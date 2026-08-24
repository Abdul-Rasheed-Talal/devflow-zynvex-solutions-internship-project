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

**POST /api/auth/login**
- **Purpose**: Authenticate an existing user and obtain a JWT.
- **Request Body**: JSON object containing `email` and `password`.
- **Response (Success)**: `200 OK`. Returns a signed JWT and safe user information (`id`, `name`, `email`, `createdAt`, `updatedAt`). Does not return `passwordHash`.
- **Validation/Error Behavior**: 
  - Validates presence of `email` and `password`.
  - Normalizes email to lowercase and trims whitespace.
  - Returns `400 Bad Request` for validation failures.
  - Returns generic `401 Unauthorized` ("Invalid email or password") for both nonexistent users and incorrect passwords to prevent email enumeration.
- **JWT Behavior**:
  - Signs a token containing the user's `id`.
  - Token expires in 1 day (`1d`).
- **Security**: Verifies the password against the stored bcrypt hash using `bcrypt.compare`. The token is cryptographically signed using `JWT_SECRET` from the environment.

### Protected Endpoints
Protected endpoints require an `Authorization` header with a valid JWT using the `Bearer` scheme:

`Authorization: Bearer <JWT>`

- **Missing/Malformed Token**: Returns `401 Unauthorized` ("Authentication required").
- **Invalid/Expired Token**: Returns `401 Unauthorized` ("Invalid or expired token").
- **Authenticated Request**: The server verifies the token signature and expiration, extracts the identity (`id`), and processes the request.

**GET /api/auth/me**
- **Purpose**: Get the current authenticated user's profile information.
- **Authentication**: Requires valid `Authorization: Bearer <JWT>`.
- **Response (Success)**: `200 OK`. Returns safe user information (`id`, `name`, `email`, `createdAt`, `updatedAt`).
- **Validation/Error Behavior**:
  - Unauthenticated requests return `401 Unauthorized`.
  - If the user associated with the token no longer exists, returns `404 Not Found` ("User not found").
- **Security**: Never returns `password` or `passwordHash`. Validates token signature prior to DB lookup.

**POST /api/auth/logout**
- **Purpose**: Logout the current authenticated user (contractual).
- **Authentication**: Requires valid `Authorization: Bearer <JWT>`.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "message": "Logged out successfully" }`.
- **Logout Semantics**:
  - The application uses a strictly stateless JWT architecture.
  - The server acknowledges the logout request, but **does not invalidate the token** on the backend.
  - The *client* is strictly responsible for clearing the stored token and un-authenticating the session.
  - Any previously issued JWT technically remains cryptographically valid until its explicit expiration if presented to the server.

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
