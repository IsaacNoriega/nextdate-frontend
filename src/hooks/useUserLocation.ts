import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { storageService, SavedLocationData } from '../services/storage';

export interface UserLocationState {
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

const DEFAULT_FALLBACK: UserLocationState = {
  lat: 20.6736,
  lng: -103.3698,
  city: 'Guadalajara',
  state: 'Jalisco',
  country: 'México',
  formattedAddress: 'Guadalajara, Jalisco',
  loading: false,
  error: null,
  permissionGranted: false,
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocationState>(DEFAULT_FALLBACK);
  const isFetchedRef = useRef(false);

  // 1. Cargar ubicación previamente guardada en storage local
  useEffect(() => {
    storageService.getLocation().then((saved) => {
      if (saved && saved.lat && saved.lng) {
        setLocation((prev) => ({
          ...prev,
          lat: saved.lat,
          lng: saved.lng,
          city: saved.city,
          state: saved.state,
          country: saved.country,
          formattedAddress: saved.formattedAddress,
          permissionGranted: true,
        }));
      }
    });
  }, []);

  const saveLocationToStorage = async (data: SavedLocationData) => {
    await storageService.setLocation(data);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (Platform.OS !== 'web') {
        const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const city = addr.city || addr.subregion || addr.district || 'Ubicación Actual';
          const state = addr.region || 'Jalisco';
          const country = addr.country || 'México';
          const formattedAddress = state ? `${city}, ${state}` : city;

          const newState = {
            lat,
            lng,
            city,
            state,
            country,
            formattedAddress,
          };

          setLocation((prev) => ({
            ...prev,
            ...newState,
            loading: false,
            error: null,
            permissionGranted: true,
          }));

          await saveLocationToStorage(newState);
          return;
        }
      }

      // Web nominatim reverse geocoding con alta precisión
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const city =
          address.city ||
          address.town ||
          address.municipality ||
          address.suburb ||
          address.county ||
          'Guadalajara';
        const state = address.state || 'Jalisco';
        const country = address.country || 'México';
        const formattedAddress = state ? `${city}, ${state}` : city;

        const newState = {
          lat,
          lng,
          city,
          state,
          country,
          formattedAddress,
        };

        setLocation((prev) => ({
          ...prev,
          ...newState,
          loading: false,
          error: null,
          permissionGranted: true,
        }));

        await saveLocationToStorage(newState);
      }
    } catch (err) {
      console.warn('Error in reverse geocoding:', err);
    }
  };

  const requestUserLocation = useCallback(async () => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocation((prev) => ({
            ...prev,
            loading: false,
            error: 'Permiso de ubicación denegado en el dispositivo.',
            permissionGranted: false,
          }));
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = currentLocation.coords;
        await reverseGeocode(latitude, longitude);
        return;
      }

      // Web HTML5 Geolocation (Nativo del Navegador)
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await reverseGeocode(latitude, longitude);
          },
          (error) => {
            console.warn('Browser Geolocation error:', error.message);
            setLocation((prev) => ({
              ...prev,
              loading: false,
              error: 'Permiso denegado en el navegador.',
              permissionGranted: false,
            }));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      } else {
        setLocation((prev) => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      console.warn('Error solicitando ubicación:', error);
      setLocation((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const setManualLocation = async (
    lat: number,
    lng: number,
    formattedAddress: string,
    city = 'Guadalajara',
    state = 'Jalisco'
  ) => {
    const data: SavedLocationData = {
      lat,
      lng,
      city,
      state,
      country: 'México',
      formattedAddress,
    };
    setLocation((prev) => ({
      ...prev,
      ...data,
      loading: false,
      error: null,
      permissionGranted: true,
    }));
    await saveLocationToStorage(data);
  };

  useEffect(() => {
    if (!isFetchedRef.current) {
      isFetchedRef.current = true;
      requestUserLocation();
    }
  }, [requestUserLocation]);

  return {
    ...location,
    requestUserLocation,
    setManualLocation,
  };
}
