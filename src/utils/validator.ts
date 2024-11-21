export function isStringArray(obj: unknown): obj is string[] {
  return Array.isArray(obj) && obj.every((item) => typeof item === 'string');
}

export function isNotFalsy<T>(obj: T | null | undefined): obj is T {
  return obj !== null && obj !== undefined;
}
