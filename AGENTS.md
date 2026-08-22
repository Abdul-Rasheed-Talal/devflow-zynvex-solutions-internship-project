# DevFlow — AI Agent Engineering Rules

## Mission
Build DevFlow, a professional AI-powered project management and collaboration platform for software development teams.

## Non-negotiable constraints
1. The official project is divided into exactly four modules. Do not implement later-module features early unless explicitly instructed.
2. Module 1 is the current development target until it is explicitly marked complete.
3. Use JavaScript, not TypeScript.
4. Follow the approved MERN stack: React/Vite, JavaScript, Tailwind CSS, React Router, TanStack Query, Zustand, Node.js, Express.js, REST APIs, JWT, bcrypt, MongoDB, Mongoose.
5. Do not add technologies or dependencies without a concrete reason and approval.
6. Do not rewrite working code just for style or personal preference.
7. Before changing code, read this file and the relevant documents under /docs.
8. After meaningful work, update /docs/PROGRESS.md with what changed, what remains, and any known issues.
9. Never claim a feature is complete unless it has been implemented and verified.
10. Prefer small, reversible changes. Keep the application runnable after each meaningful step.

## Professional UI rules
- No gradients.
- No decorative emojis.
- No excessive glassmorphism.
- No oversized rounded cards everywhere.
- No random colors.
- No flashy animated backgrounds.
- No AI-looking "everything is a card" dashboard.
- No unnecessary illustrations.
- Do not import random fonts from the web.
- Use a restrained professional SaaS visual language with consistent spacing, typography, borders, and hierarchy.
- Use icons only when they improve usability.
- Every page must have useful loading, empty, and error states.
- Responsive behavior is required.
- Accessibility matters: semantic HTML, keyboard access, labels, focus states, and adequate contrast.

## Engineering rules
- Keep frontend and backend responsibilities clearly separated.
- Validate input on the server even when the frontend validates it.
- Never trust client-supplied authorization information.
- Never expose secrets to the frontend.
- Keep environment-specific values in environment variables.
- Use consistent API response and error patterns.
- Avoid duplicated business logic.
- Prefer clear, maintainable code over clever abstractions.
- Add comments only where they explain non-obvious decisions.
- Do not generate huge files when smaller modules are practical.
- Do not silently change database models or API contracts without updating the relevant docs.

## AI-agent workflow
For every task:
1. Read AGENTS.md.
2. Read the relevant module document.
3. Inspect the existing code before editing.
4. State the intended change briefly.
5. Implement the smallest complete change.
6. Run the relevant checks/tests.
7. Fix errors caused by the change.
8. Update docs/PROGRESS.md.
9. Report files changed, verification performed, and remaining issues.

## Context/memory rule
Do not rely on conversation memory as the project specification. The repository documentation is the source of truth. If previous work is unclear, inspect the repository and /docs before making assumptions.

## Scope rule
If a requested feature belongs to Module 2, 3, or 4, do not implement it during Module 1. Record it as future work instead.
