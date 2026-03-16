export const companies = [
  {
    key: "amazon",
    name: "Amazon",
    website: "https://www.amazon.com",
    careerPage: "https://www.amazon.jobs",
    industry: "",
    size: "",
    headquartersLocation: "",
    companyType: "MNC",
    techStack: [],
    createdAt: new Date()
  },
  {
    key: "peacock",
    name: "Peacock India",
    website: "https://www.peacockindia.in",
    careerPage: "https://www.peacockindia.in/careers/MERN-Stack-Developer",
    industry: "",
    size: "",
    headquartersLocation: "",
    companyType: "other",
    techStack: ["MERN", "MongoDB", "Express.js", "React", "Node.js"],
    createdAt: new Date()
  },
  {
    key: "cognizant",
    name: "Cognizant",
    website: "https://www.cognizant.com",
    careerPage: "https://careers.cognizant.com/apj-en/jobs/00065260191/mern-stack-developer/",
    industry: "",
    size: "",
    headquartersLocation: "",
    companyType: "MNC",
    techStack: ["MERN", "MongoDB", "Express.js", "React", "Node.js"],
    createdAt: new Date()
  },
  {
    key: "att",
    name: "AT&T",
    website: "https://www.att.com",
    careerPage:
      "https://www.att.jobs/job/bengaluru/specialist-applications-development-full-stack-developer-mern-stack/117/85194164816",
    industry: "",
    size: "",
    headquartersLocation: "",
    companyType: "MNC",
    techStack: ["MERN", "MongoDB", "Express.js", "React", "Node.js"],
    createdAt: new Date()
  }
];

export const sources = [
  {
    name: "Amazon",
    website: "https://www.amazon.com",
    careerPage: "https://www.amazon.jobs/en/",
    sourceType: "company",
    region: "Global",
    tags: ["tech", "mnc"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "Smartsheet",
    website: "https://www.smartsheet.com",
    careerPage: "https://boards.greenhouse.io/smartsheet",
    sourceType: "company",
    region: "Global",
    tags: ["greenhouse", "saas"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "Speechify",
    website: "https://www.speechify.com",
    careerPage: "https://boards.greenhouse.io/speechify",
    sourceType: "company",
    region: "Global",
    tags: ["greenhouse", "ai"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "BitGo",
    website: "https://www.bitgo.com",
    careerPage: "https://boards.greenhouse.io/bitgo",
    sourceType: "company",
    region: "Global",
    tags: ["greenhouse", "fintech"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "Level AI",
    website: "https://www.level.ai",
    careerPage: "https://jobs.lever.co/levelai",
    sourceType: "company",
    region: "Global",
    tags: ["lever", "ai"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "Dun & Bradstreet",
    website: "https://www.dnb.com",
    careerPage: "https://jobs.lever.co/dnb",
    sourceType: "company",
    region: "Global",
    tags: ["lever", "data"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "LinkedIn",
    website: "https://www.linkedin.com",
    careerPage: "https://careers.smartrecruiters.com/LinkedIn3",
    sourceType: "company",
    region: "Global",
    tags: ["smartrecruiters", "tech"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "Microsoft",
    website: "https://www.microsoft.com",
    careerPage: "https://careers.microsoft.com/v2/global/en/locations/india.html",
    sourceType: "company",
    region: "India",
    tags: ["mnc", "tech"],
    active: true,
    createdAt: new Date()
  },
  {
    name: "Google",
    website: "https://www.google.com",
    careerPage: "https://www.google.com/about/careers/applications/jobs/results",
    sourceType: "company",
    region: "Global",
    tags: ["mnc", "tech"],
    active: true,
    createdAt: new Date()
  }
];

export const jobs = [
  {
    companyKey: "peacock",
    title: "MERN Stack Developer",
    description: "",
    location: "Remote",
    employmentType: "full-time",
    experienceLevel: "entry",
    remoteType: "remote",
    stack: ["MERN", "MongoDB", "Express.js", "React", "Node.js"],
    rawStack: "MongoDB, Express.js, React.js, Node.js",
    jobUrl: "https://www.peacockindia.in/careers/MERN-Stack-Developer",
    postedDate: null,
    scrapedAt: new Date()
  },
  {
    companyKey: "cognizant",
    title: "MERN Stack developer",
    description: "",
    location: "Kochi, Kerala, India",
    employmentType: "full-time",
    experienceLevel: "mid",
    remoteType: "onsite",
    stack: ["MERN", "MongoDB", "Express.js", "React", "Node.js"],
    rawStack: "MongoDB, Express.js, React.js, Node.js",
    jobUrl: "https://careers.cognizant.com/apj-en/jobs/00065260191/mern-stack-developer/",
    postedDate: null,
    scrapedAt: new Date()
  },
  {
    companyKey: "att",
    title: "Specialist Applications Development - Full Stack Developer (MERN STACK)",
    description: "",
    location: "Bengaluru, India",
    employmentType: "full-time",
    experienceLevel: "mid",
    remoteType: "onsite",
    stack: ["MERN", "MongoDB", "Express.js", "React", "Node.js"],
    rawStack: "MongoDB, Express.js, React.js, Node.js",
    jobUrl:
      "https://www.att.jobs/job/bengaluru/specialist-applications-development-full-stack-developer-mern-stack/117/85194164816",
    postedDate: null,
    scrapedAt: new Date()
  },
  {
    companyKey: "amazon",
    title: "Software Dev Engineer II, Amazon India CFX team",
    description: "",
    location: "Gurugram, Haryana, India",
    employmentType: "full-time",
    experienceLevel: "mid",
    remoteType: "onsite",
    stack: [],
    rawStack: "",
    jobUrl: "https://www.amazon.jobs/en/jobs/3180689/software-dev-engineer-ii-amazon-india-cfx-team",
    postedDate: null,
    scrapedAt: new Date()
  },
  {
    companyKey: "amazon",
    title: "Software Development Engineer, Amazon Fulfillment Technology (AFT), Platform Engineering and Services",
    description: "",
    location: "Hyderabad, Telangana, India",
    employmentType: "full-time",
    experienceLevel: "mid",
    remoteType: "onsite",
    stack: [],
    rawStack: "",
    jobUrl: "https://www.amazon.jobs/en/jobs/3142565/software-development-engineer-amazon-fulfillment-technology-aft-platform-engineering-and-services",
    postedDate: null,
    scrapedAt: new Date()
  },
  {
    companyKey: "amazon",
    title: "Software Development Engineer II, Global Warehouse",
    description: "",
    location: "Bengaluru, Karnataka, India",
    employmentType: "full-time",
    experienceLevel: "mid",
    remoteType: "onsite",
    stack: [],
    rawStack: "",
    jobUrl: "https://www.amazon.jobs/en/jobs/3193742/software-development-engineer-ii-global-warehouse",
    postedDate: null,
    scrapedAt: new Date()
  }
];
