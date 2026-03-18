# Project Explanation

This file explains the project in simple language so it is easier to understand the current codebase.

## 1. Big Picture

BeQuick Elite is a job intelligence app for tech roles.

It has two main sides:

- A frontend where users search jobs and view results.
- A backend that stores jobs, verifies users, manages sources, and runs crawlers.

There is also an admin area where trusted users can manage source data and monitor crawler-related activity.

## 2. What Users Can Do

### Home page
- Type a search prompt like `software engineer`, `data analyst`, `AI engineer`, or a company name.
- View a clean results board with job title, company, location, remote mode, links, and stack tags.
- Open a job details modal.
- Open a short report summary modal.

### Login page
- Sign in with Google.
- The backend verifies the Google identity token.
- The app then stores its own JWT for future requests.

### Admin page
- Add, edit, pause, and delete sources.
- Filter sources by region, type, tag, or active state.
- Search jobs already stored by the platform.
- Trigger a priority crawl.
- Review operational status cards.

## 3. Frontend Structure

Important frontend folders:

- `client/src/pages`
- `client/src/components`
- `client/src/layouts`
- `client/src/services`
- `client/src/styles`

### Important frontend files

- `client/src/App.jsx`
  Defines routes.
- `client/src/layouts/MainLayout/MainLayout.jsx`
  Wraps the main app shell and topbar.
- `client/src/components/ProtectedRoute/ProtectedRoute.jsx`
  Blocks unauthenticated access.
- `client/src/components/Topbar/Topbar.jsx`
  Main navigation and actions.
- `client/src/pages/Home/HomePage.jsx`
  Main search experience.
- `client/src/pages/Login/LoginPage.jsx`
  Google Sign-In page.
- `client/src/pages/Admin/AdminPage.jsx`
  Admin controls.

## 4. Frontend State And Services

### Theme
- `client/src/services/theme.jsx`
- Stores the selected theme in local storage.
- Applies `data-theme` on the document body.

### Auth
- `client/src/services/auth.jsx`
- Stores the JWT in local storage.
- Calls `GET /api/auth/me` on refresh to restore the user session.
- Exposes `loginWithGoogle()` and `logout()`.

### Home page logic
- `client/src/pages/Home/hooks/useHomeState.js`
- Loads stats.
- Runs job search requests.
- Controls report modal and job details modal.
- Handles GSAP reveal animations.

### Admin page logic
- `client/src/pages/Admin/hooks/useAdminState.js`
- Loads stats, sources, and jobs.
- Handles source CRUD actions.
- Handles crawl trigger and CSV export.
- Shows toast messages after actions.

## 5. Backend Structure

Important backend folders:

- `Backend/src/controllers`
- `Backend/src/routes`
- `Backend/src/models`
- `Backend/src/middlewares`
- `Backend/src/validators`
- `Backend/src/queue`
- `Backend/src/worker`
- `Backend/src/scheduler`
- `Backend/src/crawlers`

## 6. Backend Startup

### `Backend/src/server.js`
- Loads environment variables.
- Connects to MongoDB.
- Starts the Express server.
- Starts scheduler support.

### `Backend/src/app.js`
- Creates the Express app.
- Registers middleware.
- Mounts routes.

## 7. Authentication Flow

The app now uses Google Sign-In only.

### Route
- `POST /api/auth/google`

### What happens
1. Frontend gets a Google credential.
2. Backend verifies that credential using `google-auth-library`.
3. Backend finds or creates the user in MongoDB.
4. Backend signs its own JWT and returns it.
5. Frontend stores the JWT and uses it for protected routes.

### Session restore
- `GET /api/auth/me`

### Logout
- `POST /api/auth/logout`

## 8. Search Flow

The search feature is the main product flow.

### Route
- `GET /api/search`
- `POST /api/search`

### What the backend does
- Reads the prompt.
- Tries to convert the prompt into structured filters.
- Uses Gemini when configured.
- Falls back to local parsing rules when Gemini is not configured.
- Queries MongoDB for matching job data.
- Returns results plus summary values like totals and relaxed filters.

