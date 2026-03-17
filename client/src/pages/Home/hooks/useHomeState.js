import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { fetchStats, searchJobs } from "../../../services/api.js";
import { DEFAULT_PROMPT } from "../state/homeConstants.js";

export const useHomeState = () => {
  const pageRef = useRef(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
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

  const fetchSearchResults = useCallback(
    async (nextPage = 1, append = false, overridePrompt) => {
      try {
        setError("");
        setIsLoading(true);
        const effectivePrompt =
          typeof overridePrompt === "string" && overridePrompt.trim().length > 0
            ? overridePrompt
            : prompt;

        const data = await searchJobs({
          prompt: effectivePrompt,
          includeRemote,
          page: nextPage,
          limit
        });

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
    },
    [includeRemote, limit, prompt]
  );

  const applyPromptAndSearch = useCallback(
    (value) => {
      setPrompt(value);
      fetchSearchResults(1, false, value);
    },
    [fetchSearchResults]
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch {
        // Ignore stats errors on the UI.
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero__eyebrow", { y: 24, opacity: 0, duration: 0.6 });
      gsap.from(".hero__title", { y: 30, opacity: 0, duration: 0.8, delay: 0.1 });
      gsap.from(".hero__subtitle", { y: 20, opacity: 0, duration: 0.8, delay: 0.2 });
      gsap.from(".hero__actions", { y: 24, opacity: 0, duration: 0.8, delay: 0.3 });
      gsap.from(".hero__panel", { y: 28, opacity: 0, duration: 0.9, delay: 0.35 });
      gsap.from(".feature-card", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.5
      });
      gsap.from(".elite-swiper .swiper-slide", {
        y: 26,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.6
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return {
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
  };
};