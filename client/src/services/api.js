export async function searchJobs({ prompt, includeRemote, page, limit }) {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      includeRemote,
      page,
      limit
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Search failed");
  }

  return data;
}

export async function fetchStats() {
  const response = await fetch("/api/stats");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to load stats");
  }

  return data;
}
