## MCP + fal.ai Implementation Plan

This plan defines an actionable, multi-phase implementation for an MCP server that integrates with fal.ai. It follows the MCP TypeScript server/client guidelines in `@model-context-protocol.rules` and targets the following capabilities:

- List all available fal.ai models
- Search models by keywords
- Get model schemas/metadata
- Generate content with any fal.ai model
- Support direct (sync) and queued (async) execution
- Queue management (status, result retrieval, cancel)
- File upload to fal.ai CDN

Notes

- We will use the official MCP TypeScript SDK and a package workspace `packages/mcp-fal-ai`.
- fal.ai execution uses two base hosts: direct execution via `https://fal.run` and queued execution via `https://queue.fal.run`.
- File uploads are supported via fal.ai storage/CDN utilities (JS SDK) or a REST upload endpoint; we will expose a tool that can accept local file paths or URLs and return a CDN URL suitable for model inputs.

---

### Phase 0 — Discovery and API Confirmation

Deliverables

- Confirm fal.ai endpoints and request/response shapes for:
    - Models catalog and search (public catalog endpoint or SDK listing)
    - Model schema/metadata endpoint
    - Direct model execution (fal.run)
    - Queued model execution (queue.fal.run)
    - Queue status/result/cancel endpoints
    - Storage/CDN upload endpoint or SDK method
- Record base headers and auth (Bearer fal_key) and common error shapes.

Actions

- Review fal.ai docs for REST and JS SDK usage for: models listing/search, schema, run, queue subscribe/status/result/cancel, storage upload.
- Capture examples for at least two representative models (e.g., image and text) to validate schema variance.

Acceptance

- Documented endpoint table with paths, methods, auth, and minimal payload examples.

---

### Phase 1 — Package and Server Scaffolding (MCP TS)

Deliverables

- New workspace package `packages/mcp-fal-ai` with MCP server skeleton per rules.
- Scripts: build, validate, watch; bin entry for CLI.
- Env parsing with yargs + zod; custom `EnvironmentValidationError`.

Actions

- Create `package.json` (module, bin -> `dist/index.js`).
- Add deps: `@modelcontextprotocol/sdk`, `zod`, `zod-to-json-schema`, `yargs`, `@types/node`, `typescript`, `shx`.
- Add `src/` layout per rules:
    - `src/index.ts` (CLI entry)
    - `src/server.ts` (MCP server; stdio and SSE variants)
    - `src/config/env.ts` (token, run-sse, port)
    - `src/errors/environment-validation-error.ts`
    - `src/tools/`, `src/resources/`, `src/prompts/`, `src/types/`, `src/utils/`

Acceptance

- `npm run validate` passes; `npm run build` emits `dist/`.

---

### Phase 2 — fal.ai Client Layer (HTTP + optional SDK)

Deliverables

- A thin, typed client in `src/services/fal-client.ts` that encapsulates:
    - Auth header injection
    - Base hosts: `fal.run` (sync), `queue.fal.run` (async)
    - Endpoints: models list/search, schema, run, queue ops, storage upload
    - Strongly-typed request/response models (zod validators in `src/types/`)

Actions

- Implement generic `requestJson` helper with robust error mapping.
- Methods (names illustrative; wire to confirmed endpoints in Phase 0):
    - `listModels(params?)`
    - `searchModels(query)`
    - `getModelSchema(modelId)`
    - `run(modelId, input)` (sync via `fal.run`)
    - `enqueue(modelId, input)` (async via `queue.fal.run`)
    - `getJobStatus(jobId)` / `getJobResult(jobId)` / `cancelJob(jobId)`
    - `uploadFile(file: Buffer|Readable|URL|string)` -> `{ url }`

Acceptance

- Unit tests for client method serialization and basic error handling (mocked HTTP).

---

### Phase 3 — MCP Tools (User-Facing Operations)

Deliverables

- Tools registered in `src/tools/index.ts` with zod-validated inputs/outputs:
    - `fal-list-models` (optional filters/pagination)
    - `fal-search-models` (keyword)
    - `fal-get-model-schema` (modelId)
    - `fal-run-model` (modelId, input, options?) — direct
    - `fal-enqueue-model` (modelId, input, priority?) — queued
    - `fal-job-status` (jobId)
    - `fal-job-result` (jobId)
    - `fal-cancel-job` (jobId)
    - `fal-upload-file` (path/url/base64) -> cdn url

Actions

- Map each tool to `fal-client` methods; serialize inputs/outputs as plain JSON.
- Provide minimal examples in tool descriptions.

Acceptance

- Manual smoke via MCP client: each tool returns plausible data (with mocked or real key).

---

### Phase 4 — MCP Resources and Prompts

Deliverables

- Resources in `src/resources/index.ts` to expose read-only views:
    - `fal://models` — list snapshot (cached)
    - `fal://models/{modelId}` — model metadata/schema
    - `fal://jobs/{jobId}` — job status/result view
