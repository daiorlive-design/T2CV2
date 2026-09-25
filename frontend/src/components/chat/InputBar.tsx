import { useState, useRef, useEffect } from "react";
import { Square, ArrowUp } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  placeholder?: string;
  prefill?: string;
  onPrefillConsumed?: () => void;
}

export function InputBar({ onSend, onStop, isStreaming, placeholder, prefill, onPrefillConsumed }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount and conversation change
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Pre-fill input when a placeholder chip is clicked
  useEffect(() => {
    if (!prefill) return;
    setText(prefill);
    inputRef.current?.focus();
    onPrefillConsumed?.();
  }, [prefill]);

  // Auto-resize to fit content
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setText("");
    if (inputRef.current) inputRef.current.style.height = "44px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-12 pb-2 pt-3 border-t border-border flex flex-col items-center gap-1">
      <div className="w-full flex gap-2.5 items-end">
        <div
          className="flex-1 bg-surface-2 border border-border rounded-2xl overflow-hidden focus-within:border-accent-glow transition-colors pr-2"
          style={{ minHeight: "44px", maxHeight: "300px" }}
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent px-5 py-2.5 text-sm text-[var(--color-input-text)] placeholder-gray-500 focus:outline-none overflow-y-auto"
            style={{ minHeight: "44px", maxHeight: "300px", display: "block" }}
          />
        </div>

        {isStreaming ? (
          <button
            onClick={onStop}
            className="w-11 h-11 rounded-full bg-danger/20 border border-danger/40 flex items-center justify-center text-danger flex-shrink-0 hover:bg-danger/30 transition-colors"
            title="Stop generating"
          >
            <Square size={18} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-accent-glow disabled:opacity-30 disabled:shadow-none transition-opacity"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <p className="text-[11px] text-gray-500">Thoughts2Code can make mistakes. Check important info.</p>
    </div>
  );
}
