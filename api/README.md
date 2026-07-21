# OpenAPI Spec (pinned version)

The file `api/openapi.yaml` is a pinned copy of CESAR's OpenAPI 3.1 contract
(`cesar/api/openapi.yaml`). It is **committed** as a versioned artifact —
each commit captures which API contract version the frontend targets.

## Why committed?

CESAR (backend) owns the canonical spec, but committing a pinned copy here
ensures:

- **Build independence**: Vercel/deploy builds don't need access to the cesar repo.
- **Audit trail**: Every frontend commit references the exact API version it targets.
- **CI reproducibility**: `npm run gen:api` runs against a known spec version.

## How to update

When the API contract changes in cesar:

```bash
# 1. Sync the latest spec from cesar
bash scripts/sync-oas.sh

# 2. Regenerate orval types + hooks
npm run gen:api

# 3. Verify everything builds
npm run typecheck
npm run test

# 4. Commit both the spec and regenerated types
git add api/openapi.yaml src/api/generated/
git commit -m "chore(oas): update pinned spec from cesar"
```

The ecosystem orchestrator (`cesar-orchestration`) validates compatibility
between the backend spec and the frontend's pinned version.

## After syncing

```bash
npm run gen:api
```

This produces typed TanStack Query hooks in `src/api/generated/` and model
types in `src/api/generated/models/`.
