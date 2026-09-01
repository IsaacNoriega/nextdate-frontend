import { Platform } from 'react-native';

const TOKEN_KEY = 'nextdate_jwt_token';
const USER_KEY = 'nextdate_user_data';

// Storage universal con soporte para Web (localStorage) y Mobile
export const storageService = {
  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(TOKEN_KEY, token);
        }
      } else {
        // En entorno móvil nativo sin expo-secure-store instalado, usamos localStorage global o variable persistente
        if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
          (globalThis as any).localStorage.setItem(TOKEN_KEY, token);
        }
      }
    } catch (e) {
      console.warn('Error guardando token en storage:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(TOKEN_KEY);
        }
      } else {
        if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
          return (globalThis as any).localStorage.getItem(TOKEN_KEY);
        }
      }
    } catch (e) {
      console.warn('Error recuperando token de storage:', e);
    }
    return null;
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(TOKEN_KEY);
        }
      } else {
        if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
          (globalThis as any).localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch (e) {
      console.warn('Error eliminando token de storage:', e);
    }
  },

  async setUser(user: object): Promise<void> {
    try {
      const data = JSON.stringify(user);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(USER_KEY, data);
        }
      } else {
        if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
          (globalThis as any).localStorage.setItem(USER_KEY, data);
        }
      }
    } catch (e) {
      console.warn('Error guardando usuario en storage:', e);
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          raw = window.localStorage.getItem(USER_KEY);
        }
      } else {
        if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
          raw = (globalThis as any).localStorage.getItem(USER_KEY);
        }
      }
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch (e) {
      console.warn('Error recuperando usuario de storage:', e);
    }
    return null;
  },

  async removeUser(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(USER_KEY);
        }
      } else {
        if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
          (globalThis as any).localStorage.removeItem(USER_KEY);
        }
      }
    } catch (e) {
      console.warn('Error eliminando usuario de storage:', e);
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  },
};
