# DevFlow — Future Features Roadmap & Architectural Feasibility

This document outlines the strategic roadmap for DevFlow beyond the foundational 4 modules. It assesses the technical feasibility, architectural boundaries, and implementation plan for user-requested concepts and recommended product enhancements.

---

## 1. Feasibility & Viability Matrix

To maintain our **$0-cost Vercel/MongoDB Atlas hosting architecture** and ensure high reliability, each proposed feature is classified by technical viability:

| Feature Concept | Viability Status | Feasibility Breakdown |
| :--- | :---: | :--- |
| **1. AI Task Copilot & Step-by-Step Guide** | ✅ **100% Feasible** | Direct prompt engineering via Gemini/Groq analyzing task context and generating architectural plans, checklist steps, and test instructions. Zero extra infrastructure cost. |
| **2. Interactive Whiteboard / Canvas Planning** | ✅ **100% Feasible** | Pure frontend SVG / HTML5 Canvas / vector state with MongoDB persistence. Allows visual wireframing, sticky notes, and 1-click conversion of stickies into Kanban tasks. |
| **3. Subtasks & Interactive Checklists** | ✅ **100% Feasible** | Schema extension to `Task` model. High UX value; integrates seamlessly with the AI Copilot. |
| **4. Global Command Palette (`Ctrl/Cmd + K`)** | ✅ **100% Feasible** | Client-side keyboard-driven modal for instant search, quick navigation, and task creation across all workspaces. |
| **5. Advanced Kanban Filters & Sorting** | ✅ **100% Feasible** | Client-side and query-level filtering by priority, assignee, due date, and search terms. |
| **6. Dark / Light Mode Theme Engine** | ✅ **100% Feasible** | Tailwind CSS class-based theming with localStorage preference persistence. |
| **7. Project Tech Stack & Member Skills Mapping** | ✅ **100% Feasible** | Add `techStack: [String]` to `Project` schema and UI. Connects project architecture directly with user profile skills. |
| **8. AI Skill-Based Task Assignment Recommender** | ✅ **100% Feasible** | Analyzes task requirements vs. member skills and active workload to suggest the optimal assignee for PMs with 1 click. |
| **9. Team & Project Invitation Consent (Accept/Decline)** | ✅ **100% Feasible** | Replaces direct-adding with an invitation state machine (`pending` / `accepted` / `declined`) and interactive notification actions. |
| **10. AI Agent: Code Drafting & GitHub PR Automation** | ⚠️ **Feasible with Scope Boundary** | **Possible**: AI can write complete code files, generate PR descriptions, and push branches/open PRs directly through the user's connected GitHub OAuth token.<br>**Limitation**: Cannot run arbitrary bash terminal commands or execute code on the user's laptop without a local CLI agent or paid sandboxed cloud containers (e.g., Docker/Fly.io). |
| **11. Autonomous Local CLI Agent Execution** | ❌ **Not Possible on Web Alone** | A purely browser-hosted web app cannot access the developer's local filesystem or terminal for security reasons. Requires a companion desktop app (Tauri/Electron) or CLI tool (`npm i -g devflow-cli`). |

---

## 2. Deep Dive: User Proposed Features

### Feature 1: AI Task Copilot & Step-by-Step Implementation Guide
*“AI for users to understand their tasks, plan their tasks, and guide them to complete their tasks step by step.”*

- **Status**: ✅ **Recommended for Immediate Implementation**.
- **User Experience**:
  1. Inside the Task Detail drawer/modal, users see an **"Ask AI Copilot"** or **"Generate Implementation Plan"** action.
  2. The AI reads the task title, description, project tech stack, priority, and existing comments.
  3. It generates:
     - **Conceptual Overview**: What the task requires and why it matters.
     - **Architectural Steps**: Sequenced steps (e.g., Step 1: Schema migration, Step 2: Route handler, Step 3: Frontend hook).
     - **Edge Cases & Security Warnings**: Common pitfalls and testing requirements.
     - **Interactive Checklist**: A button: *“Convert AI Steps into Task Checklist”* that automatically inserts the steps into the task's subtasks!
- **Technical Architecture**:
  - Backend: `POST /api/tasks/:id/ai-guide` calling Gemini 2.0 Flash / Groq LLaMA.
  - Frontend: Interactive collapsible Copilot panel inside the Task modal.

---

### Feature 2: AI Agent for Task Assistance & GitHub PR Automation
*“An AI agent which can complete their task on behalf of the user.”*

