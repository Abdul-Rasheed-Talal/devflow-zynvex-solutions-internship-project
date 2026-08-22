# Module 1 — Application Foundation & Authentication

## Goal
Create a stable, professional foundation on which all later DevFlow modules can be built.

## Scope

### Repository and application setup
- Create React/Vite frontend.
- Create Node/Express backend.
- Configure MongoDB/Mongoose.
- Configure environment variables.
- Configure Git/GitHub workflow.
- Establish frontend/backend folder structures.
- Establish API client and base configuration.
- Establish reusable error handling.

### Authentication
- User registration.
- Secure password hashing with bcrypt.
- User login.
- JWT authentication.
- Protected backend routes.
- Protected frontend routes.
- Logout.
- Authentication persistence.
- Current-user endpoint.
- Basic profile information.

### Initial UI
- Application shell.
- Sidebar/navigation.
- Header.
- Authentication pages.
- Initial dashboard.
- Responsive behavior.
- Loading, empty, and error states.
- Professional design system from `docs/UI_DESIGN_SYSTEM.md`.

## Acceptance criteria
- A new user can register successfully.
- Invalid registration input is handled safely.
- A registered user can log in.
- Passwords are stored as hashes, never plaintext.
- Protected APIs reject unauthenticated requests.
- Protected frontend pages require authentication.
- Refreshing an authenticated session behaves correctly.
- Logout removes the active authentication state.
- Current-user information can be retrieved.
- Frontend and backend run locally with documented commands.
- No secrets are committed to Git.
- UI follows the design system.
- No Module 2/3/4 features are implemented as part of Module 1.

## Verification
Before marking Module 1 complete:
- Run frontend build.
- Run backend startup check.
- Test register/login/logout flow.
- Test protected route behavior.
- Test invalid credentials.
- Test invalid input.
- Check browser console for avoidable errors.
- Check network requests for leaked secrets.
