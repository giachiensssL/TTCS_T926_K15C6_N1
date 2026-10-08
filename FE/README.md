# TMS Account Administration

Responsive React + TypeScript account-management UI.

## Run locally

1. Start PostgreSQL and configure `BE/.env` from `BE/.env.example`, including valid SMTP credentials. The backend only creates an account when it can send its activation email.
2. In `BE`, run `npm install` and `npm run start:dev`.
3. In `FE`, copy `.env.example` to `.env`, run `npm install`, then run `npm run dev`.
4. Open the Vite URL (normally `http://localhost:5173`).

The user list uses `GET /users` with `search`, `role`, `status`, `page`, and `limit` query parameters. New accounts use `POST /users`; account edits use `PATCH /users/:id`.
