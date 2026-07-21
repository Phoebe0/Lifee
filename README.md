# Lifee Workspace

Monorepo for the Lifee mini program and backend API.

## Structure

- `apps/backend`: NestJS-style backend skeleton, Prisma schema, Redis, health check, and feature modules.
- `apps/frontend`: uni-app-style frontend skeleton, request layer, store, theme, and feature repositories.
- `packages/shared`: shared contracts for API responses and domain types.
- `backend-docs`: architecture, database, API, security, deployment, and filing documents.

## Start Points

- Backend entry: `apps/backend/src/main.ts`
- Frontend entry: `apps/frontend/src/main.ts`
- Prisma schema: `apps/backend/prisma/schema.prisma`

## Local Start

Prerequisites:

1. Install Node.js 20 LTS, pnpm 9, Docker Desktop, and WeChat DevTools.
2. Install dependencies at the workspace root:

```bash
pnpm install
```

3. Create these local environment files (they are ignored by Git):

- `apps/backend/.env`: backend port, database, Redis, JWT, and WeChat credentials.
- `apps/frontend/.env`: frontend environment name and API base URL.

Obtain the actual values from the project owner or your deployment platform. Never commit these files or paste production secrets into issues and pull requests.

4. Start PostgreSQL and Redis, then initialize the database:

```bash
docker compose up -d postgres redis
pnpm --dir apps/backend prisma:generate
pnpm --dir apps/backend prisma:migrate:dev --name init
```

5. Start the backend in terminal 1:

```bash
pnpm dev:backend
```

The API is available at `http://localhost:3000`. Verify it with
`http://localhost:3000/api/v1/health`.

6. Start the mini program compiler in terminal 2:

```bash
pnpm dev:frontend
```

Open WeChat DevTools and import `apps/frontend/dist/dev/mp-weixin`. For a production-style local build, run `pnpm --dir apps/frontend build:mp-weixin` and import `apps/frontend/dist/build/mp-weixin`.

## Verification

```bash
pnpm typecheck
pnpm build
pnpm test
```

The current backend and frontend are scaffolds. They start the application shells, health endpoint, request layer, shared contracts, and database connection structure. Business logic still needs to be filled in.
