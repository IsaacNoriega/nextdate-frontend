import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { setAuthToken } from '../services/api';
import { loginApi, registerUserApi, User, LoginResult } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<LoginResult>;
  register: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar sesión persistida al inicializar la aplicación
  useEffect(() => {
    async function loadSavedSession() {
      try {
        const savedToken = await storageService.getToken();
        const savedUser = await storageService.getUser<User>();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          setAuthToken(savedToken);
        }
      } catch (err) {
        console.warn('Error al restaurar sesión:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedSession();
  }, []);

  const login = async (email: string, pass: string): Promise<LoginResult> => {
    const result = await loginApi(email, pass);
    setToken(result.token);
    setUser(result.user);
    setAuthToken(result.token);

    await storageService.setToken(result.token);
    await storageService.setUser(result.user);

    return result;
  };

  const register = async (email: string, pass: string): Promise<User> => {
    const registeredUser = await registerUserApi(email, pass);
    // Realizamos login automático tras el registro
    await login(email, pass);
    return registeredUser;
  };

  const logout = async (): Promise<void> => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    await storageService.clearAll();
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    setUser(updatedUser);
    await storageService.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
