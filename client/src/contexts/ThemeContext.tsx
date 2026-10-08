import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'warm';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'zx_theme_mode';

/** 终端主题：全站只有一套配色，恒为 dark。
 *  保留 light/warm 类型是为了兼容历史 localStorage 值与既有调用方。 */
const ACTIVE_MODE: ThemeMode = 'dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode] = useState<ThemeMode>(ACTIVE_MODE);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    // 兼容依赖 .dark 类名的组件（Tailwind dark: 变体）
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((_next: ThemeMode) => {
    // 终端主题单一配色，不支持切换
  }, []);

  const toggleMode = useCallback(() => {
    // 终端主题单一配色，不支持切换
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
