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
- **Purpose**: Authenticate an existing user and obtain an HttpOnly cookie JWT.
- **Request Body**: JSON object containing `email` and `password`.
- **Response (Success)**: `200 OK`. Returns safe user information (`id`, `name`, `email`, `createdAt`, `updatedAt`). Does not return `passwordHash`. Responds with `Set-Cookie: devflow_access_token=<JWT>; HttpOnly; ...`
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
Protected endpoints require a valid JWT stored in the `devflow_access_token` HttpOnly cookie.

- **Missing/Malformed Token**: Returns `401 Unauthorized` ("Authentication required").
- **Invalid/Expired Token**: Returns `401 Unauthorized` ("Invalid or expired token").
- **Authenticated Request**: The server verifies the token signature and expiration, extracts the identity (`id`), and processes the request.

**GET /api/auth/me**
- **Purpose**: Get the current authenticated user's profile information.
- **Authentication**: Requires valid `devflow_access_token` cookie.
- **Response (Success)**: `200 OK`. Returns safe user information (`id`, `name`, `email`, `createdAt`, `updatedAt`).
- **Validation/Error Behavior**:
  - Unauthenticated requests return `401 Unauthorized`.
  - If the user associated with the token no longer exists, returns `404 Not Found` ("User not found").
- **Security**: Never returns `password` or `passwordHash`. Validates token signature prior to DB lookup.

**POST /api/auth/logout**
- **Purpose**: Logout the current authenticated user (contractual).
- **Authentication**: Requires valid `devflow_access_token` cookie.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "message": "Logged out successfully" }`. Responds with `Set-Cookie: devflow_access_token=; Max-Age=0` to clear the cookie.
- **Logout Semantics**:
  - The application uses a strictly stateless JWT architecture.
  - The server acknowledges the logout request and instructs the browser to clear the cookie.
  - The *client* browser handles cookie destruction automatically.
  - Any previously issued JWT technically remains cryptographically valid until its explicit expiration if somehow presented to the server.

### User profile
GET /api/users/me
PUT /api/users/me

### Endpoint responsibility

### `GET /api/activity/system` (Admin Only)
- Fetches paginated global system events.

---

## 7. Notifications

### `GET /api/notifications`
- **Description:** Retrieve paginated notifications for the authenticated user.
- **Access:** Private
- **Response:** Array of Notification objects.

### `PATCH /api/notifications/read-all`
- **Description:** Marks all unread notifications for the user as read.
- **Access:** Private
- **Response:** Success object.

### `PATCH /api/notifications/:notificationId/read`
- **Description:** Marks a single notification as read.
- **Access:** Private
- **Response:** Updated Notification object.

**GET /api/auth/me** — Returns the currently authenticated user's identity based on the active session/token. Used by the frontend to verify whether the user is still authenticated and to bootstrap the auth state on page load. Returns minimal identity information (id, name, email).

**GET /api/users/me** — Returns the authenticated user's full profile data for display and editing.

**PUT /api/users/me** — Updates the authenticated user's profile information.

The `/auth/me` endpoint is an authentication concern. The `/users/me` endpoints are profile-management concerns. Both require authentication but serve different purposes.

### Health
GET /api/health

Returns a simple JSON response confirming the API is running. No authentication required.

## Module 2 — Project CRUD

All project endpoints require authentication via the `devflow_access_token` HttpOnly cookie.

### Authorization model

| Operation | Owner | Admin | Member | Viewer | Unrelated |
|---|---|---|---|---|---|
| List projects | sees own | sees own | sees own | sees own | empty list |
| View project | 200 | 200 | 200 | 200 | 403 |
| Create project | 201 | 201 | 201 | 201 | 201 |
| Update project | 200 | 200 | 403 | 403 | 403 |
| Delete project | 200 | 403 | 403 | 403 | 403 |

**GET /api/projects**
- **Purpose**: List projects the authenticated user owns or is a member of.
- **Authentication**: Required.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": [...] }`.
- **Empty case**: Returns `{ "success": true, "data": [] }` (not an error).
- **Sorting**: Most recently updated first.

**POST /api/projects**
- **Purpose**: Create a new project.
- **Authentication**: Required. The authenticated user becomes the owner.
- **Request Body**: `{ "name", "description", "status", "priority", "startDate", "dueDate" }`.
- **Accepted fields**: Only `name`, `description`, `status`, `priority`, `startDate`, `dueDate`. Any `owner` or `members` field in the body is ignored.
- **Defaults**: `status` defaults to `planning`, `priority` defaults to `medium`, `members` defaults to `[]`.
- **Response (Success)**: `201 Created`. Returns `{ "success": true, "data": { ... } }`.
- **Validation/Error Behavior**:
  - `name` is required. Returns `400` if missing or exceeds 100 characters.
  - `description` must not exceed 1000 characters.
  - `status` must be one of: `planning`, `active`, `on_hold`, `completed`, `archived`.
  - `priority` must be one of: `low`, `medium`, `high`, `urgent`.
  - `dueDate` must be >= `startDate` if both are provided.
