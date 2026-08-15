# CyberSecOps

A small Attack Surface Management / vulnerability-scanning platform for lab and
staging environments. Users register an organization, register assets
(IPs, domains, URLs), launch scans against them (currently `nmap`), and
review the resulting findings — all scoped per-organization.

> ⚠️ **Scan authorized targets only.** The included `docker-compose.yml`
> ships an intentionally vulnerable OWASP Juice Shop container as a safe,
> legal scan target for local testing. Never point scans at hosts you don't
> own or have explicit permission to test.

## Architecture

```
frontend/   Next.js 16 (App Router, TypeScript, Tailwind)
backend/    FastAPI + SQLAlchemy + Alembic, Celery worker for async scans
infra/      docker-compose.yml — Postgres, Redis, Juice Shop lab target
```

- **Auth**: email/password, bcrypt-hashed, JWT bearer tokens (`python-jose`).
- **Multi-tenancy**: every asset/scan/finding is scoped to the caller's
  organization via `organization_id`; cross-org access returns `404`.
- **Scanning**: `POST /scans` queues a Celery task that runs `nmap -sV -Pn`
  against the asset and parses open ports/services into `Finding` rows.

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (for Postgres, Redis, and the Juice Shop lab target)
- `nmap` installed locally if you want to run the Celery worker outside Docker

## Setup

### 1. Start infrastructure

```bash
cd infra
docker compose up -d
```

This starts Postgres (`localhost:5432`), Redis (`localhost:6379`), and
Juice Shop (`localhost:3000` — a safe scan target for testing).

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env and set a real JWT_SECRET, especially outside local dev

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

In a second terminal, start the Celery worker that actually runs scans:

```bash
cd backend
source .venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3001` (or whatever port Next.js picks if 3000 is
already taken by Juice Shop) and register an account.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list.
Key ones:

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | Postgres connection string |
| `REDIS_URL` | backend | Celery broker/result backend |
| `JWT_SECRET` | backend | Signing key for auth tokens — **must** be changed outside local dev |
| `CORS_ALLOWED_ORIGINS` | backend | Comma-separated list of origins allowed to call the API |
| `NEXT_PUBLIC_API_URL` | frontend | Base URL the frontend uses to reach the backend |

## Security notes

- Default secrets in `core_config.py` are for local dev only — always set
  real values via `.env` before deploying anywhere reachable.
- JWTs are currently stored in `localStorage` on the frontend for
  simplicity; for a production deployment, prefer httpOnly cookies to
  reduce XSS token-theft risk.
- `nmap` is invoked via `subprocess.run` with an argument list (not a
  shell string), so asset values can't be used for shell injection —
  but only ever register assets you're authorized to scan.

## Running tests / verifying the setup

```bash
# Backend: confirm the app imports and the schema is valid
cd backend && python -c "from app.main import app"

# Frontend: type-check and lint
cd frontend && npx tsc --noEmit && npx eslint .
```
