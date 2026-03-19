const STRONG_SOFTWARE_TITLE_REGEX =
  /\b(software dev engineer|software development engineer|software engineer|software developer|sde(?:\s+[ivx0-9]+)?|frontend engineer|frontend developer|front end engineer|front end developer|backend engineer|backend developer|back end engineer|back end developer|full stack engineer|full stack developer|fullstack engineer|fullstack developer|web engineer|web developer|application engineer|application developer|mobile engineer|mobile developer|ios engineer|ios developer|android engineer|android developer|platform engineer|devops engineer|site reliability engineer|infrastructure engineer|cloud engineer|distributed systems engineer|build engineer|automation engineer|firmware engineer|embedded engineer|react developer|node(?:\.js)? developer)\b/i;

const NON_SOFTWARE_TITLE_REGEX =
  /\b(data analyst|data scientist|machine learning engineer|ml engineer|product manager|program manager|project manager|designer|ux|ui|researcher|sales|account executive|marketing|recruit(?:er|ing)?|talent|hr|human resources|finance|accountant|legal|lawyer|customer success|support engineer|support specialist|solutions engineer|solution engineer|sales engineer|security analyst|network engineer|technical writer|content|operations|consultant|business analyst|scrum master|qa tester|manual tester)\b/i;

const ENGINEER_OR_DEVELOPER_REGEX = /\b(engineer|developer|programmer)\b/i;
const SOFTWARE_CONTEXT_REGEX =
  /\b(api|application|backend|frontend|front end|back end|full stack|fullstack|web|mobile|ios|android|platform|infra(?:structure)?|devops|site reliability|sre|distributed systems?|cloud|automation|build systems?|developer tools?|software|code|coding|kubernetes|docker|react|node(?:\.js)?|javascript|typescript|java|python|go|rust|c\+\+|c#)\b/i;

const SOFTWARE_STACK_VALUES = [
  "MERN",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "Kubernetes",
  "Docker",
  "AWS",
  "Next.js",
  "React Native"
];

export function isSoftwareEngineeringJob(job = {}) {
  const title = job.title || "";
  const description = job.description || "";
  const stack = Array.isArray(job.stack) ? job.stack : [];

  if (!title.trim()) {
    return false;
  }

  if (STRONG_SOFTWARE_TITLE_REGEX.test(title)) {
    return true;
  }

  if (NON_SOFTWARE_TITLE_REGEX.test(title)) {
    return false;
  }

  if (!ENGINEER_OR_DEVELOPER_REGEX.test(title)) {
    return false;
  }

  const contextText = [title, description, stack.join(" ")].join(" ");
  return SOFTWARE_CONTEXT_REGEX.test(contextText) || stack.length > 0;
}

export function getSoftwareEngineeringQuery() {
  return {
    $and: [
      { title: { $not: NON_SOFTWARE_TITLE_REGEX } },
      {
        $or: [
          { title: STRONG_SOFTWARE_TITLE_REGEX },
          {
            $and: [
              { title: ENGINEER_OR_DEVELOPER_REGEX },
              {
                $or: [
                  { title: SOFTWARE_CONTEXT_REGEX },
                  { description: SOFTWARE_CONTEXT_REGEX },
                  { stack: { $in: SOFTWARE_STACK_VALUES } }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}

export function combineMongoQueries(...queries) {
  const clauses = queries.filter(
    (query) => query && typeof query === "object" && Object.keys(query).length > 0
  );

  if (clauses.length === 0) {
    return {};
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return { $and: clauses };
}
