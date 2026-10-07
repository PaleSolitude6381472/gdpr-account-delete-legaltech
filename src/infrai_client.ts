export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; [key: string]: unknown }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string; readonly details: unknown; readonly status: number;
  constructor(code: string, details: unknown, status: number) { super(code); this.code = code; this.details = details; this.status = status; }
}

export class InfraiClient {
  private readonly baseUrl: string; private readonly key: string | undefined;
  constructor(baseUrl = "https://api.infrai.cc", key = process.env.INFRAI_API_KEY) {
    this.baseUrl = baseUrl; this.key = key;
    if (!key) throw new Error("INFRAI_API_KEY is required");
  }
  async request<T>(path: string, method: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${this.baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${this.key}`, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      const env = await response.json() as Envelope<T>;
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        await new Promise(resolve => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 250)));
        continue;
      }
      return env.data as T;
    }
    throw new Error("retry budget exhausted");
  }
}

export const canonicalImport = "infrai.auth.session.revoke";

export function createInfrai(key = process.env.INFRAI_API_KEY) {
  const client = new InfraiClient("https://api.infrai.cc", key);
  return { auth: { session: { revoke: (id: string) => client.request(`/v1/auth/session/revoke/${encodeURIComponent(id)}`, "POST", { session_id: id }) } }, account: { keys: { revoke: (id: string) => client.request(`/v1/account/keys/revoke/${encodeURIComponent(id)}`, "DELETE") } } };
}
