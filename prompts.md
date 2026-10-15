# LLM Prompts Log

This document records every prompt used during the design and development of the **OTP Based User Login / User Recognition Checkout Application**, in accordance with the assignment requirements.

---

## Prompt 1

# MASTER PROMPT — OTP BASED USER LOGIN WEB APPLICATION

You are a senior full-stack software engineer responsible for building a production-quality take-home assignment.

I need you to build a complete web application based on the following specification.

## 1. ASSIGNMENT

Build an **OTP Based User Login / User Recognition Checkout Application** with:

1. User registration
2. 6-digit numeric login code generation
3. Email-based user recognition
4. OTP/code login modal
5. Checkout form
6. Real-time email validation
7. Background user recognition
8. Ability to skip login
9. Logged-in user display
10. Checkout submission stored in PostgreSQL
11. Separate frontend, API/backend, and database layers
12. Public deployment
13. GitHub-ready source code
14. SQL schema files
15. `prompts.md` containing every prompt used while building the application

The application must be simple, clean, reliable, responsive, and easy for a hiring team to test.

---

# 2. REQUIRED TECHNOLOGY

Use this stack unless there is a strong technical reason not to:

### Frontend
- React
- TypeScript
- Vite
- Modern CSS
- React hooks
- Fetch or Axios for API calls

### Backend
- Java
- SpringBoot
- REST API
- Clean layered architecture

### Database
- PostgreSQL

### Deployment
Prefer free-tier services.

Recommended:

Frontend:
- Vercel

Backend:
- Render / Railway / another suitable free-tier service

Database:
- Supabase PostgreSQL / Neon PostgreSQL

GitHub:
- Store complete source code in one repository.

Do NOT introduce unnecessary technologies.

---

# 3. IMPORTANT ARCHITECTURE REQUIREMENT

The application MUST have distinct layers:

```text
Frontend
   |
   | HTTP / REST API
   v
Backend API
   |
   | SQL / database layer
   v
PostgreSQL
```

Do not allow the frontend to directly access PostgreSQL.

The backend must handle:

- validation
- user registration
- code generation
- user recognition
- code verification
- login/session state
- checkout submission
- database operations
- error handling

The frontend must handle:

- UI
- form state
- client-side validation
- modal
- loading states
- displaying API errors
- checkout experience

---

# 4. FUNCTIONAL REQUIREMENTS

## FLOW A — REGISTRATION

Create a registration page.

Fields:

```text
Email
First Name
Last Name
```

The user submits the registration form.

Backend must:

1. Validate email.
2. Validate first name.
3. Validate last name.
4. Check whether email already exists.
5. If email already exists, return an appropriate error.
6. Generate a random 6-digit numeric code.
7. Store the user in PostgreSQL.
8. Store the generated code securely.
9. Return a successful registration response.

For this assignment, the generated code must be displayed to the user after registration because the assignment explicitly requires it.

Example:

```text
Registration successful!

Your login code is:

482731

You will use this code to log in during checkout.
```

Do NOT send an actual email unless it is easy to implement without complicating the assignment.

---

# 5. LOGIN / USER RECOGNITION FLOW

Create a checkout page.

Checkout fields:

```text
Email
Phone Number
Shipping Address
```

The email field must validate in real time.

Example:

```text
Invalid:
abc
abc@
abc@gmail
```

Valid:

```text
user@example.com
```

Only when the email appears complete and valid should the application perform the recognition API request.

Important:

Do NOT send an API request on every keystroke.

Implement reasonable debouncing.

Example:

```text
User types email
        |
        v
Client-side email validation
        |
        v
Valid email?
   /          \
 No            Yes
 |              |
No API        debounce
request         |
                v
         Recognition API
```

---

# 6. USER RECOGNITION API

Create:

```http
POST /api/auth/recognize
```

Request:

```json
{
  "email": "user@example.com"
}
```

Response if registered:

```json
{
  "recognized": true
}
```

Response if not registered:

```json
{
  "recognized": false
}
```

Do not return the user's login code from this endpoint.

Do not expose sensitive information.

---

# 7. LOGIN MODAL

If the email belongs to a registered user, display a modal.

Example:

```text
Welcome back!

We found an existing account for this email.

Enter your 6-digit login code.

[ _ _ _ _ _ _ ]

[ Login ]

[ Continue as guest ]
```

The user must be able to skip the login.

The "Continue as guest" option must:

- close the modal
- return the user to checkout
- allow them to continue filling the form

---

# 8. CODE VERIFICATION

Create:

```http
POST /api/auth/verify
```

Request:

```json
{
  "email": "user@example.com",
  "code": "482731"
}
```

