# OTP Based User Login & Checkout (BoltPay)

A production-quality full-stack web application implementing **instant user recognition checkout** with 6-digit numeric OTP login, background debounced recognition, guest checkout fallback, and PostgreSQL persistence.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│             Frontend (React 18 + TypeScript)           │
│        Vite • Modern CSS (Tailwind) • React Hooks      │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP / JSON (REST API)
                            ▼
┌────────────────────────────────────────────────────────┐
│        Backend API (Java 21 + Spring Boot 3.3)         │
│     Clean Layered Architecture (Controller-Service-Repo)│
│       BCrypt 6-Digit OTP Hashing • Stateless JJWT       │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Parameterized SQL (JPA/Hibernate)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                    │
│      users (unique email, BCrypt hash, timestamps)     │
│         checkouts (user_id nullable for guest)         │
└────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **User Registration & 6-Digit Code Generation**:
   - Clean registration form (`email`, `firstName`, `lastName`).
   - Server-side email format and uniqueness validation.
   - Generates a cryptographically secure 6-digit numeric login code.
   - Code is hashed using **BCrypt** before database persistence.
   - Raw code displayed once upon registration with instant copy-to-clipboard button.

2. **Real-Time Client-Side Email Validation**:
   - Real-time syntax checking (`abc` -> invalid, `abc@` -> invalid, `user@example.com` -> valid).

3. **Background Debounced User Recognition**:
   - Only triggers when email format is complete and valid.
   - Debounced by 500ms to prevent request flooding on keystrokes.
   - `POST /api/auth/recognize` checks if the user exists without leaking codes or private details.

4. **OTP Login Modal**:
   - When a registered user is recognized, a modal prompts for their 6-digit code.
   - Auto-advancing inputs with paste support for all 6 digits.
   - Wrong code displays an error without exposing internal details.

5. **Skip Login / Guest Checkout**:
   - Users can click **"Continue as guest"** to dismiss the modal and complete checkout without logging in.
   - Checkout is saved in PostgreSQL with `user_id = NULL`.

6. **Logged-in User Display**:
   - Upon successful OTP verification, the modal closes and a welcome banner displays: `Welcome, John Doe`.
   - The user can switch/logout at any time.

7. **Database Checkout Persistence**:
   - Authenticated checkout stores `user_id = authenticated_user_id`.
   - Guest checkout stores `user_id = NULL`.
   - Order confirmation displays a unique checkout reference number (`BP-XXXXXX`).

---

## Repository Structure

```text
BoltPay/
├── backend/
│   ├── src/
│   │   ├── main/java/com/boltpay/
│   │   │   ├── config/              # SecurityConfig, CORS
│   │   │   ├── controllers/         # AuthController, CheckoutController, HealthController
│   │   │   ├── dto/                 # Request/Response records
│   │   │   ├── models/              # User, Checkout entities
│   │   │   ├── repositories/        # Spring Data JPA repositories
│   │   │   ├── services/            # Layered business logic
│   │   │   ├── security/            # BCrypt, JJWT, JwtAuthFilter
│   │   │   └── exception/           # GlobalExceptionHandler
│   │   └── test/java/com/boltpay/   # Unit & Integration tests
│   ├── pom.xml                      # Maven project definition
│   ├── Dockerfile                   # Multi-stage production container build
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Input, Button, Modal, LoginModal, Navbar
│   │   ├── pages/                   # RegisterPage, CheckoutPage
│   │   ├── services/                # api.ts (Axios HTTP client)
│   │   ├── hooks/                   # useAuth, useDebounce
│   │   ├── types/                   # TypeScript interfaces
│   │   └── utils/                   # Email & OTP validators
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── database/
│   ├── schema.sql                   # DDL table creation, foreign keys, indexes
│   └── seed.sql                     # Test data (e.g. john.doe@example.com)
│
├── docs/
│   ├── API.md                       # Comprehensive API documentation
│   └── ARCHITECTURE.md              # Architecture diagrams & contracts
│
├── prompts.md                       # Complete log of LLM prompts
├── README.md                        # Documentation & setup guide
├── .gitignore
└── LICENSE                          # MIT License
```

