'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
const Ctx = createContext<{ theme: Theme; toggle: () => void; dark: boolean }>({
  theme: 'light', toggle: () => {}, dark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server renders 'light'. The pre-hydration <script> in layout.tsx sets
  // the .dark class before paint when needed (avoids FOUC). We sync our
  // React state to that authoritative class on mount.
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const saved = localStorage.getItem('siyoh-theme') as Theme | null;
    setTheme(saved || (isDark ? 'dark' : 'light'));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('siyoh-theme', theme);
  }, [theme, mounted]);

  return (
    <Ctx.Provider value={{ theme, dark: theme === 'dark', toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
