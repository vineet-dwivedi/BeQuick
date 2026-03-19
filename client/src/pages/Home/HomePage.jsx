import { useMemo } from "react";
import { useHomeState } from "./hooks/useHomeState.js";
import { DEFAULT_PROMPT } from "./state/homeConstants.js";
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  GlobeIcon,
  LayersIcon,
  MapPinIcon,
  SearchIcon,
  SparkIcon
} from "../../components/Icons/AppIcons.jsx";
import {
  formatTimestamp,
  getCompanyInitials,
  getCompanyLogoUrl,
  sanitizeDescription
} from "./state/homeUtils.js";

const QUICK_SEARCHES = [
  { label: "Software Engineer", value: "software engineer" },
  { label: "Backend Engineer", value: "backend engineer" },
  { label: "Frontend Engineer", value: "frontend engineer" },
  { label: "Full Stack Engineer", value: "full stack engineer" }
];

const FEATURED_BIG_COMPANIES = [
  {
    label: "Amazon",
    website: "https://www.amazon.com",
    careers: "https://www.amazon.jobs/en/"
  },
  {
    label: "Deloitte",
    website: "https://www.deloitte.com",
    careers: "https://apply.deloitte.com/en_US/careers/SearchJobs"
  },
  {
    label: "EY",
    website: "https://www.ey.com",
    careers: "https://careers.ey.com"
  },
  {
    label: "KPMG",
    website: "https://kpmg.com",
    careers: "https://www.kpmgcareers.co.uk/Vacancies"
  },
  {
    label: "PwC",
    website: "https://www.pwc.com",
    careers: "https://jobs.us.pwc.com/en/search-jobs"
  },
  {
    label: "LinkedIn",
    website: "https://www.linkedin.com",
    careers: "https://careers.smartrecruiters.com/LinkedIn3"
  },
  {
    label: "Google",
    website: "https://www.google.com",
    careers: "https://www.google.com/about/careers/applications/jobs/results/"
  },
  {
    label: "Microsoft",
    website: "https://www.microsoft.com",
    careers: "https://careers.microsoft.com/professionals/us/en/professions/"
  },
  {
    label: "Accenture",
    website: "https://www.accenture.com",
    careers: "https://www.accenture.com/careers"
  },
  {
    label: "Paychex",
    website: "https://www.paychex.com",
    careers: "https://careers.paychex.com/"
  },
  {
    label: "HCLTech",
    website: "https://www.hcltech.com",
    careers: "https://www.hcltech.com/careers"
  },
  {
    label: "JPMorgan Chase",
    website: "https://www.jpmorganchase.com",
    careers: "https://www.jpmorganchase.com/careers/explore-opportunities"
  },
  {
    label: "Cloudflare",
    website: "https://www.cloudflare.com",
    careers: "https://boards.greenhouse.io/embed/job_board?for=cloudflare"
  },
  {
    label: "Palantir",
    website: "https://www.palantir.com",
    careers: "https://jobs.lever.co/palantir"
  }
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
    emptyState,
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
        label: "Sources",
        icon: GlobeIcon
      },
      {
        value: stats?.jobs ?? "--",
        label: "Jobs",
        icon: BriefcaseIcon
      },
      {
        value: stats?.companies ?? "--",
        label: "Companies",
        icon: BuildingIcon
      }
    ],
    [stats]
  );

  const boardDetails = useMemo(
    () => [
      {
        label: "Focus",
        value: "Software engineering only"
      },
      {
        label: "Remote",
        value: includeRemote ? "Included" : "Hidden"
      },
      {
        label: "Last refresh",
        value: formatTimestamp(stats?.lastJobScrapedAt)
      },
      {
        label: "Search",
        value: prompt || DEFAULT_PROMPT
      }
    ],
    [includeRemote, prompt, stats]
  );

  const hasMoreResults = results.length > 0 && results.length < total;
  const emptyHeading =
    emptyState?.type === "company"
      ? "No jobs found for now"
      : "No software engineering jobs found";
  const emptyCopy =
    emptyState?.message ||
    "Try another software role, or search a different company to see current openings.";

  return (
    <div className="page page-home" ref={pageRef}>
      <section className="home-hero" id="overview">
        <div className="home-hero__main">
          <div className="home-hero__heading js-hero-line">
            <h1 className="home-hero__title">Software engineering jobs</h1>
            <p className="home-hero__subtitle">
              Search by role or company and review live openings fast.
            </p>
          </div>

          <form
            className="search-card js-hero-line"
            onSubmit={(event) => {
              event.preventDefault();
              fetchSearchResults(1, false);
            }}
          >
            <div className="search-card__head search-card__head--compact">
              <p className="search-card__label">
                <SearchIcon size={16} />
                <span>Search roles or companies</span>
              </p>
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
              <div className="search-card__field">
                <SearchIcon size={16} />
                <input
                  id="home-search"
                  type="text"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="software engineer or company name"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={isLoading}>
                <SearchIcon size={16} />
                <span>{isLoading ? "Searching..." : "Search"}</span>
              </button>
            </div>
          </form>

          {error && <p className="error-text">{error}</p>}
        </div>

        <aside className="home-hero__panel js-hero-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow">
                <SparkIcon size={14} />
                <span>Live board</span>
              </p>
              <h2>Market snapshot</h2>
            </div>
            <span className="panel-badge">
              {results.length ? `${results.length} live matches` : "Ready for search"}
            </span>
          </div>

          <div className="metric-grid">
            {commandMetrics.map((item) => (
              <article className="metric-card js-stagger-item" key={item.label}>
                <div className="metric-card__head">
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </div>
                <strong>{item.value}</strong>
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
              <BriefcaseIcon size={16} />
              <span>Jobs</span>
            </a>
            <button type="button" className="btn btn-primary" onClick={() => setShowReport(true)}>
              <LayersIcon size={16} />
              <span>Report</span>
            </button>
          </div>
        </aside>
      </section>

      <section className="home-section home-section--results js-reveal" id="companies">
        <div className="section-heading section-heading--split js-reveal-item">
          <div>
            <p className="eyebrow">
              <BriefcaseIcon size={14} />
              <span>Live roles</span>
            </p>
            <h2>Software jobs matched to your search</h2>
            <p>Fresh openings from tracked companies.</p>
          </div>
          <div className="results-summary">
            <span className="panel-badge">
              {includeRemote ? "Remote + onsite" : "Onsite only"}
            </span>
            <strong>{results.length ? `${results.length} of ${total} shown` : "No results yet"}</strong>
          </div>
        </div>

        <div className="featured-companies js-reveal-item">
          <div className="featured-companies__header">
            <p className="eyebrow">
              <BuildingIcon size={14} />
              <span>Big companies</span>
            </p>
            <span>Website and careers links</span>
          </div>
          <div className="featured-companies__grid">
            {FEATURED_BIG_COMPANIES.map((company) => (
              <article key={company.label} className="featured-company-card">
                <div className="featured-company-card__body">
                  <span className="featured-company-card__icon">
                    <BuildingIcon size={16} />
                  </span>
                  <strong>{company.label}</strong>
                </div>
                <div className="featured-company-card__actions">
                  <a
                    className="link-with-icon"
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GlobeIcon size={15} />
                    Website
                  </a>
                  <a
                    className="link-with-icon"
                    href={company.careers}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <BriefcaseIcon size={15} />
                    Careers
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        {relaxed && <p className="relaxed-note">Filters relaxed: {relaxed.join(", ")}</p>}

        {results.length > 0 ? (
          <div className="results-grid js-results">
            {results.map((item) => {
              const logoUrl = getCompanyLogoUrl(item);
              const initials = getCompanyInitials(item.companyName || "Company");

              return (
                <article className="result-card" key={item._id || item.jobUrl}>
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

                    <span className="result-card__location">
                      <MapPinIcon size={15} />
                      {item.location || "Location not listed"}
                    </span>
                  </div>

                  <div className="result-card__meta">
                    <span>{item.remoteType || "Onsite"}</span>
                    <span>{item.employmentType || "Full-time"}</span>
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
                      <a
                        className="link-with-icon"
                        href={item.companyWebsite}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <GlobeIcon size={15} />
                        Company
                      </a>
                    )}
                    {item.companyCareerPage && (
                      <a
                        className="link-with-icon"
                        href={item.companyCareerPage}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <BriefcaseIcon size={15} />
                        Careers
                      </a>
                    )}
                    {item.jobUrl && (
                      <a className="link-with-icon" href={item.jobUrl} target="_blank" rel="noreferrer">
                        <ArrowUpRightIcon size={15} />
                        Job
                      </a>
                    )}
                  </div>

                  <div className="result-card__footer">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setSelectedJob(item)}
                    >
                      <ArrowUpRightIcon size={15} />
                      <span>Details</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="results-empty js-reveal-item">
            <h3>{emptyHeading}</h3>
            <p>{emptyCopy}</p>
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

        {hasMoreResults && (
          <div className="load-more">
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={() => fetchSearchResults(page + 1, true)}
            >
              <ArrowUpRightIcon size={15} />
              <span>{isLoading ? "Loading..." : "Load more"}</span>
            </button>
          </div>
        )}
      </section>

      <section className="home-section js-reveal" id="insights">
        <div className="report-panel">
          <div className="report-panel__main js-reveal-item">
            <p className="eyebrow">
              <LayersIcon size={14} />
              <span>Report</span>
            </p>
            <h2>Quick snapshot</h2>
            <p>Counts, companies, and last refresh in one place.</p>

            <div className="report-panel__metrics">
              {commandMetrics.map((item) => (
                <article className="metric-card" key={item.label}>
                  <div className="metric-card__head">
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <aside className="report-panel__aside js-reveal-item">
            <h3>Summary</h3>
            <p className="report-panel__aside-copy">Use this before opening job details.</p>
            <button
              type="button"
              className="btn btn-primary full"
              onClick={() => setShowReport(true)}
            >
              <LayersIcon size={16} />
              <span>Open report</span>
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
                <p>Current software job snapshot</p>
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
                <p>{formatTimestamp(stats?.lastJobScrapedAt)}</p>
              </div>
            </div>
            <div className="report__tips">
              <h4>Suggested searches</h4>
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
