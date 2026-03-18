import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildApiUrl } from "./apiBase.js";

const AuthContext = createContext(null);

const getStoredToken = () => window.localStorage.getItem("auth_token") || "";

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const persistToken = useCallback((nextToken) => {
    if (nextToken) {
      window.localStorage.setItem("auth_token", nextToken);
    } else {
      window.localStorage.removeItem("auth_token");
    }
    setToken(nextToken || "");
  }, []);

  const fetchMe = useCallback(
    async (authToken) => {
      if (!authToken) return null;

      try {
        const response = await fetch(buildApiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await readJson(response);

        if (response.ok) {
          setUser(data.user);
          return data.user;
        }

        persistToken("");
        setUser(null);
        return null;
      } catch {
        persistToken("");
        setUser(null);
        return null;
      }
    },
    [persistToken]
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!token) {
        setUser(null);
        if (active) setBootstrapped(true);
        return;
      }

      await fetchMe(token);
      if (active) setBootstrapped(true);
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [token, fetchMe]);

  const loginWithGoogle = useCallback(
    async (credential) => {
      const normalizedCredential = String(credential || "").trim();
      if (!normalizedCredential) {
        return { ok: false, error: "Google credential is missing." };
      }

      try {
        const response = await fetch(buildApiUrl("/api/auth/google"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: normalizedCredential })
        });
        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(data?.error || "Google login failed");
        }

        persistToken(data.token);
        setUser(data.user);

        return { ok: true, user: data.user };
      } catch (error) {
        const message =
          error?.message === "Failed to fetch"
            ? "Unable to reach the server. Check that the backend is running and the API URL is correct."
            : error?.message || "Google login failed";

        return {
          ok: false,
          error: message
        };
      }
    },
    [persistToken]
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(buildApiUrl("/api/auth/logout"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // Ignore logout errors.
    } finally {
      persistToken("");
      setUser(null);
    }
  }, [token, persistToken]);

  const value = useMemo(
    () => ({
      user,
      token,
      bootstrapped,
      loginWithGoogle,
      logout
    }),
    [user, token, bootstrapped, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
