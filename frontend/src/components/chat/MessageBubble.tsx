import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../stores/chatStore";
import { parseSteps, parseCodeBlocks, parseSuggestions, parseComplexity, stripXmlTags } from "../../utils/parseSteps";
import { StepList } from "./StepList";
import { ChipRow } from "./ChipRow";
import { CodeBlock } from "../code/CodeBlock";
import { ComplexityMeter } from "../common/ComplexityMeter";
import { SequenceDiagramRenderer } from "./SequenceDiagramRenderer";
import { useChat } from "../../hooks/useChat";

interface Props {
  message: Message;
  isStreaming?: boolean;
  onPrefill?: (text: string) => void;
}

export function MessageBubble({ message, isStreaming, onPrefill }: Props) {
  const { sendMessage } = useChat();
  const isUser = message.role === "user";

  // Parse structured data from AI messages
  const steps = !isUser ? parseSteps(message.content) : [];
  const codeBlocks = !isUser ? parseCodeBlocks(message.content, isStreaming) : [];
  const suggestions = !isUser ? parseSuggestions(message.content) : [];
  const complexity = !isUser ? parseComplexity(message.content) : undefined;
  let plainText = !isUser ? stripXmlTags(message.content) : message.content;
  // If XML steps were parsed, strip duplicate numbered lists from prose
  if (steps.length > 0) {
    plainText = plainText.replace(/^\d+\.\s+.+(?:\n(?!\n|\d+\.).*)*/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  }

  return (
    <div className={`flex flex-col gap-1 max-w-2xl ${isUser ? "self-end" : "self-start"}`}>
      {/* Sender label */}
      <div className="text-[10px] font-semibold tracking-wide uppercase text-gray-500 px-1">
        {isUser ? "You" : "Thoughts2Code"}
      </div>

      {/* Thinking dots bubble - shown while streaming but no content yet */}
      {isStreaming && !message.content && (
        <div className="self-start flex items-center gap-1.5 px-4 py-3 rounded-chat bg-surface-2 border border-border rounded-bl-md">
          <div className="thinking-dot" />
          <div className="thinking-dot" />
          <div className="thinking-dot" />
        </div>
      )}

      {/* Bubble */}
      {(message.content || !isStreaming) && <div
        className={`px-4 py-3 rounded-chat text-sm leading-relaxed ${
          isUser
            ? "bg-[var(--color-user-bubble-bg)] border border-[var(--color-user-bubble-border)] rounded-br-md"
            : "bg-surface-2 border border-border rounded-bl-md"
        }`}
      >

        {/* Plain text content */}
        {plainText && (
          <div className={`prose prose-sm max-w-none ${isStreaming ? "streaming-cursor" : ""}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match?.[1];
                  if (language === "sequence" || language === "wsd") {
                    return <SequenceDiagramRenderer source={String(children).trimEnd()} />;
                  }
                  return <code className={className} {...props}>{children}</code>;
                },
              }}
            >{plainText}</ReactMarkdown>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && <StepList steps={steps} />}

        {/* Complexity meter */}
        {complexity !== undefined && <ComplexityMeter level={complexity} />}

        {/* Code blocks */}
        {codeBlocks.map((block, i) => (
          <CodeBlock key={i} language={block.language} code={block.code} />
        ))}

        {/* Quick-action chips */}
        {suggestions.length > 0 && !isStreaming && (
          <ChipRow
            suggestions={suggestions}
            onChipClick={(label) => {
              if (/\[.+?\]/.test(label) && onPrefill) {
                onPrefill(label.replace(/\s*\[.+?\]/, ""));
              } else {
                sendMessage(label);
              }
            }}
          />
        )}
      </div>}
    </div>
  );
}
