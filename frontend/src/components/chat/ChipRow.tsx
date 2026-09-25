import type { Suggestion } from "../../stores/chatStore";

interface Props {
  suggestions: Suggestion[];
  onChipClick: (label: string) => void;
}

export function ChipRow({ suggestions, onChipClick }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onChipClick(s.label)}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-surface-3 border border-border text-gray-400 hover:bg-accent-soft hover:border-accent-glow hover:text-accent transition-colors whitespace-nowrap"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
