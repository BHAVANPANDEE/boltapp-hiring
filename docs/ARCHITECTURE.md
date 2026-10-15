# BoltPay — Architecture & API Contracts

## 1. System Overview

```text
┌───────────────────────────────────────────┐
│           React 18 + TypeScript           │
│     (Vite, Modern CSS, Responsive)        │
└─────────────────────┬─────────────────────┘
                      │  HTTP / JSON (REST)
                      ▼
┌───────────────────────────────────────────┐
│         Spring Boot 3 (Java 21)           │
│  Controllers ➔ Services ➔ Repositories    │
│    (BCrypt OTP Hashing, JJWT Auth)        │
└─────────────────────┬─────────────────────┘
                      │  JDBC / SQL (Parameterized)
                      ▼
┌───────────────────────────────────────────┐
│             PostgreSQL 15+                │
│    (Neon / Supabase / Self-hosted)        │
└───────────────────────────────────────────┘
```

---

## 2. API Contracts

### Base URL: `/api`

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-10-15T19:30:00Z"
}
```

---

### 2. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Validation**:
  - `email`: valid format, non-empty, unique
  - `firstName`: non-empty, trimmed, min 1 char
  - `lastName`: non-empty, trimmed, min 1 char
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Registration successful! Use your 6-digit login code during checkout.",
  "loginCode": "482731",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```
- **Failure Responses**:
  - `400 Bad Request`: Validation errors (e.g. invalid email, blank fields)
  - `409 Conflict`: `{"success": false, "message": "Email is already registered"}`

---

### 3. User Recognition (Background Debounced)
- **Endpoint**: `POST /api/auth/recognize`
- **Request Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**: `200 OK`
```json
{
  "recognized": true
}
```
*Note: Never exposes user ID, login code, or sensitive data.*

---

### 4. OTP / Code Verification & Login
- **Endpoint**: `POST /api/auth/verify`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "code": "482731"
}
```
- **Validation**:
  - `code`: exactly 6 numeric digits
- **Success Response**: `200 OK`
```json
{
  "authenticated": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```
- **Failure Response**: `401 Unauthorized`
```json
{
  "authenticated": false,
  "message": "Invalid login code"
}
```

---

### 5. Current Authenticated User (`/me`)
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Failure Response**: `401 Unauthorized`

---

### 6. Checkout Submission
- **Endpoint**: `POST /api/checkouts`
- **Headers**: Optional `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "phone": "+1-555-0199",
  "shippingAddress": "123 Market St, Suite 400, San Francisco, CA 94105"
}
```
- **Behavior**:
  - If authenticated: `user_id` set to authenticated user ID.
  - If guest (unauthenticated or skipped login): `user_id` is set to `NULL`.
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Checkout submitted successfully",
  "checkoutId": 42
}
```

---

## 3. Security Highlights
1. **BCrypt Hashing**: The 6-digit numeric login code is hashed using `BCryptPasswordEncoder` (cost factor 10) before persisting in `users.login_code`. Plaintext code is never stored in DB.
2. **Secure One-Time Display**: Code is returned ONLY once in the registration response for user convenience per assignment specs.
3. **Stateless JWT**: Standard RFC 7519 JWT signed with HMAC-SHA256, carrying user ID and email with standard expiration.
4. **CORS Configuration**: Configurable allowed origins (default `*` for testing, specific origins for production).
