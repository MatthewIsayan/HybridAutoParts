# Environment Variables

## Database

- `POSTGRES_DB`: Docker Postgres database name
- `POSTGRES_USER`: Docker Postgres username
- `POSTGRES_PASSWORD`: Docker Postgres password
- `SPRING_DATASOURCE_URL`: backend JDBC URL
- `SPRING_DATASOURCE_USERNAME`: backend JDBC username
- `SPRING_DATASOURCE_PASSWORD`: backend JDBC password

## CORS And Security

- `APP_CORS_ALLOWED_ORIGINS`: comma-separated frontend origins allowed to call `/api/**`
- `APP_SECURITY_JWT_SECRET`: JWT signing secret used by the backend
- `APP_SECURITY_JWT_EXPIRATION`: token expiration duration, for example `PT8H`

## Media

- `APP_MEDIA_UPLOADS_PATH`: filesystem root where uploaded part images are stored
- `APP_MEDIA_URL_PREFIX`: public URL prefix served by the backend for uploaded files
- `SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE`: per-file upload limit
- `SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE`: total multipart request size limit

## Local Defaults

The repo includes local-friendly defaults in `application.yml` and `docker-compose.yml`, but `.env.example` documents the full surface that local developers are expected to understand and override when needed.

## Notes

- The JWT secret should be changed for shared or production-like environments.
- Docker uses `/app/uploads` inside the backend container and persists it via a named volume.
- The frontend container is exposed on port `3000`; local Vite development typically uses `5173`.
