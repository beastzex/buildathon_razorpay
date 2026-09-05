import sys
import pytest
import pytest_asyncio
from pathlib import Path

# Ensure root in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.db import init_db


@pytest_asyncio.fixture(autouse=True, scope="session")
async def setup_test_db():
    await init_db()
