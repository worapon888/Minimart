"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const COOKIE_NAME = "active_theme";
const DEFAULT_THEME = "minimal";

const THEME_MAP: Record<string, string> = {
  default: "minimal",
  blue: "minimal",
  green: "minimal",
  amber: "minimal",
  "default-scaled": "minimal-scaled",
  "blue-scaled": "minimal-scaled",
};

function normalizeTheme(theme?: string) {
  if (!theme) return DEFAULT_THEME;
  return THEME_MAP[theme] ?? theme;
}

function setThemeCookie(theme: string) {
  if (typeof window === "undefined") return;

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
    window.location.protocol === "https:" ? "Secure;" : ""
  }`;
}

type ThemeContextType = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: string;
}) {
  const [activeTheme, setActiveTheme] = useState<string>(
    () => normalizeTheme(initialTheme)
  );

  useEffect(() => {
    setThemeCookie(activeTheme);

    Array.from(document.body.classList)
      .filter((className) => className.startsWith("theme-"))
      .forEach((className) => {
        document.body.classList.remove(className);
      });
    document.body.classList.add(`theme-${activeTheme}`);
    if (activeTheme.endsWith("-scaled")) {
      document.body.classList.add("theme-scaled");
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "useThemeConfig must be used within an ActiveThemeProvider"
    );
  }
  return context;
}
