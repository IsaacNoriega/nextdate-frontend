import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

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
  city: 'Detectando ubicación...',
  state: '',
  country: 'México',
  formattedAddress: 'Obteniendo GPS...',
  loading: true,
  error: null,
  permissionGranted: false,
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocationState>(DEFAULT_FALLBACK);
  const isFetchedRef = useRef(false);

  const fetchIpFallbackLocation = async () => {
    try {
      // Intentar servicio IP gratuito 1: freeipapi.com
      const res = await fetch('https://freeipapi.com/api/json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const city = data.cityName || 'Mi Ciudad';
          const state = data.regionName || '';
          const country = data.countryName || 'México';
          const formattedAddress = state ? `${city}, ${state}` : city;

          setLocation((prev) => ({
            ...prev,
            lat: Number(data.latitude),
            lng: Number(data.longitude),
            city,
            state,
            country,
            formattedAddress,
            loading: false,
            permissionGranted: true,
            error: null,
          }));
          return true;
        }
      }
    } catch (e) {
      console.log('IP fallback 1 failed, trying fallback 2:', e);
    }

    try {
      // Intentar servicio IP fallback 2: ipapi.co
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const city = data.city || 'Mi Ciudad';
          const state = data.region || '';
          const country = data.country_name || 'México';
          const formattedAddress = state ? `${city}, ${state}` : city;

          setLocation((prev) => ({
            ...prev,
            lat: Number(data.latitude),
            lng: Number(data.longitude),
            city,
            state,
            country,
            formattedAddress,
            loading: false,
            permissionGranted: true,
            error: null,
          }));
          return true;
        }
      }
    } catch (e) {
      console.log('IP fallback 2 failed:', e);
    }
    return false;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (Platform.OS !== 'web') {
        const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const city = addr.city || addr.subregion || addr.district || 'Ubicación Actual';
          const state = addr.region || '';
          const country = addr.country || 'México';
          const formattedAddress = state ? `${city}, ${state}` : city;

          setLocation((prev) => ({
            ...prev,
            lat,
            lng,
            city,
            state,
            country,
            formattedAddress,
            loading: false,
            error: null,
            permissionGranted: true,
          }));
          return;
        }
      }

      // Web nominatim reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const city = address.city || address.town || address.village || address.suburb || address.county || 'Ubicación Actual';
        const state = address.state || '';
        const country = address.country || 'México';
        const formattedAddress = state ? `${city}, ${state}` : city;

        setLocation((prev) => ({
          ...prev,
          lat,
          lng,
          city,
          state,
          country,
          formattedAddress,
          loading: false,
          error: null,
          permissionGranted: true,
        }));
      }
    } catch (err) {
      console.log('Error in reverse geocoding:', err);
    }
  };

  const requestUserLocation = useCallback(async () => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          const ipOk = await fetchIpFallbackLocation();
          if (!ipOk) {
            setLocation((prev) => ({
              ...prev,
              loading: false,
              error: 'Permiso de ubicación denegado.',
              permissionGranted: false,
            }));
          }
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = currentLocation.coords;
        setLocation((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          loading: false,
          permissionGranted: true,
          error: null,
        }));
        reverseGeocode(latitude, longitude);
        return;
      }

      // Web Geolocation
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation((prev) => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              loading: false,
              permissionGranted: true,
              error: null,
            }));
            reverseGeocode(latitude, longitude);
          },
          async (error) => {
            console.log('HTML5 Geolocation error:', error.message, 'Trying IP fallback...');
            const ipOk = await fetchIpFallbackLocation();
            if (!ipOk) {
              setLocation((prev) => ({
                ...prev,
                loading: false,
                error: 'Permiso denegado o ubicación no disponible.',
                permissionGranted: false,
              }));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 30000,
          }
        );
      } else {
        await fetchIpFallbackLocation();
      }
    } catch (error: any) {
      console.log('Error getting location:', error);
      await fetchIpFallbackLocation();
    }
  }, []);

  useEffect(() => {
    if (!isFetchedRef.current) {
      isFetchedRef.current = true;
      requestUserLocation();
    }
  }, [requestUserLocation]);

  return {
    ...location,
    requestUserLocation,
  };
}
