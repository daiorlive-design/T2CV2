import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Minus } from "lucide-react";
import type { Step } from "../../stores/chatStore";

interface Props {
  steps: Step[];
}

const badgeStyles = {
  new: "bg-accent-soft border-accent-glow text-accent",
  kept: "bg-[rgba(52,211,153,0.12)] border-[rgba(52,211,153,0.3)] text-success",
  removed: "bg-[rgba(240,160,60,0.12)] border-[rgba(240,160,60,0.3)] text-warning",
};

const badgeLabel = {
  new: (n: number) => <>{n}</>,
  kept: () => <Check size={12} strokeWidth={3} />,
  removed: () => <Minus size={12} strokeWidth={3} />,
};

export function StepList({ steps }: Props) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {steps.map((step) => (
        <div key={step.number} className="flex items-start gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border ${
              badgeStyles[step.status]
            }`}
          >
            {badgeLabel[step.status](step.number)}
          </div>
          <div
            className={`text-[13px] leading-relaxed ${
              step.status === "kept" ? "text-gray-500" : ""
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.description}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
