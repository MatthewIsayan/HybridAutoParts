# Demo Deployment

## Goal

Publish tagged Docker images for a shared demo release while keeping Railway setup manual. This is intentionally not a production deployment shape yet.

## Demo Environment Shape

- `postgres`: Railway PostgreSQL service
- `backend`: Spring Boot Docker service built from `backend/Dockerfile`
- `frontend`: React + Nginx Docker service built from `frontend/Dockerfile`

The demo environment should use:

- `SPRING_PROFILES_ACTIVE=demo`
- the seeded Flyway database on first boot
- a persistent volume mounted to `/app/uploads` on the backend service
- a tagged release convention such as `demo-v0.1.0`

## Image Publishing

The release workflow publishes two images to GitHub Container Registry on tags such as `demo-v0.1.0`:

- `ghcr.io/<owner>/hybrid-auto-parts-backend:demo-v0.1.0`
- `ghcr.io/<owner>/hybrid-auto-parts-frontend:demo-v0.1.0`

It also updates:

- `ghcr.io/<owner>/hybrid-auto-parts-backend:demo-latest`
- `ghcr.io/<owner>/hybrid-auto-parts-frontend:demo-latest`

The workflow does not create or update Railway services anymore. It only verifies the repo, then builds and pushes versioned Docker images.

## Railway Service Setup

### Backend service

When you manually wire Railway to the published backend image, set these variables:

- `SPRING_PROFILES_ACTIVE=demo`
- `APP_ENVIRONMENT=demo`
- `APP_RELEASE_VERSION=<matching demo tag>`
- `SPRING_DATASOURCE_URL=<Railway Postgres JDBC URL>`
- `SPRING_DATASOURCE_USERNAME=<Railway Postgres user>`
- `SPRING_DATASOURCE_PASSWORD=<Railway Postgres password>`
- `APP_CORS_ALLOWED_ORIGINS=https://<frontend-domain>`
- `APP_SECURITY_JWT_SECRET=<strong-random-secret>`
- `APP_MEDIA_UPLOADS_PATH=/app/uploads`
- `APP_MEDIA_URL_PREFIX=/uploads`

Attach a persistent volume at `/app/uploads` so admin image uploads survive redeploys.

### Frontend service

When you manually wire Railway to the published frontend image, set:

- `VITE_API_BASE_URL=https://<backend-domain>`

The frontend container now reads `VITE_API_BASE_URL` at runtime, so you can reuse the same published image across environments without rebuilding it.

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
- `demo-deploy.yml`: publishes tagged demo images to GitHub Container Registry

No extra registry secret is required for publishing to GHCR from Actions because the workflow uses the repository `GITHUB_TOKEN`.

If Railway needs credentials to pull private GHCR packages later, either make the packages public or configure GHCR pull credentials in Railway.

## Suggested Demo Checklist

After each demo image release:

- confirm both images were published in GHCR with the new tag
- open the frontend domain and confirm the homepage loads
- confirm featured inventory renders
- confirm inventory search works
- sign in with `admin / password`
- upload a test image and verify it loads from the backend domain
- confirm `https://<backend-domain>/actuator/info` returns the expected environment and version