- Prompts in `src/prompts/` (optional) to standardize common requests, e.g.:
    - `generate-with-model` taking `modelId` and `input` and guiding output parsing

Actions

- Implement caching for models list to reduce calls; TTL configurable via env.
- Ensure resource URI schemes are stable and documented.

Acceptance

- `resources/list` and fetch of the above URIs work; basic TTL observed.

---

### Phase 5 — Queue Management UX and Subscriptions

Deliverables

- Convenience tool: `fal-enqueue-and-wait` (with optional timeout/poll interval) combining enqueue + polling until terminal state, returning final result.
- If supported by fal.ai, add server-side event subscription or long-poll to reduce polling.

Actions

- Implement polling strategy with backoff; surface progress fields when available.
- Normalize terminal states: succeeded, failed, canceled, expired.

Acceptance

- E2E test: enqueue, wait, return final payload; cancel path tested.

---

### Phase 6 — Configuration, Validation, and Errors

Deliverables

- `src/config/env.ts` supports:
    - `FAL_API_KEY` (required)
    - `RUN_SSE` (default false)
    - `PORT` (default 3000)
    - `MODELS_CACHE_TTL_SEC` (optional)
- Custom errors in `src/errors/` (e.g., `FalApiError`, `UploadError`, `QueueError`).

Actions

- Validate env with zod; throw `EnvironmentValidationError` with readable messages.
- Map HTTP errors to typed errors with endpoint context.

Acceptance

- Invalid env fails early with actionable messages; error objects include status and endpoint.

---

### Phase 7 — Docs, Examples, and Testing

Deliverables

- README section for this package with setup, config, examples.
- Example scripts in `src/examples/` to demonstrate:
    - Listing and searching models
    - Getting a schema and constructing input
    - Direct vs queued execution
    - Queue status/result/cancel
    - File upload and using returned URL in inputs
- Unit tests for client and tools; type-check clean.

Actions

- Add `npm run example` script(s).
- Ensure typescript strict mode; no `any`.

Acceptance

- `npm run validate` and `npm run build` pass; examples run with a test key.

---

### Phase 8 — Hardening and Observability

Deliverables

- Retries with jitter for transient 429/5xx.
- Request logging (redacting secrets) behind `DEBUG` flag.
- Rate limiting hinting if fal.ai returns usage headers.

Actions

- Add wrapper for resilient HTTP calls.
- Redact `Authorization` in logs; configurable log levels.

Acceptance

- Simulated transient errors recover; logs are helpful and safe.

---

### Endpoint Mapping (to confirm in Phase 0)

The following mappings reflect common fal.ai patterns and must be confirmed against current docs:

- Models

    - List/Search: catalog API or SDK function (to be confirmed)
    - Schema/Metadata: per-model endpoint exposing input/output schema

- Execution

    - Direct (sync): `POST https://fal.run/fal-ai/{modelId}`
    - Queued (async): `POST https://queue.fal.run/fal-ai/{modelId}` → returns `request_id`/`job_id`

- Queue Ops

    - Status: `GET https://queue.fal.run/requests/{jobId}/status` (pattern to confirm)
    - Result: `GET https://queue.fal.run/requests/{jobId}/result`
    - Cancel: `POST https://queue.fal.run/requests/{jobId}/cancel`

- Storage/CDN Upload
    - JS SDK: `fal.storage.upload(file)` → returns CDN URL
    - REST: multipart upload endpoint returning a public URL (to be confirmed)

All requests include `Authorization: Bearer ${FAL_API_KEY}`.

---

### MCP Surface: Tools and Resources (summary)

Tools

- `fal-list-models`
- `fal-search-models`
- `fal-get-model-schema`
- `fal-run-model`
- `fal-enqueue-model`
- `fal-job-status`
- `fal-job-result`
- `fal-cancel-job`
- `fal-enqueue-and-wait`
- `fal-upload-file`

Resources

- `fal://models`
- `fal://models/{modelId}`
- `fal://jobs/{jobId}`

---

### Non-Goals (initial)

- Local caching beyond simple TTL for models list.
- Complex batching interfaces.
- Full SDK re-implementation; we prefer a thin wrapper.

---

### Timeline & Milestones

1. Phases 1–2: 1–2 days (scaffold + client skeleton)
2. Phase 3: 1 day (core tools wired)
3. Phase 4–5: 1 day (resources + queue UX)
4. Phase 6–7: 1–2 days (validation, docs, tests, examples)
5. Phase 8: 0.5–1 day (hardening)

---

### Open Questions for Confirmation

- Official models catalog endpoint and search parameters.
- Canonical schema retrieval path for each model.
- Exact queue status/result/cancel paths and response fields.
- Preferred CDN upload method (SDK vs REST) and max file sizes/MIME rules.
