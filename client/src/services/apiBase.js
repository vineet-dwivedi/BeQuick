const rawBaseUrl = String(import.meta.env.VITE_API_URL || "").trim();
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");
const warnedMissingProductionApiUrl = { value: false };

const withLeadingSlash = (value) => (value.startsWith("/") ? value : `/${value}`);

export const buildApiUrl = (path) => {
  const normalizedPath = withLeadingSlash(path);

  if (!normalizedBaseUrl) {
    if (import.meta.env.PROD && !warnedMissingProductionApiUrl.value) {
      warnedMissingProductionApiUrl.value = true;
      console.warn(
        "VITE_API_URL is not set for this production build. API requests will use the current site origin."
      );
    }

    return normalizedPath;
  }

  if (/^https?:\/\//i.test(normalizedBaseUrl)) {
    return `${normalizedBaseUrl}${normalizedPath}`;
  }

  return `${withLeadingSlash(normalizedBaseUrl)}${normalizedPath}`;
};
