export function getSequenceDiagramAltText(source: string): string {
  const titleMatch = source.match(/^title\s+(.+)$/m);

  if (titleMatch?.[1]) {
    return `Sequence diagram: ${titleMatch[1].trim()}`;
  }

  return "Sequence diagram";
}
