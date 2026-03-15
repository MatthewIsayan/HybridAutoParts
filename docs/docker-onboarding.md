# Docker Onboarding

## Stack

`docker-compose.yml` starts:

- `postgres`
- `backend`
- `frontend`

## Startup

```bash
docker compose up --build
```

## What Healthy Looks Like

- `postgres` reports healthy
- backend responds at `http://localhost:8080/api/health`
- frontend responds at `http://localhost:3000`

## Persistent Data

- Postgres data is stored in the `postgres-data` named volume
- Uploaded part images are stored in the `backend-uploads` named volume

## Useful Rebuild Commands

Rebuild the full stack:

```bash
docker compose up --build
```

Rebuild only the backend:

```bash
docker compose up --build backend
```

Rebuild backend and frontend:

```bash
docker compose up --build backend frontend
```

## Common Recovery Steps

- If schema or seed data is unexpectedly stale, stop the stack and remove the Postgres volume before restarting.
- If uploaded media behavior is stale, remove the uploads volume before restarting.
- If the frontend serves an older bundle, rebuild the frontend container explicitly.

## Proxy Notes

The frontend container serves static assets through Nginx and proxies:

- `/api/`
- `/actuator/`
- `/v3/api-docs`
- `/swagger-ui/`

to the backend container on `backend:8080`.
