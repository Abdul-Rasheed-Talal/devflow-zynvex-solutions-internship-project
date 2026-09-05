# DevFlow — Production & Zero-Cost Vercel Deployment Guide

This guide details how to deploy DevFlow to **Vercel** with **$0 hosting cost** for both the frontend (Vite React SPA) and backend (Express Serverless API), backed by a free MongoDB Atlas cluster.

---

## 1. Architecture Overview ($0 Cost Stack)

| Component | Platform | Plan | Cost | Function |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | Hobby Tier | $0/month | Vite React 19 SPA served via global Edge CDN |
| **Backend** | Vercel Serverless | Hobby Tier | $0/month | Express.js API executed via Node.js Serverless Functions |
| **Database** | MongoDB Atlas | M0 Shared Cluster | $0/month | 512 MB storage, SSL/TLS encrypted, connection-pooled |
| **AI Intelligence** | Google Gemini / Groq | Free Tier | $0/month | AI project health analysis & risk prediction |

---

## 2. Step 1: MongoDB Atlas Database Setup (Free Tier)

1. **Create Account**: Sign in to [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. **Deploy Cluster**:
   - Select **M0 Free** (Shared, 512 MB).
   - Choose a cloud provider region close to your primary audience (e.g., `us-east-1` or `eu-west-1`).
3. **Configure Database Access (User)**:
   - Go to **Security > Database Access > Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `devflow_admin` (or your choice).
   - Password: Generate a secure password (save this).
   - Database User Privileges: **Read and write to any database**.
4. **Configure Network Access (IP Whitelist)**:
   - Go to **Security > Network Access > Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Note: Serverless functions on Vercel use dynamic IP addresses, so `0.0.0.0/0` is required for serverless connections.*
5. **Obtain Connection String**:
   - Click **Connect > Drivers > Node.js**.
   - Copy the URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/devflow?retryWrites=true&w=majority&appName=Cluster0
     ```

---

## 3. Step 2: Backend Deployment to Vercel

1. Push your latest code to your GitHub repository.
2. Open the [Vercel Dashboard](https://vercel.com/new).
3. Click **Import Project** and select your DevFlow repository.
4. **Project Configuration**:
   - **Project Name**: `devflow-backend` (or your preferred name).
   - **Framework Preset**: `Other`.
   - **Root Directory**: Click **Edit** and choose `backend`.
5. **Environment Variables**:
   Add the following variables in the Vercel project settings:

   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production cookie security and caching |
   | `MONGODB_URI` | `mongodb+srv://.../devflow?...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `generate-a-strong-random-64-char-string` | JWT signing key |
   | `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` | URL of your deployed frontend (update after Step 3) |
   | `GEMINI_API_KEY` | `your_gemini_api_key` | Google AI Studio API key for health analysis |
   | `GROQ_API_KEY` | `your_groq_api_key` | Optional Groq API key for AI fallback |
   | `STRIPE_SECRET_KEY` | `sk_test_...` | Optional Stripe secret key for billing |
   | `STRIPE_WEBHOOK_SECRET`| `whsec_...` | Optional Stripe webhook secret |
   | `STRIPE_PRICE_ID` | `price_...` | Optional Stripe pro plan price ID |

6. Click **Deploy**.
7. Once deployed, note your backend URL (e.g. `https://devflow-backend.vercel.app`).
8. **Verify Backend Health**:
   Visit `https://devflow-backend.vercel.app/api/health` in your browser.
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-09-05T...",
     "uptime": 1.2,
     "environment": "production",
     "database": "connected"
   }
   ```

---

## 4. Step 3: Frontend Deployment to Vercel

1. Return to the [Vercel Dashboard](https://vercel.com/new).
2. Click **Import Project** and select the **same** DevFlow repository.
3. **Project Configuration**:
   - **Project Name**: `devflow-frontend` (or your preferred name).
   - **Framework Preset**: `Vite`.
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).
4. **Environment Variables**:
   Add the following environment variables:

   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://devflow-backend.vercel.app/api` | Full URL to backend `/api` path |
   | `VITE_GITHUB_CLIENT_ID` | `your_github_client_id` | Optional GitHub OAuth Client ID |

