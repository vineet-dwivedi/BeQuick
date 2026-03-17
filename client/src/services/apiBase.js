const rawBaseUrl = import.meta.env.VITE_API_URL || "";
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

export const buildApiUrl = (path) => {
  if (!normalizedBaseUrl) return path;
  if (!path.startsWith("/")) return `${normalizedBaseUrl}/${path}`;
  return `${normalizedBaseUrl}${path}`;
};