import { buildApiUrl } from "./apiBase.js";

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

const withAuth = (token) =>
  token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};

export async function fetchSources(token, params = {}) {
  const response = await fetch(buildApiUrl(`/api/sources${buildQuery(params)}`), {
    headers: {
      ...withAuth(token)
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to load sources");
  }
  return data;
}

export async function createSource(token, payload) {
  const response = await fetch(buildApiUrl("/api/sources"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token)
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to create source");
  }
  return data;
}

export async function updateSource(token, id, payload) {
  const response = await fetch(buildApiUrl(`/api/sources/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token)
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to update source");
  }
  return data;
}

export async function deleteSource(token, id) {
  const response = await fetch(buildApiUrl(`/api/sources/${id}`), {
    method: "DELETE",
    headers: {
      ...withAuth(token)
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete source");
  }
  return data;
}

export async function fetchJobs(token, params = {}) {
  const response = await fetch(buildApiUrl(`/api/jobs${buildQuery(params)}`), {
    headers: {
      ...withAuth(token)
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to load jobs");
  }
  return data;
}

export async function fetchCompanies(token, params = {}) {
  const response = await fetch(buildApiUrl(`/api/companies${buildQuery(params)}`), {
    headers: {
      ...withAuth(token)
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to load companies");
  }
  return data;
}

export async function runPriorityCrawl(token) {
  const response = await fetch(buildApiUrl("/api/admin/crawl"), {
    method: "POST",
    headers: {
      ...withAuth(token)
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to enqueue crawl");
  }
  return data;
}
