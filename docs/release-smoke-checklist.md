# Release Smoke Checklist

## Startup

- Run `docker compose up --build`
- Confirm frontend loads at `http://localhost:3000`
- Confirm backend health at `http://localhost:8080/api/health`
- Confirm actuator health at `http://localhost:8080/actuator/health`
- Confirm Swagger UI loads at `http://localhost:8080/swagger-ui.html`

## Public Flows

- Open the home page and verify featured inventory renders
- Open `/inventory` and run a multi-term search
- Open a part detail page and confirm gallery/fallback behavior works
- Verify company/contact copy is present on public pages

## Admin Flows

- Sign in with the local admin account
- Create or edit a part
- Change part status from the admin inventory screen
- Upload, reorder, and delete part images
- Update company settings and verify success feedback

## Regression Checks

- Confirm a `401` admin failure returns a JSON error body and `X-Request-Id`
- Confirm public uploads are reachable through the backend
- Confirm generated API types are up to date if backend contracts changed
