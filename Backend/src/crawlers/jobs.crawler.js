import { crawlJobsFromPage } from "./jsonld.crawler.js";

function normalizeEmploymentType(value) {
  if (!value) return "full-time";
  const text = String(value).toLowerCase();
  if (text.includes("intern")) return "intern";
  if (text.includes("part")) return "part-time";
  if (text.includes("contract")) return "contract";
  if (text.includes("freelance")) return "freelance";
  return "full-time";
}

function normalizeRemoteType(text = "") {
  const value = text.toLowerCase();
  if (value.includes("remote")) return "remote";
  if (value.includes("hybrid")) return "hybrid";
  return "onsite";
}

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function detectAts(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (host === "boards.greenhouse.io" && parts.length > 0) {
      return { type: "greenhouse", company: parts[0] };
    }

    if (host === "jobs.lever.co" && parts.length > 0) {
      return { type: "lever", company: parts[0] };
    }

    if (host.endsWith("smartrecruiters.com") && parts.length > 0) {
      return { type: "smartrecruiters", company: parts[0] };
    }
  } catch {
    // Ignore invalid URLs.
  }

  return null;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}

async function crawlGreenhouse(company) {
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`;
  const data = await fetchJson(apiUrl);
  if (!data?.jobs) return [];

  return data.jobs.map((job) => ({
    title: job.title || "",
    description: stripHtml(job.content || ""),
    location: job.location?.name || "",
    employmentType: normalizeEmploymentType(job.metadata?.employment_type || ""),
    remoteType: normalizeRemoteType(job.location?.name || ""),
    postedDate: job.updated_at ? new Date(job.updated_at) : null,
    jobUrl: job.absolute_url || ""
  }));
}

async function crawlLever(company) {
  const apiUrl = `https://api.lever.co/v0/postings/${company}?mode=json`;
  const data = await fetchJson(apiUrl);
  if (!Array.isArray(data)) return [];

  return data.map((job) => ({
    title: job.text || "",
    description: stripHtml(job.description || ""),
    location: job.categories?.location || "",
    employmentType: normalizeEmploymentType(job.categories?.commitment || ""),
    remoteType: normalizeRemoteType(job.workplaceType || job.categories?.location || ""),
    postedDate: job.createdAt ? new Date(job.createdAt) : null,
    jobUrl: job.hostedUrl || job.applyUrl || ""
  }));
}

async function crawlSmartRecruiters(company) {
  const apiUrl = `https://api.smartrecruiters.com/v1/companies/${company}/postings`;
  const data = await fetchJson(apiUrl);
  const postings = data?.content || [];
  if (!Array.isArray(postings)) return [];

  return postings.map((job) => ({
    title: job.name || "",
    description: stripHtml(job.jobAd?.sections?.map((s) => s.text).join(" ") || ""),
    location: job.location?.city
      ? `${job.location.city}, ${job.location.country || ""}`.trim()
      : job.location?.country || "",
    employmentType: normalizeEmploymentType(job.typeOfEmployment || ""),
    remoteType: normalizeRemoteType(job.location?.city || job.location?.country || ""),
    postedDate: job.releasedDate ? new Date(job.releasedDate) : null,
    jobUrl: job.postingUrl || ""
  }));
}

export async function crawlJobsFromSource(url) {
  const ats = detectAts(url);

  if (ats?.type === "greenhouse") {
    const jobs = await crawlGreenhouse(ats.company);
    if (jobs.length) return jobs;
  }

  if (ats?.type === "lever") {
    const jobs = await crawlLever(ats.company);
    if (jobs.length) return jobs;
  }

  if (ats?.type === "smartrecruiters") {
    const jobs = await crawlSmartRecruiters(ats.company);
    if (jobs.length) return jobs;
  }

  return crawlJobsFromPage(url);
}
