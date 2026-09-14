const MAX_BYTES = 16_384;

export async function readJsonBody<T>(request: Request): Promise<{ ok: true; value: T } | { ok: false; status: number; error: string }> {
  const text = await request.text();
  if (text.length > MAX_BYTES) return { ok: false, status: 413, error: "payload_too_large" };
  if (!text.trim()) return { ok: false, status: 400, error: "empty_body" };
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}
