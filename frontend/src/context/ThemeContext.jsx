import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference - Data Preserved
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Add a transition class to root during theme switch for a premium feel
    root.classList.add('theme-transition');
    
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Clean up transition class
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [darkMode]);

  // Listen for system theme changes - Logic Preserved
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const setTheme = (theme) => {
    setDarkMode(theme === 'dark');
  };

  // Memoizing value for best performance in a large app
  const value = useMemo(() => ({
    darkMode,
    toggleTheme,
    setTheme,
  }), [darkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Best View styling: Add this to your global CSS or a style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .theme-transition,
    .theme-transition *,
    .theme-transition *:before,
    .theme-transition *:after {
      transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease !important;
      transition-delay: 0s !important;
    }
  `;
  document.head.appendChild(style);
}

export { useTheme };