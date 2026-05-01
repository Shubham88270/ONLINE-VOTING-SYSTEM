import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  indigo: {
    name: 'Indigo',
    primary:   '#6366f1',
    secondary: '#8b5cf6',
    accent:    '#06b6d4',
    bg:        'from-slate-950 via-indigo-950 to-slate-900',
    sidebar:   'bg-indigo-900',
    badge:     'bg-indigo-600',
  },
  violet: {
    name: 'Violet',
    primary:   '#7c3aed',
    secondary: '#a855f7',
    accent:    '#ec4899',
    bg:        'from-slate-950 via-violet-950 to-slate-900',
    sidebar:   'bg-violet-900',
    badge:     'bg-violet-600',
  },
  cyan: {
    name: 'Cyan',
    primary:   '#0891b2',
    secondary: '#06b6d4',
    accent:    '#10b981',
    bg:        'from-slate-950 via-cyan-950 to-slate-900',
    sidebar:   'bg-cyan-900',
    badge:     'bg-cyan-600',
  },
  rose: {
    name: 'Rose',
    primary:   '#e11d48',
    secondary: '#f43f5e',
    accent:    '#f97316',
    bg:        'from-slate-950 via-rose-950 to-slate-900',
    sidebar:   'bg-rose-900',
    badge:     'bg-rose-600',
  },
  emerald: {
    name: 'Emerald',
    primary:   '#059669',
    secondary: '#10b981',
    accent:    '#06b6d4',
    bg:        'from-slate-950 via-emerald-950 to-slate-900',
    sidebar:   'bg-emerald-900',
    badge:     'bg-emerald-600',
  },
  amber: {
    name: 'Amber',
    primary:   '#d97706',
    secondary: '#f59e0b',
    accent:    '#ef4444',
    bg:        'from-slate-950 via-amber-950 to-slate-900',
    sidebar:   'bg-amber-900',
    badge:     'bg-amber-600',
  },
};

export const fontSizes = {
  sm:  { name: 'Small',   base: '13px', label: 'text-xs' },
  md:  { name: 'Medium',  base: '15px', label: 'text-sm' },
  lg:  { name: 'Large',   base: '17px', label: 'text-base' },
  xl:  { name: 'X-Large', base: '19px', label: 'text-lg' },
};

export const fontFamilies = {
  inter:   { name: 'Inter',    value: "'Inter', sans-serif" },
  poppins: { name: 'Poppins',  value: "'Poppins', sans-serif" },
  mono:    { name: 'Mono',     value: "'JetBrains Mono', monospace" },
  system:  { name: 'System',   value: "system-ui, sans-serif" },
};

export const ThemeProvider = ({ children }) => {
  const [theme,      setTheme]      = useState(() => localStorage.getItem('theme')      || 'indigo');
  const [fontSize,   setFontSize]   = useState(() => localStorage.getItem('fontSize')   || 'md');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'inter');
  const [darkMode,   setDarkMode]   = useState(() => localStorage.getItem('darkMode')   !== 'false');

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    const t = themes[theme];
    const r = document.documentElement;
    r.style.setProperty('--color-primary',   t.primary);
    r.style.setProperty('--color-secondary', t.secondary);
    r.style.setProperty('--color-accent',    t.accent);
    r.style.setProperty('--font-size-base',  fontSizes[fontSize].base);
    r.style.setProperty('--font-family',     fontFamilies[fontFamily].value);
    document.body.style.fontSize   = fontSizes[fontSize].base;
    document.body.style.fontFamily = fontFamilies[fontFamily].value;
    localStorage.setItem('theme',      theme);
    localStorage.setItem('fontSize',   fontSize);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('darkMode',   darkMode);
  }, [theme, fontSize, fontFamily, darkMode]);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, themes,
      fontSize, setFontSize, fontSizes,
      fontFamily, setFontFamily, fontFamilies,
      darkMode, setDarkMode,
      currentTheme: themes[theme],
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
