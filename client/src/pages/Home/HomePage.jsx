import { useMemo } from "react";
import { useHomeState } from "./hooks/useHomeState.js";
import {
  DEFAULT_PROMPT,
  DUMMY_SIGNALS,
  ROLE_LANES,
  SIGNAL_SLIDES,
  TRUST_POINTS
} from "./state/homeConstants.js";
import {
  formatTimestamp,
  getCompanyInitials,
  getCompanyLogoUrl,
  sanitizeDescription
} from "./state/homeUtils.js";

const QUICK_SEARCHES = [
  { label: "Software Engineer", value: "software engineer" },
  { label: "Data Analyst", value: "data analyst" },
  { label: "AI Engineer", value: "AI engineer" },
  { label: "Product Manager", value: "product manager" }
];

const PROCESS_STEPS = [
  {
    index: "01",
    title: "Start broad",
    detail:
      "Search by role, skill, or company name and let the platform shape that into a cleaner hiring brief."
  },
  {
    index: "02",
    title: "Filter the noise",
    detail:
      "Verified sources, freshness, and role-fit signals stay in focus so the board feels usable from the start."
  },
  {
    index: "03",
    title: "Act faster",
    detail:
      "Review live openings, compare market notes, and move into detail pages without breaking the flow."
  }
];

const REPORT_POINTS = [
  "Keep prompts simple, then narrow with company names or specialist skills.",
  "Use the live board to compare quality, not just volume.",
  "Open the report when you want a quick snapshot before you shortlist."
];

