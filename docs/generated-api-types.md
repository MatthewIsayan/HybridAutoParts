# Generated API Types

## Purpose

The frontend consumes generated contracts from `shared/api-types/generated.ts` instead of maintaining duplicate handwritten DTOs.

## Command

Run from the repo root after the backend is running:

```bash
npm install
npm run generate:api-types
```

## Preconditions

- Backend available at `http://localhost:8080`
- OpenAPI document reachable at `http://localhost:8080/v3/api-docs`

## Workflow

1. Change backend controllers, DTOs, or OpenAPI-exposed contracts.
2. Rebuild or restart the backend if needed.
3. Run `npm run generate:api-types`.
4. Update any frontend aliases in `frontend/src/types/api.ts` if the generated operation names or schemas changed.
5. Commit the regenerated `shared/api-types/generated.ts` file alongside the backend/frontend code that depends on it.

## Drift Prevention

- Do not bypass generated schemas with parallel handwritten frontend types.
- If the frontend build fails after backend contract changes, regenerate first before debugging route code.
