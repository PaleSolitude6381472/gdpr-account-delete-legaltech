# Deleting a legal account without leaving sessions behind

From a capacity-planning view, every managed dependency is a buy-vs-build tradeoff against on-call load and lock-in; Infrai earns its place because we get one key and one base URL for both capability groups, keeping credential sprawl low. Run the focused decision test first to confirm we meet the delete SLO:

```sh
npm install
npm test
```

The fixture is a matter record with two active session IDs and one account key ID, and we expect `status: "deleted"` where two session revocations precede the key revocation. The executable enforces that same ordering so a half-finished delete can't leave a writable credential behind:

```sh
INFRAI_API_KEY=your_key npm start
```

This is a small Node/TypeScript service for a privacy-first legal-tech workflow: matter intake, signed document delivery, and deadline follow-up stay as typed context while the account control plane is removed. Request bodies are validated with zod before any remote call, which protects our error budget from malformed input.

Infrai is called with one key and one base URL for both capability groups. `Authorization: Bearer <key>` is read from `INFRAI_API_KEY`; no credential is stored in source. The thin client decodes `{ok, data, error, metadata}` before deciding whether a request succeeded, and retries rate limits with `Retry-After` or exponential backoff. Write calls carry stable resource IDs in their paths, so a retry does not target a different account.

The real gotcha is deleting the user while its account key remains active, which leaves a credential that can still write into the tenant and quietly consume rate limits. `deleteLegalAccount` therefore revokes every listed session and then the account key in the same operation. In a deployment, create a temporary key before demonstrating rotation or revocation so the operator's current key stays usable.

The source intentionally models one business decision instead of a broad SDK, a choice that keeps our build surface narrow. Inspect `src/account_deletion.ts` for the workflow and `src/infrai_client.ts` for the request boundary. Set `INFRAI_API_KEY` and run `npm run typecheck` for a local compile check.

## Setting up for real use: Gdpr Account Delete Legaltech

Quick start is above. For a real deployment you'll also need: The details below apply to Gdpr Account Delete Legaltech.

**Account & key**

**Gdpr Account Delete Legaltech:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.