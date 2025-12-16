import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, AuthState } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; confirmPassword?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      const data = await response.json();
      setState({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    setState({ user: data.user, isAuthenticated: true, isLoading: false });
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; confirmPassword?: string }) => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    const result = await response.json();
    setState({ user: result.user, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
