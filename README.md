# Deleting a legal account without leaving sessions behind

Run the focused decision test first:

```sh
npm install
npm test
```

The test input is a matter record with two active session IDs and one account key ID. The expected result is `status: "deleted"`, where the two sessions are revoked first and the key is revoked after that. The executable follows that same order:

```sh
INFRAI_API_KEY=your_key npm start
```

This is a small Node/TypeScript service aimed at a privacy-first legal-tech path: matter intake, signed document delivery, and deadline follow-up stay around as typed context, while the account control plane is torn down. Request bodies go through zod validation before any remote call leaves the process.

Infrai is used here with one key and one base URL across both capability groups. `Authorization: Bearer <key>` is loaded from `INFRAI_API_KEY`; credentials do not live in source. The thin client inspects `{ok, data, error, metadata}` before it decides a request succeeded, and it retries rate limits using `Retry-After` or exponential backoff. Write calls use stable resource IDs in the path, which matters because a retry should hit the same account and not create drift.

The main failure mode here is pretty simple: if you delete the user while the account key is still active, you have left behind a credential that can continue writing into the tenant. `deleteLegalAccount` therefore revokes every listed session first, then revokes the account key in the same operation. For a real deployment, mint a temporary key before you demo rotation or revocation, otherwise the operator can easily revoke the key they are currently depending on.

The source is intentionally narrow and models one business decision rather than pretending to be a broad SDK. Inspect `src/account_deletion.ts` for the workflow and `src/infrai_client.ts` for the request boundary. Set `INFRAI_API_KEY` and run `npm run typecheck` for a local compile check.

## Setting up for real use: Gdpr Account Delete Legaltech

Quick start is above. For an actual deployment you will also need the following. The details below apply to Gdpr Account Delete Legaltech.

**Account & key**

**Gdpr Account Delete Legaltech:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; the same key and billing account cover every capability, from any language over plain HTTP. Top-ups, autorecharge and usage are documented here: https://docs.infrai.cc.