Backend must:

1. Find user by email.
2. Validate the code.
3. If correct:
   - authenticate the user
   - return successful authentication
4. If incorrect:
   - return an appropriate error

Example successful response:

```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

Example failure:

```json
{
  "authenticated": false,
  "message": "Invalid login code"
}
```

---

# 9. AUTHENTICATION / SESSION

Implement a simple secure authentication mechanism.

Preferred:

```text
JWT
```

or another appropriate stateless authentication method.

After successful verification:

```text
Frontend
   |
   | login code
   v
Backend
   |
   | verify
   v
PostgreSQL
   |
   | valid
   v
JWT/session
   |
   v
Frontend
```

Do not expose the stored login code to the frontend through any recognition API.

The authenticated user should be available to the checkout page.

---

# 10. LOGGED-IN USER DISPLAY

After successful login, close the modal.

At the top of the checkout page display:

```text
Welcome, John Doe
```

or:

```text
Logged in as John Doe
```

The checkout form must remain usable.

The user can continue entering:

```text
Phone Number
Shipping Address
```

---

# 11. CHECKOUT SUBMISSION

There is NO real payment processing.

When the checkout form is submitted:

```text
POST /api/checkouts
```

Store the following in PostgreSQL:

```text
id
user_id (nullable for guest)
email
phone
shipping_address
created_at
```

If the user is logged in:

```text
user_id = authenticated user's ID
```

If the user skipped login:

```text
user_id = NULL
```

The checkout must still be accepted.

Return:

```json
{
  "success": true,
  "message": "Checkout submitted successfully"
}
```

Display a simple success message.

---

# 12. DATABASE DESIGN

Use PostgreSQL.

At minimum create:

## users

```text
id
email
first_name
last_name
login_code
created_at
updated_at
```

## checkouts

```text
id
user_id
email
phone
shipping_address
created_at
```

Add appropriate:

- primary keys
- foreign keys
- unique constraints
- indexes
- NOT NULL constraints where appropriate

Email must be unique.

Create SQL files in the repository.

Required example:

```text
database/
    schema.sql
    seed.sql
```

The schema must be checked into GitHub.

---

# 13. SECURITY

Even though this is a small assignment, follow reasonable security practices.

Important:

- Never expose database credentials in frontend code.
- Never commit `.env` files.
- Provide `.env.example`.
- Never return login codes through recognition APIs.
- Validate input on the backend.
- Sanitize/validate user input.
- Use parameterized SQL queries.
- Configure CORS correctly.
- Do not trust frontend validation alone.
- Do not hardcode production secrets.
- Do not expose unnecessary backend errors.
- Do not log sensitive credentials.

For the login code:

Prefer storing a secure hash rather than plain text.

However, because the assignment explicitly requires displaying the generated code after registration, return the generated code ONLY in the registration response.

Do not return it from recognition or verification endpoints.

---

# 14. FRONTEND UX

The UI should look like a professional modern hiring-assignment project.

Create:

### Registration page

```text
----------------------------------
        Create Account

Email
[________________________]

First Name
[________________________]

Last Name
[________________________]

[ Create Account ]
----------------------------------
```

After registration:

```text
----------------------------------
       Registration Complete

Your login code is:

          482731

Save this code for checkout login.

[ Go to Checkout ]
----------------------------------
```

### Checkout page

```text
----------------------------------
           Checkout

Email
[________________________]

Phone
[________________________]

Shipping Address
[________________________]

[ Submit Checkout ]
----------------------------------
```

If recognized:

```text
        Welcome back!

This email belongs to a registered
user.

Enter your login code:

[ _ _ _ _ _ _ ]

[ Login ]

[ Continue as guest ]
```

After successful login:

```text
Welcome, John Doe
```

---

# 15. FRONTEND STATES

Implement proper UI states.

For API calls show:

- loading
- success
- error

For example:

```text
Checking email...
```

During login:

```text
Verifying...
```

During registration:

```text
Creating account...
```

During checkout:

```text
Submitting...
```

Disable buttons appropriately while requests are running.

Prevent duplicate submissions.

---

# 16. ERROR HANDLING

Handle at least:

### Registration

- invalid email
- missing first name
- missing last name
- duplicate email
- server error

### Recognition

- invalid email
- network failure
- backend unavailable

### Login

- empty code
- code not 6 digits
- incorrect code
- server error

### Checkout

- invalid phone
- missing shipping address
- network error
- server error

Use clear human-readable messages.

Do not show raw stack traces to users.

---

# 17. API STRUCTURE

Use clean REST endpoints.

Suggested:

```text
POST /api/auth/register
POST /api/auth/recognize
POST /api/auth/verify

