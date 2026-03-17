export const EMPTY_SOURCE_FORM = {
  name: "",
  website: "",
  careerPage: "",
  sourceType: "company",
  region: "",
  tags: "",
  active: true
};

export const DEFAULT_SOURCE_FILTERS = {
  type: "",
  region: "",
  tag: "",
  active: ""
};

export const DEFAULT_COMPANY_FILTERS = {
  type: "",
  industry: "",
  location: ""
};

export const ACTIVITY_FEED = [
  {
    title: "Crawler queue",
    detail: "Queue builds from active sources and companies",
    status: "On schedule"
  },
  {
    title: "Signal refresh",
    detail: "Realtime updates streaming every 30 minutes",
    status: "Healthy"
  },
  {
    title: "Source audits",
    detail: "Monitor new sources for quality assurance",
    status: "Attention"
  }
];