import { load } from "cheerio";

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeToArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractJobPostings(json) {
  if (!json) return [];

  const items = normalizeToArray(json["@graph"] || json);
  const postings = [];

  for (const item of items) {
    if (!item) continue;
    if (item["@type"] === "JobPosting") {
      postings.push(item);
    } else if (Array.isArray(item)) {
      item.forEach((child) => {
        if (child && child["@type"] === "JobPosting") postings.push(child);
      });
    }
  }

  return postings;
}

export async function crawlJobsFromPage(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);

  const scripts = $('script[type="application/ld+json"]');
  const jobs = [];

  scripts.each((_, node) => {
    const text = $(node).text();
    const json = tryParseJson(text);
    if (!json) return;

    const postings = extractJobPostings(json);
    postings.forEach((posting) => {
      jobs.push({
        title: posting.title || posting.name || "",
        description: posting.description || "",
        location: posting.jobLocation?.address?.addressLocality
          ? `${posting.jobLocation.address.addressLocality}, ${posting.jobLocation.address.addressRegion || ""}, ${posting.jobLocation.address.addressCountry || ""}`
          : "",
        employmentType: posting.employmentType || "full-time",
        postedDate: posting.datePosted ? new Date(posting.datePosted) : null,
        jobUrl: posting.url || url
      });
    });
  });

  return jobs;
}
