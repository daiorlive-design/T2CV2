/**
 * API Service - communicates with the Thoughts2Code backend.
 * Handles SSE streaming for chat and regular POST for code execution.
 */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface ChatRequestBody {
  message: string;
  conversation: { role: string; content: string }[];
  mode: "thought_to_code" | "code_to_explain";
  difficulty: "light" | "strict";
  participant_id?: string | null;
  conversation_id?: string | null;
}

export interface StreamEvent {
  type: "token" | "done" | "error";
  content?: string;
}

/**
 * Stream a chat response from the backend via SSE.
 * Calls `onToken` for each text chunk, `onDone` when complete.
 */
export async function streamChat(
  body: ChatRequestBody,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      onError(`Server error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event: StreamEvent = JSON.parse(line.slice(6));

            switch (event.type) {
              case "token":
                if (event.content) onToken(event.content);
                break;
              case "done":
                onDone();
                return;
              case "error":
                onError(event.content || "Unknown error");
                return;
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    }

    onDone();
  } catch (err: any) {
    if (err.name !== "AbortError") {
      onError(err.message || "Connection failed");
    }
  }
}

