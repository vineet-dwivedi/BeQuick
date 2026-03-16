# Backend Explanation (Easy Points)

This file explains the backend code in simple language.

**Overview**
- The backend is an Express API for jobs and companies.
- It connects to MongoDB using Mongoose.
- It has auth (register/login), search, and basic listing APIs.

**Main Folders**
- `Backend/src/controllers` holds the logic for each route.
- `Backend/src/routes` defines the API endpoints.
- `Backend/src/models` defines MongoDB schemas.
- `Backend/src/middlewares` holds reusable logic for requests.
- `Backend/src/validators` holds input validation rules.
- `Backend/src/seed` holds sample data and seeding script.
- `Backend/src/config` holds database connection code.

**Server Start**
- `Backend/src/server.js` loads env, connects DB, and starts the server.
- `Backend/src/app.js` sets up middleware and mounts routes.

**Auth Controller**
- `register` creates a user and returns a token.
- `login` checks password and returns a token.
- `me` returns the logged-in user.
- `logout` just responds success (client deletes token).

**Company Controller**
- `getCompanies` returns a list with optional filters.
- `getCompanyById` returns one company and optional jobs.

**Jobs Controller**
- `getJobs` returns job list with filters.
- `getJobById` returns one job.
- Supports `page`, `limit`, and `q` (keyword search in title/description).

**Search Controller**
- `searchJobs` reads a prompt, extracts basic filters, and returns jobs.
- It also saves the search into `searchLogs`.
- Use `includeRemote=true` to include remote jobs when a location is provided.
- Use `page` and `limit` for pagination.
- If the prompt includes a company name (example: "Amazon"), it filters by that company.
- If nothing matches, it falls back to `PRIORITY_COMPANIES` (from `.env`) and shows jobs from those companies.
- Priority company openings are injected on the first page of results and sorted to the top.
- If the prompt includes "all jobs" / "every job", it returns all jobs without extra filters.

**Routes**
- Auth routes are in `Backend/src/routes/auth.routes.js`.
- Company routes are in `Backend/src/routes/companies.routes.js`.
- Job routes are in `Backend/src/routes/jobs.routes.js`.
- Search route is in `Backend/src/routes/search.routes.js`.
- Stats route is in `Backend/src/routes/stats.routes.js`.

**Middleware**
- `auth.middleware.js` checks JWT and protects routes.
- `validate.middleware.js` validates request body, query, and params.
- `logger.middleware.js` prints simple request logs.
- `notfound.middleware.js` handles 404.
- `error.middleware.js` handles server errors.

**Validation**
- Zod is used to validate inputs.
- Schemas are in `Backend/src/validators`.

**Models**
- `user.model.js` holds user data and hashed password.
- `company.model.js` holds company info.
- `job.model.js` holds job info.
- `searchlog.model.js` stores user search prompts.
- `techstack.model.js` stores company tech stack data.

**Seed Data**
- `Backend/src/seed/seed-data.js` has real sample jobs.
- `Backend/src/seed/seed.js` inserts them into MongoDB.
- `Backend/src/seed/seed-sources.js` inserts sources (career pages) without deleting existing data.

**Environment**
- Config is loaded from `.env`.
- Key values: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`.

---

## Query Explanations (Easy)

**Auth (users)**
- `userModel.findOne({ email })`  
  Checks if a user exists with the same email.
- `userModel.create({ user, email, passwordHash })`  
  Creates a new user in the database.
- `userModel.findById(req.user.id)`  
  Finds the logged‑in user by ID.

**Companies**
- `companyModel.find(filters).sort({ createdAt: -1 })`  
  Gets companies that match filters, newest first.
- `companyModel.findById(id)`  
  Gets one company by ID.
- `jobModel.find({ companyId: id }).sort({ postedDate: -1 })`  
  Gets jobs of a company, newest first.

**Jobs**
- `jobModel.find(filters).sort({ postedDate: -1 }).limit(limit)`  
  Gets jobs with filters, newest first, limited count.
- `jobModel.findById(req.params.id)`  
  Gets one job by ID.

**Search**
- `jobModel.find(query).sort({ postedDate: -1 }).limit(50)`  
  Finds jobs matching the prompt filters.
- `$in`  
  Match any value from a list (example: stacks).
- `RegExp("india","i")`  
  Case‑insensitive text match.
- `searchLogModel.create({ prompt, filters })`  
  Saves the search for analytics.

**Seed Script**
- `deleteMany({})`  
  Clears old data.
- `insertMany([...])`  
  Inserts many documents at once.
- `seed:sources`  
  Upserts sources by `careerPage` so you can run it safely multiple times.
- `cleanup:empty`
  Removes companies (and sources) that have 0 jobs.

---

## Frontend and Backend Connection

**Vite proxy**
- File: `client/vite.config.js`
- `/api` requests are proxied to `http://localhost:4000`.
- This avoids CORS issues during development.

**Frontend fetch**
- File: `client/src/App.jsx`
- `fetchSearchResults()` sends:
  `POST /api/search` with `{ prompt }`
- Response is used to render job cards.
  
