# Environment Variables

## Database

- `POSTGRES_DB`: Docker Postgres database name
- `POSTGRES_USER`: Docker Postgres username
- `POSTGRES_PASSWORD`: Docker Postgres password
- `SPRING_PROFILES_ACTIVE`: Spring profile override, use `demo` for the shared Railway environment
- `SPRING_DATASOURCE_URL`: backend JDBC URL
- `SPRING_DATASOURCE_USERNAME`: backend JDBC username
- `SPRING_DATASOURCE_PASSWORD`: backend JDBC password

## CORS And Security

- `APP_ENVIRONMENT`: human-readable environment label exposed through `/actuator/info`
- `APP_RELEASE_VERSION`: deploy version label exposed through `/actuator/info` and OpenAPI metadata
- `APP_CORS_ALLOWED_ORIGINS`: comma-separated frontend origins allowed to call `/api/**`
- `APP_SECURITY_JWT_SECRET`: JWT signing secret used by the backend
- `APP_SECURITY_JWT_EXPIRATION`: token expiration duration, for example `PT8H`

## Media

- `APP_MEDIA_UPLOADS_PATH`: filesystem root where uploaded part images are stored
- `APP_MEDIA_URL_PREFIX`: public URL prefix served by the backend for uploaded files
- `SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE`: per-file upload limit
- `SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE`: total multipart request size limit

## Frontend Build

- `VITE_API_BASE_URL`: optional frontend build-time API base URL. Leave it empty for local Vite proxying, or set it to the backend public URL for split-host deployments such as Railway.

## Local Defaults

The repo includes local-friendly defaults in `application.yml` and `docker-compose.yml`, and `.env.example` documents the full surface that local developers or shared demo deployments are expected to override when needed.

## Notes

- The JWT secret should be changed for shared or production-like environments.
- Docker uses `/app/uploads` inside the backend container and persists it via a named volume.
- The frontend container is exposed on port `3000`; local Vite development typically uses `5173`.
- Uploaded media paths stay under `/uploads`, and the frontend rewrites those paths to the backend base URL when `VITE_API_BASE_URL` is set.
