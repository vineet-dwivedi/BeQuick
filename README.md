**BeQuick Elite**

BeQuick Elite is a full-stack job intelligence platform that crawls verified sources, powers AI-assisted search, and provides an admin command center with OTP-based access. It ships with a modern React UI, light/dark theming, GSAP motion, and a crawler pipeline backed by Redis queues.

**Features**
- AI-assisted job search with prompt parsing and priority-company fallback
- OTP login with admin and member flows
- Admin command center for sources, jobs, companies, and crawl controls
- Daily scheduled crawl with on-demand crawl triggering
- Source pipeline to manage career pages and boards
- GSAP-enhanced UI + Swiper highlights
- Light and dark themes with protected routes

**Tech Stack**
- Frontend: React, Vite, SCSS, GSAP, Swiper
- Backend: Node.js, Express, Mongoose, BullMQ, Redis, Nodemailer
- AI: Gemini structured output (optional, with fallback)

**Repository Layout**
- `Backend/` API server, worker, scheduler
- `client/` React frontend
- `explaintion.md` easy project walkthrough

**Quick Start**
1. Install dependencies
```
# Backend
cd Backend
npm install

# Frontend
cd ..\client
npm install
```
2. Configure environment:
```
# Backend
copy Backend\.env.example Backend\.env

# Frontend (for production builds / separate frontend deployment)
copy client\.env.example client\.env
```
Update the copied env files with your real values.
3. Start services
```
# Backend API
cd Backend
npm run dev

# Crawler worker (requires Redis)
npm run worker

# Frontend UI
cd ..\client
npm run dev
```

**Scheduler**
- The scheduler starts automatically with the backend server.
- Default schedule: daily at 2:00 AM Asia/Kolkata.
- Control via `.env`:
```
SCHEDULER_ENABLED=true
CRAWL_CRON=0 2 * * *
CRAWL_TIMEZONE=Asia/Kolkata
```

**Environment**
- `MONGO_URI` MongoDB connection string
- `JWT_SECRET` JWT secret
- `CORS_ORIGIN` Frontend URL or comma-separated list of allowed frontend URLs
- `REDIS_URL` Redis connection string for the crawl queue
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` for OTP mail
- `SMTP_CONNECTION_TIMEOUT_MS`, `SMTP_GREETING_TIMEOUT_MS`, `SMTP_SOCKET_TIMEOUT_MS` to fail fast when SMTP is unreachable
- `OTP_TTL_SECONDS`, `OTP_COOLDOWN_SECONDS`, `OTP_MAX_ATTEMPTS`
- `GEMINI_API_KEY`, `GEMINI_MODEL` (optional)
- `PRIORITY_COMPANIES` default fallback companies
- `VITE_API_URL` frontend-only env that should point to your deployed backend origin for production builds

**Admin Access**
- Frontend admin email is set in `client/src/pages/Login/state/loginConstants.js`
- Admin role is stored in the database user document

**Scripts**
- `npm run worker` start crawl worker
- `npm run schedule:once` enqueue a single crawl batch
- `npm run seed` seed sample data
- `npm run seed:sources` seed crawl sources

**API**
- `POST /api/auth/request-otp` request OTP
- `POST /api/auth/verify-otp` verify OTP
- `GET /api/search` or `POST /api/search` job search
- `GET /api/stats` platform stats
- `GET /api/sources` admin list sources
- `POST /api/sources` admin create source
- `PUT /api/sources/:id` admin update source
- `DELETE /api/sources/:id` admin delete source
- `POST /api/admin/crawl` admin trigger crawl

**Notes**
- Redis must be running for the crawler queue.
- Vite dev server proxies `/api` to `http://localhost:4000`.

**Deployment Notes**
- If the frontend and backend are deployed on different domains, set `client/.env` or your hosting provider env with `VITE_API_URL=https://your-backend-domain.com` before building the client.
- Set backend `CORS_ORIGIN` to the exact deployed frontend URL. Multiple origins can be comma-separated.
- The frontend uses `BrowserRouter`, so static hosting also needs an SPA rewrite that serves `index.html` for app routes like `/login` or `/admin`.
- For Vercel deployments, add a `vercel.json` rewrite so routes like `/login` and `/admin` resolve to `index.html` instead of Vercel's `404 NOT_FOUND` page.
- For Gmail SMTP on deployed hosts, port `587` with `SMTP_SECURE=false` is usually more reliable than port `465`.
