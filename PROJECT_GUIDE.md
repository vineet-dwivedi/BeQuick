# AI Job Intelligence Platform - Implementation Guide

Last updated: 2026-03-14

This guide turns the concept into a buildable plan with clear scope, architecture, data flow, and next steps. It is optimized for a fast MVP and a scalable path to production on a MERN stack.

## 1. Product Definition

### Core user flow
User types: "Top MNC companies hiring MERN stack developers for freshers in India"

System returns:
- Companies
- Career pages
- Relevant job openings
- Tech stack used
- Hiring insights (freshness, volume, trend)

### Success criteria for MVP
- User can search with a free-text prompt
- System returns verified job postings for a small set of companies
- Results are explainable (why matched)
- Admin can trigger crawls and edit data

## 2. MVP Scope and Phases

### Phase 1 (2-3 weeks)
- Manual seed list of 30-50 companies
- Crawl only career pages (no job boards initially)
- Store jobs in MongoDB
- Prompt parsing to structured filters
- Simple search API + basic UI

### Phase 2 (3-4 weeks)
- Automated crawler pipeline (queue + workers)
- Tech stack detection from job descriptions
- Hiring signals and ranking
- Admin dashboard improvements

### Phase 3 (4-6 weeks)
- Company discovery crawler
- Job boards + JSON-LD extraction
- Resume-based matching (optional)
- Analytics + trend charts

## 3. High-Level Architecture

User
  -> Frontend (React + Vite)
  -> Express API
  -> Service Layer
  -> Prompt Parser (LLM)
  -> Query Engine
  -> MongoDB
  -> Crawler Pipeline (Playwright + BullMQ)
  -> Public Sources

Background pipeline runs continuously and updates the database.

## 4. Technology Choices

Frontend
- React + Vite
- Tailwind CSS or SCSS modules
- TanStack Query
- Chart.js or Recharts

Backend
- Node.js
- Express
- Redis + BullMQ for jobs

Database
- MongoDB (Atlas)
- Mongoose for schemas and validation

Crawling
- Playwright (preferred)
- Separate worker process for scraping

## 5. Data Sources and Compliance

Allowed sources
- Official company career pages
- Public job boards (if their terms allow crawling)
- JSON-LD JobPosting markup when available

Compliance and safety
- Respect robots.txt and terms of service
- Use reasonable rate limiting (1-3 requests/second per domain)
- Include a crawl user-agent string with contact email
- Store source URLs and fetch timestamps for auditability
- Provide an opt-out process if a company requests removal

## 6. Data Model (MongoDB)

Suggested collections

companies
- _id
- name
- website
- careerPage
- industry
- size
- headquartersLocation
- companyType (MNC, startup, etc)
- techStack (optional summary)
- createdAt

jobs
- _id
- companyId
- title
- description
- location
- employmentType
- experienceLevel
- remoteType
- stack (normalized: e.g. MERN)
- rawStack (free text)
- jobUrl (unique)
- postedDate
- scrapedAt

techStacks
- _id
- companyId
- technology
- confidenceScore
- source (job_description | github | manual)

users
- _id
- email
- passwordHash
- role
- createdAt

searchLogs
- _id
- prompt
- filters (normalized JSON)
- createdAt

Indexes
- jobs(companyId)
- jobs(stack, experienceLevel, location)
- jobs(postedDate desc)
- jobs(jobUrl unique)

## 7. Prompt Parsing (LLM)

Goal: Convert free-text prompt into structured filters.

Example output schema
{
  "stack": ["MERN"],
  "experienceLevel": "entry",
  "companyType": "MNC",
  "location": "India",
  "role": "fullstack"
}

Suggested approach
- Use a system prompt that forces JSON output
- Add a fixed schema for validation
- If LLM output fails validation, retry with a stricter prompt

Fallback parsing
- Regex for stack keywords
- Map synonyms (fresher -> entry, graduate -> entry)

## 7.1 AI Layer Implementation (OpenAI + Gemini)

OpenAI (recommended first)
- Use the OpenAI Responses API for text generation and structured outputs.
- Start with gpt-5.4 for complex reasoning and coding; use gpt-5-mini when you need lower latency or cost.
- SDK: `npm install openai`
- Store API key in `OPENAI_API_KEY` (SDK reads it automatically)

Minimal OpenAI example (Node.js)
```js
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.4",
  input: "Extract filters: Top MNC companies hiring MERN freshers in India."
});

console.log(response.output_text);
```

Privacy note
- To avoid storing prompts or outputs with the provider, set `store: false` on requests.

Gemini
- Use Gemini for classification or redundancy if you want a second model.
- Keep model outputs normalized so both providers map to the same schema.

## 8. Tech Stack Detection

Input: job description text
Output: normalized stack tags + confidence

Workflow
1. Extract raw tech tokens (regex + dictionary)
2. LLM classification for final stack label
3. Store both raw + normalized data

## 9. Search and Ranking

Query flow
Prompt -> filters -> MongoDB query -> ranked results

Example Mongo query
db.jobs.find({
  stack: "MERN",
  experienceLevel: "entry",
  location: "India"
});

Ranking signals (simple formula)
- Freshness: postedDate within last 14 days
- Relevance: stack + role match
- Hiring signal: company job volume in last 30 days

## 10. Crawler System

Crawler flow
Seed company list
  -> resolve careers page
  -> extract job links
  -> scrape job details
  -> push to AI parser
  -> store in DB

Crawler services
- companyCrawler.js: discover careers page
- jobListCrawler.js: gather job URLs
- jobDetailCrawler.js: extract job info
- techStackCrawler.js: extract stack

Reliability
- Dedup by jobUrl + companyId
- Retry logic with exponential backoff
- Store raw HTML or JSON-LD for debugging

## 11. Admin Panel

Core features
- Add/edit companies
- Trigger crawl for a company
- Review and edit job postings
- Mark jobs as verified

Tech
- React admin dashboard
- Table views + filters
- Basic charts (job volume by date)

## 12. Caching

Use Redis for:
- Prompt -> results cache
- Hot query caching (top searches)
- Rate limiting tokens

Cache key
- Hash of normalized filter JSON

## 13. Security

Must-have
- API rate limiting
- JWT-based auth
- Admin role gating
- Input validation (Zod)

## 14. Deployment

Frontend
- Vercel

Backend API
- Render

Workers
- Render worker or separate container

Database
- MongoDB Atlas

Redis
- Upstash or Render Redis

## 15. Suggested Repository Structure

/
  client/       (React + Vite app)
  server/       (Express API)
  worker/       (crawler + queue workers)
  shared/       (shared types + utils)
  docs/

## 15.1 Frontend Structure (React + Vite)

client/
  src/
    components/
    pages/
    hooks/
    services/
    context/
    utils/

## 15.2 Backend Structure (Express)

server/
  controllers/
  routes/
  models/
  services/
  middlewares/
  jobs/
  crawlers/
  utils/

## 16. Build Checklist

Phase 1
- Setup React + Vite app with prompt UI
- Build API endpoint: POST /search
- Implement LLM prompt parser
- Create MongoDB schemas and seed data
- Manual job entries for testing

Phase 2
- Add crawler worker with Playwright
- Add Redis + BullMQ queue
- Store scraped jobs automatically
- Add admin panel for manual moderation

Phase 3
- JSON-LD extraction from boards
- Company discovery crawler
- Hiring trend analytics

## 17. What We Should Do Next

If you want, I can scaffold the repo (React + Express + worker + MongoDB schema) and implement:
- Prompt parsing endpoint
- Job search endpoint
- Sample crawler for 1-2 companies
