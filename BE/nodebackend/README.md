# TMS Node.js backend

This Node.js/TypeScript API serves the admissions and account APIs used by the React frontend.

## Local setup

- Node.js 22.5 or newer (`node:sqlite` is used; Node 24 is recommended).
- No database server is needed for local development. SQLite data is stored at `data/tms.sqlite`.

From this directory, run:

```powershell
npm install
npm run migrate
npm run dev
```

The API listens on `http://localhost:8080`. The React frontend runs separately from `FE` on port 5173.

By default, activation messages are written as `.eml` files in `data/mail-preview` so the enrollment flow can be tested without SMTP. Open a preview file locally to view the activation email. These files contain temporary credentials and are excluded from Git. To send real email, set `MAIL_MODE=smtp` and configure the SMTP variables from `.env.example`.

## API

- `GET /api/health`
- `GET|POST /api/leads`
- `GET|PUT /api/leads/:id`
- `POST /api/leads/:id/enroll`
- `GET|POST /api/accounts`
- `GET|PUT|DELETE /api/accounts/:id`
