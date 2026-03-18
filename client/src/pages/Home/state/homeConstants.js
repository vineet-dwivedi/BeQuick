export const DEFAULT_PROMPT =
  "Search a company, skill, or role like backend, data, AI, product, or security";

export const DUMMY_SIGNALS = [
  "Hiring spike detected across multiple tech teams",
  "Consistent openings across product, data, and engineering",
  "Fresh role cluster surfaced this week",
  "New listings captured in the last 48 hours"
];

export const SIGNAL_SLIDES = [
  {
    title: "Signal velocity",
    metric: "2.9x",
    detail: "Hiring movement detected faster across newly opened tech roles."
  },
  {
    title: "Verified coverage",
    metric: "98%",
    detail: "Openings reconciled against official career pages and trusted sources."
  },
  {
    title: "Remote map",
    metric: "41%",
    detail: "Remote-friendly roles surfaced with stronger confidence tags."
  },
  {
    title: "Role spread",
    metric: "8 lanes",
    detail:
      "Coverage across engineering, data, AI, product, design, QA, cloud, and security."
  },
  {
    title: "Freshness",
    metric: "24h",
    detail: "Average time to surface a newly captured opening."
  }
];

export const ROLE_LANES = [
  {
    label: "Engineering",
    title: "Software and platform delivery",
    detail:
      "Track backend, frontend, mobile, platform, DevOps, SRE, cloud, and broader engineering roles in one workspace.",
    tags: ["Backend", "Frontend", "Mobile", "DevOps"]
  },
  {
    label: "Data and AI",
    title: "Data, analytics, and intelligence",
    detail:
      "Search data engineering, analytics, machine learning, applied AI, and research-adjacent openings with cleaner signals.",
    tags: ["Data", "Analytics", "ML", "AI"]
  },
  {
    label: "Product and design",
    title: "Product builders and UX operators",
    detail:
      "Surface product, design, research, growth, and strategy roles from high-signal teams without switching tools.",
    tags: ["Product", "Design", "Research", "Growth"]
  },
  {
    label: "Quality and trust",
    title: "Security, QA, and reliability",
    detail:
      "Monitor quality engineering, testing, security, compliance, and trust-focused roles with the same verified feed.",
    tags: ["QA", "Security", "Testing", "Trust"]
  }
];

export const TRUST_POINTS = [
  {
    label: "Role-flexible",
    detail: "One search surface for every major tech career lane."
  },
  {
    label: "Verified sources",
    detail: "Career pages and trusted endpoints stay at the center."
  },
  {
    label: "Decision-ready",
    detail: "Freshness, volume, and signal quality help you shortlist faster."
  }
];
