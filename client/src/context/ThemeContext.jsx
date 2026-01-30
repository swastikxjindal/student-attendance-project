import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import API from '../api/axios';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();

    // Initial theme: Fallback order -> User DB Preference -> LocalStorage -> Default 'theme-light'
    const [theme, setThemeState] = useState('light');

    // Sync theme from user object when they log in
    useEffect(() => {
        if (user?.theme) {
            setThemeState(user.theme);
        } else {
            const saved = localStorage.getItem('theme');
            if (saved) setThemeState(saved);
        }
    }, [user?.id, user?.theme]);

    // Apply theme to DOM and LocalStorage
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('theme-light', 'theme-slate', 'theme-indigo', 'theme-midnight', 'theme-emerald');
        root.classList.add(`theme-${theme}`);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Wrapper function to update theme in state and database
    const setTheme = async (newTheme) => {
        setThemeState(newTheme);

        // If user is logged in, persist to database
        if (user?.id) {
            try {
                await API.patch('/auth/theme', { theme: newTheme });

                // Also update local user object to keep it in sync
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    storedUser.theme = newTheme;
                    localStorage.setItem('user', JSON.stringify(storedUser));
                }
            } catch (error) {
                console.error('Failed to persist theme to database:', error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
