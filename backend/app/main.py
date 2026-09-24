"""
Thoughts2Code - FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import chat

settings = get_settings()

app = FastAPI(
    title="Thoughts2Code API",
    description="Translate thoughts into programming steps and code",
    version="0.1.0",
)

# CORS - allow the deployed frontend (FRONTEND_URL, comma-separated) and the local dev server
allowed_origins = [u.strip().rstrip("/") for u in settings.frontend_url.split(",") if u.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[*allowed_origins, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": settings.llm_model,
        "logging_to": "supabase" if (settings.supabase_url and settings.supabase_key) else "local files",
    }
