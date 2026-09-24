from pydantic import BaseModel, Field
from enum import Enum


class ChatMode(str, Enum):
    THOUGHT_TO_CODE = "thought_to_code"
    CODE_TO_EXPLAIN = "code_to_explain"


class Difficulty(str, Enum):
    LIGHT = "light"
    STRICT = "strict"


class Message(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""
    message: str = Field(..., min_length=1, max_length=4000)
    conversation: list[Message] = Field(default_factory=list)
    mode: ChatMode = ChatMode.THOUGHT_TO_CODE
    difficulty: Difficulty = Difficulty.LIGHT
    # Research logging: participant code from the link (?p=P01) and the chat's id
    participant_id: str | None = Field(default=None, max_length=64)
    conversation_id: str | None = Field(default=None, max_length=64)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "message": "I want to make a program that checks if a number is even or odd",
                    "conversation": [],
                    "mode": "thought_to_code",
                }
            ]
        }
    }


class Step(BaseModel):
    number: int
    description: str
    status: str = "new"  # "new", "kept", "removed"


class CodeBlock(BaseModel):
    language: str = "python"
    code: str


class Suggestion(BaseModel):
    label: str



class CodeRunRequest(BaseModel):
    """Request to execute code in the sandbox."""
    code: str = Field(..., min_length=1, max_length=10000)
    language: str = "python"


class CodeRunResponse(BaseModel):
    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0
    timed_out: bool = False
