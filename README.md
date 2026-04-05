# Sahāy

Sahāy is a full-stack SaaS marketplace for local services. It supports customer booking flows, provider management, support ticket handling, admin moderation, secure payments, and realtime chat/notifications.

## Project Overview

The application is structured as a multi-role platform with role-based routing and permissions:

- Customer: search services, create bookings, pay, chat, and review providers.
- Provider: manage bookings, earnings, and profile details.
- Support Agent: handle customer support tickets and escalations.
- Admin: manage platform operations, analytics, moderation, and approvals.

## Features

- JWT authentication with access and refresh tokens
- Role-based dashboards and protected routes
- Service browsing, search, and filtering
- Booking creation with date, time, address, and payment method selection
- Razorpay test-mode payment flow and cash handling
- 10% commission calculation with escrow-style release logic
- Anonymous in-app chat with phone-number sharing blocked by regex detection
- Realtime notifications over WebSockets
- Support ticket workflow and admin moderation tools
- Responsive Tailwind CSS UI with cards, empty states, and loading indicators

## Technology Stack

### Backend
- Python
- Django
- Django REST Framework
- SimpleJWT
- Django Channels
- PostgreSQL
- Redis
- django-filter
- drf-yasg

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Axios
- React Router
- Recharts
- Lucide React

## Folder Structure

```text
sahayy/
├── backend/
│   ├── accounts/
│   ├── services/
│   ├── bookings/
│   ├── payments/
│   ├── chat/
│   ├── reviews/
│   ├── notifications/
│   ├── adminpanel/
│   ├── support/
│   └── config/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── hooks/
│       ├── types/
│       └── utils/
└── README.md
```

## Installation

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL
- Redis

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

## Environment Variables

Create a backend `.env` file with values similar to the following:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CORS_ALLOW_ALL_ORIGINS=False
DB_NAME=sahay_db
DB_USER=sahay_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=
REDIS_URL=redis://localhost:6379/0
CACHE_BACKEND=django.core.cache.backends.locmem.LocMemCache
CACHE_LOCATION=sahay-cache
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## API Documentation

- Swagger UI: `http://127.0.0.1:8000/api/docs/`

## Deployment Instructions

- Use PostgreSQL and Redis in production.
- Set `DEBUG=False`.
- Provide a strong production `SECRET_KEY`.
- Restrict `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to deployed domains.
- Build the frontend with `npm run build` and serve the output from a static host or CDN.
- Run Django migrations before starting application servers.
- Use Gunicorn or Uvicorn behind a reverse proxy for backend deployment.

## Validation Checklist

- JWT login and registration work
- Role-based route protection works
- Service search and booking flow work
- Razorpay test-mode flow works
- Realtime chat and notifications connect
- Empty states and loading states render correctly
- No hardcoded secrets are committed

## Report

See [PROJECT_REPORT.md](PROJECT_REPORT.md) for the full architecture, schema, and security report.
