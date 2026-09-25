"""
Chat Router - API endpoints for Thoughts2Code.
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest, CodeRunRequest, CodeRunResponse
from app.services.llm_service import stream_chat
from app.services.code_runner import run_code

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Stream a chat response from the LLM via Server-Sent Events.

    The frontend should consume this with an EventSource or fetch + reader.
    Each SSE event contains JSON: {"type": "token"|"done"|"error", "content": "..."}
    """
    return StreamingResponse(
        stream_chat(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering if proxied
        },
    )


@router.post("/run", response_model=CodeRunResponse)
async def run_code_endpoint(request: CodeRunRequest):
    """
    Execute code in a sandboxed environment.
    Returns stdout, stderr, and exit code.
    """
    return await run_code(request)
