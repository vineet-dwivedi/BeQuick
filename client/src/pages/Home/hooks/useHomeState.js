import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchStats, searchJobs } from "../../../services/api.js";
import { DEFAULT_PROMPT } from "../state/homeConstants.js";

gsap.registerPlugin(ScrollTrigger);

const shouldReduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  const [emptyState, setEmptyState] = useState(null);
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
        setEmptyState(data.emptyState || null);
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
    if (shouldReduceMotion()) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const heroTimeline = gsap.timeline({
        defaults: { duration: 0.76, ease: "power3.out" }
      });

      heroTimeline
        .from(".js-hero-line", {
          y: 28,
          autoAlpha: 0,
          stagger: 0.1
        })
        .from(
          ".js-hero-card .js-stagger-item",
          {
            y: 18,
            autoAlpha: 0,
            duration: 0.48,
            stagger: 0.06
          },
          "-=0.34"
        )
        .from(
          ".js-hero-card",
          {
            y: 28,
            autoAlpha: 0,
            duration: 0.82,
            stagger: 0.12
          },
          "-=0.46"
        );

      gsap.utils.toArray(".js-reveal").forEach((section) => {
        const items = Array.from(section.querySelectorAll(".js-reveal-item"));

        if (!items.length) {
          return;
        }

        gsap.from(items, {
          y: 24,
          autoAlpha: 0,
          duration: 0.72,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true
          }
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!results.length || shouldReduceMotion()) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const cards = gsap.utils
        .toArray(".js-results .result-card")
        .filter((card) => !card.dataset.animated);

      if (!cards.length) {
        return;
      }

      cards.forEach((card) => {
        card.dataset.animated = "true";
      });

      gsap.from(cards, {
        y: 26,
        autoAlpha: 0,
        duration: 0.52,
        stagger: 0.06,
        ease: "power3.out",
        clearProps: "all"
      });
    }, pageRef);

    return () => ctx.revert();
  }, [results.length]);

  useEffect(() => {
    if (!(selectedJob || showReport) || shouldReduceMotion()) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.from(".modal__card", {
        y: 24,
        autoAlpha: 0,
        duration: 0.34,
        ease: "power2.out"
      });
    }, pageRef);

    return () => ctx.revert();
  }, [selectedJob, showReport]);

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
    emptyState,
    selectedJob,
    setSelectedJob,
    showReport,
    setShowReport,
    fetchSearchResults,
    applyPromptAndSearch
  };
};