- **Security**: The `owner` field is always derived from `req.user.id`. Client-supplied `owner` values are discarded.

**GET /api/projects/:projectId**
- **Purpose**: Get a single project by ID.
- **Authentication**: Required.
- **Authorization**: Viewer or higher.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": { ... } }`.
- **Error Behavior**:
  - Invalid ObjectId: `400 Bad Request`.
  - Project does not exist: `404 Not Found`.
  - User is not owner or member: `403 Forbidden`.

**PATCH /api/projects/:projectId**
- **Purpose**: Update project details.
- **Authentication**: Required.
- **Authorization**: Admin or higher.
- **Updatable fields**: `name`, `description`, `status`, `priority`, `startDate`, `dueDate`.
- **Protected fields**: `_id`, `owner`, `members`, `createdAt`, `updatedAt` cannot be modified through this endpoint.
- **Response (Success)**: `200 OK`. Returns updated project.
- **Error Behavior**:
  - Invalid ObjectId: `400`.
  - Project does not exist: `404`.
  - Not the owner: `403`.
  - No valid fields provided: `400`.
  - Invalid field values: `400`.

**DELETE /api/projects/:projectId**
- **Purpose**: Delete a project.
- **Authentication**: Required.
- **Authorization**: Owner only.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "message": "Project deleted successfully" }`.
- **Error Behavior**:
  - Invalid ObjectId: `400`.
  - Project does not exist: `404`.
  - Not the owner: `403`.

### Project Membership

**GET /api/projects/:projectId/members**
- **Purpose**: Get the list of project members.
- **Authentication**: Required.
- **Authorization**: Viewer or higher.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": [...] }` where each item is a safe user representation. Does not expose password hashes.
- **Error Behavior**:
  - Invalid ObjectId: `400`.
  - Project does not exist: `404`.
  - Not the owner: `403`.

**POST /api/projects/:projectId/members**
- **Purpose**: Add a user to a project.
- **Authentication**: Required.
- **Authorization**: Admin or higher.
- **Request Body**: `{ "userId": "<user_id>" }`
- **Response (Success)**: `200 OK`. Returns the updated project.
- **Error Behavior**:
  - Invalid project/user ID: `400`.
  - Project/user does not exist: `404`.
  - Not the owner: `403`.
  - Attempting to add the owner: `400`.
  - User is already a member: `409`.

**PATCH /api/projects/:projectId/members/:userId**
- **Purpose**: Update a user's role in a project.
- **Authentication**: Required.
- **Authorization**: Admin or higher.
- **Request Body**: `{ "role": "<admin|member|viewer>" }`
- **Response (Success)**: `200 OK`. Returns the updated project.
- **Error Behavior**:
  - Invalid project/user ID or role: `400`.
  - Project/user does not exist: `404`.
  - Not an admin/owner: `403`.
  - Attempting to modify the owner: `400`.
  - User is not a member: `404`.

**DELETE /api/projects/:projectId/members/:userId**
- **Purpose**: Remove a user from a project.
- **Authentication**: Required.
- **Authorization**: Admin or higher.
- **Response (Success)**: `200 OK`. Returns the updated project.
- **Error Behavior**:
  - Invalid project/user ID: `400`.
  - Project does not exist: `404`.
  - Not the owner: `403`.
  - Attempting to remove the owner: `400`.
  - User is not a member: `404`.

## Tasks

**GET /api/projects/:projectId/tasks**
- **Purpose**: Get all tasks for a specific project.
- **Authentication**: Required.
- **Authorization**: Viewer or higher.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": [...] }` containing task objects populated with safe creator and assignee fields.
- **Error Behavior**:
  - Invalid project ID: `400`.
  - Project not found: `404`.
  - Not an owner or member: `403`.

**POST /api/projects/:projectId/tasks**
- **Purpose**: Create a new task within a project.
- **Authentication**: Required.
- **Authorization**: Member or higher.
- **Request Body**: `{ "title": "...", "description": "...", "status": "todo", "priority": "medium", "assignee": "...", "labels": ["...", "..."], "dueDate": "..." }`
- **Response (Success)**: `201 Created`. Returns `{ "success": true, "data": { ... } }` containing the new task.
- **Error Behavior**:
  - Invalid project ID: `400`.
  - Project not found: `404`.
  - Not an owner or member: `403`.
  - Validation errors (missing title, invalid enum, etc.): `400`.
  - Invalid assignee or assignee outside project: `400`/`403`/`404`.

