export const formatTimestamp = (value) => {
  if (!value) return "Not updated yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not updated yet";
  return date.toLocaleString();
};

export const decodeHtml = (value = "") => {
  if (!value) return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

export const sanitizeDescription = (value = "") => {
  if (!value) return "<p>No description provided.</p>";
  const decoded = decodeHtml(value);
  const parser = new DOMParser();
  const doc = parser.parseFromString(decoded, "text/html");

  doc
    .querySelectorAll("script, style, noscript, iframe, object, embed")
    .forEach((node) => node.remove());

  const allowedTags = new Set([
    "p",
    "br",
    "strong",
    "em",
    "ul",
    "ol",
    "li",
    "a",
    "h3",
    "h4",
    "h5",
    "h6",
    "div",
    "span"
  ]);

  const isSafeUrl = (href) => /^https?:\/\//i.test(href || "");

  const walk = (node) => {
    const children = Array.from(node.childNodes);

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const fragment = doc.createDocumentFragment();
        children.forEach((child) => fragment.appendChild(child));
        node.replaceWith(fragment);
        children.forEach(walk);
        return;
      }

      Array.from(node.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (tag === "a" && name === "href") {
          const href = node.getAttribute("href");
          if (!isSafeUrl(href)) {
            node.removeAttribute("href");
          }
        } else {
          node.removeAttribute(attr.name);
        }
      });

      if (tag === "a") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noreferrer");
      }
    }

    children.forEach(walk);
  };

  Array.from(doc.body.childNodes).forEach(walk);
  const sanitized = doc.body.innerHTML.trim();
  return sanitized || "<p>No description provided.</p>";
};

export const getDomainFromUrl = (value = "") => {
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(normalized);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export const getCompanyLogoUrl = (item) => {
  const domain =
    getDomainFromUrl(item?.companyWebsite) ||
    getDomainFromUrl(item?.companyCareerPage) ||
    getDomainFromUrl(item?.jobUrl);

  if (!domain) return "";
  return `https://logo.clearbit.com/${domain}?size=96`;
};

export const getCompanyInitials = (name = "") => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CO";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};