5. Click **Deploy**.
6. Once deployment finishes, copy your frontend domain (e.g. `https://devflow-frontend.vercel.app`).
7. **Update Backend CORS**:
   - Go to your backend project in Vercel: **Settings > Environment Variables**.
   - Update `FRONTEND_URL` to your production frontend URL (`https://devflow-frontend.vercel.app`).
   - Trigger a Redeploy in the backend project for the change to take effect.

---

## 5. Master Developer Account & Enterprise Rights

The master developer email is permanently configured with universal Enterprise privileges:

- **Email**: `mabdulrasheedtalal@gmail.com`
- **Privileges Guaranteed Across All Environments**:
  - `accountType: "company"`
  - `subscriptionPlan: "pro"`
  - `companyName: "DevFlow Enterprise"`
  - Unlimited global teams & members
  - Workspace announcements broadcast permission
  - AI Health Analysis & risk prediction access
  - Exemption from free-tier email domain restrictions

### First-Time Production Login
1. On your production frontend, go to `/register` or `/login`.
2. Register or log in with `mabdulrasheedtalal@gmail.com`.
3. The server automatically detects this email, activates all Enterprise capabilities, and displays the **ENTERPRISE** badge throughout the UI.

---

## 6. Serverless Architecture & Scalability Highlights

### 1. Mongoose Connection Pooling & Caching
Serverless functions are stateless and spin down when idle. DevFlow uses global connection caching in `backend/config/db.js` (`global.mongoose = { conn, promise }`). This ensures warm function instances reuse existing connections, preventing connection spikes and avoiding MongoDB Atlas connection limits.

### 2. Cross-Domain Dual Authentication
In separate frontend/backend deployments:
- **HttpOnly Cookies**: Automatically set with `sameSite: 'none'`, `secure: true`, and `path: '/'` in production.
- **Bearer Token Fallback**: Tokens are simultaneously returned in auth responses and attached via `Authorization: Bearer <token>` in `frontend/src/lib/apiClient.ts`. This protects against browsers that partition or block third-party cookies (e.g. Safari ITP, Brave).

### 3. SPA Route Rewrites
Single-page React apps require client-side routing rewrites. `frontend/vercel.json` maps all routes `/(.*)` to `index.html`, ensuring deep links (e.g. `/app/projects/123` or `/settings`) never 404 upon browser reload.

### 4. Real-Time Fallbacks
Vercel Serverless Functions do not support persistent stateful WebSockets. DevFlow is built with dual real-time resilience:
- Socket.IO gracefully degrades with `reconnectionAttempts: 5` and polling fallbacks without crashing the UI.
- All core features (notifications, activity logs, task boards, comments) leverage TanStack Query polling and cache invalidation.
- If continuous long-lived WebSockets are required in the future, the backend can be hosted on Render or Railway with zero code modifications.

---

## 7. Production Verification Checklist

- [ ] Backend `/api/health` returns `status: "ok"` and `database: "connected"`.
- [ ] Frontend loads with crisp SaaS aesthetic without console errors.
- [ ] User registration and login succeed; session persists across page reloads.
- [ ] Direct navigation to deep URLs (e.g., `/app/projects`) loads correctly without 404s.
- [ ] Log in with `mabdulrasheedtalal@gmail.com`:
  - [ ] Header shows **ENTERPRISE** badge.
  - [ ] Sidebar shows **ENTERPRISE** badge.
  - [ ] Announcements page allows creating announcements.
  - [ ] Teams page allows creating unlimited teams.
  - [ ] AI Health Analyzer executes successfully.
- [ ] Test project creation, task assignment, and comment threads.