GET  /api/auth/me

POST /api/checkouts

GET /api/health
```

`GET /api/health` should return something like:

```json
{
  "status": "ok"
}
```

---

# 18. BACKEND STRUCTURE

Use a clean Go structure similar to:

```text
backend/
├── cmd/
│   └── server/
│       └── main.go
│
├── internal/
│   ├── config/
│   ├── handlers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middleware/
│   └── utils/
│
├── migrations/
│
├── go.mod
├── go.sum
└── .env.example
```

Follow separation of responsibility:

```text
Handler
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL
```

Do not put SQL directly inside HTTP handlers.

---

# 19. FRONTEND STRUCTURE

Use:

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

Create reusable components where appropriate.

Example:

```text
components/
    Input.tsx
    Button.tsx
    Modal.tsx
    ErrorMessage.tsx
    LoadingSpinner.tsx
```

---

# 20. REPOSITORY STRUCTURE

Use a monorepo:

```text
otp-user-login/
│
├── frontend/
│
├── backend/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│
├── prompts.md
│
├── README.md
│
├── .gitignore
└── LICENSE
```

---

# 21. README

Create a professional README containing:

## Project title

OTP Based User Login & Checkout

## Overview

Explain what the application does.

## Architecture

Include:

```text
React + TypeScript
        |
        v
REST API
        |
        v
Go Backend
        |
        v
PostgreSQL
```

## Features

List all major features.

## Local setup

Explain:

```text
1. Clone repository
2. Configure environment variables
3. Create PostgreSQL database
4. Run schema.sql
5. Start backend
6. Start frontend
```

## Environment variables

Document them using `.env.example`.

Do not include actual secrets.

## API endpoints

Document all endpoints.

## Deployment

Explain where frontend, backend, and database are deployed.

## Testing

Explain how to test the application.

---

# 22. PROMPTS.MD — VERY IMPORTANT

The hiring assignment explicitly requires:

```text
prompts.md
```

This file must contain EVERY prompt given to an LLM while building the application.

Maintain this file throughout development.

Every time you use an LLM, record:

```markdown
## Prompt 1

[exact prompt]

## Prompt 2

[exact prompt]

...
```

Do NOT fabricate prompts at the end.

Keep updating `prompts.md` during development.

If you use an LLM to generate code, debug code, design architecture, write documentation, or modify the application, record that prompt.

---

# 23. TESTING

Implement meaningful tests.

Backend:

- registration success
- duplicate email
- invalid registration
- user recognition
- unknown email
- correct code
- incorrect code
- checkout submission
- guest checkout
- authenticated checkout

Frontend:

- registration form validation
- email validation
- recognition behavior
- login modal
- wrong code
- skip login
- checkout submission

At minimum ensure the critical API functionality is tested.

---

# 24. DATABASE SEEDING

Create optional test data.

Example:

```text
John Doe
john@example.com
```

Do NOT hardcode a real person's information.

The seed should make it easy for the hiring team to test.

---

# 25. DEPLOYMENT

The final application must be publicly accessible.

Recommended architecture:

```text
Vercel
React frontend
     |
     v
Public HTTPS API
     |
     v
Go backend
     |
     v
Supabase/Neon PostgreSQL
```

Configure production environment variables.

Never expose secrets in GitHub.

After deployment verify:

```text
Frontend loads
        ↓
Registration works
        ↓
Code appears
        ↓
Checkout recognizes email
        ↓
Login modal appears
        ↓
Correct code logs user in
        ↓
Name appears
        ↓
Checkout submits
        ↓