- **Status**: ⚠️ **Feasible within Web/GitHub Boundaries**.
- **What IS Possible (and highly practical)**:
  - **AI Code Drafter**: The AI generates production-ready code files (JS/TS/React/Node) tailored to the task description.
  - **Automated GitHub Branch & PR Creation**: Using the existing GitHub integration, the user clicks *“Open PR with AI Draft”*. DevFlow's backend creates a feature branch, commits the generated code files, and opens a Pull Request on the linked GitHub repository with a detailed changelog.
  - **Task Auto-Summarizer**: Scans recent commits and PR discussions to automatically draft release notes and mark tasks as *Review* or *Done*.
- **What IS NOT Possible in a 0-Cost Web Browser App**:
  - Direct local file editing on the user's laptop or executing local compiler/terminal commands without an external agent daemon.
- **Architectural Solution**:
  - Build the **DevFlow GitHub Agent**: Operates via GitHub REST API (`octokit` / native fetch) to commit code and create PRs directly on behalf of the authenticated user.

---

### Feature 3: Interactive Visual Planning Canvas (Whiteboard & Stickies)
*“A canvas type where users can draw, write, and plan their tasks.”*

- **Status**: ✅ **100% Feasible & High Visual Wow Factor**.
- **User Experience**:
  1. A new tab on the Project page: **Canvas / Whiteboard**.
  2. An infinite panning/zooming vector board where developers and designers can:
     - Freehand draw wireframes and architectural diagrams.
     - Drop sticky notes (color-coded by priority or idea category).
     - Type text blocks, draw connection arrows, and frame sprint areas.
     - **The Killer Feature**: Right-click any sticky note -> **“Convert to Task”**, which instantly creates a real Kanban task assigned to that project!
     - Drag existing project tasks onto the canvas to visually organize sprint boards or dependencies.
- **Technical Architecture**:
  - Storage: Store whiteboard nodes/vectors as lightweight JSON in a `Whiteboard` Mongoose model per project.
  - Engine: Lightweight HTML5 Canvas / SVG rendering or integration with an open-source canvas engine (such as `tldraw` or custom vector renderer).

---

### Feature 4: Project Tech Stack & Member Skills Integration
*“Do our current system have an option where we write tech stack in project metadata?”*

- **Current Reality**: `Project` currently has `name`, `description`, `githubRepo`, `status`, `priority`, `startDate`, `dueDate`. It does **not** currently have a dedicated `techStack` field. `User` does have a profile `skills: [String]` array.
- **Status**: ✅ **100% Feasible & Immediate Recommendation**.
- **Enhancement**:
  1. Add `techStack: [String]` to the `Project` Mongoose model and TypeScript types (e.g. `['React', 'Node.js', 'MongoDB', 'Docker', 'TailwindCSS']`).
  2. Add an intuitive multi-tag input selector in `ProjectForm.tsx` during project creation and editing.
  3. When inviting a team member to a project, allow setting project-specific role skills or inheriting their user profile skills.
  4. Display the Project Tech Stack badge bar prominently in the Project Header for instant technical context.

---

### Feature 5: AI Skill-Based Task Assignment Recommender
*“AI recommends task assignment based on team members' skills for project managers or whoever assigns tasks.”*

- **Status**: ✅ **100% Feasible & Exceptional PM Productivity Feature**.
- **User Experience**:
  1. In `TaskForm.tsx` (or task detail drawer), next to the Assignee dropdown, a new button appears: **“✨ AI Suggest Assignee”**.
  2. The AI evaluates:
     - **Task Title & Description**: Keywords (e.g. *“Build MongoDB aggregation pipeline for analytics”* or *“Design responsive mobile drawer”*).
     - **Project Tech Stack**: Active technologies.
     - **Team Members' Skills**: Profile and project skills of all assigned collaborators.
     - **Current Workload Balancing**: How many active tasks (`todo` + `in_progress` + `review`) each team member currently has, avoiding burnout!
  3. The AI returns ranked suggestions:
     - 🥇 **Cric Vela** (94% match • Skills: `MongoDB`, `Node.js` • 1 active task)
     - 🥈 **Talal** (88% match • Skills: `Full Stack`, `React` • 3 active tasks)
  4. Clicking the recommendation instantly sets the assignee!

---

### Feature 6: Team & Project Invitation Consent Flow (Accept / Decline)
*“Give the team member an option whether they want to accept or decline when added to a team, rather than being added directly without consent.”*