---

## Local Setup Instructions

### Prerequisites
- **Java 21** or later
- **Maven 3.8+**
- **Node.js 18+** & **npm**
- **PostgreSQL 14+** (or Neon / Supabase database URL)

---

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/BoltPay.git
cd BoltPay
```

---

### Step 2: Database Setup

Create a PostgreSQL database named `boltpay`:

```sql
CREATE DATABASE boltpay;
```

Run the schema and seed scripts:

```bash
psql -U postgres -d boltpay -f database/schema.sql
psql -U postgres -d boltpay -f database/seed.sql
```

---

### Step 3: Backend Configuration & Start

1. Copy `.env.example` to `.env` or set environment variables:

```bash
cd backend
cp .env.example .env
```

2. Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend starts at `http://localhost:8080`.
Verify via `http://localhost:8080/api/health`.

*(Note: During `mvn test`, the backend uses an embedded H2 database in PostgreSQL mode, so tests run independently without requiring a running database server).*

---

### Step 4: Frontend Configuration & Start

1. In a new terminal, navigate to `frontend`:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.
The Vite dev server proxies `/api` calls directly to `http://localhost:8080`.

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health check endpoint | No |
| `POST` | `/api/auth/register` | Register user & generate 6-digit code | No |
| `POST` | `/api/auth/recognize` | Background debounced email recognition | No |
| `POST` | `/api/auth/verify` | Verify 6-digit OTP and issue JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `POST` | `/api/checkouts` | Submit checkout (auth or guest) | Optional |

See [docs/API.md](docs/API.md) for full request/response schemas.

---

## Running Automated Tests

### Backend Tests (JUnit 5, Mockito, MockMvc)

```bash
cd backend
mvn test
```

Verifies:
- User registration success and 6-digit code generation
- Duplicate email prevention (409 Conflict)
- Bean validation on malformed inputs
- Background user recognition (positive and negative)
- Correct code verification and JWT issuance
- Invalid code rejection (401 Unauthorized)
- Authenticated checkouts linked to `user_id`
- Guest checkouts with `user_id = null`
- System health check

### Frontend Tests (Vitest, React Testing Library)

```bash
cd frontend
npm test
```

Verifies:
- RFC compliant email validation logic
- 6-digit numeric OTP validation
- Login modal opening and rendering
- "Continue as guest" bypass behavior
- Full OTP verification submission flow

---

## Production Deployment Guide

### 1. Database (Neon or Supabase PostgreSQL)
- Create a new project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
- Open the SQL Editor in your dashboard.
- Execute `database/schema.sql` and `database/seed.sql`.
- Copy your pooled connection string (`jdbc:postgresql://...`).

### 2. Backend (Render / Railway)
- Connect your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
- Use Docker runtime or Maven:
  - Dockerfile is located at `backend/Dockerfile`.
- Set Environment Variables:
  - `DATABASE_URL`: `jdbc:postgresql://<neon-or-supabase-host>:5432/<dbname>?sslmode=require`
  - `DATABASE_USERNAME`: `<db-user>`
  - `DATABASE_PASSWORD`: `<db-password>`
  - `JWT_SECRET`: `<secure-random-32-byte-string>`
  - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
  - `PORT`: `8080`

### 3. Frontend (Vercel)
- Import the repository on [Vercel](https://vercel.com).
- Set **Root Directory** to `frontend`.
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com`

---

## Pre-Seeded Test Credentials

For hiring team evaluation, the database seed file includes:

| Email | First Name | Last Name | 6-Digit Login Code |
|---|---|---|---|
| `john.doe@example.com` | John | Doe | `123456` |
| `alex.taylor@example.com` | Alex | Taylor | `888999` |

Or click **Register** to create a brand new account and receive a generated 6-digit code!
