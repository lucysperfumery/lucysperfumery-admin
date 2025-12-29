import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "lucysperfumery_admin_auth";
const SESSION_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

// Check authentication status from localStorage
const checkAuth = (): boolean => {
  const authData = localStorage.getItem(AUTH_KEY);
  if (authData) {
    try {
      const { timestamp } = JSON.parse(authData);
      const now = Date.now();

      if (now - timestamp < SESSION_DURATION) {
        return true;
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
  }
  return false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuth());

  const login = (password: string): boolean => {
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (password === correctPassword) {
      const authData = {
        timestamp: Date.now(),
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
