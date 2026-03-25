export function getErrorMessage(error: unknown): string {
  return typeof error === 'string'
    ? error
    : (error as { message?: string } | null)?.message || 'Something went wrong';
}
