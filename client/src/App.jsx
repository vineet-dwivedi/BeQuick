import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import "./App.scss";

function App() {
  const [theme, setTheme] = useState("default");
  const [prompt, setPrompt] = useState(
    "Top MNC companies hiring MERN stack developers for freshers in India"
  );
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const dummySignals = useMemo(
    () => [
      "Hiring spike in the last 14 days",
      "Consistent openings across teams",
      "New grad roles updated this week",
      "Fresh roles updated in last 48 hours"
    ],
    []
  );

  const fetchSearchResults = async () => {
    try {
      setError("");
      setIsLoading(true);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Search failed");
      }

      setResults(data.results || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
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

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "default" ? "alt" : "default"));
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
          <button className="primary" type="button">
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
                  fetchSearchResults();
                }}
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask for roles, stacks, locations..."
                />
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Analyze"}
                </button>
              </form>
              {error && <p className="error-text">{error}</p>}

              <div className="quick-tags">
                <button type="button">Fresher</button>
                <button type="button">Remote</button>
                <button type="button">MERN</button>
                <button type="button">India</button>
              </div>
            </div>

            <div className="hero__stats">
              <div className="stat">
                <h3>450+</h3>
                <p>Verified company sources</p>
              </div>
              <div className="stat">
                <h3>12k</h3>
                <p>Active roles tracked</p>
              </div>
              <div className="stat">
                <h3>24h</h3>
                <p>Freshness guarantee</p>
              </div>
            </div>
          </div>

          <aside className="hero__card">
            <div className="card__header">
              <span>Live Hiring Signals</span>
              <span className="chip">Updated 2h ago</span>
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
              <button type="button" className="link">
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
          </div>
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
                <button type="button" className="ghost small">
                  View openings
                </button>
              </article>
            ))}
          </div>
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
            <button type="button" className="primary full">
              Generate my report
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
