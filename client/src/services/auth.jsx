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

  const register = useCallback(async ({ user: name, email, password }) => {
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim();
    const normalizedPassword = String(password || "");

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return { ok: false, error: "Name, email, and password are required." };
    }

    try {
      const response = await fetch(buildApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: normalizedName,
          email: normalizedEmail,
          password: normalizedPassword
        })
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create account");
      }

      return {
        ok: true,
        message: data?.message || "Account created. Check your email to verify your account."
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "Failed to create account"
      };
    }
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const normalizedEmail = String(email || "").trim();
      const normalizedPassword = String(password || "");

      if (!normalizedEmail || !normalizedPassword) {
        return { ok: false, error: "Email and password are required." };
      }

      try {
        const response = await fetch(buildApiUrl("/api/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: normalizedPassword
          })
        });
        const data = await readJson(response);

        if (!response.ok) {
          return {
            ok: false,
            requiresVerification: Boolean(data?.requiresVerification),
            error: data?.error || "Login failed"
          };
        }

        persistToken(data.token);
        setUser(data.user);

        return { ok: true, user: data.user };
      } catch (error) {
        return {
          ok: false,
          error: error?.message || "Login failed"
        };
      }
    },
    [persistToken]
  );

  const resendVerification = useCallback(async (email) => {
    const normalizedEmail = String(email || "").trim();

    if (!normalizedEmail) {
      return { ok: false, error: "Enter the email you used when signing up." };
    }

    try {
      const response = await fetch(buildApiUrl("/api/auth/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to resend verification email");
      }

      return {
        ok: true,
        message: data?.message || "Verification link sent."
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "Failed to resend verification email"
      };
    }
  }, []);

  const verifyEmail = useCallback(async (tokenToVerify) => {
    const normalizedToken = String(tokenToVerify || "").trim();

    if (!normalizedToken) {
      return { ok: false, error: "Verification token is missing." };
    }

    try {
      const response = await fetch(buildApiUrl("/api/auth/verify-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: normalizedToken })
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Verification failed");
      }

      return {
        ok: true,
        message: data?.message || "Email verified. You can log in now."
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "Verification failed"
      };
    }
  }, []);

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
      register,
      login,
      resendVerification,
      verifyEmail,
      logout
    }),
    [user, token, bootstrapped, register, login, resendVerification, verifyEmail, logout]
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
