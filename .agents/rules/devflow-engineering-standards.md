---
trigger: always_on
---

# DevFlow — Antigravity Engineering Standards

You are working on DevFlow, a professional AI-powered project management and collaboration platform.

The repository's `AGENTS.md` and documentation under `docs/` are the project's source of truth.

## Required behavior

Before modifying code:

1. Read `AGENTS.md`.
2. Read the relevant documentation under `docs/`.
3. Read `docs/PROGRESS.md`.
4. Inspect the existing implementation.
5. Confirm that the requested work belongs to the current project module.
6. Make the smallest complete change necessary.

Never rely on conversation memory instead of inspecting the repository.

## Current scope

The project has exactly four modules:

1. Application Foundation & Authentication
2. Project, Team & Task Management
3. Collaboration, Permissions & Analytics
4. AI Project Health Analysis, Testing & Deployment

We are currently implementing Module 3.

Do NOT implement features belonging to Module 4 unless explicitly instructed.

## Technology constraints

Use JavaScript, NOT TypeScript.

Approved stack:

- React
- Vite
- JavaScript ES6+
- Tailwind CSS
- React Router
- TanStack Query
- Zustand
- Node.js
- Express.js
- REST APIs
- JWT
- bcrypt
- MongoDB
- Mongoose

Do not introduce new frameworks or unnecessary dependencies without justification.

## Code quality

- Keep frontend and backend responsibilities separate.
- Prefer small, maintainable modules.
- Avoid unnecessary abstractions.
- Avoid duplicated business logic.
- Validate input on the server.
- Enforce authorization on the server.
- Never expose secrets.
- Never commit `.env`.
- Do not rewrite working code unnecessarily.
- Do not make large architectural changes without explaining them first.
- Keep the application runnable after meaningful changes.

## UI standards

DevFlow must look like a professional developer-focused SaaS product, not a generic AI-generated MVP.

Strictly avoid:

- Gradients
- Decorative emojis
- Excessive rounded cards
- Excessive glassmorphism
- Random colors
- Random fonts
- Flashy animations
- Decorative backgrounds
- Unnecessary illustrations
- Generic AI dashboard patterns
- "Everything is a card" layouts

Use:

- Clear visual hierarchy
- Consistent spacing
- Restrained colors
- Professional typography
- Subtle borders
- Appropriate shadows
- Functional information-dense layouts
- Accessible controls
- Responsive design

Follow `docs/UI_DESIGN_SYSTEM.md`.

## Verification

Never claim a feature is complete without verification.

After meaningful implementation:

1. Run the relevant checks.
2. Test the affected functionality.
3. Fix errors caused by the implementation.
4. Check for console/runtime errors where applicable.
5. Update `docs/PROGRESS.md`.
6. Report what changed, what was verified, and what remains.

If a requirement is ambiguous, inspect the documentation and existing code before making assumptions.