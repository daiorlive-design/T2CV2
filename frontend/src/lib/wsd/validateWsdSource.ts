const MAX_WSD_SOURCE_LENGTH = 4000;

export function validateWsdSource(source: string): {
  valid: boolean;
  reason?: string;
} {
  const trimmed = source.trim();

  if (!trimmed) {
    return { valid: false, reason: "Sequence diagram is empty." };
  }

  if (trimmed.length > MAX_WSD_SOURCE_LENGTH) {
    return { valid: false, reason: "Sequence diagram is too large to render inline." };
  }

  return { valid: true };
}
