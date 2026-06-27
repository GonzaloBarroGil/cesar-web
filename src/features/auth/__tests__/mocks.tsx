import type { ReactNode } from "react";
import { AuthContext } from "../AuthContext";
import type { AuthState } from "../AuthContext";

interface WrapperProps {
  children: ReactNode;
  authState: Partial<AuthState>;
}

function MockAuthProvider({ children, authState }: WrapperProps) {
  const defaultState: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    login: async () => {},
    logout: () => {},
    ...authState,
  };

  return <AuthContext.Provider value={defaultState}>{children}</AuthContext.Provider>;
}

export { MockAuthProvider };
export type { AuthState };
