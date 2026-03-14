export function getErrorStack(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return JSON.stringify(error);
}
