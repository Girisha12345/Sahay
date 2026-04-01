# Sahāy

Sahāy is a full-stack local services marketplace platform that connects customers with verified service providers for bookings, payments, and secure in-app chat.

## Tech Stack

### Backend
- Python 3.12+
- Django + Django REST Framework
- JWT Authentication (SimpleJWT)
- PostgreSQL
- Redis + Django Channels (WebSockets)

### Frontend
- React + Vite + TypeScript
- Tailwind CSS
- Zustand
- Axios
- React Router
- React Hook Form + Zod

## Project Structure

```text
sahay/
├── backend/   # Django REST API
├── frontend/  # React frontend
└── README.md
```

## Local Setup

### 1. Clone repository
```bash
git clone https://github.com/Girisha12345/sahay.git
cd sahay
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
# activate venv
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## API Documentation
- Swagger: `http://127.0.0.1:8000/api/docs/`

## Git Workflow
- `main`: production-ready code
- `develop`: active integration branch
- `feature/*`: feature branches

## Commit Convention
- `feat: add login API`
- `fix: resolve validation error`
- `refactor: improve folder structure`
- `docs: update README`
