# Project Explanation (Easy Points)

This file explains both the backend and frontend in simple language.

**Overview**
- The backend is an Express API for jobs, companies, sources, and auth.
- The frontend is a React app with protected routes, themes, and GSAP motion.
- A crawler pipeline fetches jobs from official career pages and boards.

**Main Folders**
- `Backend/src/controllers` route logic
- `Backend/src/routes` API endpoints
- `Backend/src/models` Mongoose schemas
- `Backend/src/middlewares` reusable request logic
- `Backend/src/validators` Zod input validation
- `Backend/src/queue` BullMQ queue setup
- `Backend/src/worker` crawler worker
- `Backend/src/scheduler` daily crawl scheduler
- `client/src/pages` page-level UI
- `client/src/components` shared UI
- `client/src/layouts` layout wrapper
- `client/src/services` API + auth helpers
- `client/src/styles` global tokens and base styles

**Server Start**
- `Backend/src/server.js` loads env, connects DB, starts API, and starts scheduler.
- `Backend/src/app.js` sets up middleware and mounts routes.

**Auth (OTP)**
- `POST /api/auth/request-otp` sends an OTP to email.
- `POST /api/auth/verify-otp` verifies OTP and returns a token.
- `OTP_DEV_MODE=true` makes the API return a dev OTP in the response.

**Admin Access**
- Admin is controlled by the user role in MongoDB.
- Frontend admin email is set in `client/src/pages/Login/state/loginConstants.js`.
- Admin-only routes use `requireAdmin` in `Backend/src/middlewares/auth.middleware.js`.

**Search Controller**
- Reads a prompt and extracts filters (stack, location, experience).
- Uses Gemini structured output if configured.
- Falls back to a rule-based parser when Gemini is missing.
- If nothing matches, it uses `PRIORITY_COMPANIES` from `.env`.

**Sources Pipeline**
- Sources represent career pages and job boards.
- `Backend/src/models/source.model.js` stores sources and tags.
- Admin routes manage sources with CRUD endpoints.

**Crawler + Queue**
- `Backend/src/queue/crawl.queue.js` defines BullMQ queue.
- `Backend/src/worker/crawl.worker.js` pulls jobs and crawls sites.
- `Backend/src/crawlers/jobs.crawler.js` supports Greenhouse, Lever, SmartRecruiters, Workday.
- `Backend/src/crawlers/jsonld.crawler.js` extracts JSON-LD job data.

**Scheduler (Daily Crawl)**
- `Backend/src/scheduler/crawl.scheduler.js` runs daily crawl enqueue.
- Default schedule: 2:00 AM Asia/Kolkata.
- Controlled by `.env`:
```
SCHEDULER_ENABLED=true
CRAWL_CRON=0 2 * * *
CRAWL_TIMEZONE=Asia/Kolkata
```

**Stats Endpoint**
- `GET /api/stats` returns companies, jobs, sources counts.
- Also returns last crawl timestamps.

**Frontend Pages**
- `Home` shows prompt search, signals, and results.
- `Login` shows admin and member OTP flows.
- `Admin` shows sources CRUD, jobs, companies, and crawl controls.
- `NotFound` handles 404.

**Frontend Architecture**
- Each page has `hooks/` and `state/` folders.
- UI and logic are split cleanly for readability.
- Styles are in SCSS per page/component.

**Protected Routes**
- `client/src/components/ProtectedRoute` blocks unauthenticated users.
- `client/src/layouts/MainLayout` wraps the app and topbar.

**Theme**
- Light and dark themes are managed by `client/src/services/theme.jsx`.

**Environment (Backend)**
- `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN` are required.
- `REDIS_URL` is required for the crawler queue.
- `SMTP_*` values are required for OTP email.

**Useful Scripts**
- `npm run dev` start backend API
- `npm run worker` start crawler worker
- `npm run schedule:once` enqueue a crawl batch now
- `npm run seed` seed sample data

**Frontend + Backend Connection**
- `client/vite.config.js` proxies `/api` to `http://localhost:4000`.
- Search calls `POST /api/search` with `{ prompt }`.