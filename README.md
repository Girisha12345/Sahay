# Sahāy

Sahāy is a full-stack marketplace platform for local services with role-based workflows for Customer, Provider, Support Agent, and Admin users.

The project currently supports production-style flows for authentication, service discovery, booking, checkout, payments, chat, notifications, moderation, and support operations.

## Highlights

- Multi-role authentication and authorization using JWT
- Customer flow: browse services, checkout, payment, booking tracking, chat, reviews
- Provider flow: service CRUD, bookings, availability, earnings, wallet insights
- Admin flow: analytics, provider approval/rejection, flagged chat monitoring
- Support flow: support ticket handling and escalation workflow
- Realtime updates through WebSockets (chat and notifications)

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Axios
- React Router

### Backend
- Python
- Django
- Django REST Framework
- SimpleJWT
- Django Channels
- PostgreSQL
- Redis
- drf-yasg (Swagger)

## Project Structure

```text
sahayy/
├── backend/
│   ├── accounts/
│   ├── services/
│   ├── bookings/
│   ├── payments/
│   ├── chat/
│   ├── notifications/
│   ├── reviews/
│   ├── support/
│   ├── adminpanel/
│   └── config/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── provider/
│       ├── services/
│       ├── store/
│       ├── components/
│       └── utils/
├── render.yaml
└── README.md
```

## Quick Start (Local)

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL
- Redis

### 1) Backend Setup

```bash
cd backend
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
..\.venv\Scripts\python.exe manage.py migrate
..\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

### 2) Frontend Setup

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### 3) Open the App

- Frontend: http://127.0.0.1:5173
- Backend API: http://127.0.0.1:8000
- Swagger Docs: http://127.0.0.1:8000/api/docs/

## Environment Variables

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost,testserver
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DB_NAME=sahay_db
DB_USER=postgres
DB_PASSWORD=Giri@8453
DB_HOST=localhost
DB_PORT=5433
DATABASE_URL=postgresql://postgres:Giri%408453@localhost:5433/sahay_db

REDIS_URL=redis://localhost:6379/0
CACHE_BACKEND=django.core.cache.backends.locmem.LocMemCache
CACHE_LOCATION=sahay-cache

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Optional `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
VITE_WS_URL=ws://127.0.0.1:8000
```

## Core Modules

- `accounts`: users, roles, provider profile, auth
- `services`: categories, public services, provider-owned service management
- `bookings`: booking lifecycle and state transitions
- `payments`: intent/order/verification, refunds, wallet and transactions
- `chat`: booking-scoped chat and flagged-content logging
- `notifications`: in-app notifications + realtime socket events
- `reviews`: post-service ratings and comments
- `support`: support ticket workflows
- `adminpanel`: analytics, provider verification actions, moderation views

## Current Status

Implemented and integrated:

- Role-protected route architecture for all four roles
- Customer booking and checkout flow with payment integration
- Provider dashboard pages connected to live APIs
- Provider service management with create, update, activate/deactivate, delete
- Provider availability persistence
- Wallet and transaction-backed provider earnings views
- Chat privacy controls (PII/contact pattern flagging)
- Admin moderation and provider approval flows

## Build and Checks

Frontend build:

```bash
cd frontend
npm run build
```

Backend checks:

```bash
cd backend
..\.venv\Scripts\python.exe manage.py check
```

## Deployment Notes

- `render.yaml` includes backend service and managed PostgreSQL configuration.
- Backend starts with Gunicorn + Uvicorn worker (ASGI-ready).
- Configure production values for `DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and payment credentials.
- Use Redis in production for Channels websocket scaling.

## Troubleshooting

- API/network errors on login usually mean backend is not running at `http://127.0.0.1:8000`.
- If categories/services are empty, validate data from `/api/categories/` and `/api/services/`.
- If local API smoke tests fail with `DisallowedHost`, include `testserver` in `ALLOWED_HOSTS`.
- If websocket updates do not appear, check `VITE_WS_URL` and backend Redis availability.

## Documentation

- Midterm review report (template-aligned): [PROJECT_REPORT.md](PROJECT_REPORT.md)
- Frontend notes: [frontend/README.md](frontend/README.md)
