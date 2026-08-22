# DevFlow — API Specification

The API contract should be kept stable and documented as endpoints are implemented.

## Module 1 target

### Authentication
**POST /api/auth/register**
- **Purpose**: Create a new user account securely.
- **Request Body**: JSON object containing `name`, `email`, and `password`.
- **Response (Success)**: `201 Created`. Returns safe user information (`id`, `name`, `email`, `createdAt`). Does not return `passwordHash`.
- **Validation/Error Behavior**: 
  - Validates presence of `name`, `email`, and `password`.
  - Enforces password minimum length of 6 characters.
  - Normalizes email to lowercase and trims whitespace.
  - Returns `400 Bad Request` for validation failures.
  - Returns `409 Conflict` if the email is already registered.
- **Security**: Hashes the password using `bcrypt` (salt rounds: 10) before saving to the database. Plaintext passwords are not logged or stored.

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

### User profile
GET /api/users/me
PUT /api/users/me

### Endpoint responsibility

**GET /api/auth/me** — Returns the currently authenticated user's identity based on the active session/token. Used by the frontend to verify whether the user is still authenticated and to bootstrap the auth state on page load. Returns minimal identity information (id, name, email).

**GET /api/users/me** — Returns the authenticated user's full profile data for display and editing.

**PUT /api/users/me** — Updates the authenticated user's profile information.

The `/auth/me` endpoint is an authentication concern. The `/users/me` endpoints are profile-management concerns. Both require authentication but serve different purposes.

### Health
GET /api/health

Returns a simple JSON response confirming the API is running. No authentication required.

## API rules
- JSON request/response.
- Consistent success/error structure.
- Server-side validation.
- Authentication middleware for protected routes.
- Authorization must be enforced on the server.
- Do not return password hashes or secrets.
- Use appropriate HTTP status codes.
- Do not expose internal stack traces in production responses.
