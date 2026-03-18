# Repository Guidelines

## Project Structure

- `apps/client/`: React + Vite frontend (Ant Design). Main code in `apps/client/src/`.
- `apps/server/`: NestJS + Prisma backend API. Main code in `apps/server/src/`, schema in `apps/server/prisma/schema.prisma`.
- `packages/shared/`: shared TypeScript types/constants used by both apps.
- Infra/docs: `docker/`, `nginx/`, `docs/`.

## Build, Test, and Development Commands

This repo uses a pnpm workspace (`pnpm-workspace.yaml`).

- Install: `pnpm install`
- Dev (all packages): `pnpm dev` (runs workspaces in parallel)
- Dev (single app): `pnpm --filter @narcissus/client dev` / `pnpm --filter @narcissus/server dev`
- Build: `pnpm build`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Format: `pnpm format` / `pnpm format:check`
- DB init/migrate (server): `pnpm --filter @narcissus/server prisma:generate` and `pnpm --filter @narcissus/server prisma:migrate`

## Coding Style & Naming Conventions

- TypeScript-first; prefer `interface` for data shapes and avoid overusing `any` (ESLint warns on `any`).
- React: function components + Hooks only (no class components).
- Files: use kebab-case (e.g. `auth-store.ts`, `use-init-theme.ts`).
- API access: use `apps/client/src/services/api-client.ts` (Axios interceptors handle auth + error normalization).
- CSS: prefer flex layouts; avoid `float`. Autoprefixing is configured via PostCSS.
- Security: do not use `eval()` / `with()`.

## Testing Guidelines

Tests are not fully wired yet: current `pnpm test` scripts print placeholders for “Vitest” (client) and “Jest” (server).
When adding tests, keep them close to code (e.g. `src/**/__tests__/*` or `src/**/*.test.ts(x)`), and ensure `pnpm test` passes before opening a PR.

## Commit & Pull Request Guidelines

- Follow existing Conventional-Commit style messages (e.g. `feat: 管理页面完善`, `fix: ...`).
- PRs should include: a short summary, linked issue (if any), and screenshots/GIFs for UI changes.
- For backend changes, call out Prisma schema/migration impact and any required `.env` changes.

## Configuration & Secrets

- Server env: copy `apps/server/.env.example` to `apps/server/.env`. Never commit real secrets; change JWT secrets for production.
- Frontend API base: set `VITE_API_BASE_URL` in a local env file if needed.
