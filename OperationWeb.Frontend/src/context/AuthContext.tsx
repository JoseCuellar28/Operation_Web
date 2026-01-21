import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, AuthState } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: false, // Start false, validate in effect
        isLoading: false,
        isInitialLoading: true, // App starts in loading state until token check
    });

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    // Token exists, verify it by fetching user
                    const user = await authService.getCurrentUser();
                    setState(s => ({
                        ...s,
                        user,
                        token: storedToken,
                        isAuthenticated: true,
                        isInitialLoading: false
                    }));
                } catch (error) {
                    console.warn("Session expired or invalid on init", error);
                    logout(); // Clears state and storage
                }
            } else {
                // No token, just stop loading
                setState(s => ({ ...s, isInitialLoading: false, isAuthenticated: false }));
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        setState(s => ({ ...s, isLoading: true }));
        try {
            // 1. Perform Login
            const { token, mustChangePassword } = await authService.login(credentials);

            // 2. Persist Token IMMEDIATELY (Critical Step)
            localStorage.setItem('token', token);

            // 3. Fetch User Details (with new token in place for interceptor)
            let user = null;
            if (!mustChangePassword) {
                try {
                    console.log('[AuthContext] Token persisted, fetching user...', token.substring(0, 10) + '...');
                    user = await authService.getCurrentUser();
                } catch (e) {
                    console.error("Login successful but failed to fetch user details", e);
                    // Decide if we want to proceed or fail. Proceeding allows dashboard access (partial).
                }
            }

            // 4. Update Global State (Only now trigger re-renders/redirects)
            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                isInitialLoading: false,
                mustChangePassword: !!mustChangePassword
            });
        } catch (error) {
            // On failure, ensure clean state
            localStorage.removeItem('token');
            setState(s => ({ ...s, isLoading: false, isAuthenticated: false }));
            throw error;
        }
    };

    const logout = () => {
        authService.logout(); // Clears localStorage
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialLoading: false,
        });
    };

    const updateUser = (user: User) => {
        setState(s => ({ ...s, user }));
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
            {!state.isInitialLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
