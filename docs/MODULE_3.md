# Module 3 — Collaboration, RBAC & Real-Time

## 1. Goal

The objective of Module 3 is to elevate DevFlow from a basic project-management tool to a robust team collaboration platform. It introduces controlled access (RBAC) to restrict what team members can do, enables seamless communication through comments and mentions, surfaces events via in-app notifications, provides a historical record of project activity and security audit logs, and leverages real-time updates via WebSockets for a snappy, multiplayer-like user experience.

## 2. Scope

Module 3 strictly focuses on:
- Extending the existing project membership model into a formalized Role-Based Access Control (RBAC) system.
- Introducing a minimal but effective set of project roles (`owner`, `admin`, `member`, `viewer`).
- Adding contextual communication (Comments) on tasks.
- Enabling user mentions (`@username`) in comments.
- Providing in-app Notifications for mentions, assignments, and critical updates.
- Maintaining an Activity History feed for operational visibility on projects and tasks.
- Implementing immutable Audit Logs for security-sensitive actions (e.g., membership/role changes).
- Building a Real-Time Architecture using Socket.IO for live updates without page reloads.

## 3. Module 2 Baseline

Module 2 delivered the core operational data structures:
- `Project` with an `owner` (ObjectId) and `members` (Array of ObjectIds).
- `Task` scoped to a `project`, with status, assignment, and metadata.
- Backend authorization that enforces basic access boundaries: only the owner can modify project details or manage members; all members can create, update, delete, and assign tasks.
- Frontend utilizing React, Tailwind, and TanStack Query for caching and optimistic UI updates.

Module 3 will extend the `members` array into a robust role system and build the collaborative features on top of these boundaries.

## 4. Role-Based Access Control

The RBAC system in DevFlow is scoped strictly to the **Project** level. There are no global application roles (e.g., Superadmin) needed for this module.

### Roles
1. **Owner**: The creator of the project. Has ultimate authority. Cannot be removed or have their role downgraded.
2. **Admin**: Trusted team member. Can manage other members (except Owner) and configure project settings, plus all `Member` capabilities.
3. **Member**: Standard collaborator. Can create, edit, assign, and delete tasks, add comments, and view everything. Cannot modify project settings or manage members.
4. **Viewer**: Read-only access. Can view project details, tasks, comments, and activity, but cannot mutate any data (cannot create/edit tasks or comment).

### Permission Matrix

| Operation | Owner | Admin | Member | Viewer |
|---|:---:|:---:|:---:|:---:|
| View project & tasks | ✅ | ✅ | ✅ | ✅ |
| Update project details | ✅ | ✅ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ |
| Add members | ✅ | ✅ | ❌ | ❌ |
| Remove/Change members | ✅ | ✅ | ❌ | ❌ |
| Create tasks | ✅ | ✅ | ✅ | ❌ |
| Update tasks & status | ✅ | ✅ | ✅ | ❌ |
| Delete tasks | ✅ | ✅ | ✅ | ❌ |
| Add comments | ✅ | ✅ | ✅ | ❌ |
| View activity | ✅ | ✅ | ✅ | ✅ |
| View audit logs | ✅ | ✅ | ❌ | ❌ |

## 5. Ownership vs Roles

- **Ownership** is a special immutable status. The `owner` field on the Project model remains the authoritative reference.
- **Transfer of Ownership** is currently out of scope.
- **Migration**: Existing Module 2 `members` (ObjectIds) will be automatically mapped to the `Member` role when the backend is updated to support roles.
- Owners cannot be added to the `members` array; their access is inherently derived from the `owner` field.

## 6. Permission Enforcement Architecture

Authorization remains strictly enforced on the backend.
- **Authentication**: `requireAuth` middleware ensures a valid JWT.
- **Role Resolution Middleware**: A new middleware (e.g., `requireProjectRole(roles)`) will:
  1. Look up the project.
  2. Verify if `req.user.id` is the `owner`. If so, grant all access.
  3. Otherwise, check the `members` array to find the user's role.
  4. Compare the user's role against the allowed `roles` for the route.
