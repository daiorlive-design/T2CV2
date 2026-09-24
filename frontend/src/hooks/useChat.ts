/**
 * useChat hook - encapsulates the chat send/stream logic.
 * Components call `sendMessage(text)` and everything else is handled.
 */

import { useCallback, useRef } from "react";
import { useChatStore } from "../stores/chatStore";
import { streamChat, ChatRequestBody } from "../services/api";
import { getParticipantId } from "../utils/participant";

export function useChat() {
  const store = useChatStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      // Ensure we have an active conversation
      let convId = store.activeConversationId;
      if (!convId) {
        convId = store.createConversation();
      }

      // Add user message
      store.addMessage({ role: "user", content: text });

      // Add empty assistant message (will be filled by streaming)
      store.addMessage({ role: "assistant", content: "" });
      store.setStreaming(true, convId);
      store.setStreamingContent("");

      // Build request
      const conversation = store.getActiveConversation();
      const history = (conversation?.messages || [])
        .filter((m) => m.content) // Skip the empty assistant message
        .map((m) => ({ role: m.role, content: m.content }));

      const body: ChatRequestBody = {
        message: text,
        conversation: history.slice(0, -1), // Exclude the message we just added
        mode: store.mode,
        difficulty: store.difficulty,
        participant_id: getParticipantId(),
        conversation_id: convId,
      };

      // Stream response - pin to the conversation that sent the message
      const pinnedConvId = convId;
      const abort = new AbortController();
      abortRef.current = abort;
      let accumulated = "";

      await streamChat(
        body,
        // onToken
        (token) => {
          accumulated += token;
          store.setStreamingContent(accumulated);
          store.updateLastAssistantMessage(accumulated, pinnedConvId);
        },
        // onDone
        () => {
          store.setStreaming(false);
          store.setStreamingContent("");
        },
        // onError
        (error) => {
          store.updateLastAssistantMessage(
            accumulated + `\n\n⚠️ Error: ${error}`,
            pinnedConvId
          );
          store.setStreaming(false);
          store.setStreamingContent("");
        },
        abort.signal
      );
    },
    [store]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    store.setStreaming(false);
  }, [store]);

  return {
    sendMessage,
    stopStreaming,
    isStreaming: store.isStreaming,
  };
}
