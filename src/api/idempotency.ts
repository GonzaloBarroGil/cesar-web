import { v7 as uuidv7 } from "uuid";

let cachedKey: string | null = null;

export function generateIdempotencyKey(): string {
  if (cachedKey) {
    const key = cachedKey;
    cachedKey = null;
    return key;
  }
  return uuidv7();
}

export function setRetryKey(key: string): void {
  cachedKey = key;
}
