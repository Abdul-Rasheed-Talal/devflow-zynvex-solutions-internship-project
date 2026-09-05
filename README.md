# DevFlow

**Professional AI-Powered Project Management & Collaboration Platform for Software Engineering Teams**

DevFlow is an enterprise-grade project management and collaboration platform built on the approved MERN stack (MongoDB, Express.js, React/Vite, Node.js). It integrates task workflows, Kanban boards, role-based access control, team workspaces, real-time collaboration, GitHub synchronization, visual analytics, and an AI-driven project health diagnostic engine.

---

## 🚀 Key Capabilities

### 1. Project & Task Management
- **Interactive Kanban Boards**: Drag-and-drop status workflows (`Todo`, `In Progress`, `Review`, `Done`) with inline state toggling.
- **Granular Task Details**: Priority levels (`Urgent`, `High`, `Medium`, `Low`), due dates, relative deadline calculations (`Due today`, `X days overdue`), and markdown-ready descriptions.
- **Task Assignment & Auto-Sync**: Project members and team collaborators are automatically recognized for assignment.
- **Task Commenting & Mentions**: Real-time comment threads with user tagging and mention alerts.

### 2. Team Workspaces & Collaboration
- **Dual Account Hierarchy**:
  - **Personal Accounts**: Optimized for solo developers with 1 global team (up to 12 members) and focused project access.
  - **Enterprise Accounts**: Full organization tier with unlimited global teams, unlimited collaborators, verified company badge, and organization-wide broadcast announcements.
- **Global Workspaces**: Centralized team grouping with instant team deletion, member invitation by email, and auto-sync into projects.
- **Company Broadcasts**: Announcement channels for company-wide updates and critical releases.
- **Project Collaborator Directory**: Searchable directory displaying team member roles, bios, and technical skills.

### 3. Real-Time Notifications & Socket.IO
- **Live User Alerts**: Instant push notifications for task assignments, status updates, comment mentions, team invitations, and project additions.
- **Socket.IO Real-time Events**: Immediate state synchronization across active browser sessions without manual polling.
- **Notification Dropdown**: Direct 1-click navigation to the specific task, project, or team referenced in alerts.

### 4. AI-Powered Project Health Engine
- **Automated Health Diagnostic**: Evaluates task distribution, deadline risks, team workload balance, and completion trajectories.
- **Risk & Bottleneck Detection**: Identifies stalled review cycles, overdue backlogs, and disproportionate assignments.
- **Actionable Recommendations**: Generates concrete next steps to restore project velocity.
- **Enterprise Sponsorship**: Personal collaborators invited to Enterprise projects inherit AI health capabilities within that project scope.

### 5. GitHub Integration & OAuth
- **GitHub OAuth Login**: Fast, secure single sign-on with GitHub.
- **Live Repository Synchronization**: Real-time tracking of recent commits, pull requests, and repository activity linked directly to project workflows.

### 6. Analytics & Developer Dashboard
- **Aggregated Performance Metrics**: Unified stats bar tracking active projects, pending deliverables, and overdue tasks.
- **Upcoming Tasks Feed**: Dual-filter view (`Assigned to Me` vs. `All Project Tasks`) with urgency indicators.
- **Visual Analytics**: Interactive task status distribution and workload charts powered by Recharts.
- **Live Activity Audit**: Real-time project activity feed recording operational modifications.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18, Vite (Fast HMR)
- **Language**: JavaScript ES6+
- **Styling**: Tailwind CSS (Strict developer SaaS design system, responsive layouts)
- **State Management**: Zustand, TanStack Query (React Query)
- **Routing**: React Router v6
- **Visualization**: Recharts
- **Icons & Real-Time**: Heroicons (SVGs), Socket.IO Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (REST API architecture)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) stored in HttpOnly, secure cookies, bcrypt password hashing
- **Real-Time Engine**: Socket.IO
- **AI Engine**: Groq API / Google Gemini integration with strict response sanitization

---

## 📋 Module Roadmap & Status

| Module | Scope | Status |
| :--- | :--- | :--- |
| **Module 1** | Application Foundation, Authentication & Security | **Completed** |
| **Module 2** | Project, Team & Task Management (Kanban, RBAC) | **Completed** |
| **Module 3** | Collaboration, Permissions, Announcements & Analytics | **Completed** |
| **Module 4** | AI Project Health Analysis, Testing & Deployment | **In Progress / Hardening** |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas connection string
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Abdul-Rasheed-Talal/devflow-zynvex-solutions-internship-project.git
   cd devflow-zynvex-solutions-internship-project
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/devflow
   JWT_SECRET=your_super_secret_jwt_key
   GROQ_API_KEY=your_groq_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_GITHUB_CLIENT_ID=your_optional_github_oauth_client_id
   ```

### Running Locally

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend client**:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Production Deployment ($0 Cost on Vercel)

DevFlow is fully optimized for **zero-cost production deployment on Vercel** (both frontend and backend deployed independently):

- **Frontend**: Deployed as a Vite React SPA with automated client-side route rewrites (`frontend/vercel.json`).
- **Backend**: Deployed as a high-performance Express serverless function with Mongoose connection pooling (`backend/vercel.json` + `backend/api/index.js`).
- **Database**: Connects seamlessly to MongoDB Atlas M0 free tier.
- **Enterprise Privileges**: The master developer account (`mabdulrasheedtalal@gmail.com`) automatically inherits full Enterprise capabilities, unlimited teams, broadcast announcements, and AI Health diagnostics across all environments.

👉 **Complete Step-by-Step Instructions**: See [docs/DEPLOYMENT_GUIDE.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/DEPLOYMENT_GUIDE.md).

---

## 📚 Documentation Index

- [docs/FUTURE_ROADMAP.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/FUTURE_ROADMAP.md) — Future product roadmap, feasibility matrix & AI agent plans
- [docs/DEPLOYMENT_GUIDE.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/DEPLOYMENT_GUIDE.md) — Step-by-step $0 cost Vercel & MongoDB Atlas production deployment
- [AGENTS.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/AGENTS.md) — Core AI agent engineering standards & constraints
- [docs/PROGRESS.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/PROGRESS.md) — Implementation progress, recent changes, and task log
- [docs/PROJECT_SPEC.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/PROJECT_SPEC.md) — Master product specification
- [docs/ARCHITECTURE.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/ARCHITECTURE.md) — Technical architecture and data flow
- [docs/API_SPEC.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/API_SPEC.md) — Comprehensive REST API endpoint definitions
- [docs/UI_DESIGN_SYSTEM.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/UI_DESIGN_SYSTEM.md) — Professional UI/UX standards (no emojis, restrained SaaS language)
- [docs/MODULE_1.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/MODULE_1.md) — Foundation & Authentication specification
- [docs/MODULE_2.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/MODULE_2.md) — Projects, Teams & Tasks specification
- [docs/MODULE_3.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/MODULE_3.md) — Collaboration, Permissions & Notifications specification
- [docs/MODULE_4.md](file:///e:/Zynvex-Solutions%20Internship%20Project%20-%20DevFlow/docs/MODULE_4.md) — AI Health, Testing & Polish specification