- **Task/Comment Level**: Ownership of individual comments allows the original creator to edit/delete their own comment regardless of role (unless they are downgraded to Viewer, they can still view, but edits might be restricted based on business rules; for simplicity, authors can edit their own comments if they are at least a Member).
- **Frontend Controls**: UI components must use the authenticated user's role to conditionally hide or disable buttons (e.g., hiding the "Add Member" button for Viewers). This is UX only; the backend is the security perimeter.

## 7. Database Design

### Modified Models

**Project Model**
- Change `members: [{ type: ObjectId }]` to an array of objects:
  ```javascript
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
    addedAt: { type: Date, default: Date.now }
  }]
  ```

### New Models

**Comment Model**
- `_id`: ObjectId
- `project`: ObjectId (ref: 'Project', indexed)
- `task`: ObjectId (ref: 'Task', indexed)
- `author`: ObjectId (ref: 'User')
- `content`: String (max 2000 chars)
- `mentionedUsers`: Array of ObjectIds (ref: 'User')
- `isEdited`: Boolean (default: false)
- Timestamps: `createdAt`, `updatedAt`

**Notification Model**
- `_id`: ObjectId
- `user`: ObjectId (ref: 'User', indexed) - The recipient.
- `actor`: ObjectId (ref: 'User') - Who triggered it.
- `project`: ObjectId (ref: 'Project')
- `type`: Enum (`mention`, `task_assigned`, `task_updated`)
- `referenceId`: ObjectId (dynamic reference to Task/Comment)
- `isRead`: Boolean (default: false, indexed)
- Timestamps: `createdAt`

**Activity Model (Operational feed)**
- `_id`: ObjectId
- `project`: ObjectId (ref: 'Project', indexed)
- `task`: ObjectId (ref: 'Task', optional)
- `actor`: ObjectId (ref: 'User')
- `action`: String (e.g., `task_created`, `status_changed`, `comment_added`)
- `metadata`: Object (e.g., `{ oldStatus: 'todo', newStatus: 'in_progress' }`)
- Timestamps: `createdAt` (Indexed for reverse chronological sorting)

**AuditLog Model (Security feed)**
- `_id`: ObjectId
- `project`: ObjectId (ref: 'Project', indexed)
- `actor`: ObjectId (ref: 'User')
- `action`: String (e.g., `member_added`, `role_changed`, `project_deleted`)
- `targetUser`: ObjectId (ref: 'User', optional)
- `ipAddress`: String
- Timestamps: `createdAt`

## 8. Database Relationships

- **User** has many **Notifications**.
- **Task** has many **Comments**.
- **Project** has many **Activities** and **AuditLogs**.
- **Comment** belongs to a **Task** and mentions many **Users**.
- All operational data (Tasks, Comments, Activities) cascade delete if the parent Project is deleted.
- AuditLogs should ideally be retained even if the project is deleted (soft deletion/tombstoning), but for Module 3, cascading delete is acceptable to prevent database bloat.

## 9. Comments

- **Creation**: Requires `Member`, `Admin`, or `Owner` role.
- **Retrieval**: Loaded sequentially under a Task.
- **Editing/Deletion**: Users can edit/delete their own comments. Admins/Owners can delete any comment.
- **Pagination**: Client fetches recent comments, paginated via a `cursor` or `page/limit`.

## 10. Mentions

- Mentions are simple `@username` text patterns inside comments.
- **Extraction**: The frontend identifies the mention and explicitly passes an array of `mentionedUserIds` to the backend when creating the comment.
- **Validation**: Backend verifies the `mentionedUserIds` actually belong to the project.
- **Notification**: Backend fires a `mention` notification to the target user.

## 11. Notifications

- **Types**: `mention`, `task_assigned`, `task_updated` (if assigned).
- **State**: A user can mark individual notifications as read, or hit "Mark all as read".
- **Delivery**: Saved to DB and emitted immediately over Socket.IO to the specific user's private room.

## 12. Activity History

- Tracks operational workflow (task creation, status changes).
- Visible to all project members via a dedicated "Activity" tab in the Project details or a sidebar in the Task details.
- Human-readable translation happens on the frontend based on the `action` and `metadata`.

## 13. Audit Logs

