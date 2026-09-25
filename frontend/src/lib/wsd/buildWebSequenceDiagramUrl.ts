const DEFAULT_WSD_STYLE = "modern-blue";

export function buildWebSequenceDiagramUrl(
  source: string,
  style = DEFAULT_WSD_STYLE
): string {
  return `https://www.websequencediagrams.com/cgi-bin/cdraw?s=${encodeURIComponent(
    style
  )}&m=${encodeURIComponent(source)}`;
}
