This repository is a Vite + React frontend for a FastAPI backend. The file below gives actionable, repository-specific guidance for AI coding agents to be immediately productive.

Principles
- Keep changes minimal and focused: prefer small, well-scoped edits and avoid large refactors without an explicit issue or tests.  
- Preserve generated code: `src/client` is generated from the backend OpenAPI schema. Don't modify generated files in-place — update the generator inputs and re-run generation.  
- Run the dev server locally when iterating: `npm run dev` serves at http://localhost:5173/ for fast feedback.

Where to look first (big picture)
- Frontend entry: `src/main.tsx` and top-level styles at `src/index.css`.  
- Routing: `routeTree.gen.ts` and `src/routes` (pages and nested layouts). The project uses TanStack Router; route files under `src/routes` define pages.  
- API client: `src/client` (generated OpenAPI client). Core helpers are in `src/client/core` (e.g., `request.ts`, `ApiError.ts`, `CancelablePromise.ts`). Use these helpers for network calls so app-level behavior (headers, error handling, cancelation) remains consistent.  
- UI primitives: `src/components/ui` contains the shared design-system primitives (buttons, inputs, table, dialog, etc.). Prefer these components over creating new ad-hoc UI elements.  
- Domain components: `src/components/*` contain feature UIs (Admin, Items, Pending, Sidebar, UserSettings). Use their patterns for layout, data-fetching, and actions.

Build / Test / Dev workflows
- Start dev server: `npm run dev` (Vite). Dev server runs at `http://localhost:5173/` by default.  
- Production build: `npm run build` (runs `tsc` then `vite build`).  
- Lint: `npm run lint` (uses Biome). Keep lint changes limited to files you modify.  
- Generate API client: `npm run generate-client` (registered to `openapi-ts`). Prefer the provided script or the repository script `./scripts/generate-client.sh` (see README) so output stays consistent.  
- Playwright tests: tests live in `tests/`. Use Playwright via `npx playwright test` (README documents running tests with Docker Compose when the backend is needed).  
- Environment: README recommends `fnm`/`nvm` and the repo contains an `.nvmrc` — match node versions when running locally.

Project-specific patterns and conventions
- Generated client usage: do not hand-edit `src/client/sdk.gen.ts` or other generated artifacts. If the backend OpenAPI changes, regenerate the client and commit the generated files.  
- Central request pattern: `src/client/core/request.ts` centralizes fetch options (base URL, headers). When changing global API behavior (auth headers, error parsing), update this file to propagate changes app-wide.  
- Error model: API errors are represented by `ApiError` in `src/client/core/ApiError.ts`. Prefer throwing/handling this type rather than ad-hoc error objects.  
- Data fetching: components commonly use TanStack Query (`@tanstack/react-query`) patterns. Follow existing Query keys and cache patterns to avoid duplicate fetches.  
- Forms & validation: project uses `react-hook-form` and `zod` for validation in several forms; mirror existing patterns (resolver usage, error display components in `src/components/ui/form.tsx`).  
- UI composition: prefer composition over styling inline. Use `class-variance-authority` and `tailwind` patterns found in `src/components/ui`.

Integration points & environment
- Backend base URL: configured via `VITE_API_URL`. For local dev, dev server defaults to proxied or local backend; README describes using Docker Compose.  
- OpenAPI generator: `@hey-api/openapi-ts` is used. See `package.json` script `generate-client` and README steps that call `./scripts/generate-client.sh`.  
- Linting: Biome is used (`@biomejs/biome`). Use `npm run lint` and prefer to run it only on changed files when iterating.

When editing code
- Update tests: when making behavior changes, update or add unit/E2E tests in `tests/` where appropriate. Playwright E2E requires backend availability (see README Docker Compose commands).  
- Update generated artifacts carefully: if you need to update the OpenAPI client, run the generator and commit generated output. Include the command you used in the PR description.  
- Keep commits focused: follow single-purpose commits (e.g., `fix: update API call handling in request.ts`).

Files to reference while making changes
- `package.json` — scripts and dev tooling.  
- `README.md` — dev/test instructions and environment notes.  
- `src/client/core/request.ts` — central API request configuration.  
- `src/client` (generated) — OpenAPI-generated client and types.  
- `src/components/ui` — shared UI primitives and patterns.  
- `src/routes` and `routeTree.gen.ts` — routing structure and conventions.  
- `tests/` and `playwright.config.ts` — E2E test layout and expectations.

Quick examples
- Regenerate client (local):

  1. Ensure backend OpenAPI is available (or place `openapi.json` at repo root).  
  2. Run:

     npm run generate-client

- Run dev server:

     npm run dev

- Run lint:

     npm run lint

Agent do/don't checklist
- Do: update `src/client/core/request.ts` for global API changes.  
- Do: regenerate `src/client` using `npm run generate-client` and commit generated files.  
- Don't: hand-edit generated files as a first step; prefer adjusting generator inputs.  
- Don't: start sweeping refactors without tests or a linked issue.

If any automated guidance here is unclear or incomplete, please tell me which file or workflow you'd like expanded and I will update this file.
