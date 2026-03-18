import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../../../services/auth.jsx";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function loadGoogleScript() {
  const existing = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existing) {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In script."));
    document.head.appendChild(script);
  });
}

export const useLoginState = () => {
  const pageRef = useRef(null);
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-panel", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".login-card", { y: 30, opacity: 0, duration: 0.8, delay: 0.1, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let active = true;

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

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setError("");
          setInfo("");
          setLoading(true);

          const result = await loginWithGoogle(response?.credential);
          if (!active) return;

          setLoading(false);

          if (!result.ok) {
            setError(result.error || "Google login failed");
            return;
          }

          const fallback = result.user?.role === "admin" ? "/admin" : "/";
          const intended = location.state?.from?.pathname;
          const target = intended && intended !== "/login" ? intended : fallback;
          navigate(target, { replace: true });
        }
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: googleButtonRef.current.offsetWidth || 320
      });
      setInfo("Use the Google account you want linked to your BeQuick profile.");
    };

    initializeGoogle();

    return () => {
      active = false;
    };
  }, [location.state?.from?.pathname, loginWithGoogle, navigate]);

  return {
    pageRef,
    googleButtonRef,
    error,
    info,
    loading
  };
};
