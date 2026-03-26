import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../../../services/auth.jsx";
import { useTheme } from "../../../services/theme.jsx";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
let googleScriptPromise = null;
let googleInitializedClientId = "";
let googleCredentialHandler = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  const existing = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existing) {
    if (existing.dataset.loaded === "true") {
      return Promise.resolve();
    }

    googleScriptPromise = new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener(
        "error",
        () => {
          googleScriptPromise = null;
          reject(new Error("Failed to load Google Sign-In script."));
        },
        { once: true }
      );
    });

    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error("Failed to load Google Sign-In script."));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

function ensureGoogleInitialized(clientId) {
  if (!window.google?.accounts?.id || !clientId) {
    return;
  }

  if (googleInitializedClientId === clientId) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (typeof googleCredentialHandler === "function") {
        googleCredentialHandler(response);
      }
    }
  });

  googleInitializedClientId = clientId;
}

export const useLoginState = () => {
  const pageRef = useRef(null);
  const googleButtonRef = useRef(null);
  const googleReadyRef = useRef(false);
  const isMountedRef = useRef(true);
  const resizeObserverRef = useRef(null);
  const renderGoogleButtonRef = useRef(() => {});
  const googleCallbackRef = useRef(async () => {});
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const delegatedGoogleHandler = useMemo(
    () => (response) => {
      void googleCallbackRef.current(response);
    },
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-panel", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".login-card", { y: 30, opacity: 0, duration: 0.8, delay: 0.1, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    googleCallbackRef.current = async (response) => {
      if (!isMountedRef.current) {
        return;
      }

      setError("");
      setInfo("");
      setLoading(true);

      const result = await loginWithGoogle(response?.credential);
      if (!isMountedRef.current) {
        return;
      }

      setLoading(false);

      if (!result.ok) {
        setError(result.error || "Google login failed");
        return;
      }

      const fallback = result.user?.role === "admin" ? "/admin" : "/";
      const intended = location.state?.from?.pathname;
      const target = intended && intended !== "/login" ? intended : fallback;
      navigate(target, { replace: true });
    };
  }, [location.state?.from?.pathname, loginWithGoogle, navigate]);

  useEffect(() => {
    renderGoogleButtonRef.current = () => {
      if (!googleButtonRef.current || !window.google?.accounts?.id) {
        return;
      }

      const buttonWidth = Math.max(
        220,
        Math.floor(googleButtonRef.current.getBoundingClientRect().width || 0)
      );
      const isCompact = buttonWidth < 320;

      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: theme === "alt" ? "outline" : "filled_black",
        size: isCompact ? "medium" : "large",
        shape: "rectangular",
        text: isCompact ? "signin_with" : "continue_with",
        logo_alignment: "left",
        width: buttonWidth
      });
    };
  }, [theme]);

  useEffect(() => {
    googleCredentialHandler = delegatedGoogleHandler;

    return () => {
      if (googleCredentialHandler === delegatedGoogleHandler) {
        googleCredentialHandler = null;
      }
    };
  }, [delegatedGoogleHandler]);

  useEffect(() => {
    let active = true;
    isMountedRef.current = true;

    const initializeGoogle = async () => {
      if (!googleClientId) {
        setError("Google login is not configured. Set VITE_GOOGLE_CLIENT_ID in the frontend env.");
        return;
      }

      try {
        await loadGoogleScript();
      } catch (scriptError) {
        if (!active) return;
        setError(scriptError?.message || "Failed to load Google Sign-In.");
        return;
      }

      if (!active || !googleButtonRef.current || !window.google?.accounts?.id) return;

      ensureGoogleInitialized(googleClientId);
      googleReadyRef.current = true;

      renderGoogleButtonRef.current();
      setError("");

      if (typeof window.ResizeObserver !== "undefined" && googleButtonRef.current) {
        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = new window.ResizeObserver(() => {
          renderGoogleButtonRef.current();
        });
        resizeObserverRef.current.observe(googleButtonRef.current);
      }

      setInfo("Use the Google account you want linked to your BeQuick profile.");
    };

    initializeGoogle();

    return () => {
      active = false;
      isMountedRef.current = false;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!googleReadyRef.current) {
      return;
    }

    renderGoogleButtonRef.current();
  }, [theme]);

  return {
    pageRef,
    googleButtonRef,
    error,
    info,
    loading
  };
};
