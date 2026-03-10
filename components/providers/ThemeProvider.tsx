"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Toaster } from "react-hot-toast";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On mount, read saved preference
  useEffect(() => {
    const saved = localStorage.getItem("urhabit-theme") as Theme | null;
    const initial = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("urhabit-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  // Prevent flash: hide content until theme is resolved
  if (!mounted) {
    return <>{children}</>;
  }

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "#141414" : "#FFFFFF",
            color: isDark ? "#f5f5f5" : "#1a1a1a",
            border: `1px solid ${isDark ? "#2a2a2a" : "#E0D8CC"}`,
          },
          success: {
            iconTheme: { primary: isDark ? "#6b8c3a" : "#5A7832", secondary: isDark ? "#f5f5f5" : "#FFFFFF" },
          },
        }}
      />
    </ThemeContext.Provider>
  );
}
