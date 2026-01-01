'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        // Redirect logic after auth check is complete
        if (!isLoading) {
            const isPublicRoute = publicRoutes.some(route => pathname === route);

            // Ne pas rediriger si on est déjà sur login ou homepage
            if (!user && !isPublicRoute && !pathname?.startsWith('/login')) {
                console.log('AuthProvider: Redirecting to login');
                router.push('/login');
            }
        }
    }, [isLoading, user, pathname]);

    const checkAuth = async () => {
        try {
            const storedToken = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('user');

            if (!storedToken || !storedUser) {
                setIsLoading(false);
                return;
            }

            // Verify token with server
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setToken(storedToken);
                setUser(data.user);
            } else {
                // Token invalid, clear storage
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    };

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
