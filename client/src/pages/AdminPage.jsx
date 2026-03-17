import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import gsap from "gsap";
import { fetchStats } from "../services/api.js";
import {
  createSource,
  deleteSource,
  fetchCompanies,
  fetchJobs,
  fetchSources,
  runPriorityCrawl,
  updateSource
} from "../services/admin.js";
import { useAuth } from "../services/auth.jsx";

const emptySourceForm = {
  name: "",
  website: "",
  careerPage: "",
  sourceType: "company",
  region: "",
  tags: "",
  active: true
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString();
};

const parseTags = (value) =>
  String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const toCsv = (rows) =>
  rows
    .map((row) =>
      row
        .map((cell) => {
          const safe = String(cell ?? "").replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(",")
    )
    .join("\n");

export default function AdminPage() {
  const pageRef = useRef(null);
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState("");

  const [sources, setSources] = useState([]);
  const [sourceFilters, setSourceFilters] = useState({
    type: "",
    region: "",
    tag: "",
    active: ""
  });
  const [sourceForm, setSourceForm] = useState(emptySourceForm);
  const [editingSourceId, setEditingSourceId] = useState(null);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState("");

  const [jobs, setJobs] = useState([]);
  const [jobQuery, setJobQuery] = useState("");
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  const [companies, setCompanies] = useState([]);
  const [companyFilters, setCompanyFilters] = useState({
    type: "",
    industry: "",
    location: ""
  });
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState("");

  const [crawlLoading, setCrawlLoading] = useState(false);

  const activity = useMemo(
    () => [
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
    ],
    []
  );

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => setToast(""), 2800);
  };

  const loadStats = async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // Ignore stats errors on the UI.
    }
  };

  const loadSources = async (overrideFilters) => {
    setSourcesLoading(true);
    setSourcesError("");
    try {
      const params = { ...sourceFilters, ...overrideFilters, limit: 100 };
      const data = await fetchSources(token, params);
      setSources(data.sources || []);
    } catch (error) {
      setSourcesError(error.message || "Failed to load sources");
    } finally {
      setSourcesLoading(false);
    }
  };

  const loadJobs = async (overrideQuery) => {
    setJobsLoading(true);
    setJobsError("");
    try {
      const data = await fetchJobs(token, {
        q: overrideQuery ?? jobQuery,
        limit: 12,
        page: 1
      });
      setJobs(data.jobs || []);
    } catch (error) {
      setJobsError(error.message || "Failed to load jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  const loadCompanies = async (overrideFilters) => {
    setCompaniesLoading(true);
    setCompaniesError("");
    try {
      const params = { ...companyFilters, ...overrideFilters };
      const data = await fetchCompanies(token, params);
      setCompanies(data.companies || []);
    } catch (error) {
      setCompaniesError(error.message || "Failed to load companies");
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadSources();
    loadJobs();
    loadCompanies();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".admin-hero", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".admin-card", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 });
      gsap.from(".admin-section", { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

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

  const handleSourceSubmit = async (event) => {
    event.preventDefault();
    setSourcesError("");

    const payload = {
      name: sourceForm.name.trim(),
      website: sourceForm.website.trim(),
      careerPage: sourceForm.careerPage.trim(),
      sourceType: sourceForm.sourceType,
      region: sourceForm.region.trim(),
      tags: parseTags(sourceForm.tags),
      active: Boolean(sourceForm.active)
    };

    if (!payload.name) {
      setSourcesError("Source name is required.");
      return;
    }

    try {
      if (editingSourceId) {
        await updateSource(token, editingSourceId, payload);
        showToast("Source updated.");
      } else {
        await createSource(token, payload);
        showToast("Source created.");
      }
      setSourceForm(emptySourceForm);
      setEditingSourceId(null);
      loadSources();
    } catch (error) {
      setSourcesError(error.message || "Failed to save source");
    }
  };

  const handleEditSource = (source) => {
    setEditingSourceId(source._id);
    setSourceForm({
      name: source.name || "",
      website: source.website || "",
      careerPage: source.careerPage || "",
      sourceType: source.sourceType || "company",
      region: source.region || "",
      tags: (source.tags || []).join(", "),
      active: Boolean(source.active)
    });
  };

  const handleDeleteSource = async (source) => {
    const confirmed = window.confirm(`Delete source "${source.name}"?`);
    if (!confirmed) return;

    try {
      await deleteSource(token, source._id);
      showToast("Source deleted.");
      loadSources();
    } catch (error) {
      setSourcesError(error.message || "Failed to delete source");
    }
  };

  const handleToggleSource = async (source) => {
    try {
      await updateSource(token, source._id, {
        active: !source.active,
        tags: source.tags || []
      });
      loadSources();
    } catch (error) {
      setSourcesError(error.message || "Failed to update source");
    }
  };

  const handleRunCrawl = async () => {
    setCrawlLoading(true);
    try {
      const data = await runPriorityCrawl(token);
      showToast(`Queued ${data.queued ?? 0} sources for crawling.`);
    } catch (error) {
      showToast(error.message || "Failed to run crawl");
    } finally {
      setCrawlLoading(false);
    }
  };

  const handleExportSources = () => {
    if (!sources.length) {
      showToast("No sources to export.");
      return;
    }

    const rows = [
      ["Name", "Type", "Region", "Website", "Career Page", "Active", "Last Crawled"],
      ...sources.map((source) => [
        source.name,
        source.sourceType,
        source.region,
        source.website,
        source.careerPage,
        source.active ? "true" : "false",
        formatDate(source.lastCrawledAt)
      ])
    ];

    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bequick-sources-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page page-admin" ref={pageRef}>
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Command center</p>
          <h1>Admin intelligence dashboard</h1>
          <p>
            Monitor crawler health, review source performance, and control the
            weekly data refresh cycles.
          </p>
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
                placeholder="frontend, hiring, graduate"
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
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setEditingSourceId(null);
                    setSourceForm(emptySourceForm);
                  }}
                >
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
              <div className="table-row" key={job._id}>
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.companyName || "Unknown company"}</p>
                </div>
                <span className="pill">{job.location || "Location n/a"}</span>
                <span className="pill">{job.remoteType || "onsite"}</span>
              </div>
            ))}
            {!jobs.length && !jobsLoading && (
              <p className="info-text">No jobs found for this query.</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__head">
          <div>
            <h2>Companies overview</h2>
            <p>Quick view of companies indexed in the platform.</p>
          </div>
          <div className="admin-section__actions">
            <input
              className="auth-input"
              type="text"
              placeholder="Industry"
              value={companyFilters.industry}
              onChange={(event) =>
                setCompanyFilters((prev) => ({ ...prev, industry: event.target.value }))
              }
            />
            <input
              className="auth-input"
              type="text"
              placeholder="Location"
              value={companyFilters.location}
              onChange={(event) =>
                setCompanyFilters((prev) => ({ ...prev, location: event.target.value }))
              }
            />
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadCompanies(companyFilters)}
              disabled={companiesLoading}
            >
              {companiesLoading ? "Loading" : "Filter"}
            </button>
          </div>
        </div>

        {companiesError && <p className="error-text">{companiesError}</p>}
        <div className="admin-table">
          <div className="table-body">
            {companies.map((company) => (
              <div className="table-row" key={company._id}>
                <div>
                  <h3>{company.name}</h3>
                  <p>{company.industry || "Industry n/a"}</p>
                </div>
                <span className="pill">{company.companyType || "other"}</span>
                <span className="pill">{company.headquartersLocation || "Location n/a"}</span>
              </div>
            ))}
            {!companies.length && !companiesLoading && (
              <p className="info-text">No companies match the current filters.</p>
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
