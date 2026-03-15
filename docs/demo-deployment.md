# Demo Deployment

## Goal

Use Railway as a low-cost shared demo environment backed by the existing Flyway seed data. This is intentionally not a production deployment shape yet.

## Demo Environment Shape

- `postgres`: Railway PostgreSQL service
- `backend`: Spring Boot Docker service built from `backend/Dockerfile`
- `frontend`: React + Nginx Docker service built from `frontend/Dockerfile`

The demo environment should use:

- `SPRING_PROFILES_ACTIVE=demo`
- the seeded Flyway database on first boot
- a persistent volume mounted to `/app/uploads` on the backend service
- a tagged release convention such as `demo-v0.1.0`

## Railway Service Setup

### Backend service

Set these Railway variables on the backend service:

- `RAILWAY_DOCKERFILE_PATH=backend/Dockerfile`
- `SPRING_PROFILES_ACTIVE=demo`
- `APP_ENVIRONMENT=demo`
- `APP_RELEASE_VERSION=demo-v0.1.0`
- `SPRING_DATASOURCE_URL=<Railway Postgres JDBC URL>`
- `SPRING_DATASOURCE_USERNAME=<Railway Postgres user>`
- `SPRING_DATASOURCE_PASSWORD=<Railway Postgres password>`
- `APP_CORS_ALLOWED_ORIGINS=https://<frontend-domain>`
- `APP_SECURITY_JWT_SECRET=<strong-random-secret>`
- `APP_MEDIA_UPLOADS_PATH=/app/uploads`
- `APP_MEDIA_URL_PREFIX=/uploads`

Attach a persistent volume at `/app/uploads` so admin image uploads survive redeploys.

### Frontend service

Set these Railway variables on the frontend service:

- `RAILWAY_DOCKERFILE_PATH=frontend/Dockerfile`
- `VITE_API_BASE_URL=https://<backend-domain>`

The frontend is now built to call the backend directly, so no Nginx proxying is required between services.

### Postgres service

Use Railway Postgres and point the backend datasource variables at that service. Flyway will create the schema and load the existing Hybrid Auto Parts seed data automatically on a fresh database.

## Seed Data Behavior

- The demo catalog is migration-driven, not runtime-seeded.
- The Hybrid seed image files live under `frontend/public/images/seed/ebay/hybridonlyparts`.
- If those files are ever missing locally, rebuild them with `python scripts/hydrate_ebay_seed_images.py` before deploying.
- A brand-new database gets the full seeded inventory automatically.
- Once admins edit data in the demo, the environment will drift from the original seed baseline.
- To fully reset the demo data, recreate the demo database or restore from a clean seeded snapshot.

## Release Versioning

Use Git tags as the deploy version source of truth:

- `demo-v0.1.0`
- `demo-v0.1.1`
- `demo-v0.2.0`

Keep `APP_RELEASE_VERSION` aligned with the current deployed tag so `/actuator/info` and the OpenAPI document reflect the demo release version.

## GitHub Actions

Two workflows are included:

- `ci.yml`: runs backend tests plus frontend test and build validation
- `demo-deploy.yml`: deploys tagged demo releases to Railway

Required repository secrets:

- `RAILWAY_TOKEN`
- `RAILWAY_BACKEND_SERVICE_ID`
- `RAILWAY_FRONTEND_SERVICE_ID`

`RAILWAY_TOKEN` must be a Railway project token, not a personal API token.

## Suggested Demo Checklist

After each demo deploy:

- open the frontend domain and confirm the homepage loads
- confirm featured inventory renders
- confirm inventory search works
- sign in with `admin / password`
- upload a test image and verify it loads from the backend domain
- confirm `https://<backend-domain>/actuator/info` returns the expected environment and version
