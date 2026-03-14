# Hybrid Auto Parts

Phase 0 foundation for the Hybrid Auto Parts phased functional spec.

## Structure

- `backend/` Spring Boot API with Flyway, PostgreSQL, MapStruct, and OpenAPI
- `frontend/` React + TypeScript + Vite app with Tailwind, React Router, TanStack Query, and shadcn-ready utilities
- `shared/api-types/` generated TypeScript API contracts
- `docker-compose.yml` local stack for `postgres`, `backend`, and `frontend`

## Local Stack

1. Copy `.env.example` to `.env` if you want to override defaults.
2. Run `docker compose up --build`.
3. Open `http://localhost:3000` for the frontend.
4. Open `http://localhost:8080/swagger-ui.html` for backend API docs.

## Generated API Types

Run this from the repo root after the backend is running:

```bash
npm install
npm run generate:api-types
```

That command refreshes `shared/api-types/generated.ts` from the backend OpenAPI document.

## Phase 0 Notes

- Seed data includes one company config record, three sample parts, placeholder image URLs, and a local-only default admin user.
- The public home route and admin route are placeholders so Phase 1 and Phase 2 can build on stable routing and shared contracts.
