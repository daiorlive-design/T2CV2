"""
Log Store - saves every chat exchange for research analysis.

If SUPABASE_URL and SUPABASE_KEY are set, each exchange is inserted as a row
in the Supabase table `conversation_logs` (permanent storage, works on Render).
Otherwise it falls back to writing JSON files in backend/logs/ (local dev only:
files on Render's free plan are deleted whenever the server restarts).
"""

import json
import logging
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx

from app.core.config import get_settings
from app.models.schemas import ChatRequest

logger = logging.getLogger("thoughts2code.logs")

LOGS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "logs")
TZ = ZoneInfo("Atlantic/Reykjavik")
TABLE = "conversation_logs"


def _build_entry(request: ChatRequest, full_response: str, status: str) -> dict:
    now = datetime.now(tz=TZ)
    messages = [{"role": m.role, "content": m.content} for m in request.conversation]
    messages.append({"role": "user", "content": request.message})
    messages.append({"role": "assistant", "content": full_response})

    return {
        "created_at": now.isoformat(),
        "participant_id": request.participant_id or "unknown",
        "conversation_id": request.conversation_id,
        "turn": len(request.conversation) // 2 + 1,
        "mode": request.mode.value,
        "difficulty": request.difficulty.value,
        "user_message": request.message,
        "assistant_response": full_response,
        "status": status,
        "messages": messages,
    }


async def _save_to_supabase(entry: dict) -> None:
    settings = get_settings()
    key = settings.supabase_key
    headers = {
        "apikey": key,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    # Legacy "service_role" keys are JWTs (start with "eyJ") and also go in Authorization.
    if key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {key}"

    url = f"{settings.supabase_url.rstrip('/')}/rest/v1/{TABLE}"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, headers=headers, json=entry)
        response.raise_for_status()


def _save_to_file(entry: dict) -> None:
    os.makedirs(LOGS_DIR, exist_ok=True)
    stamp = datetime.fromisoformat(entry["created_at"]).strftime("%Y-%m-%d_%H-%M-%S")
    safe_pid = "".join(c for c in entry["participant_id"] if c.isalnum() or c in "-_") or "unknown"
    filename = os.path.join(LOGS_DIR, f"conversa_{safe_pid}_{stamp}.json")
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(entry, f, ensure_ascii=False, indent=2)


async def save_exchange(request: ChatRequest, full_response: str, status: str = "complete") -> None:
    """Save one user->assistant exchange. Never raises: logging must not break the chat."""
    entry = _build_entry(request, full_response, status)
    settings = get_settings()

    if settings.supabase_url and settings.supabase_key:
        try:
            await _save_to_supabase(entry)
            return
        except Exception as e:  # keep a local copy if the database is unreachable
            logger.error("Could not save log to Supabase: %s", e)

    try:
        _save_to_file(entry)
    except Exception as e:
        logger.error("Could not save log to file: %s", e)