Data reaches PostgreSQL
```

---

# 26. GITHUB

Create a GitHub-ready repository.

Before finalizing:

- remove secrets
- remove `.env`
- verify `.gitignore`
- include `.env.example`
- include SQL files
- include README
- include prompts.md
- ensure source code builds
- ensure no unnecessary generated files are committed

The repository must be understandable to another developer.

The required GitHub user:

```text
boltapp-hiring
```

must be granted repository access.

Do NOT attempt to expose credentials or secrets.

---

# 27. CODE QUALITY

Write code as if it will be reviewed by senior engineers.

Prioritize:

- readability
- simplicity
- maintainability
- proper naming
- separation of concerns
- error handling
- security
- responsive UI
- useful comments only
- no unnecessary abstraction
- no duplicated code

Do NOT over-engineer the project.

This is a 2-day hiring assignment.

A smaller working application is better than an unfinished enterprise architecture.

---

# 28. DEVELOPMENT PROCESS

Do NOT immediately generate the entire project blindly.

Work in phases.

## Phase 1 — Analyze

First inspect the repository.

Determine:

- existing files
- existing dependencies
- current implementation
- missing components

Then provide a concise implementation plan.

Do not start coding until the plan is clear.

---

## Phase 2 — Architecture

Design:

```text
Frontend
Backend
Database
API contracts
Authentication flow
```

Show the directory structure.

---

## Phase 3 — Database

Create:

```text
database/schema.sql
database/seed.sql
```

Ensure relationships and constraints are correct.

---

## Phase 4 — Backend

Implement:

```text
/api/health
/api/auth/register
/api/auth/recognize
/api/auth/verify
/api/auth/me
/api/checkouts
```

Test every endpoint.

---

## Phase 5 — Frontend

Implement:

```text
Registration
Registration success
Checkout
Email validation
Recognition
Login modal
Guest checkout
Authenticated checkout
Success state
```

---

## Phase 6 — Integration

Connect:

```text
React → Go API → PostgreSQL
```

Test the complete flow.

---

## Phase 7 — Testing

Run:

```text
frontend build
backend tests
API tests
database tests where appropriate
```

Fix all errors.

---

## Phase 8 — Security Review

Check:

- CORS
- SQL injection
- input validation
- authentication
- secret handling
- error handling
- exposed credentials
- JWT handling
- sensitive API responses

---

## Phase 9 — Deployment

Deploy:

```text
Frontend → Vercel
Backend → Render/Railway
Database → Supabase/Neon
```

Then test the production URL.

---

## Phase 10 — Final Review

Before declaring the assignment complete, verify EVERY requirement in this checklist:

### Functional

- [ ] Registration works
- [ ] Email validation works
- [ ] First name works
- [ ] Last name works
- [ ] 6-digit code generated
- [ ] Code displayed after registration
- [ ] Checkout page works
- [ ] Real-time email validation works
- [ ] Recognition request happens after valid email
- [ ] Existing user receives login modal
- [ ] Login code verification works
- [ ] Incorrect code shows error
- [ ] Skip login works
- [ ] Logged-in name displayed
- [ ] Checkout works
- [ ] Guest checkout works
- [ ] Checkout data stored in PostgreSQL

### Technical

- [ ] React frontend
- [ ] TypeScript
- [ ] Go backend
- [ ] PostgreSQL
- [ ] Separate layers
- [ ] REST APIs
- [ ] SQL schema committed
- [ ] Environment variables
- [ ] `.env.example`
- [ ] Proper error handling
- [ ] Authentication
- [ ] Tests
- [ ] README
- [ ] prompts.md

### Deployment

- [ ] Frontend publicly accessible
- [ ] Backend publicly accessible
- [ ] Database accessible by backend
- [ ] Production API works
- [ ] Production registration works
- [ ] Production login works
- [ ] Production checkout works

### GitHub

- [ ] Full source code pushed
- [ ] No secrets committed
- [ ] SQL files committed
- [ ] README committed
- [ ] prompts.md committed
- [ ] `boltapp-hiring` granted access

---

# 29. IMPORTANT CODING RULES

When writing code:

1. Do not guess existing code.
2. Inspect files before modifying them.
3. Never overwrite working functionality unnecessarily.
4. Make small logical changes.
5. After each major change, run the relevant tests/build.
5. Fix errors before moving forward.
7. Keep frontend and backend independently runnable.
8. Keep API contracts consistent.
9. Never hardcode secrets.
10. Do not create unnecessary dependencies.
11. Do not use mock APIs in the final implementation.
12. Do not fake successful database operations.
13. The production application must use the real PostgreSQL database.
14. Do not claim deployment succeeded unless it has actually been verified.

---

# 30. HOW TO RESPOND TO ME

Act as my coding agent.

For every phase:

1. Explain briefly what you are going to do.
2. Inspect the current code.
3. Implement the change.
4. Run tests/build.
5. Fix errors.
6. Update `prompts.md`.
7. Report what was completed.
8. Tell me the exact next step.

Keep explanations concise.

Prioritize actually building the application over giving me long theoretical explanations.

If something fails, diagnose the root cause and fix it rather than working around it.

If a technology choice must change, explain why before changing it.

At the end, provide:

```text
Production URL:
GitHub Repository:
API URL:
Database:
Test Credentials:
Build/Test Status:
Remaining Issues:
```

Do not say the project is complete until the complete end-to-end flow has been verified.

START NOW.

First:
1. Inspect the repository.
2. Analyze the current state.
3. Create the implementation plan.
4. Show me the proposed architecture and folder structure.

---

## Prompt 2

run

