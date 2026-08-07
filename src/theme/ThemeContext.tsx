import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { C } from "./colors";
import { fetchThemeConfig, DEFAULT_THEME } from "../services/themeApi";
import type { ThemeConfig } from "../types";

/**
 * ThemeContext expõe duas coisas:
 *  - `C`      → paleta fixa do design system (não customizável pelo cliente)
 *  - `theme`  → cores customizáveis pelo cliente via API (header/sidebar/footer/login/conteúdo)
 *
 * Uso em qualquer componente:
 *   const { theme } = useTheme();
 *   <header style={{ backgroundColor: theme.headerBg }}>
 */
interface ThemeContextValue {
  theme: ThemeConfig;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  loading: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    fetchThemeConfig().then((config) => {
      if (ativo) {
        setTheme(config);
        setLoading(false);
      }
    });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { C };