**Alternate search (browser test)**
- `GET /api/search?prompt=...` also works now.
- Helpful when testing in the address bar.
 - If `prompt` is missing, a default prompt is used.

---

## Gemini LLM Integration

**Where it is**
- `Backend/src/services/gemini.service.js`
- Uses `GEMINI_API_KEY` and `GEMINI_MODEL` from `.env`.

**What it does**
- Converts user prompt into structured filters (stack, location, experience).
- Returns JSON using Gemini structured output.

**Fallback**
- If Gemini fails or key is missing, the app uses the simple rule‑based parser.

---

## Automatic Job Fetch (Crawler + Queue)

**Queue**
- File: `Backend/src/queue/crawl.queue.js`
- Uses BullMQ + Redis.
- Each job represents one company to crawl.

**Worker**
- File: `Backend/src/worker/crawl.worker.js`
- Pulls jobs from the queue.
- Crawls the company career page.
- Saves or updates jobs in MongoDB.

**Crawler**
- File: `Backend/src/crawlers/jsonld.crawler.js`
- Extracts jobs from JSON‑LD `JobPosting` blocks.
- Works well for many career pages and job boards.

**ATS Adapters**
- File: `Backend/src/crawlers/jobs.crawler.js`
- Supports Greenhouse, Lever, and SmartRecruiters APIs.
- Uses ATS APIs first, then falls back to JSON‑LD.
- Also supports Workday job boards and tries to discover ATS links on career pages.

**Experience Level Detection**
- Worker now tries to infer experience from text (e.g. "3 years" → mid).
- If it cannot detect, it stores `experienceLevel = "unspecified"`.

**Scheduler**
- File: `Backend/src/scheduler/crawl.scheduler.js`
- Runs daily at 2:00 AM.
- Enqueues all companies that have a `careerPage`.

**Scripts**
- `npm run worker` → start the crawler worker
- `npm run schedule` → start daily scheduler
- `npm run schedule:once` → enqueue once now

**Env**
- `REDIS_URL` must be set for the queue.

---

## Sources Pipeline (New)

**Why it exists**
- A "source" is a place we crawl for jobs (company career page, job board, or directory).
- This lets you grow the crawler without hardcoding companies.

**Model**
- File: `Backend/src/models/source.model.js`
- Stores name, careerPage, sourceType, region, tags, and lastCrawledAt.

**API routes**
- `GET /api/sources` list sources
- `POST /api/sources` create a source
- `GET /api/sources/:id` single source
- `PUT /api/sources/:id` update a source
- `DELETE /api/sources/:id` delete a source

**Scheduler update**
- Scheduler now reads from `sources` first.
- It still falls back to `companies` if no sources exist.

**Worker update**
- If the queue job has no `companyId`, the worker creates a company on the fly.
- After crawl, it updates `lastCrawledAt` on the source.

---

## Stats Endpoint

**What it returns**
- `companies`, `jobs`, `sources`
- `lastJobScrapedAt`, `lastSourceCrawledAt`

**Route**
- `GET /api/stats`

**Loading + error**
- UI shows `Searching...` on submit.
- If backend fails, an error message is shown.

---

## Validators (Why and How)

**Why we use validation**
- It blocks bad input before it reaches the database.
- It keeps responses consistent for the frontend.

**Where it lives**
- Validation rules are in `Backend/src/validators`.
- Middleware that runs validation is in `Backend/src/middlewares/validate.middleware.js`.

**How it works**
- `validateBody(schema)` checks `req.body`
- `validateQuery(schema)` checks `req.query`
- `validateParams(schema)` checks `req.params`

If validation fails, the API returns:
```
{
  "error": "Validation failed",
  "details": { ... }
}
```

**Examples**
- `auth.schema.js`  
  `registerSchema` checks name, email, password.
- `search.schema.js`  
  `searchSchema` checks prompt length.
- `jobs.schema.js`  
  `jobsQuerySchema` checks optional filters.
- `companies.schema.js`  
  `companiesQuerySchema` checks optional filters.

---

## Error Handling (Simple Flow)

**notFound middleware**
- File: `Backend/src/middlewares/notfound.middleware.js`
- Runs when no route matches.
- Returns: `404 { error: "Not found" }`

**errorHandler middleware**
- File: `Backend/src/middlewares/error.middleware.js`
- Runs when an error is thrown in code.
- Returns: `500 { error: "Server error" }` (or custom status)

**Why this helps**
- API errors are clean and predictable.
- Frontend can handle errors without crashing.

---

## All Middlewares (What Each Does)

**auth.middleware.js**
- Checks JWT token from `Authorization: Bearer <token>`.
- Adds `req.user` if token is valid.
- Returns `401` if token is missing or invalid.

**validate.middleware.js**
- Runs Zod validation on body, query, or params.
- Returns `400` with details if invalid.

**logger.middleware.js**
- Logs method, URL, status, and time.
- Helps debug slow or failing requests.

**notfound.middleware.js**
- Runs when no route matches.
- Returns `404 { error: "Not found" }`.

**error.middleware.js**
- Catches server errors.
- Returns `500 { error: "Server error" }` unless a custom status is set.
