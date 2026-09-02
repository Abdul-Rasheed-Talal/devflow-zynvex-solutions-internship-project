# Module 4: Analytics, AI Project Health & Final Polish

## 1. Overview
Module 4 serves as the final phase of DevFlow, elevating the application from a functional task manager into a production-ready, intelligent project management platform. This module introduces comprehensive visual analytics, global workspace dashboards, and an AI-powered Project Health Analysis feature.

## 2. Deferred Features from Module 3
As noted during the Module 3 review, the following features were deferred and are now incorporated into Module 4:
- **Dashboard Analytics**: Visual representations of project statuses and task distributions across the user's entire workspace.
- **Workload & Progress Monitoring**: Charts and metrics detailing team member workload, task completion rates, and overdue tasks.

## 3. Core Features

### 3.1. Global Workspace Dashboard (The "Home" Page)
- **Aggregated Metrics**: Total active projects, pending tasks, and overdue tasks across all projects.
- **Workspace Charts**: A global task status distribution chart (e.g., Pie chart) and a workload distribution chart (e.g., Bar chart) using `recharts`.
- **My Tasks Widget**: A quick-access list of tasks directly assigned to the authenticated user across all projects.

### 3.2. GitHub Integration (Explicitly Approved)
- **Repository Linking**: Project owners can link a GitHub repository (e.g., `owner/repo`) to a project.
- **GitHub Dashboard Tab**: A dedicated tab within the project fetching real-time data from the GitHub API (Recent Commits, Open Pull Requests, Issues).
- **Task-to-PR Linking**: Tasks can store a `pullRequestUrl`. The UI will fetch and display the live status of the PR (Open/Merged/Closed) directly on the task card.

### 3.2. Project-Level Analytics & Reports
- **Analytics Tab**: A new tab inside the Project Detail view alongside Kanban, Members, and Activity.
- **Task Distribution**: Visual breakdown of tasks by Status and Priority.
- **Team Workload**: A chart showing the number of tasks assigned to each team member to identify bottlenecks.
- **Progress Tracking**: A basic burndown or completion-over-time metric based on task updates.

### 3.3. AI Project Health Analysis
- **AI Insights Tab/Button**: A feature available to Project Owners and Admins.
- **Data Gathering**: The backend will aggregate project data (task statuses, overdue tasks, team size, recent activity volume).
- **AI Generation**: A service will analyze this payload and generate:
  - **Overall Health Score** (e.g., 0-100)
  - **Identified Risks & Bottlenecks** (e.g., "Too many tasks in 'Review' status")
  - **Actionable Recommendations** (e.g., "Reassign tasks from User A to User B")
- *Implementation Note*: We will implement the AI backend endpoint using a structured LLM prompt (using a library like `@google/genai` or a mock service depending on API key availability).

### 3.4. UX Improvements (Add Member by Email)
- **Email-based Invites**: Transition the "Add Member" form from requiring a raw MongoDB ObjectId to accepting a user's email address.
- **Backend Resolution**: The backend will securely resolve the email address to a user account and add them to the project, providing user-friendly errors if the email is not found.

### 3.5. User Profiles & GitHub OAuth
- **Profile Settings**: Users can update their Name, Profile Picture (Avatar URL), Bio, and Skills.
- **GitHub Login**: Integration of GitHub OAuth for fast, seamless login and registration.

### 3.6. Account Types & Workspaces
- **Registration Flow**: Users choose between "Personal" and "Company" accounts during onboarding.
- **Personal Mode**: Streamlined UI optimized for solo developers (hides team, collaboration, and complex permission features).
- **Company Mode**: Full collaborative workspace experience allowing team member invites, RBAC, and advanced project analytics.

### 3.7. Production-Ready Polish
- **UI Refinements**: Polishing empty states, loading skeletons, and hover states to ensure a premium feel.
- **Sidebar & Navigation**: Enhancing the sidebar to include direct links to "My Tasks" or "Global Analytics".
- **Security & Hardening**: Final review of all API endpoints for security vulnerabilities before deployment.

## 4. Technical Stack Additions
- **Frontend Charting**: `recharts` for responsive, accessible, and highly customizable React charts.
- **AI Integration**: Backend integration with an AI provider (e.g., Google Gemini API) for the Health Analysis feature.

## 5. Task Breakdown & Status

- [x] **M4-T01**: Specification & Architecture (Module 4 spec document and technical requirements)
- [x] **M4-T02**: User Profiles & Account Types (Backend `accountType`, Bio, Skills, Registration flow for Personal/Company accounts)
- [x] **M4-T03**: Workspace UI & UX Improvements (Personal account 1-team cap, Add team member by Email, Global Workspaces)
- [x] **M4-T04**: Global Dashboard & Project Analytics (Recharts integration, aggregation APIs, upcoming tasks, live audit feed)
- [x] **M4-T05**: GitHub Integration (OAuth Login, Repo linking, PR status badges on tasks, commit tracking)
- [x] **M4-T06**: AI Project Health Analysis Backend (Groq/Gemini API integration, health score heuristic, risk analysis)
- [x] **M4-T07**: AI Insights Frontend (Interactive health dashboard, actionable recommendations UI, Enterprise project sponsorship)
- [x] **M4-T08**: Final Polish & Deployment Prep (Enterprise branding, team deletion, auto-synchronization, documentation update)