export default function HomePage() {
  const {
    pageRef,
    prompt,
    setPrompt,
    results,
    total,
    page,
    relaxed,
    includeRemote,
    setIncludeRemote,
    stats,
    isLoading,
    error,
    selectedJob,
    setSelectedJob,
    showReport,
    setShowReport,
    fetchSearchResults,
    applyPromptAndSearch
  } = useHomeState();

  const commandMetrics = useMemo(
    () => [
      {
        value: stats?.sources ?? "--",
        label: "Verified sources"
      },
      {
        value: stats?.jobs ?? "--",
        label: "Active openings"
      },
      {
        value: stats?.companies ?? "--",
        label: "Tracked companies"
      }
    ],
    [stats]
  );

  const boardDetails = useMemo(
    () => [
      {
        label: "Coverage",
        value: includeRemote ? "Remote and onsite" : "Onsite only"
      },
      {
        label: "Last source crawl",
        value: formatTimestamp(stats?.lastSourceCrawledAt)
      },
      {
        label: "Last job refresh",
        value: formatTimestamp(stats?.lastJobScrapedAt)
      },
      {
        label: "Current brief",
        value: prompt || DEFAULT_PROMPT
      }
    ],
    [includeRemote, prompt, stats]
  );

  return (
    <div className="page page-home" ref={pageRef}>
      <section className="home-hero">
        <div className="home-hero__main">
          <p className="eyebrow js-hero-line">Focused Tech Hiring Search</p>

          <div className="home-hero__heading js-hero-line">
            <h1 className="home-hero__title">
              Clean search. Clear signals.
              <br />
              Better role decisions.
            </h1>
            <p className="home-hero__subtitle">
              A professional, minimal workspace for finding tech roles through verified
              sources, stronger context, and a calmer review flow.
            </p>
          </div>

          <form
            className="search-card js-hero-line"
            onSubmit={(event) => {
              event.preventDefault();
              fetchSearchResults(1, false);
            }}
          >
            <div className="search-card__head">
              <div>
                <p className="search-card__label">Search brief</p>
                <p className="search-card__copy">
                  Try a role, skill, or company and get a tighter live board.
                </p>
              </div>
              <label className="search-toggle">
                <input
                  type="checkbox"
                  checked={includeRemote}
                  onChange={(event) => setIncludeRemote(event.target.checked)}
                />
                <span>Include remote</span>
              </label>
            </div>

            <div className="search-card__row">
              <input
                id="home-search"
                type="text"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={DEFAULT_PROMPT}
              />
              <button className="btn btn-primary" type="submit" disabled={isLoading}>
                {isLoading ? "Searching..." : "Search roles"}
              </button>
            </div>

            <div className="search-card__tags">
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="search-chip"
                  onClick={() => applyPromptAndSearch(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="search-card__hint">
              Keep it simple: "data engineer", "frontend", "AI intern", or a company name.
            </p>
          </form>

          {error && <p className="error-text">{error}</p>}

          <div className="trust-row js-hero-line">
            {TRUST_POINTS.map((point) => (
              <article className="trust-card" key={point.label}>
                <strong>{point.label}</strong>
                <p>{point.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="home-hero__panel js-hero-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Live Board</p>
              <h2>Market snapshot</h2>
            </div>
            <span className="panel-badge">
              {results.length ? `${results.length} live matches` : "Ready for search"}
            </span>
          </div>

          <div className="metric-grid">
            {commandMetrics.map((item) => (
              <article className="metric-card js-stagger-item" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>

          <div className="detail-list">
            {boardDetails.map((item) => (
              <div className="detail-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="panel-actions">
            <a className="btn btn-ghost" href="#companies">
              View live roles
            </a>
            <button type="button" className="btn btn-primary" onClick={() => setShowReport(true)}>
              Open report
            </button>
          </div>
        </aside>
      </section>

      <section className="home-section home-section--highlight js-reveal" id="how">
        <div className="section-heading js-reveal-item">
          <p className="eyebrow">Approach</p>
          <h2>Minimal workflow, useful context</h2>
          <p>
            The interface stays simple on purpose so the search feels fast, readable, and
            easier to trust.
          </p>
        </div>

        <div className="process-grid">
          {PROCESS_STEPS.map((step) => (
            <article className="process-card js-reveal-item" key={step.title}>
              <span>{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section js-reveal" id="coverage">
        <div className="section-heading section-heading--split js-reveal-item">
          <div>
            <p className="eyebrow">Coverage</p>
            <h2>Built for serious tech role discovery</h2>
            <p>
              Engineering, data, AI, product, design, security, and quality roles all stay
              inside the same clean workflow.
            </p>
          </div>
          <span className="section-note">All major tech lanes</span>
        </div>

        <div className="coverage-grid">
          {ROLE_LANES.map((lane) => (
            <article className="coverage-card js-reveal-item" key={lane.title}>
              <p className="coverage-card__label">{lane.label}</p>
              <h3>{lane.title}</h3>
              <p>{lane.detail}</p>
              <div className="coverage-card__tags">
                {lane.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section js-reveal" id="signals">
        <div className="section-heading section-heading--split js-reveal-item">
          <div>
            <p className="eyebrow">Market Notes</p>
            <h2>A quieter way to read hiring movement</h2>
            <p>
              Short signal cards keep the page informative without turning the interface into a
              dashboard overload.
            </p>
          </div>
          <button type="button" className="btn btn-outline" onClick={() => setShowReport(true)}>
            Generate summary
          </button>
        </div>

        <div className="signal-grid">
          {SIGNAL_SLIDES.map((slide) => (
            <article className="signal-note js-reveal-item" key={slide.title}>
              <span className="signal-note__metric">{slide.metric}</span>
              <h3>{slide.title}</h3>
              <p>{slide.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--results js-reveal" id="companies">
        <div className="section-heading section-heading--split js-reveal-item">
          <div>
            <p className="eyebrow">Live Roles</p>
            <h2>Open roles matched to your search</h2>
            <p>
              {results.length
                ? "Review the latest matching roles in a simple board built for quick comparison."
                : "Run a search to populate the board with live opportunities from tracked sources."}
            </p>
          </div>
          <div className="results-summary">
            <span className="panel-badge">{includeRemote ? "Remote + onsite" : "Onsite only"}</span>
            <strong>{results.length ? `${results.length} of ${total} shown` : "No results yet"}</strong>
          </div>
        </div>

        {relaxed && <p className="relaxed-note">Filters relaxed: {relaxed.join(", ")}</p>}

        {results.length > 0 ? (
          <div className="results-grid js-results">
            {results.map((item, index) => {
              const logoUrl = getCompanyLogoUrl(item);
              const initials = getCompanyInitials(item.companyName || "Company");

              return (
                <article className="result-card" key={item._id || index}>
                  <div className="result-card__header">
                    <div className="result-card__identity">
                      <div
                        className="company-avatar"
                        data-has-logo={logoUrl ? "true" : "false"}
                        aria-hidden="true"
                      >
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt=""
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              const parent = event.currentTarget.parentElement;
                              if (parent) {
                                parent.dataset.fallback = "true";
                              }
                            }}
                          />
                        ) : null}
                        <span className="company-initials">{initials}</span>
                      </div>

                      <div className="result-card__title-group">
                        <p className="result-card__company">{item.companyName || "Company"}</p>
                        <h3>{item.title}</h3>
                      </div>
                    </div>

                    <span className="result-card__location">{item.location || "Location not listed"}</span>
                  </div>

                  <div className="result-card__meta">
                    <span>{item.remoteType || "Onsite"}</span>
                    <span>{item.employmentType || "Full-time"}</span>
                    <span>{DUMMY_SIGNALS[index % DUMMY_SIGNALS.length]}</span>
                  </div>

                  {(item.stack || []).length > 0 && (
                    <div className="result-card__stack">
                      {(item.stack || []).map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="result-card__links">
                    {item.companyWebsite && (
                      <a href={item.companyWebsite} target="_blank" rel="noreferrer">
                        Company
                      </a>
                    )}
                    {item.companyCareerPage && (
                      <a href={item.companyCareerPage} target="_blank" rel="noreferrer">
                        Careers
                      </a>
                    )}
                    {item.jobUrl && (
                      <a href={item.jobUrl} target="_blank" rel="noreferrer">
                        Job link
                      </a>
                    )}
                  </div>

                  <div className="result-card__footer">
                    <span className="result-card__signal">Verified source trail</span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setSelectedJob(item)}
                    >
                      Open details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="results-empty js-reveal-item">
            <h3>Start with a focused search brief</h3>
            <p>
              Search by role, skill, or company to fill the board with fresher and more useful
              openings.
            </p>
            <div className="results-empty__actions">
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="btn btn-outline"
                  onClick={() => applyPromptAndSearch(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && results.length < total && (
          <div className="load-more">
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={() => fetchSearchResults(page + 1, true)}
            >
              {isLoading ? "Loading..." : "Load more roles"}
            </button>
          </div>
        )}
      </section>

      <section className="home-section js-reveal" id="insights">
        <div className="report-panel">
          <div className="report-panel__main js-reveal-item">
            <p className="eyebrow">Report View</p>
            <h2>Professional search support without the clutter</h2>
            <p>
              Use the report area as a final pass before you shortlist. It pulls the core stats
              into one place and keeps the next step obvious.
            </p>

            <div className="report-panel__metrics">
              {commandMetrics.map((item) => (
                <article className="metric-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className="report-panel__aside js-reveal-item">
            <h3>Suggested workflow</h3>
            <div className="report-list">
              {REPORT_POINTS.map((item) => (
                <div className="report-list__item" key={item}>
                  <span />
                  <p>{item}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary full"
              onClick={() => setShowReport(true)}
            >
              Open report summary
            </button>
          </aside>
        </div>
      </section>

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
              <span>{selectedJob.remoteType || "Onsite"}</span>
              <span>{selectedJob.employmentType || "Full-time"}</span>
            </div>
            <div
              className="modal__description"
              dangerouslySetInnerHTML={{
                __html: sanitizeDescription(selectedJob.description)
              }}
            />
            {(selectedJob.stack || []).length > 0 && (
              <div className="modal__stack">
                {(selectedJob.stack || []).map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            )}
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
                <p>Current platform snapshot</p>
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
                {QUICK_SEARCHES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => applyPromptAndSearch(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
