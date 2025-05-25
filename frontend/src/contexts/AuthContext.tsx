import { Loading } from "@/components/ui/loading";
import { IUser } from "@/types/apiTypes";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => void;
  authToken: string | null;
  user: IUser;
  login: (user: IUser, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setAuthToken(token);
    }
    setLoading(false);
  }, []);
  const verifyUser = (user: IUser) => {
    setUser(user);
    setIsAuthenticated(true);
    setIsAdmin(user.is_admin);
  };
  const login = (user: IUser, token?: string) => {
    setUser(user);
    setIsAuthenticated(true);
    setIsAdmin(user.is_admin);
    if (token) {
      localStorage.setItem("auth_token", token);
      setAuthToken(token);
    }
  };
  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        setIsAdmin,
        logout,
        authToken,
        user,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
