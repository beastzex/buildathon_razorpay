"""
Event Bus for Agent Relay (Tier 1)
Supports cross-process Redis Pub/Sub as the primary delivery path (for Celery/worker processes),
with transparent in-process asyncio.Queue fallback when running in standalone development mode.
"""

import os
import json
import asyncio
import logging
from typing import AsyncGenerator, Dict, Set, Optional
from agents.pipeline.agent_base import AgentResult

logger = logging.getLogger("ledgr.event_bus")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


class EventBus:
    def __init__(self):
        self._in_process_subscribers: Dict[str, Set[asyncio.Queue]] = {}
        self._redis = None
        self._redis_checked = False
        self._redis_available = False

    async def _init_redis(self):
        if not self._redis_checked:
            self._redis_checked = True
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(REDIS_URL, decode_responses=True)
                await self._redis.ping()
                self._redis_available = True
                logger.info(f"EventBus: Connected to Redis Pub/Sub at {REDIS_URL.split('@')[-1]}")
            except Exception as e:
                self._redis_available = False
                logger.warning(f"EventBus: Redis unavailable ({e}). Using in-process queue for single-process delivery.")

    async def publish(self, batch_id: str, event: AgentResult):
        """Publish an AgentResult event to Redis channel and in-process subscribers."""
        await self._init_redis()
        payload = event.model_dump_json()

        # 1. Primary: Redis Pub/Sub for cross-process worker delivery
        if self._redis_available and self._redis:
            try:
                channel = f"ledgr:batch:{batch_id}:events"
                await self._redis.publish(channel, payload)
            except Exception as e:
                logger.error(f"Redis publish error: {e}")

        # 2. In-process subscribers (for local FastAPI / test execution)
        queues = self._in_process_subscribers.get(batch_id, set())
        for q in list(queues):
            try:
                q.put_nowait(payload)
            except Exception:
                pass

    async def subscribe(self, batch_id: str) -> AsyncGenerator[Optional[AgentResult], None]:
        """Subscribe to events for a batch, yielding AgentResult objects (or None on heartbeat)."""
        await self._init_redis()

        if self._redis_available and self._redis:
            # Primary: Redis Pub/Sub
            pubsub = self._redis.pubsub()
            channel = f"ledgr:batch:{batch_id}:events"
            await pubsub.subscribe(channel)
            try:
                while True:
                    message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.5)
                    if message and message.get("type") == "message":
                        data_str = message.get("data")
                        if data_str:
                            try:
                                data_dict = json.loads(data_str)
                                yield AgentResult(**data_dict)
                            except Exception as e:
                                logger.error(f"Error parsing event: {e}")
                    else:
                        yield None
                    await asyncio.sleep(0.01)
            except asyncio.CancelledError:
                await pubsub.unsubscribe(channel)
                await pubsub.close()
                raise
        else:
            # Fallback: In-process asyncio.Queue
            q: asyncio.Queue = asyncio.Queue()
            self._in_process_subscribers.setdefault(batch_id, set()).add(q)
            try:
                while True:
                    try:
                        payload = await asyncio.wait_for(q.get(), timeout=0.5)
                        data_dict = json.loads(payload)
                        yield AgentResult(**data_dict)
                    except asyncio.TimeoutError:
                        yield None
            except asyncio.CancelledError:
                raise
            finally:
                if batch_id in self._in_process_subscribers:
                    self._in_process_subscribers[batch_id].discard(q)


# Global singleton
_event_bus = EventBus()


def get_event_bus() -> EventBus:
    return _event_bus
