Phase 1 is complete in this repository. Please begin Phase 2 from `docs/phased-functional-spec.md`.

Current state:
- Phase 0 and Phase 1 are implemented.
- Public inventory browsing, company profile, part detail pages, baseline search, pagination, backend tests, and frontend tests already work.
- Seed data now reflects `Hybrid Auto Parts`, `9787 Glenoaks Blvd, Sun Valley, CA 91352`, with imported local catalog images under `frontend/public/images/seed/ebay/hybridonlyparts/`.
- Monorepo structure remains:
  - `backend/` Spring Boot + Gradle + PostgreSQL + Flyway + MapStruct + OpenAPI
  - `frontend/` React + TypeScript + Vite + Tailwind + React Router + TanStack Query
  - `shared/api-types/` for generated frontend API types
  - Docker Compose wiring for `postgres`, `backend`, and `frontend`

Please implement Phase 2: Admin Authentication And Inventory CRUD.

Use the spec as the source of truth, especially:
- admin authentication endpoint
- JWT issuance for valid admin credentials
- Spring Security protection for admin API routes
- create, update, delete, and status update operations for parts
- update operation for company configuration
- BCrypt password handling
- frontend admin login flow
- protected admin route handling
- inventory manager list view
- create/edit part forms
- delete confirmation flow
- company branding settings form
- backend tests for auth and protected CRUD endpoints
- frontend tests for auth guard behavior and form submission flows

Important constraints:
- Build on the existing Phase 0 and Phase 1 structure; do not re-scaffold the repo.
- Preserve Docker-based local startup.
- Keep multi-image upload/ordering deferred to Phase 3 unless Phase 2 strictly needs placeholders.
- Prefer generated shared API types in the frontend instead of handwritten duplicates.
- Preserve the public site behavior while layering in admin capabilities.

Start by inspecting the current implementation and the Phase 2 section of `docs/phased-functional-spec.md`, then make the smallest coherent set of changes to complete Phase 2.
