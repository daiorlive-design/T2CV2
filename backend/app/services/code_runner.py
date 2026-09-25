"""
Code Runner - executes user/generated code in a sandboxed subprocess.

⚠️  This is a RESEARCH PROTOTYPE runner. For production, use Docker
    containers or a proper sandbox like Pyodide / RestrictedPython.
"""

import subprocess
import tempfile
import os
from app.core.config import get_settings
from app.models.schemas import CodeRunRequest, CodeRunResponse


async def run_code(request: CodeRunRequest) -> CodeRunResponse:
    """
    Execute code in a subprocess with a timeout.
    Returns stdout, stderr, exit code, and whether it timed out.
    """
    settings = get_settings()

    if not settings.code_execution_enabled:
        return CodeRunResponse(
            stderr="Code execution is disabled.",
            exit_code=1,
        )

    if request.language != "python":
        return CodeRunResponse(
            stderr=f"Language '{request.language}' is not supported yet. Only Python is available.",
            exit_code=1,
        )

    # Write code to a temp file
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".py",
        delete=False,
    ) as f:
        f.write(request.code)
        temp_path = f.name

    try:
        result = subprocess.run(
            ["python", temp_path],
            capture_output=True,
            text=True,
            timeout=settings.code_execution_timeout,
            # Basic safety: don't inherit parent env fully
            env={
                "PATH": os.environ.get("PATH", "/usr/bin"),
                "HOME": tempfile.gettempdir(),
            },
        )
        return CodeRunResponse(
            stdout=result.stdout[:5000],  # Truncate long output
            stderr=result.stderr[:5000],
            exit_code=result.returncode,
        )

    except subprocess.TimeoutExpired:
        return CodeRunResponse(
            stderr=f"Code execution timed out after {settings.code_execution_timeout}s.",
            exit_code=1,
            timed_out=True,
        )

    except Exception as e:
        return CodeRunResponse(
            stderr=f"Execution error: {str(e)}",
            exit_code=1,
        )

    finally:
        os.unlink(temp_path)
