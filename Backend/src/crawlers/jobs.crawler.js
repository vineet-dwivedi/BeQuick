import { load } from "cheerio";
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

function decodeHtmlEntities(value = "") {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value = "") {
  const decoded = decodeHtmlEntities(value);
  return decoded.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function detectAts(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const workdayHost =
      host.includes("myworkdayjobs.com") || host.includes("workdayjobs.com");

    if (host === "boards.greenhouse.io" && parts.length > 0) {
      return { type: "greenhouse", company: parts[0] };
    }

    if (host === "jobs.lever.co" && parts.length > 0) {
      return { type: "lever", company: parts[0] };
    }

    if (host.endsWith("smartrecruiters.com") && parts.length > 0) {
      return { type: "smartrecruiters", company: parts[0] };
    }

    if (workdayHost && parts.length > 0) {
      const tenant = host.split(".")[0];
      let site = parts[0];
      if (/^[a-z]{2}-[a-z]{2}$/i.test(site) && parts[1]) {
        site = parts[1];
      }
      return { type: "workday", host, tenant, site };
    }

    if (host.includes("careers.microsoft.com") || host.includes("apply.careers.microsoft.com")) {
      return { type: "microsoft" };
    }

    if (host.includes("google.com") && parsed.pathname.includes("/about/careers/applications/jobs/results")) {
      return { type: "google" };
    }

    if (host.includes("careers.google.com") && parsed.pathname.includes("/jobs/results")) {
      return { type: "google" };
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

async function fetchJsonWithOptions(url, options) {
  const response = await fetch(url, options);
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

async function crawlWorkday(workday) {
  const apiUrl = `https://${workday.host}/wday/cxs/${workday.tenant}/${workday.site}/jobs`;
  const payload = {
    limit: 50,
    offset: 0,
    searchText: ""
  };

  const data = await fetchJsonWithOptions(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const postings = data?.jobPostings || data?.jobs || data?.postings || [];
  if (!Array.isArray(postings)) return [];

  return postings.map((job) => ({
    title: job.title || "",
    description: stripHtml(job.jobDescription || job.jobDescriptionSummary || ""),
    location: job.locationsText || job.location || "",
    employmentType: normalizeEmploymentType(job.timeType || ""),
    remoteType: normalizeRemoteType(job.locationsText || ""),
    postedDate: job.postedOn ? new Date(job.postedOn) : null,
    jobUrl: job.externalPath ? `https://${workday.host}${job.externalPath}` : job.url || ""
  }));
}

function normalizeExperienceLabel(label = "") {
  const value = label.toLowerCase();
  if (!value) return "";
  if (value.includes("intern")) return "intern";
  if (value.includes("early") || value.includes("entry") || value.includes("junior")) return "entry";
  if (value.includes("mid")) return "mid";
  if (value.includes("advanced") || value.includes("senior") || value.includes("lead") || value.includes("staff")) {
    return "senior";
  }
  return "";
}

async function crawlGoogleCareers(url) {
  const response = await fetch(url);
  if (!response.ok) return [];
  const html = await response.text();
  const $ = load(html);
  const baseHref = $("base").attr("href") || "https://www.google.com/about/careers/applications/";

  const jobs = [];

  $("li.lLd3Je").each((_, element) => {
    const title = $(element).find("h3.QJPWVe").first().text().trim();
    if (!title) return;

    const locationParts = $(element)
      .find("span.pwO9Dc span.r0wTof")
      .map((__, node) => $(node).text().trim())
      .get()
      .filter(Boolean);
    const location = locationParts.join("; ");

    const experienceLabel = $(element).find("span.wVSTAb").first().text().trim();
    const experienceLevel = normalizeExperienceLabel(experienceLabel);

    const detailHref = $(element).find("a.WpHeLc[href]").attr("href") || "";
    let jobUrl = url;
    try {
      if (detailHref) {
        jobUrl = new URL(detailHref, baseHref).toString();
      }
    } catch {
      jobUrl = url;
    }

    const description = stripHtml($(element).find(".Xsxa1e").text());

    jobs.push({
      title,
      description,
      location,
      employmentType: "full-time",
      experienceLevel,
      remoteType: normalizeRemoteType(location),
      postedDate: null,
      jobUrl
    });
  });

  return jobs;
}

async function crawlMicrosoftCareers(url) {
  const response = await fetch(url);
  if (!response.ok) return [];
  const html = await response.text();
  const $ = load(html);
  const jobs = [];

  const cards = $(".careers-joblistResponsive-column, .careers-joblistResponsive-columnTwo");

  cards.each((_, element) => {
    const title = $(element).find(".careers-joblistResponsive-subheading").first().text().trim();
    if (!title) return;

    const location = $(element)
      .find(".careers-joblistResponsive-primarylocation")
      .first()
      .text()
      .trim();
    const worksite = $(element)
      .find(".careers-joblistResponsive-worksiteflex")
      .first()
      .text()
      .trim();
    const postedRaw = $(element)
      .find(".careers-joblistResponsive-postdate")
      .first()
      .text()
      .trim();
    const jobUrl =
      $(element).find("a.careers-joblistResponsive-button[href]").attr("href") || url;
    const descriptionHtml = $(element).find(".careers-joblistResponsive-desc").first().html() || "";

    jobs.push({
      title,
      description: stripHtml(descriptionHtml),
      location,
      employmentType: "full-time",
      remoteType: normalizeRemoteType(worksite || location),
      postedDate: postedRaw ? new Date(postedRaw) : null,
      jobUrl
    });
  });

  return jobs;
}

async function discoverAtsUrlFromPage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();

    const patterns = [
      /https?:\/\/boards\.greenhouse\.io\/[a-z0-9-]+/i,
      /https?:\/\/jobs\.lever\.co\/[a-z0-9-]+/i,
      /https?:\/\/careers\.smartrecruiters\.com\/[a-z0-9-]+/i,
      /https?:\/\/[a-z0-9-]+\.wd\d+\.myworkdayjobs\.com\/[a-z0-9-_]+/i,
      /https?:\/\/[a-z0-9-]+\.myworkdayjobs\.com\/[a-z0-9-_]+/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[0]) return match[0];
    }
  } catch {
    return null;
  }

  return null;
}

export async function crawlJobsFromSource(url, visited = new Set()) {
  if (visited.has(url)) return [];
  visited.add(url);
  const ats = detectAts(url);

  if (ats?.type === "google") {
    const jobs = await crawlGoogleCareers(url);
    if (jobs.length) return jobs;
  }

  if (ats?.type === "microsoft") {
    const jobs = await crawlMicrosoftCareers(url);
    if (jobs.length) return jobs;
  }

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

  if (ats?.type === "workday") {
    const jobs = await crawlWorkday(ats);
    if (jobs.length) return jobs;
  }

  const discovered = await discoverAtsUrlFromPage(url);
  if (discovered && !visited.has(discovered)) {
    const jobs = await crawlJobsFromSource(discovered, visited);
    if (jobs.length) return jobs;
  }

  return crawlJobsFromPage(url);
}
