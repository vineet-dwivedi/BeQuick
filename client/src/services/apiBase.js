const rawBaseUrl = String(import.meta.env.VITE_API_URL || "").trim();
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");
const warnedMissingProductionApiUrl = { value: false };
const warnedLocalhostApiFallback = { value: false };

const withLeadingSlash = (value) => (value.startsWith("/") ? value : `/${value}`);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const isLocalHostname = (value) => LOCAL_HOSTS.has(String(value || "").trim().toLowerCase());

const shouldUseSameOriginProxy = () => {
  if (!normalizedBaseUrl || typeof window === "undefined") {
    return false;
  }

  try {
    const parsed = new URL(normalizedBaseUrl);
    const pageHost = window.location.hostname;

    return isLocalHostname(parsed.hostname) && !isLocalHostname(pageHost);
  } catch {
    return false;
  }
};

export const buildApiUrl = (path) => {
  const normalizedPath = withLeadingSlash(path);

  if (shouldUseSameOriginProxy()) {
    if (!warnedLocalhostApiFallback.value) {
      warnedLocalhostApiFallback.value = true;
      console.warn(
        "VITE_API_URL points to localhost, but this page is not running on localhost. Falling back to same-origin /api requests."
      );
    }

    return normalizedPath;
  }

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
