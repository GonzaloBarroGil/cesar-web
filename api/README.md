# OpenAPI Spec (gitignored)

The file `api/openapi.yaml` is a copy of CESAR's OpenAPI 3.1 contract (`cesar/api/openapi.yaml`). It is **gitignored** because the backend owns the spec — cesar-web is a consumer, not the source of truth.

## Why gitignored?

CESAR is the canonical source. Committing a copy here would create a fork that drifts from the real spec. The ecosystem orchestrator (`cesar-orchestration`) validates compatibility between the two.

## How to get it

```bash
bash scripts/sync-oas.sh
```

This copies the latest spec from `~/Repos/cesar/api/openapi.yaml`.

## After syncing

Regenerate the orval API client from the updated spec:

```bash
npm run gen:api
```

This produces typed TanStack Query hooks in `src/api/generated/` and model types in `src/api/generated/models/`.
