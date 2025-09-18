import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme store for managing application theme (light/dark)
 * Uses persist middleware to save theme preference in localStorage
 */
export const useTheme = create(
  persist(
    (set) => ({
      // Default theme is light, but we'll check system preference on init
      theme: 'light',
      
      // Set theme directly
      setTheme: (theme) => {
        set({ theme });
        // Apply theme class to document element
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      // Toggle between light and dark themes
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          
          // Apply theme class to document element
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return { theme: newTheme };
        });
      },
      
      // Initialize theme based on system preference
      initTheme: () => {
        set((state) => {
          // If theme is already set in store, use that
          if (state.theme) {
            if (state.theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
            return {};
          }
          
          // Otherwise check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const theme = prefersDark ? 'dark' : 'light';
          
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
          
          return { theme };
        });
      },
    }),
    {
      name: 'gsc-theme', // localStorage key
    }
  )
);

// Initialize theme when this module is imported
if (typeof window !== 'undefined') {
  useTheme.getState().initTheme();
}