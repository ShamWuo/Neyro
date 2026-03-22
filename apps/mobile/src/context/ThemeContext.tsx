import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DARK_THEME, LIGHT_THEME } from '../constants';
import { useSettings } from '../hooks/useSettings';

type Theme = typeof DARK_THEME;

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void; // For quick debugging if needed
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const { settings } = useSettings();

    // Default to system, fallback to dark
    const [activeTheme, setActiveTheme] = useState<Theme>(DARK_THEME);

    useEffect(() => {
        let shouldBeDark = true;

        if (settings.theme === 'system') {
            shouldBeDark = systemColorScheme === 'dark';
        } else if (settings.theme === 'light') {
            shouldBeDark = false;
        } else {
            shouldBeDark = true;
        }

        setActiveTheme(shouldBeDark ? DARK_THEME : LIGHT_THEME);
    }, [settings.theme, systemColorScheme]);

    const value = {
        theme: activeTheme,
        isDark: activeTheme.isDark,
        toggleTheme: () => { }, // Handled via settings
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
