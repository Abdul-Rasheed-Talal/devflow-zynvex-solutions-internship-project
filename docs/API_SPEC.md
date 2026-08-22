# DevFlow — API Specification

The API contract should be kept stable and documented as endpoints are implemented.

## Module 1 target

### Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

### User
GET /api/users/me
PUT /api/users/me

Exact request/response schemas should be documented here when implemented.

## API rules
- JSON request/response.
- Consistent success/error structure.
- Server-side validation.
- Authentication middleware for protected routes.
- Authorization must be enforced on the server.
- Do not return password hashes or secrets.
- Use appropriate HTTP status codes.
- Do not expose internal stack traces in production responses.
