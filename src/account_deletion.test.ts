import assert from "node:assert/strict";
import { deleteLegalAccount } from "./account_deletion";

const calls: Array<[string, string, unknown]> = [];
const client = { request: async <T>(path: string, method: string, body?: unknown) => { calls.push([method, path, body]); return undefined as T; } } as never;
const result = await deleteLegalAccount({ userId: "u1", sessionIds: ["s1", "s2"], accountKeyId: "k1", matterId: "m1", signedDocumentId: "d1", deadlineIso: "2026-10-01T09:00:00.000Z" }, client);
assert.equal(result.status, "deleted");
assert.equal(result.sessionsRevoked, 2);
assert.deepEqual(calls, [["POST", "/v1/auth/session/revoke/s1", { session_id: "s1" }], ["POST", "/v1/auth/session/revoke/s2", { session_id: "s2" }], ["DELETE", "/v1/account/keys/revoke/k1", undefined]]);
console.log("account deletion decision passed");
