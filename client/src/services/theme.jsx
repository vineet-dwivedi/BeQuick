import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "ui_theme";
const DEFAULT_THEME = "default";
const THEME_ASSETS = {
  default: {
    favicon: "/favicon-dark.svg?v=1",
    themeColor: "#12100d"
  },
  alt: {
    favicon: "/favicon-light.svg?v=1",
    themeColor: "#f8f0e3"
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);

    const assets = THEME_ASSETS[theme] || THEME_ASSETS[DEFAULT_THEME];
    const faviconLink = document.querySelector("link[rel='icon']");
    const themeColorMeta = document.querySelector("meta[name='theme-color']");

    if (faviconLink) {
      faviconLink.setAttribute("href", assets.favicon);
    }

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", assets.themeColor);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "default" ? "alt" : "default"));
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
