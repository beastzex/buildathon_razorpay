FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (build essentials, git, curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU/CUDA and Python dependencies
COPY pyproject.toml requirements.txt* ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir \
    fastapi uvicorn sqlalchemy aiosqlite asyncpg psycopg2-binary pgvector \
    pydantic pydantic-settings python-dotenv tenacity rapidfuzz \
    xgboost scikit-learn pandas numpy sentence-transformers transformers peft groq

# Copy application source
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
