"""
LLM Service - handles streaming chat via OpenRouter.
"""

import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.core.prompts import build_system_prompt
from app.models.schemas import ChatRequest
from app.services.log_store import save_exchange


async def stream_chat(request: ChatRequest) -> AsyncGenerator[str, None]:
    """
    Stream a chat response from the LLM, yielding SSE-formatted chunks.

    Each chunk is a JSON object with:
      - type: "token" | "done" | "error"
      - content: the text token (for "token" type)
    """
    settings = get_settings()
    system_prompt = build_system_prompt(mode=request.mode.value, difficulty=request.difficulty.value)

    messages = [{"role": m.role, "content": m.content} for m in request.conversation]
    messages.append({"role": "user", "content": request.message})

    client = AsyncOpenAI(
        api_key=settings.openrouter_api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers={"X-Title": "Thoughts2Code"},
    )

    full_response = ""
    try:
        stream = await client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            stream=True,
            temperature=0.7,
            max_tokens=2048,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                full_response += delta.content
                yield _sse_event({"type": "token", "content": delta.content})

        await save_exchange(request, full_response, status="complete")
        yield _sse_event({"type": "done"})

    except Exception as e:
        await save_exchange(request, full_response, status=f"error: {e}")
        yield _sse_event({"type": "error", "content": str(e)})


def _sse_event(data: dict) -> str:
    """Format a dict as an SSE event string."""
    return f"data: {json.dumps(data)}\n\n"
