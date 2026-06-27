import { apiClient, loginClient } from "@/api/client";
import { loginRequestSchema, loginResponseSchema } from "@/api/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  role: "ADMIN" | "ACCOUNTANT";
  consorcio_id: string | null;
  nombre_completo: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "cesar_token";

const AuthContext = createContext<AuthState | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = useCallback(async (storedToken: string) => {
    try {
      const data = await apiClient<User>({
        url: "/auth/me",
        method: "GET",
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setUser(data as User);
      setIsLoading(false);
    } catch {
      clearToken();
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      validateSession(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [validateSession]);

  const login = useCallback(async (username: string, password: string) => {
    const body = loginRequestSchema.parse({ username, password });
    try {
      const data = await loginClient<{ token: string; user: User }>({
        url: "/auth/login",
        method: "POST",
        data: body,
      });
      const parsed = loginResponseSchema.parse(data);
      storeToken(parsed.token);
      setToken(parsed.token);
      setUser(parsed.user as User);
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 401) {
          throw new Error("Credenciales inválidas. Verifique usuario y contraseña.");
        }
      }
      throw new Error("Error de conexión. Intente nuevamente.");
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext, AuthProvider, useAuth };
export type { User, AuthState };