**GET /api/tasks/:taskId**
- **Purpose**: Retrieve a single task.
- **Authentication**: Required.
- **Authorization**: Viewer or higher.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": { ... } }`.
- **Error Behavior**:
  - Invalid task ID: `400`.
  - Task not found: `404`.
  - Not an owner or member of the parent project: `403`.

**PATCH /api/tasks/:taskId**
- **Purpose**: Update an existing task.
- **Authentication**: Required.
- **Authorization**: Member or higher.
- **Request Body**: Allowed fields: `title`, `description`, `status`, `priority`, `assignee`, `labels`, `dueDate`.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": { ... } }` containing the updated task.
- **Error Behavior**:
  - Invalid task ID: `400`.
  - Task not found: `404`.
  - Not an owner or member: `403`.
  - Validation errors: `400`.

**DELETE /api/tasks/:taskId**
- **Purpose**: Delete a task.
- **Authentication**: Required.
- **Authorization**: Member or higher.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": {} }`.
- **Error Behavior**:
  - Invalid task ID: `400`.
  - Task not found: `404`.
  - Not an owner or member: `403`.

## Comments

**GET /api/tasks/:taskId/comments**
- **Purpose**: List comments for a task.
- **Authentication**: Required.
- **Authorization**: Viewer or higher.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": [...] }` with comments populated with `author` and `mentionedUsers`.

**POST /api/tasks/:taskId/comments**
- **Purpose**: Create a new comment.
- **Authentication**: Required.
- **Authorization**: Member or higher.
- **Request Body**: `{ "content": "...", "mentionedUsers": ["..."] }`
- **Response (Success)**: `201 Created`. Returns `{ "success": true, "data": { ... } }`.
- **Error Behavior**:
  - Empty or >2000 chars content: `400`.
  - Not a member or higher: `403`.

**PATCH /api/comments/:commentId**
- **Purpose**: Edit a comment.
- **Authentication**: Required.
- **Authorization**: Comment author only.
- **Request Body**: `{ "content": "...", "mentionedUsers": ["..."] }`
- **Response (Success)**: `200 OK`. Returns updated comment with `isEdited: true`.
- **Error Behavior**:
  - Not the author: `403`.
  - Empty or >2000 chars content: `400`.

**DELETE /api/comments/:commentId**
- **Purpose**: Delete a comment.
- **Authentication**: Required.
- **Authorization**: Comment author OR project Admin/Owner.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": {} }`.
- **Error Behavior**:
  - Not author/admin/owner: `403`.

## Activity

**GET /api/projects/:projectId/activity**
- **Purpose**: Retrieve project activity feed.
- **Authentication**: Required.
- **Authorization**: Viewer or higher.
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": [...] }` sorted chronologically (newest first).

## Audit Logs

**GET /api/projects/:projectId/audit**
- **Purpose**: Retrieve the security audit logs for a project.
- **Authentication**: Required.
- **Authorization**: Admin or Owner only.
- **Query Parameters**: `page` (default: 1), `limit` (default: 20).
- **Response (Success)**: `200 OK`. Returns `{ "success": true, "data": [...], "pagination": {...} }`.
- **Error Behavior**:
  - Not an admin or owner: `403`.

## Real-Time Sync (Socket.IO)

DevFlow uses Socket.IO as a real-time event distribution layer to instruct clients to invalidate stale caches. 
The REST APIs remain the absolute source of truth.

**Connection & Authentication**
- Connect to the root URL (or the `API_URL` stripped of `/api`).
- Connections MUST supply credentials (HttpOnly `devflow_access_token` cookie).
- Invalid tokens or unauthenticated requests are rejected during the socket handshake.
- Upon connection, sockets automatically join a private room: `user_<userId>`.

**Project Rooms**
- Sockets can explicitly join project rooms by emitting: `join_project(projectId)`.
- The server performs a database authorization check. Only project owners and active members are allowed to join.
- Sockets can explicitly leave by emitting: `leave_project(projectId)`.

**Events Emitted (Server to Client)**
- Project events: `project.updated`, `project.deleted`, `membership.updated`
- Task events: `task.created`, `task.updated`, `task.deleted`, `task.status_changed`
- Comment events: `comment.created`, `comment.updated`, `comment.deleted`

**Payload Structure**
- Payloads are intentionally minimal and safe. They NEVER include sensitive data, tokens, or entire database documents.
- Example payload: `{ projectId: "...", taskId: "..." }`
- Clients should use the IDs provided to trigger REST API re-fetches (e.g. invalidating a TanStack query).

## API rules
- JSON request/response.
- Consistent success/error structure.
- Server-side validation.
- Authentication middleware for protected routes.
- Authorization must be enforced on the server.
- Do not return password hashes or secrets.
- Use appropriate HTTP status codes.
- Do not expose internal stack traces in production responses.
