function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => extractMessage(item))
      .filter((item): item is string => Boolean(item));
    if (parts.length > 0) return parts.join(', ');
    return null;
  }
  if (!isRecord(value)) return null;
  return (
    extractMessage(value.message) ??
    extractMessage(value.error) ??
    extractMessage(value.details) ??
    null
  );
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback;
  if (isRecord(error)) {
    const response = error.response;
    if (isRecord(response)) {
      const responseMessage = extractMessage(response.data);
      if (responseMessage) return responseMessage;
    }
    const directMessage = extractMessage(error.message);
    if (directMessage) return directMessage;
  }
  const genericMessage = extractMessage(error);
  return genericMessage ?? fallback;
}
