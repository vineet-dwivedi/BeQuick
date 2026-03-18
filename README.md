## BeQuick Elite

BeQuick Elite is a full-stack job intelligence platform for discovering tech roles from verified sources. It combines a React frontend, an Express API, MongoDB storage, Redis-backed crawl jobs, optional Gemini-assisted prompt parsing, and an admin control panel for source operations.

## What The App Does

- Search jobs with a free-text prompt such as `backend engineer`, `AI intern`, or a company name.
- Surface live openings with cleaner context like location, remote mode, stack tags, and verified source links.
- Show a polished home experience with light and dark themes plus subtle GSAP motion.
- Use Google Sign-In for authentication and role-based admin access.
- Let admins manage crawl sources, inspect jobs, export sources, and trigger priority crawls.

## Current Product Areas

### User-facing frontend
- Home page:
  Minimal hero, search brief input, market snapshot, coverage sections, signal notes, live role board, and report modal.
- Login page:
  Google Sign-In flow only.
- Admin page:
  Source management, jobs monitor, and operational status.

### Backend services
- Search API for prompt-based job discovery.
- Stats API for platform counters and crawl timestamps.
- Source CRUD API for admin users.
- Crawl queue + worker + scheduler.
- Google-authenticated JWT session flow.

## Tech Stack

### Frontend
- React 19
- Vite
- SCSS
- GSAP
- React Router

### Backend
- Node.js
- Express
- Mongoose
- BullMQ
- Redis
- Zod
- Google Auth Library

### AI
- Gemini via `@google/genai` when configured
- Rule-based fallback when Gemini is unavailable

## Repository Layout

- `client/` frontend application
- `Backend/` API server, crawlers, worker, scheduler, seeds
- `README.md` setup + project overview
- `explaintion.md` plain-language project walkthrough

## Quick Start

### 1. Install dependencies

```powershell
cd Backend
npm install

cd ..\client
npm install
```

### 2. Configure environment

Create env files for both apps:

- `Backend/.env`
- `client/.env`

### 3. Minimum backend env

```env
MONGO_URI=
JWT_SECRET=
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=
REDIS_URL=
```

Optional backend env:

```env
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=
PRIORITY_COMPANIES=Google,Microsoft,Amazon
SCHEDULER_ENABLED=true
CRAWL_CRON=0 2 * * *
CRAWL_TIMEZONE=Asia/Kolkata
```

### 4. Frontend env

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=
```

## Run The App

### Backend API

```powershell
cd Backend
npm run dev
```

### Crawl worker

```powershell
cd Backend
npm run worker
```

### Frontend

```powershell
cd client
npm run dev
```

## Useful Scripts

### Backend
- `npm run dev` start the API with nodemon
- `npm run start` start the API normally
- `npm run worker` start the BullMQ crawl worker
- `npm run schedule` run the scheduler process
- `npm run schedule:once` enqueue one crawl batch
- `npm run seed` seed sample data
- `npm run seed:sources` seed source records
- `npm run cleanup:empty` remove empty companies
- `npm run cleanup:companies` remove companies

### Frontend
- `npm run dev` start Vite
- `npm run build` create production build
- `npm run preview` preview production build
- `npm run lint` run ESLint

## Authentication

- Login is handled through Google Sign-In.
- The frontend sends the Google credential to `POST /api/auth/google`.
- The backend verifies the Google ID token, creates or updates the user, then returns the app JWT.
- `GET /api/auth/me` restores the session on refresh.
- Admin access depends on the `role` field in the MongoDB user document.

## Search Flow

1. User enters a prompt on the home page.
2. Frontend calls the search API.
3. Backend normalizes the prompt with Gemini if available, otherwise falls back to local parsing.
4. MongoDB returns matching jobs.
5. Frontend renders role cards, details modal, and report summary.

## Admin Flow

### Sources control
- Add or edit source records.
- Filter sources by region, type, tag, and active state.
- Pause or activate a source.
- Export the source list.

### Jobs monitor
- Search fetched job records.
- Review core metadata like location and remote mode.

### Operations
- Trigger a priority crawl.
- Review operational status items.

## API Overview

### Auth
- `POST /api/auth/google`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Search and stats
- `GET /api/search`
- `POST /api/search`
- `GET /api/stats`

### Sources
- `GET /api/sources`
- `POST /api/sources`
- `PUT /api/sources/:id`
- `DELETE /api/sources/:id`

### Jobs and companies
- `GET /api/jobs`
- `GET /api/companies`

### Admin crawl
- `POST /api/admin/crawl`

## Crawler Notes

- Redis must be running for BullMQ.
- The backend scheduler can enqueue crawls automatically.
- The worker processes crawl jobs separately from the API server.
- Source freshness and last-crawl timestamps are exposed through stats and admin views.

## Frontend Notes

- Theme is managed with `client/src/services/theme.jsx`.
- Auth state is managed with `client/src/services/auth.jsx`.
- The topbar, home page, login page, and admin page use SCSS modules by page/component.
- GSAP is used for restrained entrance motion rather than heavy visual effects.

## Deployment Notes

- Set `VITE_API_URL` to the deployed backend origin before building the client.
- Set backend `CORS_ORIGIN` to the deployed frontend origin.
- Set backend `GOOGLE_CLIENT_ID` and frontend `VITE_GOOGLE_CLIENT_ID` to the same Google web client ID.
- Because the frontend uses `BrowserRouter`, static hosting must rewrite app routes like `/login` and `/admin` to `index.html`.
- Redis is required in production if you want crawl queue features.

## Current Status

The project currently ships with:

- Minimal professional home UI
- Google Sign-In based auth
- Protected routes
- Admin source management
- Admin jobs monitor
- Crawl trigger support
- Daily crawl scheduling support

For a simpler code walkthrough, see `explaintion.md`.
