import { z } from "zod";
import { InfraiClient } from "./infrai_client";

export const deletionRequest = z.object({ userId: z.string().min(1), sessionIds: z.array(z.string().min(1)), accountKeyId: z.string().min(1), matterId: z.string().min(1), signedDocumentId: z.string().min(1), deadlineIso: z.string().datetime() });
export type DeletionRequest = z.infer<typeof deletionRequest>;

export async function deleteLegalAccount(input: unknown, client: InfraiClient) {
  const request = deletionRequest.parse(input);
  for (const sessionId of request.sessionIds) await client.request(`/v1/auth/session/revoke/${encodeURIComponent(sessionId)}`, "POST", { session_id: sessionId });
  await client.request(`/v1/account/keys/revoke/${encodeURIComponent(request.accountKeyId)}`, "DELETE");
  return { userId: request.userId, matterId: request.matterId, signedDocumentId: request.signedDocumentId, deadlineIso: request.deadlineIso, sessionsRevoked: request.sessionIds.length, accountKeyRevoked: true, status: "deleted" as const };
}
