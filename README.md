# V4YT OFFICIAL

React 19 + Vite frontend and a separate FastAPI backend. The frontend never connects to Supabase. The backend uses Supabase PostgreSQL through `DATABASE_URL`.

## Supabase setup

1. Create a Supabase project and save its database password.
2. In **Project Settings → Database → Connection string**, select **Transaction pooler** (port `6543`, pooler host) for the app connection and **Direct connection** (port `5432`) for migrations. Use the URI format and URL encode reserved characters in the password. Prefix the URL schemes with `postgresql+asyncpg://`.
3. Copy `backend/.env.example` to `backend/.env`. Set `DATABASE_URL`, `DIRECT_URL`, and a random `JWT_SECRET` with at least 32 characters. Set the admin email, username, and strong seed password. Never put these values in the Vite `.env` or commit them.
4. Copy root `.env.example` to `.env`; set only `VITE_API_BASE_URL=http://localhost:8000`.

PowerShell example:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item .env.example .env
```

## Run locally

```powershell
cd backend
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

In another terminal at the repo root:

```powershell
npm install
npm run dev
```

Open `/docs` for interactive API docs and `/health` for a DB connectivity check. Add your actual frontend origin (the Figma Make preview origin as well as local origin) to `CORS_ORIGINS` in `backend/.env`.

## Tests and commands

Backend tests: `cd backend; pytest`. Frontend production build: `npm run build`. Database integration checks require configured Supabase credentials; migrations are run with `DIRECT_URL`. The seed script is idempotent and reads `SEED_ADMIN_PASSWORD` only from backend environment.

## Deployment

Deploy the backend as an ASGI service with environment secrets configured in the host, allow the frontend origin through `CORS_ORIGINS`, and run Alembic once against the direct/session migration URL. Keep runtime DB connections on the transaction pooler. Deploy Vite as static files with `VITE_API_BASE_URL` pointing at the API. Supabase free-tier projects may pause when idle; provision a host/plan with enough connection capacity and monitor database sleep/cold-start behavior.
