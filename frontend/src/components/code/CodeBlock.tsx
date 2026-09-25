import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-3 rounded-xl bg-[var(--color-code-bg)] border border-border overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <span className="text-[9px] font-medium tracking-widest uppercase text-gray-500">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-gray-500 hover:text-accent transition-colors"
        >
          {copied ? <><Check size={10} className="inline-block mr-0.5" />Copied</> : <><Copy size={10} className="inline-block mr-0.5" />Copy</>}
        </button>
      </div>

      {/* Code content */}
      <pre className="px-4 py-3 overflow-x-auto text-xs leading-7 font-mono text-[var(--color-code-text)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
