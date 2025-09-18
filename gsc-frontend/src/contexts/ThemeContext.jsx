import React, { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

/**
 * Theme provider component
 * Manages application theme (light/dark)
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Initialize theme on mount
  useEffect(() => {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('gsc-theme');
    
    if (savedTheme) {
      // Use saved theme
      setTheme(savedTheme);
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      
      setTheme(initialTheme);
      localStorage.setItem('gsc-theme', initialTheme);
      
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Set theme
  const setThemeValue = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('gsc-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeValue(newTheme);
  };

  // Context value
  const value = {
    theme,
    setTheme: setThemeValue,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};