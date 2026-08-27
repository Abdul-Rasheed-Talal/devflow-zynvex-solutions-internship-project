# DevFlow — Progress

## Current module
Module 1 — Application Foundation & Authentication

## Status
Application foundation initialized. User model, auth APIs, and JWT middleware implemented.

## Completed
- Project scope documented.
- Four-module roadmap documented.
- AI-agent engineering rules documented.
- UI design rules documented.
- Initial architecture documented.
- Initial Module 1 acceptance criteria documented.
- GitHub repository created and configured.
- Agent rules committed (.agents/rules/devflow-engineering-standards.md).
- Backend initialized (Node.js + Express, ES modules).
- Backend dependencies installed (express, mongoose, dotenv, cors).
- Backend server entry point created (server.js).
- Environment configuration with validation (config/env.js).
- MongoDB connection configuration (config/db.js).
- Centralized error-handling middleware (middleware/errorHandler.js).
- Health-check endpoint (GET /api/health).
- Route aggregator structure (routes/index.js).
- Frontend initialized (React + Vite, JavaScript).
- Frontend dependencies installed (react-router-dom, @tanstack/react-query, zustand, tailwindcss, @tailwindcss/vite).
- Tailwind CSS v4 configured with Vite plugin and design tokens.
- React Router configured with placeholder routes.
- TanStack Query configured with QueryClientProvider.
- Zustand store created (uiStore.js).
- API client utility created (lib/apiClient.js).
- .env.example updated with NODE_ENV.
- /api/auth/me vs /api/users/me responsibility clarified in API_SPEC.md.
- User model implemented (models/User.js).
- Schema validation: name (required, 2–100 chars), email (required, unique, normalized to lowercase, regex-validated), passwordHash (required, select:false).
- Email uniqueness enforced via Mongoose unique index.
- Email normalization via lowercase:true.
- passwordHash excluded from default queries (select:false) and excluded from toJSON()/toSafeObject().
- Mongoose timestamps enabled (createdAt, updatedAt).
- Registration endpoint implemented (POST /api/auth/register).
- Password hashing implemented using bcrypt (salt rounds 10).
- Duplicate email handling implemented safely (returns 409 Conflict).
- Input validation implemented for registration (400 Bad Request).
- Verification performed for missing fields, invalid fields, successful registration, and duplicate registration.
- Login endpoint implemented (POST /api/auth/login).
- JWT token generation implemented (jsonwebtoken, 1d expiration).
- Password verification implemented using bcrypt.compare.
- Invalid credential handling implemented securely (generic 401 error).
- Environment configuration updated to strictly require JWT_SECRET.
- JWT authentication middleware implemented (`requireAuth`).
- Bearer token verification implemented.
- Invalid/expired token handling verified.
- `req.user` identity established safely (avoids full DB fetch).
- GET /api/auth/me implemented.
- Route protected by `requireAuth` middleware.
- Authenticated user lookup implemented using `req.user.id`.
- Safe user response verified (excludes sensitive fields).
- Nonexistent-user behavior verified (returns 404).
- POST /api/auth/logout implemented.
- Current authentication architecture verified as strictly stateless.
- **Architecture Migration Completed**:
  - Converted from `Authorization: Bearer` to `HttpOnly` cookies.
  - `devflow_access_token` securely handles the JWT.
  - Token-theft risk from XSS reduced, CORS properly configured with credentials.
- Future Redis/revocation infrastructure intentionally deferred.
- Future WebSocket/real-time infrastructure intentionally deferred.
- M1-T02 authentication flow completed successfully.

## Next
1. Finalize Module 1 and prepare for Module 2.

## Completed
- **M1-T06: Public Landing Page & Route Architecture**
  - Created professional public LandingPage at `/`.
  - Migrated authenticated dashboard to `/app/dashboard`.
  - Adjusted `App.tsx` router configuration to cleanly separate public and protected namespaces.
  - Updated `PublicRoute.tsx` and `LoginPage.tsx` default redirects to `/app/dashboard`.
  - Maintained complete security posture (zero token leakage, zero localStorage).
- **M1-T04-B: Protected Routes & Route Guards**
  - Designed generic `ProtectedRoute.tsx` and `PublicRoute.tsx` layout components.
  - Safely encapsulated initialization loading sequences within route guards, removing top-level blocking in `App.tsx` and allowing native `NotFoundPage` resolution.
  - Implemented strictly-typed redirection logic preventing authenticated users from accessing `login` / `register`.
  - Re-routed unauthenticated users safely away from protected elements without disrupting React Router navigation states.
  - Confirmed 0 `localStorage` and 0 raw token logic entered the guards; strictly consumed `authStore` boolean flags initialized solely by `/api/auth/me`.
- **M1-T04-A: Authentication Pages & Forms**
  - Designed professional, accessible Login and Registration forms (`LoginPage.tsx`, `RegisterPage.tsx`).
  - Integrated React Router for `/login` and `/register`.
  - Implemented client-side validation logic.
  - Linked native form submission to global `authStore` actions.
  - Successfully connected API workflows without breaking backend tests.
  - Demonstrated error-rendering without exposing backend internals.
  - Verified no raw tokens entered frontend architecture.
- **M1-T03: Frontend TypeScript Migration & Authentication Foundation**
  - Frontend fully migrated from JavaScript/JSX to TypeScript/TSX.
  - Strict TypeScript checking established (`noEmit`, `strict: true`).
  - Typed API client established using `credentials: 'include'`.
  - Authentication types (`User`, `AuthResponse`) and `authService` created.
  - Zustand `authStore` established for global authentication state (`isInitializing`, `isAuthenticated`, `user`).
  - React application properly synchronizes initialization using `GET /api/auth/me`.
  - Build (`npm run build`) and strict type checks pass.
  - Verified no `localStorage` or `sessionStorage` usage for tokens.
  - Verified backend regression tests pass successfully under cookie-based architecture.
- **M1-T02-G**: Converted from `Authorization: Bearer` to `HttpOnly` cookies.

## Decision log
- Used Node.js built-in --watch flag for backend dev script instead of adding nodemon dependency (Node v22 supports --watch natively).
- Used Tailwind CSS v4 with @tailwindcss/vite plugin (CSS-first configuration, no tailwind.config.js needed).
- Removed TypeScript type packages (@types/react, @types/react-dom) from frontend since project uses JavaScript.
- /api/auth/me serves authentication verification; /api/users/me serves profile management. Both require auth but serve different concerns.
- passwordHash field uses select:false in Mongoose schema, plus toJSON() override as a safety net — double protection against accidental exposure.
- Did not add avatar field to User model; DATABASE_SCHEMA.md marks it as "optional, only if needed" and it is not needed for Module 1 auth.