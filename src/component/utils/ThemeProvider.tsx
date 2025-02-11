import React, { createContext, useState, ReactNode } from 'react';
import { lightTheme, darkTheme } from './theme';

// Define the theme type
interface ThemeContextProps {
  theme: typeof lightTheme;
  toggleTheme: () => void;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Theme provider component
const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme: isDarkMode ? darkTheme : lightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
