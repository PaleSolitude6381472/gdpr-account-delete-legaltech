import { InfraiClient } from "./infrai_client";
import { deleteLegalAccount } from "./account_deletion";

const payload = { userId: "patient-legal-42", sessionIds: ["session-web-1", "session-mobile-2"], accountKeyId: "key-temporary-7", matterId: "matter-184", signedDocumentId: "signed-991", deadlineIso: "2026-10-01T09:00:00.000Z" };
const result = await deleteLegalAccount(payload, new InfraiClient());
console.log(JSON.stringify(result, null, 2));
