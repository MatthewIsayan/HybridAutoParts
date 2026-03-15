# Local Development

## Prerequisites

- Docker Desktop or a compatible Docker runtime
- Node.js for the root `generate:api-types` script and frontend local development
- Java 21 if you want to run the backend outside Docker

## Default Local Ports

- Frontend app: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Docker-First Startup

1. Optionally copy `.env.example` to `.env`.
2. Run:

```bash
docker compose up --build
```

3. Wait for:
   - `postgres` healthy
   - backend reachable at `http://localhost:8080/api/health`
   - frontend reachable at `http://localhost:3000`

## First Things To Verify

- Public app loads at `http://localhost:3000`
- Swagger UI loads at `http://localhost:8080/swagger-ui.html`
- Actuator health responds at `http://localhost:8080/actuator/health`
- Default admin login works with `admin / password`

## Seeded Local Data

- One company config record
- Seed inventory records for browsing and search
- A local-only seeded admin user for testing protected flows

## Optional Native Development

### Backend

From `backend/`:

```bash
./gradlew bootRun
```

On Windows PowerShell:

```powershell
.\gradlew.bat bootRun
```

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api`, `/actuator`, `/v3/api-docs`, and `/swagger-ui` to `http://localhost:8080`.

## Common Checks

- Backend request correlation header: inspect `X-Request-Id` on API responses
- Public inventory search: verify multi-term searches on `/inventory`
- Admin inventory flow: create/edit/search/delete a part
- Admin media flow: upload, reorder, and delete part images

## Troubleshooting

- If Docker containers boot but the app looks stale, rerun `docker compose up --build`.
- If Postgres state is corrupted or obsolete, stop the stack and remove volumes before restarting.
- If generated API types look stale, make sure the backend is running and regenerate from the repo root.
