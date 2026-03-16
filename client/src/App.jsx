import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import "./App.scss";

function App() {
  const [theme, setTheme] = useState("default");
  const [prompt, setPrompt] = useState("Search company name or type all jobs");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [relaxed, setRelaxed] = useState(null);
  const [includeRemote, setIncludeRemote] = useState(true);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [toast, setToast] = useState("");

  const dummySignals = useMemo(
    () => [
      "Hiring spike in the last 14 days",
      "Consistent openings across teams",
      "New grad roles updated this week",
      "Fresh roles updated in last 48 hours"
    ],
    []
  );

  const fetchSearchResults = async (nextPage = 1, append = false, overridePrompt) => {
    try {
      setError("");
      setIsLoading(true);
      const effectivePrompt =
        typeof overridePrompt === "string" && overridePrompt.trim().length > 0
          ? overridePrompt
          : prompt;

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: effectivePrompt,
          includeRemote,
          page: nextPage,
          limit
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Search failed");
      }

      const incoming = data.results || [];
      setResults((prev) => (append ? [...prev, ...incoming] : incoming));
      setTotal(data.total || incoming.length);
      setPage(data.page || nextPage);
      setRelaxed(data.relaxed || null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (message) => {
    setToast(message);
    window.clearTimeout(showToastMessage._timer);
    showToastMessage._timer = window.setTimeout(() => setToast(""), 2500);
  };

  const applyPromptAndSearch = (value) => {
    setPrompt(value);
    fetchSearchResults(1, false, value);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch {
      // Ignore stats errors on the UI.
    }
  };

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.6 });
      gsap.from(".hero__title", { y: 30, opacity: 0, duration: 0.8, delay: 0.1 });
      gsap.from(".hero__subtitle", { y: 20, opacity: 0, duration: 0.8, delay: 0.2 });
      gsap.from(".hero__actions", { y: 20, opacity: 0, duration: 0.8, delay: 0.3 });
      gsap.from(".hero__card", { y: 30, opacity: 0, duration: 0.9, delay: 0.35 });
      gsap.from(".feature-card", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.5
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTimestamp = (value) => {
    if (!value) return "Not updated yet";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not updated yet";
    return date.toLocaleString();
  };

  const decodeHtml = (value = "") => {
    if (!value) return "";
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  };

  const sanitizeDescription = (value = "") => {
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

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "default" ? "alt" : "default"));
  };

  const openJob = (job) => {
    setSelectedJob(job);
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand__dot" />
          BeQuick
        </div>
        <nav className="nav">
          <a href="#how">How it works</a>
          <a href="#signals">Signals</a>
          <a href="#companies">Companies</a>
          <a href="#insights">Insights</a>
        </nav>
        <div className="topbar__actions">
          <button className="ghost" type="button" onClick={handleThemeToggle}>
            {theme === "default" ? "Switch to Pulse" : "Switch to Focus"}
          </button>
          <button
            className="primary"
            type="button"
            onClick={() => showToastMessage("Thanks! We will reach out soon.")}
          >
            Get early access
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__content">
            <p className="hero__eyebrow">AI Job Intelligence Platform</p>
            <h1 className="hero__title">
              Discover real MERN roles with live hiring signals and verified sources.
            </h1>
            <p className="hero__subtitle">
              Turn one prompt into a curated list of companies, open roles, tech stacks,
              and hiring momentum. Built for freshers and early‑career developers.
            </p>

            <div className="hero__actions">
              <form
                className="prompt"
                onSubmit={(event) => {
                  event.preventDefault();
                  fetchSearchResults(1, false);
                }}
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Search company name or type all jobs"
                />
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Analyze"}
                </button>
              </form>
              {error && <p className="error-text">{error}</p>}

              <div className="filters">
                <label>
                  <input
                    type="checkbox"
                    checked={includeRemote}
                    onChange={(event) => setIncludeRemote(event.target.checked)}
                  />
                  Include remote roles
                </label>
              </div>

              <div className="quick-tags">
                <button type="button" onClick={() => applyPromptAndSearch("all jobs")}>
                  All jobs
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("Amazon")}>
                  Amazon
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("LinkedIn")}>
                  LinkedIn
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("BitGo")}>
                  BitGo
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("Smartsheet")}>
                  Smartsheet
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("Speechify")}>
                  Speechify
                </button>
                <button
                  type="button"
                  onClick={() => applyPromptAndSearch("Dun & Bradstreet")}
                >
                  Dun & Bradstreet
                </button>
              </div>
            </div>

            <div className="hero__stats">
              <div className="stat">
                <h3>{stats?.sources ?? "--"}</h3>
                <p>Verified sources indexed</p>
              </div>
              <div className="stat">
                <h3>{stats?.jobs ?? "--"}</h3>
                <p>Active roles tracked</p>
              </div>
              <div className="stat">
                <h3>{stats?.companies ?? "--"}</h3>
                <p>Companies indexed</p>
              </div>
            </div>
          </div>

          <aside className="hero__card">
            <div className="card__header">
              <span>Live Hiring Signals</span>
              <span className="chip">{formatTimestamp(stats?.lastJobScrapedAt)}</span>
            </div>
            <ul className="signal-list">
              <li>
                <strong>Amazon</strong>
                <span>23 new postings in India</span>
              </li>
              <li>
                <strong>Microsoft</strong>
                <span>+18 roles across cloud teams</span>
              </li>
              <li>
                <strong>Google</strong>
                <span>New grad roles open this week</span>
              </li>
            </ul>
            <div className="card__footer">
              <p>AI score: 91/100 for MERN freshness</p>
              <button
                type="button"
                className="link"
                onClick={() => setShowReport(true)}
              >
                View full report
              </button>
            </div>
          </aside>
        </section>

        <section className="features" id="how">
          <div className="section-heading">
            <h2>How BeQuick works</h2>
            <p>Designed to surface opportunities faster than job boards.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Prompt to filters</h3>
              <p>AI converts your query into stack, location, and experience filters.</p>
            </article>
            <article className="feature-card">
              <h3>Verified sources</h3>
              <p>We crawl official career pages and prioritize trusted postings.</p>
            </article>
            <article className="feature-card">
              <h3>Hiring momentum</h3>
              <p>Track company hiring signals to know where demand is rising.</p>
            </article>
            <article className="feature-card">
              <h3>Actionable insights</h3>
              <p>Understand the tech stack and tailor your prep accordingly.</p>
            </article>
          </div>
        </section>

        <section className="results" id="companies">
          <div className="section-heading">
            <h2>Live role previews</h2>
            <p>
              {results.length
                ? "Results from your backend."
                : "No results yet. Run a search to see live data."}
            </p>
            {relaxed && (
              <p className="relaxed-note">Filters relaxed: {relaxed.join(", ")}</p>
            )}
          </div>
          {results.length > 0 && (
            <div className="results-meta">
              Showing {results.length} of {total} results
            </div>
          )}
          <div className="results-grid">
            {results.map((item, index) => (
              <article className="result-card" key={item._id || index}>
                <div className="result-card__top">
                  <div>
                    <h3>{item.companyName || "Company"}</h3>
                    <p>{item.title}</p>
                  </div>
                  <span className="badge">{item.location || "India"}</span>
                </div>
                <div className="result-card__stack">
                  {(item.stack || []).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <div className="result-card__links">
                  {item.companyWebsite && (
                    <a href={item.companyWebsite} target="_blank" rel="noreferrer">
                      Company site
                    </a>
                  )}
                  {item.companyCareerPage && (
                    <a href={item.companyCareerPage} target="_blank" rel="noreferrer">
                      Career page
                    </a>
                  )}
                  {item.jobUrl && (
                    <a href={item.jobUrl} target="_blank" rel="noreferrer">
                      Job link
                    </a>
                  )}
                </div>
                <p className="result-card__signal">
                  {dummySignals[index % dummySignals.length]}
                </p>
                <button type="button" className="ghost small" onClick={() => openJob(item)}>
                  View openings
                </button>
              </article>
            ))}
          </div>
          {results.length > 0 && results.length < total && (
            <div className="load-more">
              <button
                type="button"
                className="primary"
                disabled={isLoading}
                onClick={() => fetchSearchResults(page + 1, true)}
              >
                {isLoading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </section>

        <section className="insights" id="insights">
          <div className="insights__content">
            <h2>Professional insights, not just listings</h2>
            <p>
              BeQuick scores every role for freshness and stack fit, helping you prioritize
              the best opportunities. All data is updated daily from official sources.
            </p>
            <div className="insights__metrics">
              <div>
                <h3>87%</h3>
                <p>Average relevance match</p>
              </div>
              <div>
                <h3>4.2x</h3>
                <p>Faster job discovery</p>
              </div>
            </div>
          </div>
          <div className="insights__panel">
            <div className="panel-row">
              <span>Signal score</span>
              <strong>91</strong>
            </div>
            <div className="panel-row">
              <span>Top stack</span>
              <strong>MERN</strong>
            </div>
            <div className="panel-row">
              <span>Hot location</span>
              <strong>Bengaluru</strong>
            </div>
            <button type="button" className="primary full" onClick={() => setShowReport(true)}>
              Generate my report
            </button>
          </div>
        </section>
      </main>

      {toast && <div className="toast">{toast}</div>}

      {selectedJob && (
        <div className="modal">
          <div className="modal__card">
            <div className="modal__header">
              <div>
                <h3>{selectedJob.title}</h3>
                <p>{selectedJob.companyName}</p>
              </div>
              <button type="button" onClick={() => setSelectedJob(null)}>
                Close
              </button>
            </div>
            <div className="modal__meta">
              <span>{selectedJob.location || "Location not listed"}</span>
              <span>{selectedJob.remoteType || "onsite"}</span>
              <span>{selectedJob.employmentType || "full-time"}</span>
            </div>
            <div
              className="modal__description"
              dangerouslySetInnerHTML={{
                __html: sanitizeDescription(selectedJob.description)
              }}
            />
            <div className="modal__stack">
              {(selectedJob.stack || []).map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
            <div className="modal__actions">
              {selectedJob.jobUrl && (
                <a href={selectedJob.jobUrl} target="_blank" rel="noreferrer">
                  Open job link
                </a>
              )}
              {selectedJob.companyCareerPage && (
                <a href={selectedJob.companyCareerPage} target="_blank" rel="noreferrer">
                  Company career page
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="modal">
          <div className="modal__card report">
            <div className="modal__header">
              <div>
                <h3>Report summary</h3>
                <p>Latest platform snapshot</p>
              </div>
              <button type="button" onClick={() => setShowReport(false)}>
                Close
              </button>
            </div>
            <div className="report__grid">
              <div>
                <h4>Sources</h4>
                <p>{stats?.sources ?? "--"}</p>
              </div>
              <div>
                <h4>Companies</h4>
                <p>{stats?.companies ?? "--"}</p>
              </div>
              <div>
                <h4>Jobs</h4>
                <p>{stats?.jobs ?? "--"}</p>
              </div>
              <div>
                <h4>Last crawl</h4>
                <p>{formatTimestamp(stats?.lastSourceCrawledAt)}</p>
              </div>
            </div>
            <div className="report__tips">
              <h4>Suggested next searches</h4>
              <div className="report__tags">
                <button type="button" onClick={() => applyPromptAndSearch("all jobs")}>
                  All jobs
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("frontend")}>
                  Frontend
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("React")}>
                  React
                </button>
                <button type="button" onClick={() => applyPromptAndSearch("Remote")}>
                  Remote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