- Tracks security boundaries (who changed a role, who deleted a task).
- Visible ONLY to `Owner` and `Admin`.
- Immutable: No endpoints exist to update or delete audit logs.

## 14. API Design

All endpoints require a valid JWT.

**Roles / Members**
- `GET /api/projects/:projectId/members` - Returns members with roles.
- `POST /api/projects/:projectId/members` - Adds member (Admin/Owner). Body: `{ email, role }`.
- `PATCH /api/projects/:projectId/members/:userId` - Updates role (Admin/Owner).
- `DELETE /api/projects/:projectId/members/:userId` - Removes member (Admin/Owner).

**Comments**
- `GET /api/tasks/:taskId/comments` - List comments.
- `POST /api/tasks/:taskId/comments` - Create comment.
- `PATCH /api/comments/:commentId` - Edit comment.
- `DELETE /api/comments/:commentId` - Delete comment.

**Notifications**
- `GET /api/notifications` - List current user's notifications.
- `PATCH /api/notifications/:id/read` - Mark as read.
- `PATCH /api/notifications/read-all` - Mark all as read.

**Activity / Audit**
- `GET /api/projects/:projectId/activity` - List project activity.
- `GET /api/projects/:projectId/audit` - List project audit logs (Admin/Owner only).

## 15. Real-Time Architecture

- **Engine**: Socket.IO.
- **Authentication**: Socket connects using the HttpOnly `devflow_access_token` cookie. Middleware on the socket server validates the JWT exactly like the REST API.
- **Rooms**: 
  - `user_USERID`: Private channel for direct notifications.
  - `project_PROJECTID`: Broadcast channel for project-wide updates (task changes, activities).
- **Authorization**: Clients must explicitly emit a `join_project` event. The server verifies project membership before joining the socket to `project_PROJECTID`.
- **Source of Truth**: REST API handles all mutations. Socket.IO is strictly for pushing one-way updates to clients to trigger refetches or optimistic cache updates.

## 16. Real-Time Event Contract

- `notification.created`: Payload `{ notification }` -> Emitted to `user_USERID`.
- `task.updated`: Payload `{ taskId, changes }` -> Emitted to `project_PROJECTID`.
- `task.status_changed`: Payload `{ taskId, oldStatus, newStatus }` -> Emitted to `project_PROJECTID`.
- `comment.created`: Payload `{ comment }` -> Emitted to `project_PROJECTID`.

## 17. Frontend Architecture

- **State Management**: Continue using TanStack Query for server state. WebSockets will trigger `queryClient.invalidateQueries` to refresh data automatically.
- **Components**:
  - `RoleSelect`: Dropdown to manage member roles.
  - `CommentSection`: Renders under task details.
  - `NotificationBell`: In the global top navigation, showing an unread badge.
  - `ActivityFeed`: A timeline UI component.
- **Hooks**: `useComments`, `useNotifications`, `useActivity`, `useSocket`.

## 18. Permission-Aware UI

- The frontend will derive the current user's role from the `project` or `members` queries.
- `Admin`/`Owner` only buttons (like "Add Member", "View Audit Logs") will be conditionally rendered: `if (role === 'admin' || isOwner) { render }`.
- Direct URL access to `/app/projects/:id/audit` for a `Viewer` will hit the API, receive a `403 Forbidden`, and the UI will render an "Access Denied" boundary.

## 19. Security

- **Strict Server-Side Validation**: Never trust the frontend's role assessment.
- **Role Escalation**: Admins cannot promote themselves to Owner. Admins cannot demote Owners. Owners cannot be modified.
- **Cross-Project Isolation**: A user cannot mention a user who is not in the project, nor can they subscribe to a Socket room for a project they aren't in.
- **XSS Prevention**: Comment content must be sanitized on the frontend when rendered (React does this safely by default for text, but prevent raw HTML injection).
- **Rate Limiting**: Socket.IO connection rate limiting and comment creation rate limiting to prevent spam.

## 20. Performance / Indexing

