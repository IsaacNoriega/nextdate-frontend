import { Platform } from 'react-native';

const TOKEN_KEY = 'nextdate_jwt_token';
const USER_KEY = 'nextdate_user_data';

// In-memory fallback map for environments without native/web storage (Node/SSR/Jest)
const memoryStorage = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage.getItem(key);
  }
  return memoryStorage.get(key) ?? null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
    return;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    (globalThis as any).localStorage.setItem(key, value);
    return;
  }
  memoryStorage.set(key, value);
}

function removeStorageItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
    return;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    (globalThis as any).localStorage.removeItem(key);
    return;
  }
  memoryStorage.delete(key);
}

const LOCATION_KEY = 'nextdate_saved_location';

export interface SavedLocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
}

// Storage universal con soporte para Web (localStorage), Mobile y Node/Jest fallback
export const storageService = {
  async setLocation(location: SavedLocationData): Promise<void> {
    try {
      setStorageItem(LOCATION_KEY, JSON.stringify(location));
    } catch (e) {
      console.warn('Error guardando ubicación en storage:', e);
    }
  },

  async getLocation(): Promise<SavedLocationData | null> {
    try {
      const raw = getStorageItem(LOCATION_KEY);
      if (raw) {
        return JSON.parse(raw) as SavedLocationData;
      }
    } catch (e) {
      console.warn('Error recuperando ubicación de storage:', e);
    }
    return null;
  },

  async removeLocation(): Promise<void> {
    try {
      removeStorageItem(LOCATION_KEY);
    } catch (e) {
      console.warn('Error eliminando ubicación de storage:', e);
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      setStorageItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Error guardando token en storage:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return getStorageItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Error recuperando token de storage:', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      removeStorageItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Error eliminando token de storage:', e);
    }
  },

  async setUser(user: object): Promise<void> {
    try {
      setStorageItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Error guardando usuario en storage:', e);
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      const raw = getStorageItem(USER_KEY);
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
      removeStorageItem(USER_KEY);
    } catch (e) {
      console.warn('Error eliminando usuario de storage:', e);
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
    await this.removeLocation();
  },
};
