import { buildApiUrl } from "./apiBase.js";

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function normalizeNetworkError(error) {
  if (error?.message === "Failed to fetch") {
    return new Error(
      "Unable to reach the API. Check that VITE_API_URL points to the deployed backend and that backend CORS_ORIGIN allows this frontend origin."
    );
  }

  return error instanceof Error ? error : new Error("Request failed");
}

export async function searchJobs({ prompt, includeRemote, page, limit }) {
  try {
    const response = await fetch(buildApiUrl("/api/search"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        includeRemote,
        page,
        limit
      })
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(data?.error || "Search failed");
    }

    return data;
  } catch (error) {
    throw normalizeNetworkError(error);
  }
}

export async function fetchStats() {
  try {
    const response = await fetch(buildApiUrl("/api/stats"));
    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(data?.error || "Failed to load stats");
    }

    return data;
  } catch (error) {
    throw normalizeNetworkError(error);
  }
}
