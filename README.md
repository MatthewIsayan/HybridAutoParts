# Hybrid Auto Parts

Hybrid Auto Parts is a phased MVP for public salvage inventory browsing plus protected admin inventory, media, and company-content management.

The repo is now set up for a shared `demo` deployment flow with seeded Flyway data, Docker-based service builds, and optional GitHub Actions driven Railway deploys.

## Current Stack

- `backend/`: Spring Boot API with Flyway, PostgreSQL, Spring Security JWT auth, MapStruct, and OpenAPI
- `frontend/`: React + TypeScript + Vite app with React Router, TanStack Query, Tailwind, and admin/public route shells
- `shared/api-types/`: generated TypeScript contracts from the backend OpenAPI document
- `docker-compose.yml`: local stack for `postgres`, `backend`, and `frontend`

## Quick Start

1. Copy `.env.example` to `.env` if you want to override defaults.
2. Run `docker compose up --build`.
3. Open `http://localhost:3000` for the app.
4. Open `http://localhost:8080/swagger-ui.html` for backend API docs.
5. Verify `http://localhost:8080/api/health` returns `ok`.

## Local Verification

- Public app: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Actuator health: `http://localhost:8080/actuator/health`
- Default local admin login: `admin / password`

## Generated API Types

Run this from the repo root after the backend is running:

```bash
npm install
npm run generate:api-types
```

That command refreshes `shared/api-types/generated.ts` from the backend OpenAPI document. The generated file is committed and should stay in sync with backend contract changes.

## Documentation

- [docs/local-development.md](docs/local-development.md)
- [docs/environment-variables.md](docs/environment-variables.md)
- [docs/generated-api-types.md](docs/generated-api-types.md)
- [docs/docker-onboarding.md](docs/docker-onboarding.md)
- [docs/demo-deployment.md](docs/demo-deployment.md)
- [docs/release-smoke-checklist.md](docs/release-smoke-checklist.md)
