interface Props {
  level: number;
  max?: number;
}

export function ComplexityMeter({ level, max = 5 }: Props) {
  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-[10px] font-medium tracking-wide uppercase text-gray-500">
        Complexity
      </span>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-1.5 rounded-full ${
              i < level
                ? level <= 2
                  ? "bg-success"
                  : level <= 3
                  ? "bg-warning"
                  : "bg-danger"
                : "bg-surface-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
