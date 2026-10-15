# BoltPay — REST API Documentation

Base URL: `/api`

All requests and responses use `application/json` formatting unless otherwise specified.

---

## 1. System Health

### `GET /api/health`
Checks server health and uptime.

- **Authentication**: None required
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "BoltPay API",
  "timestamp": "2026-10-15T19:30:00.000Z"
}
```

---

## 2. Authentication & User Recognition

### `POST /api/auth/register`
Creates a new user account, validates unique email, securely hashes a generated 6-digit numeric login code, and returns the code once to the user per assignment specs.

- **Authentication**: None required
- **Request Body**:
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Validation Rules**:
  - `email`: Required, valid RFC format, max 255 chars, unique.
  - `firstName`: Required, trimmed, max 100 chars.
  - `lastName`: Required, trimmed, max 100 chars.
- **Response**: `201 Created`
```json
{
  "success": true,
  "message": "Registration successful! Save your 6-digit login code.",
  "loginCode": "482731",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (empty field, invalid email)
  - `409 Conflict`: Email already exists

---

### `POST /api/auth/recognize`
Background user recognition endpoint invoked with debouncing when a user types a valid email address in the checkout form.

- **Authentication**: None required
- **Security Rule**: Does NOT return user IDs, login codes, or personal details.
- **Request Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response (Registered)**: `200 OK`
```json
{
  "recognized": true
}
```
- **Response (Unregistered)**: `200 OK`
```json
{
  "recognized": false
}
```

---

### `POST /api/auth/verify`
Verifies the user's 6-digit login code using BCrypt against the securely stored hash. On success, returns an RFC 7519 HMAC-SHA256 JWT token.

- **Authentication**: None required
- **Request Body**:
```json
{
  "email": "user@example.com",
  "code": "482731"
}
```
- **Validation Rules**:
  - `email`: Required, valid email.
  - `code`: Exactly 6 numeric digits (`^\d{6}$`).
- **Response (Success)**: `200 OK`
```json
{
  "authenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```
- **Response (Invalid Code)**: `401 Unauthorized`
```json
{
  "authenticated": false,
  "message": "Invalid login code"
}
```

---

### `GET /api/auth/me`
Fetches the profile of the currently logged-in user from the Bearer JWT token.

- **Authentication**: Required (`Authorization: Bearer <token>`)
- **Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Error Response**: `401 Unauthorized` (missing or expired token)

---

## 3. Checkout

### `POST /api/checkouts`
Submits a checkout order. If a valid `Authorization: Bearer <token>` header is present, the checkout is linked to the authenticated user's `id`. If unauthenticated or the user chose "Continue as guest", `user_id` is stored as `NULL`.

- **Authentication**: Optional
- **Request Body**:
```json
{
  "email": "user@example.com",
  "phone": "+1 (555) 234-5678",
  "shippingAddress": "742 Evergreen Terrace, Springfield, OR 97477"
}
```
- **Validation Rules**:
  - `email`: Required, valid email.
  - `phone`: Required, min 7 chars, max 50 chars.
  - `shippingAddress`: Required, min 5 chars, max 1000 chars.
- **Response (Success)**: `201 Created`
```json
{
  "success": true,
  "message": "Checkout submitted successfully",
  "checkoutId": 42,
  "userId": 1,
  "guest": false
}
```
*(For guest checkouts, `guest: true` and `userId: null`)*.
