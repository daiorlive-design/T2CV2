import { useMemo, useState } from "react";
import { buildWebSequenceDiagramUrl } from "../../lib/wsd/buildWebSequenceDiagramUrl";
import { getSequenceDiagramAltText } from "../../lib/wsd/getSequenceDiagramAltText";
import { validateWsdSource } from "../../lib/wsd/validateWsdSource";

interface Props {
  source: string;
  style?: string;
}

function SequenceDiagramFallback({
  message = "Unable to render sequence diagram.",
  source,
}: {
  message?: string;
  source: string;
}) {
  return (
    <div className="sequence-diagram-fallback my-2 p-3 rounded-lg bg-surface-3 border border-border text-sm">
      <p className="text-gray-400">{message}</p>
      <details className="mt-2">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-300 text-xs">
          Show diagram source
        </summary>
        <pre className="mt-1 text-xs overflow-x-auto">
          <code>{source}</code>
        </pre>
      </details>
    </div>
  );
}

export function SequenceDiagramRenderer({ source, style = "modern-blue" }: Props) {
  const [hasError, setHasError] = useState(false);

  const validation = useMemo(() => validateWsdSource(source), [source]);
  const url = useMemo(() => {
    if (!validation.valid) return null;
    return buildWebSequenceDiagramUrl(source, style);
  }, [source, style, validation.valid]);
  const alt = useMemo(() => getSequenceDiagramAltText(source), [source]);

  if (!validation.valid) {
    return <SequenceDiagramFallback message={validation.reason} source={source} />;
  }

  if (hasError || !url) {
    return (
      <SequenceDiagramFallback
        message="Unable to render sequence diagram."
        source={source}
      />
    );
  }

  return (
    <figure className="sequence-diagram my-2">
      <img
        src={url}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    </figure>
  );
}
