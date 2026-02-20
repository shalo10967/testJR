# TestJR — User & Posts Management Portal

Fullstack challenge: Next.js frontend, Node.js backend (hexagonal), MongoDB. Auth and user data via [ReqRes API](https://reqres.in/); posts and saved users in local DB.

## Structure

- **apps/api** — Node.js (Express) REST API, hexagonal architecture, MongoDB
- **apps/web** — Next.js 14 (App Router), TypeScript, Tailwind, atomic design

## Prerequisites

- Node.js 18+
- Docker (for MongoDB)

## Install

```bash
npm install
```

## Run locally

1. Start MongoDB:

```bash
npm run docker:up
```

2. Backend (from repo root):

```bash
npm run dev:api
```

Runs at `http://localhost:4000`.

3. Frontend (from repo root):

```bash
npm run dev:web
```

Runs at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL=http://localhost:4000` if the API is on another host.

## Run in production (local)

Build and run API and web as production (e.g. to test production behaviour). ReqRes often returns 403 to server requests; set `MOCK_REQRES_LOGIN=1` so login works with test credentials.

1. Start MongoDB: `npm run docker:up`

2. Build everything:
   ```bash
   npm run build
   ```

3. Start the API (production; set `JWT_SECRET` and use `MOCK_REQRES_LOGIN=1` for local testing):
   ```bash
   NODE_ENV=production JWT_SECRET=your-secret-here MOCK_REQRES_LOGIN=1 npm run start:api
   ```
   Or from `apps/api`: `NODE_ENV=production JWT_SECRET=your-secret-here MOCK_REQRES_LOGIN=1 node dist/index.js`

4. In another terminal, start the web:
   ```bash
   npm run start:web
   ```
   Web: http://localhost:3000 — API: http://localhost:4000

Ensure `NEXT_PUBLIC_API_URL` was set to `http://localhost:4000` when you ran `npm run build:web` (or set it before building).

## Tests

- Backend: `npm run test:api` (Vitest, use cases)
- Frontend: `npm run test:web` (Vitest + React Testing Library)

## Environment variables

### API (apps/api)

| Variable         | Description                         | Default                    |
|------------------|-------------------------------------|----------------------------|
| `MONGODB_URI`    | MongoDB connection string           | `mongodb://localhost:27017/testjr` |
| `PORT`           | Server port                         | `4000`                     |
| `JWT_SECRET`     | Secret for signing JWTs (required in production) | `change-me-in-production` (dev only) |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`)              | `7d`                       |
| `JWT_COOKIE_NAME`   | Cookie name for session token       | `token`                    |
| `CORS_ORIGIN`       | Allowed CORS origins (comma-separated); omit for any | (any) |
| `REQRES_API_KEY`    | API key for ReqRes (sent as `x-api-key` header); use if your ReqRes plan requires it | (unset) |
| `MOCK_REQRES_LOGIN` | If `1`, accept test credentials when ReqRes returns 403 (dev only) | (unset) |

### Web (apps/web)

| Variable              | Description        | Default              |
|-----------------------|--------------------|----------------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL   | `http://localhost:4000` |

## API endpoints

| Method | Path                 | Auth | Description                    |
|--------|----------------------|------|--------------------------------|
| POST   | /auth/login          | No   | Login (proxies ReqRes), returns JWT |
| GET    | /reqres/users?page=  | Yes  | List users from ReqRes        |
| GET    | /reqres/users/:id    | Yes  | ReqRes user by id              |
| POST   | /users/import/:id     | Yes  | Import ReqRes user into DB     |
| GET    | /users/saved         | Yes  | List locally saved users       |
| GET    | /users/saved/:id     | Yes  | Saved user by id               |
| POST   | /posts               | Yes  | Create post                    |
| GET    | /posts               | Yes  | List posts                     |
| GET    | /posts/:id           | Yes  | Post by id                     |
| PUT    | /posts/:id           | Yes  | Update post                    |
| DELETE | /posts/:id           | Yes  | Delete post                    |

Protected routes accept auth via header `Authorization: Bearer <token>` or via cookie (name from `JWT_COOKIE_NAME`; set on successful login).

## Deploy

### Backend (AWS Lambda)

1. **MongoDB:** Use Atlas or DocumentDB. Set `MONGODB_URI` in the Lambda environment.
2. **Build:** From repo root, `npm run build:api` (output in `apps/api/dist`).
3. **Package:** With Serverless Framework (example):
   - Create `serverless.yml` in `apps/api` (or repo root) defining a single Lambda, handler pointing to `dist/index.handler` if you wrap Express (e.g. with `serverless-http`), or use a custom runtime that runs `node dist/index.js`.
   - Set env: `MONGODB_URI`, `JWT_SECRET` (required), `JWT_EXPIRES_IN`, optional `CORS_ORIGIN`, `JWT_COOKIE_NAME`.
4. **Deploy:** `npx serverless deploy` (or `sam deploy` / CDK deploy depending on choice). Note the API Gateway base URL (e.g. `https://xxxx.execute-api.region.amazonaws.com/dev`).
5. **Deployed backend URL:** Set this as the public base URL for the API (e.g. in README or submission: `https://your-api-id.execute-api.region.amazonaws.com/dev`).

### Frontend

- Build: `npm run build:web`. Deploy `apps/web` to Vercel/Netlify (or static export to S3 + CloudFront).
- Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.

## Backend architecture (hexagonal)

- **Domain:** `User`, `Post` entities
- **Application (ports):** `ReqResClientPort`, `UserRepositoryPort`, `PostRepositoryPort`
- **Application (use cases):** Login, ImportUser, GetSavedUsers, GetSavedUser, CreatePost, GetPosts, GetPost, UpdatePost, DeletePost
- **Adapters out:** `ReqResClient` (HTTP), `MongoUserRepository`, `MongoPostRepository` (Mongoose)
- **Adapters in:** Express routes, auth middleware, validation (Zod), central error handler

## Frontend structure (atomic design)

- **Atoms:** Button, Input
- **Molecules:** FormField
- **Organisms:** LoginForm
- **Templates:** AuthLayout, DashboardLayout
- **Pages:** App Router routes under `src/app` (login, users, posts)
