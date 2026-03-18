import { Navigate } from "react-router-dom";
import { useAdminState } from "./hooks/useAdminState.js";
import { formatDate } from "./state/adminUtils.js";

export default function AdminPage() {
  const {
    pageRef,
    user,
    stats,
    toast,
    activity,
    sources,
    sourceFilters,
    setSourceFilters,
    sourceForm,
    setSourceForm,
    editingSourceId,
    sourcesLoading,
    sourcesError,
    jobs,
    jobQuery,
    setJobQuery,
    jobsLoading,
    jobsError,
    crawlLoading,
    loadSources,
    loadJobs,
    handleSourceSubmit,
    handleEditSource,
    handleDeleteSource,
    handleToggleSource,
    handleRunCrawl,
    handleExportSources,
    resetSourceForm
  } = useAdminState();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="page page-admin" ref={pageRef}>
        <section className="access-denied">
          <p className="eyebrow">Restricted</p>
          <h1>Admin access required</h1>
          <p>
            You are signed in as {user.email}. Switch to an admin account to view
            the control panel.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page page-admin" ref={pageRef}>
      <section className="admin-hero">
        <div className="admin-hero__copy">
          <div className="admin-hero__meta">
            <span>Elite control room</span>
            <span>Live operations</span>
          </div>
          <p className="eyebrow">Command center</p>
          <h1>Admin intelligence dashboard</h1>
          <p>
            Monitor crawler health, review source performance, and control the
            weekly data refresh cycles.
          </p>
        </div>
        <div className="admin-hero__panel">
          <div className="admin-hero__pulse">
            <strong>{stats?.jobs ?? "--"}</strong>
            <span>Live roles under watch</span>
          </div>
          <div className="admin-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleRunCrawl}
              disabled={crawlLoading}
            >
              {crawlLoading ? "Queueing..." : "Run priority crawl"}
            </button>
            <button className="btn btn-outline" type="button" onClick={handleExportSources}>
              Export sources
            </button>
          </div>
        </div>
      </section>

      <section className="admin-grid">
        <div className="admin-card">
          <p>Sources indexed</p>
          <h2>{stats?.sources ?? "--"}</h2>
          <span>Verified endpoints</span>
        </div>
        <div className="admin-card">
          <p>Active jobs</p>
          <h2>{stats?.jobs ?? "--"}</h2>
          <span>Live listings</span>
        </div>
        <div className="admin-card">
          <p>Companies tracked</p>
          <h2>{stats?.companies ?? "--"}</h2>
          <span>Global coverage</span>
        </div>
        <div className="admin-card">
          <p>System confidence</p>
          <h2>93%</h2>
          <span>Signal reliability</span>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__head">
          <div>
            <h2>Sources control</h2>
            <p>Add, edit, and prioritize crawl sources.</p>
          </div>
          <div className="admin-section__actions">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => loadSources()}
              disabled={sourcesLoading}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="source-grid">
          <form className="source-form" onSubmit={handleSourceSubmit}>
            <div className="form-field">
              Source name
              <input
                className="auth-input"
                type="text"
                value={sourceForm.name}
                onChange={(event) =>
                  setSourceForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Company or board name"
                required
              />
            </div>
            <div className="form-field">
              Website
              <input
                className="auth-input"
                type="url"
                value={sourceForm.website}
                onChange={(event) =>
                  setSourceForm((prev) => ({ ...prev, website: event.target.value }))
                }
                placeholder="https://company.com"
              />
            </div>
            <div className="form-field">
              Career page
              <input
                className="auth-input"
                type="url"
                value={sourceForm.careerPage}
                onChange={(event) =>
                  setSourceForm((prev) => ({ ...prev, careerPage: event.target.value }))
                }
                placeholder="https://company.com/careers"
              />
            </div>
            <div className="form-split">
              <label className="form-field">
                Type
                <select
                  className="auth-input"
                  value={sourceForm.sourceType}
                  onChange={(event) =>
                    setSourceForm((prev) => ({ ...prev, sourceType: event.target.value }))
                  }
                >
                  <option value="company">Company</option>
                  <option value="job-board">Job board</option>
                  <option value="directory">Directory</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="form-field">
                Region
                <input
                  className="auth-input"
                  type="text"
                  value={sourceForm.region}
                  onChange={(event) =>
                    setSourceForm((prev) => ({ ...prev, region: event.target.value }))
                  }
                  placeholder="APAC, US, EU"
                />
              </label>
            </div>
            <div className="form-field">
              Tags (comma separated)
              <input
                className="auth-input"
                type="text"
                value={sourceForm.tags}
                onChange={(event) =>
                  setSourceForm((prev) => ({ ...prev, tags: event.target.value }))
                }
                placeholder="engineering, data, product"
              />
            </div>
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={sourceForm.active}
                onChange={(event) =>
                  setSourceForm((prev) => ({ ...prev, active: event.target.checked }))
                }
              />
              Active source
            </label>
            {sourcesError && <p className="error-text">{sourcesError}</p>}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={sourcesLoading}>
                {editingSourceId ? "Update source" : "Add source"}
              </button>
              {editingSourceId && (
                <button className="btn btn-ghost" type="button" onClick={resetSourceForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="source-list">
            <div className="source-filters">
              <input
                className="auth-input"
                type="text"
                placeholder="Filter by region"
                value={sourceFilters.region}
                onChange={(event) =>
                  setSourceFilters((prev) => ({ ...prev, region: event.target.value }))
                }
              />
              <input
                className="auth-input"
                type="text"
                placeholder="Filter by tag"
                value={sourceFilters.tag}
                onChange={(event) =>
                  setSourceFilters((prev) => ({ ...prev, tag: event.target.value }))
                }
              />
              <select
                className="auth-input"
                value={sourceFilters.type}
                onChange={(event) =>
                  setSourceFilters((prev) => ({ ...prev, type: event.target.value }))
                }
              >
                <option value="">All types</option>
                <option value="company">Company</option>
                <option value="job-board">Job board</option>
                <option value="directory">Directory</option>
                <option value="other">Other</option>
              </select>
              <select
                className="auth-input"
                value={sourceFilters.active}
                onChange={(event) =>
                  setSourceFilters((prev) => ({ ...prev, active: event.target.value }))
                }
              >
                <option value="">All status</option>
                <option value="true">Active</option>
                <option value="false">Paused</option>
              </select>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => loadSources(sourceFilters)}
              >
                Apply filters
              </button>
            </div>

            {sourcesLoading ? (
              <p className="info-text">Loading sources...</p>
            ) : (
              <div className="source-table">
                {sources.map((source) => (
                  <div className="source-row" key={source._id}>
                    <div>
                      <h3>{source.name}</h3>
                      <p>{source.careerPage || source.website || "No URL set"}</p>
                      <div className="source-tags">
                        {(source.tags || []).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="source-meta">
                      <span className="pill">{source.sourceType}</span>
                      <span className="pill">{source.region || "Global"}</span>
                      <span className={source.active ? "status healthy" : "status attention"}>
                        {source.active ? "Active" : "Paused"}
                      </span>
                      <span className="meta">Last crawl: {formatDate(source.lastCrawledAt)}</span>
                    </div>
                    <div className="source-actions">
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => handleEditSource(source)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={() => handleToggleSource(source)}
                      >
                        {source.active ? "Pause" : "Activate"}
                      </button>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() => handleDeleteSource(source)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {!sources.length && !sourcesLoading && (
                  <p className="info-text">No sources found. Add one to get started.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__head">
          <div>
            <h2>Jobs monitor</h2>
            <p>Search and verify live openings fetched from the crawler.</p>
          </div>
          <div className="admin-section__actions">
            <input
              className="auth-input"
              type="text"
              placeholder="Search jobs"
              value={jobQuery}
              onChange={(event) => setJobQuery(event.target.value)}
            />
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadJobs(jobQuery)}
              disabled={jobsLoading}
            >
              {jobsLoading ? "Loading" : "Search"}
            </button>
          </div>
        </div>

        {jobsError && <p className="error-text">{jobsError}</p>}
        <div className="admin-table">
          <div className="table-body">
            {jobs.map((job) => (
              <div className="table-row table-row--job" key={job._id}>
                <div className="table-row__content">
                  <h3>{job.title}</h3>
                  <p>{job.companyName || "Unknown company"}</p>
                </div>
                <div className="table-row__meta">
                  <span className="pill pill--location">{job.location || "Location n/a"}</span>
                  <span className="pill pill--mode">{job.remoteType || "onsite"}</span>
                </div>
              </div>
            ))}
            {!jobs.length && !jobsLoading && (
              <p className="info-text">No jobs found for this query.</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="table-header">
          <h2>Operational status</h2>
          <p>Live feed from the crawler and analytics services.</p>
        </div>
        <div className="admin-table">
          <div className="table-body">
            {activity.map((item) => (
              <div className="table-row" key={item.title}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                <span className={`status ${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
