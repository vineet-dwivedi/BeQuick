import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useHomeState } from "./hooks/useHomeState.js";
import {
  DEFAULT_PROMPT,
  DUMMY_SIGNALS,
  SIGNAL_SLIDES
} from "./state/homeConstants.js";
import {
  formatTimestamp,
  getCompanyInitials,
  getCompanyLogoUrl,
  sanitizeDescription
} from "./state/homeUtils.js";

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

  return (
    <div className="page page-home" ref={pageRef}>
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">AI Job Intelligence Platform</p>
          <h1 className="hero__title">
            Discover real MERN roles with verified signals and elite screening.
          </h1>
          <p className="hero__subtitle">
            Convert a single prompt into a curated stack map, live openings, and
            momentum signals. Built for freshers and early-career developers.
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
                placeholder={DEFAULT_PROMPT}
              />
              <button className="btn btn-primary" type="submit" disabled={isLoading}>
                {isLoading ? "Scanning..." : "Analyze"}
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

        <aside className="hero__panel">
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
              <strong>Smartsheet</strong>
              <span>Fresh analytics roles updated this week</span>
            </li>
            <li>
              <strong>Speechify</strong>
              <span>New grad roles open this week</span>
            </li>
          </ul>
          <div className="card__footer">
            <p>AI score: 91/100 for MERN freshness</p>
            <button type="button" className="btn btn-link" onClick={() => setShowReport(true)}>
              View full report
            </button>
          </div>
        </aside>
      </section>

      <section className="section" id="how">
        <div className="section-heading">
          <h2>How BeQuick Elite works</h2>
          <p>Designed to surface verified openings faster than generic boards.</p>
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
            <p>Track hiring signals and prioritize companies on the rise.</p>
          </article>
          <article className="feature-card">
            <h3>Actionable insights</h3>
            <p>Understand the stack requirements and tailor your prep precisely.</p>
          </article>
        </div>
      </section>

      <section className="section" id="signals">
        <div className="section-heading">
          <h2>Live intelligence signals</h2>
          <p>Animated snapshots highlighting what is trending right now.</p>
        </div>
        <Swiper
          modules={[Pagination, Autoplay]}
          className="elite-swiper"
          spaceBetween={16}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3200, disableOnInteraction: false }}
          breakpoints={{
            720: { slidesPerView: 2 },
            1100: { slidesPerView: 3 }
          }}
        >
          {SIGNAL_SLIDES.map((slide) => (
            <SwiperSlide key={slide.title}>
              <article className="signal-card animated-ui">
                <div className="signal-card__top">
                  <span className="signal-chip">Live</span>
                  <span className="signal-metric">{slide.metric}</span>
                </div>
                <h3>{slide.title}</h3>
                <p>{slide.detail}</p>
                <div className="signal-underline" />
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="section" id="companies">
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
          {results.map((item, index) => {
            const logoUrl = getCompanyLogoUrl(item);
            const initials = getCompanyInitials(item.companyName || "Company");

            return (
              <article className="result-card" key={item._id || index}>
                <div className="result-card__top">
                  <div>
                    <h3>{item.companyName || "Company"}</h3>
                    <p>{item.title}</p>
                  </div>
                  <div className="result-card__meta">
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
                    <span className="result-card__location">
                      {item.location || "India"}
                    </span>
                  </div>
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
                  {DUMMY_SIGNALS[index % DUMMY_SIGNALS.length]}
                </p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelectedJob(item)}
                >
                  View openings
                </button>
              </article>
            );
          })}
        </div>
        {results.length > 0 && results.length < total && (
          <div className="load-more">
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={() => fetchSearchResults(page + 1, true)}
            >
              {isLoading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>

      <section className="section" id="insights">
        <div className="insights">
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
            <button
              type="button"
              className="btn btn-primary full"
              onClick={() => setShowReport(true)}
            >
              Generate my report
            </button>
          </div>
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