### What the frontend does
- Sends the prompt from the home page.
- Renders returned jobs as cards.
- Lets the user open job details and report modals.

## 9. Stats

### Route
- `GET /api/stats`

### Used for
- Total jobs
- Total companies
- Total sources
- Last crawl timestamps

These values are shown on the home page and admin page.

## 10. Sources System

Sources are the records that tell the crawler where to look.

Each source can include:

- Name
- Website
- Career page
- Source type
- Region
- Tags
- Active or paused state

### Source routes
- `GET /api/sources`
- `POST /api/sources`
- `PUT /api/sources/:id`
- `DELETE /api/sources/:id`

Admin users manage these from the Sources Control section.

## 11. Jobs Data

Jobs are stored in MongoDB and returned by search and admin endpoints.

Important job fields include:

- Title
- Company name
- Description
- Location
- Employment type
- Remote type
- Stack tags
- Job URL
- Posted date
- Scraped date

### Jobs route
- `GET /api/jobs`

The admin page uses this to monitor fetched jobs.

## 12. Companies Data

The backend still exposes company data through:

- `GET /api/companies`

But the current admin UI no longer shows the old Companies Overview section. Right now the frontend focuses more on sources and jobs.

## 13. Crawl Queue And Worker

The crawler is split from the API so scraping does not block normal requests.

### Important files
- `Backend/src/queue/crawl.queue.js`
- `Backend/src/worker/crawl.worker.js`
- `Backend/src/scheduler/crawl.scheduler.js`

### What they do
- Queue crawl jobs in Redis.
- Let the worker process those crawl jobs.
- Allow the scheduler to enqueue crawls automatically on a cron schedule.

## 14. Crawlers

Important crawler-related files:

- `Backend/src/crawlers/jobs.crawler.js`
- `Backend/src/crawlers/jsonld.crawler.js`

The crawler system supports extracting jobs from common hiring systems and JSON-LD job markup where available.

## 15. Admin Crawl Trigger

### Route
- `POST /api/admin/crawl`

### Purpose
- Lets an admin enqueue a priority crawl from the admin panel.

## 16. Styling And UI

The frontend uses SCSS, global tokens, and page-level style files.

Important style files:

- `client/src/styles/tokens.scss`
- `client/src/styles/global.scss`
- `client/src/pages/Home/HomePage.scss`
- `client/src/pages/Admin/AdminPage.scss`

The current UI direction is:

- Clean
- Minimal
- Responsive
- Light and dark theme support
- GSAP motion kept subtle

## 17. Environment Variables

### Backend
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `REDIS_URL`

Optional:
- `JWT_EXPIRES_IN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `PRIORITY_COMPANIES`
- `SCHEDULER_ENABLED`
- `CRAWL_CRON`
- `CRAWL_TIMEZONE`

### Frontend
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## 18. Scripts

### Backend
- `npm run dev`
- `npm run start`
- `npm run worker`
- `npm run schedule`
- `npm run schedule:once`
- `npm run seed`
- `npm run seed:sources`

### Frontend
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## 19. Simple Request Flow Example

### When a user searches
1. User opens the home page.
2. User types a prompt.
3. Frontend calls the search API.
4. Backend parses the prompt.
5. Backend reads jobs from MongoDB.
6. Frontend shows the matching jobs.

### When an admin adds a source
1. Admin opens the admin page.
2. Admin fills the source form.
3. Frontend sends the source payload to the backend.
4. Backend validates and stores the source.
5. Frontend reloads the source list.

## 20. Summary

In short:

- React handles the UI.
- Express handles the API.
- MongoDB stores users, jobs, companies, and sources.
- Redis + BullMQ handle crawl jobs.
- Google Sign-In handles login.
- Gemini can help parse search prompts, but the app still works without it.

If you want the deeper setup instructions, read `README.md`.