- **Current Reality**: When an owner adds a member by email, the user is immediately appended directly to `team.members` without confirmation.
- **Status**: ✅ **100% Feasible & Standard Enterprise Best Practice**.
- **User Experience**:
  1. When an owner invites a user:
     - Member record created with `status: 'pending'`.
     - Invitee receives a high-priority notification: *“Talal has invited you to join team 'Core Engineering'”*.
  2. In the Notifications dropdown and on a new **“Pending Invitations”** banner in `TeamPage.tsx`:
     - Invitee sees the team details, owner name, and member count.
     - Interactive action buttons: **[Accept Invitation]** and **[Decline]**.
  3. **Upon Accept**: Member status flips to `'accepted'`, team projects sync, and real-time alert notifies the team owner.
  4. **Upon Decline**: The pending invitation is dismissed without modifying the user's workspace.

---

## 3. Recommended Product Polish & Power Features

### Feature 7: Global Command Palette (`Ctrl/Cmd + K`)
- **Impact**: Elevates DevFlow into an elite developer SaaS tool (similar to Linear, GitHub, Raycast).
- **Capabilities**:
  - Press `Ctrl + K` (or `Cmd + K` on macOS) from anywhere in the app.
  - Fuzzy-search projects, tasks, teams, and announcements.
  - Quick actions: `+ Create New Task`, `+ New Project`, `Go to Settings`, `Run Health Diagnostic`.
  - Full keyboard accessibility with arrow keys and `Enter`.

### Feature 8: Task Subtasks & Interactive Checklists
- **Impact**: Fundamental productivity feature for granular task decomposition.
- **Capabilities**:
  - Add sub-items inside tasks with individual completion checkboxes.
  - Visual completion progress bar (e.g. `3/5 subtasks completed`).
  - Auto-toggles task status to `Done` when all subtasks are finished (optional setting).

### Feature 9: Advanced Kanban Filters & Sorting
- **Impact**: Essential for projects with 20+ tasks.
- **Capabilities**:
  - Filter by **Assignee** (e.g. show only my tasks or Cric Vela's tasks).
  - Filter by **Priority** (`Urgent`, `High`, `Medium`, `Low`).
  - Filter by **Due Date** (`Overdue`, `Due this week`).
  - Search bar to filter tasks by keyword in real time without server refetching.

### Feature 10: Dark / Light Mode Theme Engine
- **Impact**: Highly requested by developers who prefer dark interfaces for late-night work.
- **Capabilities**:
  - Toggle between **Dark Slate** (`#0f172a`), **Light SaaS** (`#f8fafc`), and **System Default**.
  - Persistent user preference saved in `localStorage` and synchronized across browser sessions.

### Feature 11: Project Data Export & Executive Reporting
- **Impact**: Enables engineering managers to export sprint data for stakeholders.
- **Capabilities**:
  - 1-Click CSV export of project tasks, assignees, and completion dates.
  - Markdown/PDF Executive Summary report generation incorporating the AI Health Diagnostic.

---

## 4. Phased Implementation Roadmap

```mermaid
graph TD
    subgraph "Phase 5.1: Task Power & Navigation"
        F4[Command Palette Ctrl+K]
        F5[Subtasks & Checklists]
        F6[Advanced Kanban Filters]
    end

    subgraph "Phase 5.2: AI Task Copilot"
        F1[AI Implementation Guide]
        F1B[Convert AI Steps to Checklists]
        F2A[AI Code & PR Drafter]
    end

    subgraph "Phase 5.3: Visual Canvas & Whiteboard"
        F3[Infinite Project Canvas]
        F3B[Sticky Notes to Kanban Tasks]
        F3C[Vector Drawing & Arrows]
    end

    subgraph "Phase 5.4: Appearance & Reporting"
        F7[Dark Mode Theme Switcher]
        F8[CSV & Report Exporter]
    end

    Phase 5.1 --> Phase 5.2
    Phase 5.2 --> Phase 5.3
    Phase 5.3 --> Phase 5.4
```

### Proposed Phase Order:
1. **Phase 5.1 (Immediate Power Polish)**:
   - Task Subtasks & Checklists (`models/Task.js` subtask schema + UI checklist).
   - Advanced Kanban Filters & Search Bar (`ProjectTasksPage.tsx`).
   - Global Command Palette `Ctrl+K` (`CommandPalette.tsx`).
2. **Phase 5.2 (AI Task Copilot & Code Drafter)**:
   - Task Implementation Guide modal with step-by-step guidance.
   - 1-Click conversion of AI guidance into task checklists.
   - GitHub PR generator creating branches and drafting PRs.
3. **Phase 5.3 (Interactive Project Planning Canvas)**:
   - Infinite whiteboard workspace tab with freehand sketch, text, and sticky notes.
   - Dual-sync: Convert sticky notes into real Kanban tasks.
4. **Phase 5.4 (Theme Engine & Reporting)**:
   - System/Dark/Light theme switcher.
   - CSV / Markdown project export.
