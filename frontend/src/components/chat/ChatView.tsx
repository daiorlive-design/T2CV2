import { useRef, useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { useChat } from "../../hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { InputBar } from "./InputBar";
import { COURSE_PROMPTS, type StarterPrompt } from "../../data/starterPrompts";

function PromptIcon({ name }: { name: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[name];
  return Icon ? <Icon size={16} /> : null;
}

const allPrompts = COURSE_PROMPTS.flatMap((s) => s.prompts);

function getRandomPrompts(n: number): StarterPrompt[] {
  const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function ChatView() {
  const { sendMessage, isStreaming, stopStreaming } = useChat();
  const conversation = useChatStore((s) => s.getActiveConversation());
  const activeId = useChatStore((s) => s.activeConversationId);
  const streamingConversationId = useChatStore((s) => s.streamingConversationId);
  const isThisChatStreaming = isStreaming && streamingConversationId === activeId;
  const createConversation = useChatStore((s) => s.createConversation);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shownPrompts, setShownPrompts] = useState<StarterPrompt[]>(() => getRandomPrompts(3));
  const [prefill, setPrefill] = useState("");

  // Fresh prompts on each new conversation
  useEffect(() => {
    setShownPrompts(getRandomPrompts(3));
  }, [activeId]);

  // Auto-scroll only if user is already near the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 100) {
      el.scrollTop = el.scrollHeight;
    }
  }, [conversation?.messages, isThisChatStreaming]);

  const handleSend = (text: string) => {
    if (!activeId) createConversation();
    sendMessage(text);
  };

  const messages = conversation?.messages || [];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-12 py-6 flex flex-col gap-4">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="text-4xl">What are you trying to build?</div>
            <div className="text-base font-medium">Describe your idea, paste some code, or try an example:</div>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {shownPrompts.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border text-sm text-gray-400 text-left hover:border-accent-glow hover:bg-accent-soft hover:text-accent transition-colors"
                >
                  <span className="flex-shrink-0"><PromptIcon name={prompt.icon} /></span>
                  <span>"{prompt.text}"</span>
                </button>
              ))}
              <button
                onClick={() => setShownPrompts(getRandomPrompts(3))}
                className="self-center text-sm text-gray-500 underline hover:text-accent transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          /* Messages */
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isThisChatStreaming && i === messages.length - 1 && msg.role === "assistant"}
              onPrefill={setPrefill}
            />
          ))
        )}
      </div>

      <InputBar
        onSend={handleSend}
        onStop={stopStreaming}
        isStreaming={isThisChatStreaming}
        placeholder={
          messages.length === 0
            ? "Describe your idea..."
            : "Refine or ask a follow-up..."
        }
        prefill={prefill}
        onPrefillConsumed={() => setPrefill("")}
      />
    </div>
  );
}
