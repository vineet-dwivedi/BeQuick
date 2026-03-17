import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getStoredToken = () => window.localStorage.getItem("auth_token") || "";

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
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await response.json();

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

  const requestOtp = useCallback(async (email) => {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) {
      return { ok: false, error: "Please enter a valid email." };
    }

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send OTP");
      }

      return {
        ok: true,
        devCode: data?.devCode || "",
        cooldown: Boolean(data?.cooldown),
        message: data?.message || "OTP sent to your email."
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "Failed to send OTP"
      };
    }
  }, []);

  const verifyOtp = useCallback(
    async (email, code) => {
      const normalizedEmail = String(email || "").trim();
      const cleanedCode = String(code || "").replace(/\s+/g, "");

      if (!normalizedEmail || !cleanedCode) {
        return { ok: false, error: "Enter the code sent to your email." };
      }

      try {
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            code: cleanedCode
          })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "OTP verification failed");
        }

        persistToken(data.token);
        setUser(data.user);
        return { ok: true, user: data.user };
      } catch (error) {
        return {
          ok: false,
          error: error?.message || "OTP verification failed"
        };
      }
    },
    [persistToken]
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch("/api/auth/logout", {
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
      requestOtp,
      verifyOtp,
      logout
    }),
    [user, token, bootstrapped, requestOtp, verifyOtp, logout]
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