- **Notifications**: Index `{ user: 1, isRead: 1, createdAt: -1 }` to quickly fetch unread counts.
- **Comments**: Index `{ task: 1, createdAt: 1 }`.
- **Activity/Audit**: Index `{ project: 1, createdAt: -1 }`.
- **Socket.IO**: Keep payloads small. Send IDs and minimal context, letting TanStack Query refetch the full updated resource.

## 21. Pagination

- **Notifications, Activity, Audit Logs**: Implement cursor-based pagination or simple `page`/`limit` query parameters with a default limit of 20.
- **Comments**: Standard `page`/`limit` since users may want to load older comments.

## 22. Error Handling

- Ensure `403 Forbidden` is returned consistently when a user lacks the specific role required (e.g., Member trying to view Audit Logs).
- Standardized API error envelopes will continue to be used.

## 23. Empty / Loading / Error States

- **Notifications**: "You're all caught up!"
- **Activity**: "No activity yet."
- **Comments**: "No comments yet. Be the first to share your thoughts!"
- **Access Denied**: Clear lock icon and message: "You don't have permission to view this section."

## 24. Accessibility

- **Notification Dropdown**: Must be navigable via `Tab` and easily dismissible via `Escape`.
- **Mentions**: The mention popover/autocomplete must announce its presence to screen readers and support keyboard arrow navigation.
- **Real-Time Updates**: Crucial task updates should use `aria-live="polite"` if the user is actively viewing that specific task.

## 25. Responsive Design

- The Activity Feed and Comment Section must stack vertically on mobile.
- The Notification dropdown should convert to a full-screen mobile modal or drawer on small screens.

## 26. Testing Strategy

### Backend
- Unit test the Role Resolution Middleware extensively.
- Test role transitions (e.g., Admin removing a Member).
- Test Socket authentication and room joining rejections.
- Test Activity and Audit log creation hooks.

### Frontend
- Test that UI controls disappear for `Viewer` roles.
- Test Socket event listeners triggering `invalidateQueries`.

## 27. Migration Strategy

- Upon deploying Module 3, a database migration script (or silent application-level migration) must run:
  - Iterates over all `Project` documents.
  - Converts `members: [ObjectId, ObjectId]` to `members: [{ user: ObjectId, role: 'member', addedAt: Date.now() }]`.
- The frontend `ProjectMember` type must be updated to expect the object shape rather than just a populated User string/object.

## 28. Implementation Order

- **M3-T01** — Specification & Architecture (This document)
- **M3-T02** — RBAC & Membership Schema Migration
- **M3-T03** — Role Enforcement Middleware & Controller Updates
- **M3-T04** — RBAC UI & Role Management Frontend
- **M3-T05** — Comments & Activity Backend Models/API
- **M3-T06** — Comments & Activity UI
- **M3-T07** — Audit Logs API & UI
- **M3-T08** — Socket.IO Integration & Real-time Sync
- **M3-T09** — Notifications API & UI
- **M3-T10** — Module 3 Integration, Testing & Hardening

## 29. Out of Scope

- Custom role creation (e.g., users creating a custom "QA" role).
- Document/File attachments in comments.
- Rich text editors (WYSIWYG) for comments — simple markdown/text is sufficient.
- Email or Push notifications (In-app only for Module 3).
- Real-time collaborative typing/cursors (multiplayer).

## 30. Acceptance Criteria

- [ ] Existing projects seamlessly migrate to the new role schema.
- [ ] Owners and Admins can assign roles to users.
- [ ] Role boundaries (Viewer vs Member vs Admin) are strictly enforced by the backend API.
- [ ] Unauthorized UI elements are successfully hidden based on role.
- [ ] Users can add, edit, and delete comments on tasks.
- [ ] `@username` mentions successfully trigger in-app notifications.
- [ ] In-app notifications can be marked as read.
- [ ] Real-time updates push task and comment changes to connected clients instantly.
- [ ] Socket.IO connections are securely authenticated.
- [ ] Activity history accurately reflects operational changes.
- [ ] Audit logs accurately reflect security and membership changes and are restricted to Admins/Owners.
- [ ] All features are fully responsive and accessible.

## 31. Project Status

Module 1 — Complete (v1.0.0-module-1)
Module 2 — Complete (v2.0.0-module-2)
Module 3 — Specification complete
