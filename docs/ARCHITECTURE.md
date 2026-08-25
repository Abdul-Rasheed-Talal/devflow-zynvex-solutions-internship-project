# DevFlow — Architecture

## High-level architecture

React frontend
    |
    | HTTP/JSON
    v
Express REST API
    |
    v
Mongoose
    |
    v
MongoDB

Module 4:
Express API -> AI provider -> structured project-health result -> React UI

## Frontend
- React + Vite
- JavaScript
- React Router
- TanStack Query for server state
- Zustand for small client/UI state
- Tailwind CSS for styling

## Backend
- Node.js
- Express.js
- RESTful API
- JWT authentication
- bcrypt password hashing
- Mongoose data layer

## Responsibility boundaries
Frontend:
- UI
- routing
- forms
- client-side validation
- server-state fetching/caching
- presentation

Backend:
- authentication
- authorization
- validation
- business rules
- database access
- API responses
- AI orchestration in Module 4

## Authentication Strategy
- **Authentication mechanism**: JWT (JSON Web Tokens).
- **Storage**: Stateless HttpOnly cookies (`devflow_access_token`), configured with `SameSite=lax` to mitigate CSRF. `HttpOnly` reduces token-theft risk from XSS by preventing client-side JavaScript from reading the cookie.
- **Passwords**: Hashed with bcrypt (10 rounds).
- **Authorization**: Middleware intercepts incoming requests, verifies the JWT in the cookie, and attaches the user's ID to the request object.
- **Logout**: Stateless cookie destruction via `Set-Cookie: devflow_access_token=; Max-Age=0`. The backend does not maintain a blocklist.

Database:
- persistent application data

## Initial folder target

/
  frontend/
  backend/
  docs/
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  README.md
  .env.example
  .gitignore

Keep feature-specific code modular inside frontend and backend as the project grows.
