# Sahāy

Sahāy is a full-stack SaaS marketplace for local services. The current implementation already includes authenticated customer, provider, support, and admin workflows with booking, checkout, chat, notification, and moderation features connected across the frontend and backend.

## Project Overview

The application is structured as a multi-role platform with role-based routing and permissions:

- Customer: search services, create bookings, pay, chat, manage addresses, and review providers.
- Provider: manage bookings, earnings, services, availability, and profile details.
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

## Completed Work

### Authentication and Access Control

- JWT login, registration, profile loading, and session persistence
- Auto-redirects for authenticated users and logout cleanup
- Role-based route protection for customer, provider, support, and admin users

### Customer Experience

- Public homepage with personalized greetings for signed-in users
- Service browsing, search, filtering, and service detail pages
- Customer dashboard, bookings, chat, notifications, profile, and saved address flows
- Booking creation with date, time, address, and payment method selection
- Order success and payment success pages

### Checkout and Payments

- Multi-step checkout flow with address selection and address creation
- Order summary, payment method selection, and validation feedback
- Razorpay test-mode payment flow and cash payment support
- Booking creation, payment order creation, payment verification, and booking updates
- 10% commission handling and payment lifecycle support

### Provider Workspace

- Provider dashboard with booking overview, earnings, ratings, and profile actions
- Booking management for accepting, rejecting, starting, and completing jobs
- Earnings tracking and service management
- Provider profile and availability controls

### Support and Admin Operations

- Dedicated support dashboard for support agents
- Support ticket workflow and escalation handling
- Admin dashboard, provider review, category moderation, and flagged chat review pages
- Role-safe separation between support-owned and admin-only surfaces

### Realtime Communication and Safety

- Anonymous in-app chat backed by WebSockets
- Realtime notifications delivered over WebSockets
- Phone-number sharing blocked in chat by regex-based filtering
- Masking and privacy protections for sensitive booking details

### Backend and Platform Foundations

- Django REST backend split into accounts, services, bookings, payments, reviews, chat, notifications, support, and admin modules
- API serializers, permissions, signals, and utility layers for reusable business rules
- PostgreSQL, Redis, and Channels support for persistent and realtime features
- Swagger API documentation and seed-data support for local development

### UI and Frontend Quality

- Responsive Tailwind UI with cards, empty states, loading states, and status badges
- Shared layout, navbar, button, spinner, and form components
- Zustand stores and service clients for state and API integration
- TypeScript-based frontend structure with route-level page separation

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
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
..\.venv\Scripts\python.exe manage.py migrate
..\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### Frontend Environment

Create a `frontend/.env` file if you want to override the default API endpoints:

```env
VITE_API_URL=http://127.0.0.1:8000/api/
VITE_WS_URL=ws://127.0.0.1:8000
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

## Current Deliverables

- Authentication flow and role redirects
- Customer browsing, booking, checkout, and success pages
- Provider dashboard, bookings, earnings, services, and profile pages
- Support dashboard and support ticket workflow
- Admin moderation and flagged content review pages
- Chat, notifications, and privacy protections
- Shared frontend and backend documentation

## Troubleshooting

- If login shows `Network error. Please check your internet connection.`, make sure the Django backend is running on `http://127.0.0.1:8000`.
- If `Book Now` opens a loading state, refresh the page after the frontend and backend are both running; the booking page now falls back to loading service details by ID, but it still needs the API server online.
- If service cards or categories are empty, verify that the backend API returns data from `http://127.0.0.1:8000/api/categories` and `http://127.0.0.1:8000/api/services/`.

## Report

See [PROJECT_REPORT.md](PROJECT_REPORT.md) for the full architecture, schema, and security report.
