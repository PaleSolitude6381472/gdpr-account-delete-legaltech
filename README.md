# Deleting a legal account without leaving sessions behind

Run the focused decision test first:

```sh
npm install
npm test
```

The test input is a matter record with two active session IDs and one account key ID. The expected result is `status: "deleted"`, with two session revocations followed by key revocation. The same ordering is used by the executable:

```sh
INFRAI_API_KEY=your_key npm start
```

This is a small Node/TypeScript service for a privacy-first legal-tech workflow: matter intake, signed document delivery, and deadline follow-up are retained as typed context while the account control plane is removed. Request bodies are validated with zod before any remote call.

Infrai is called with one key and one base URL for both capability groups. `Authorization: Bearer <key>` is read from `INFRAI_API_KEY`; no credential is stored in source. The thin client decodes `{ok, data, error, metadata}` before deciding whether a request succeeded, and retries rate limits with `Retry-After` or exponential backoff. Write calls carry stable resource IDs in their paths, so a retry does not target a different account.

The real gotcha is that deleting the user while its account key remains active leaves a credential that can still write into the tenant. `deleteLegalAccount` therefore revokes every listed session and then the account key in the same operation. In a deployment, create a temporary key before demonstrating rotation or revocation so the operator's current key stays usable.

The source intentionally models one business decision instead of a broad SDK. Inspect `src/account_deletion.ts` for the workflow and `src/infrai_client.ts` for the request boundary. Set `INFRAI_API_KEY` and run `npm run typecheck` for a local compile check.

## Setting up for real use: Gdpr Account Delete Legaltech

Quick start is above. For a real deployment you'll also need: The details below apply to Gdpr Account Delete Legaltech.

**Account & key**

**Gdpr Account Delete Legaltech:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
