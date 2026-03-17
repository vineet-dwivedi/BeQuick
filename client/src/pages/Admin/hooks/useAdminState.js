import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { fetchStats } from "../../../services/api.js";
import {
  createSource,
  deleteSource,
  fetchCompanies,
  fetchJobs,
  fetchSources,
  runPriorityCrawl,
  updateSource
} from "../../../services/admin.js";
import { useAuth } from "../../../services/auth.jsx";
import {
  ACTIVITY_FEED,
  DEFAULT_COMPANY_FILTERS,
  DEFAULT_SOURCE_FILTERS,
  EMPTY_SOURCE_FORM
} from "../state/adminConstants.js";
import { formatDate, parseTags, toCsv } from "../state/adminUtils.js";

export const useAdminState = () => {
  const pageRef = useRef(null);
  const toastTimer = useRef(null);
  const { user, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState("");

  const [sources, setSources] = useState([]);
  const [sourceFilters, setSourceFilters] = useState({ ...DEFAULT_SOURCE_FILTERS });
  const [sourceForm, setSourceForm] = useState({ ...EMPTY_SOURCE_FORM });
  const [editingSourceId, setEditingSourceId] = useState(null);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState("");

  const [jobs, setJobs] = useState([]);
  const [jobQuery, setJobQuery] = useState("");
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  const [companies, setCompanies] = useState([]);
  const [companyFilters, setCompanyFilters] = useState({ ...DEFAULT_COMPANY_FILTERS });
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState("");

  const [crawlLoading, setCrawlLoading] = useState(false);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // Ignore stats errors on the UI.
    }
  }, []);

  const loadSources = useCallback(
    async (overrideFilters) => {
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
    },
    [sourceFilters, token]
  );

  const loadJobs = useCallback(
    async (overrideQuery) => {
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
    },
    [jobQuery, token]
  );

  const loadCompanies = useCallback(
    async (overrideFilters) => {
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
    },
    [companyFilters, token]
  );

  useEffect(() => {
    loadStats();
    loadSources();
    loadJobs();
    loadCompanies();
  }, [loadCompanies, loadJobs, loadSources, loadStats]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".admin-hero", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".admin-card", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 });
      gsap.from(".admin-section", { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const resetSourceForm = useCallback(() => {
    setEditingSourceId(null);
    setSourceForm({ ...EMPTY_SOURCE_FORM });
  }, []);

  const handleSourceSubmit = useCallback(
    async (event) => {
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
        resetSourceForm();
        loadSources();
      } catch (error) {
        setSourcesError(error.message || "Failed to save source");
      }
    },
    [editingSourceId, loadSources, resetSourceForm, showToast, sourceForm, token]
  );

  const handleEditSource = useCallback((source) => {
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
  }, []);

  const handleDeleteSource = useCallback(
    async (source) => {
      const confirmed = window.confirm(`Delete source "${source.name}"?`);
      if (!confirmed) return;

      try {
        await deleteSource(token, source._id);
        showToast("Source deleted.");
        loadSources();
      } catch (error) {
        setSourcesError(error.message || "Failed to delete source");
      }
    },
    [loadSources, showToast, token]
  );

  const handleToggleSource = useCallback(
    async (source) => {
      try {
        await updateSource(token, source._id, {
          active: !source.active,
          tags: source.tags || []
        });
        loadSources();
      } catch (error) {
        setSourcesError(error.message || "Failed to update source");
      }
    },
    [loadSources, token]
  );

  const handleRunCrawl = useCallback(async () => {
    setCrawlLoading(true);
    try {
      const data = await runPriorityCrawl(token);
      showToast(`Queued ${data.queued ?? 0} sources for crawling.`);
    } catch (error) {
      showToast(error.message || "Failed to run crawl");
    } finally {
      setCrawlLoading(false);
    }
  }, [showToast, token]);

  const handleExportSources = useCallback(() => {
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
  }, [showToast, sources]);

  return {
    pageRef,
    user,
    stats,
    toast,
    activity: ACTIVITY_FEED,
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
    companies,
    companyFilters,
    setCompanyFilters,
    companiesLoading,
    companiesError,
    crawlLoading,
    loadSources,
    loadJobs,
    loadCompanies,
    handleSourceSubmit,
    handleEditSource,
    handleDeleteSource,
    handleToggleSource,
    handleRunCrawl,
    handleExportSources,
    resetSourceForm
  };
};