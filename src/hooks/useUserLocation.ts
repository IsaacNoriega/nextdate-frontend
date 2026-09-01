import { useState, useEffect, useCallback } from 'react';
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

const DEFAULT_LOCATION: UserLocationState = {
  lat: 20.6736,
  lng: -103.3698,
  city: 'Guadalajara',
  state: 'Jalisco',
  country: 'México',
  formattedAddress: 'Guadalajara, Jal.',
  loading: false,
  error: null,
  permissionGranted: false,
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocationState>(DEFAULT_LOCATION);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (Platform.OS !== 'web') {
        const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const city = addr.city || addr.subregion || addr.district || 'Guadalajara';
          const state = addr.region || 'Jalisco';
          const country = addr.country || 'México';
          const shortState = state.replace('Jalisco', 'Jal.').replace('Nuevo León', 'N.L.').replace('Ciudad de México', 'CDMX');
          const formattedAddress = `${city}, ${shortState}`;

          setLocation({
            lat,
            lng,
            city,
            state,
            country,
            formattedAddress,
            loading: false,
            error: null,
            permissionGranted: true,
          });
          return;
        }
      }

      // Fallback web / OSM nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NextDateApp/1.0',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const city = address.city || address.town || address.village || address.suburb || 'Guadalajara';
        const state = address.state || 'Jalisco';
        const country = address.country || 'México';

        const shortState = state.replace('Jalisco', 'Jal.').replace('Nuevo León', 'N.L.').replace('Ciudad de México', 'CDMX');
        const formattedAddress = `${city}, ${shortState}`;

        setLocation({
          lat,
          lng,
          city,
          state,
          country,
          formattedAddress,
          loading: false,
          error: null,
          permissionGranted: true,
        });
      } else {
        setLocation((prev) => ({ ...prev, lat, lng, loading: false, permissionGranted: true }));
      }
    } catch (err) {
      console.log('Error reverse geocoding location:', err);
      setLocation((prev) => ({ ...prev, lat, lng, loading: false, permissionGranted: true }));
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
            error: 'Permiso de ubicación denegado.',
            permissionGranted: false,
          }));
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = currentLocation.coords;
        await reverseGeocode(latitude, longitude);
        return;
      }

      // Web handling
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            reverseGeocode(latitude, longitude);
          },
          (error) => {
            console.log('Geolocation error or permission denied:', error.message);
            setLocation((prev) => ({
              ...prev,
              loading: false,
              error: 'Permiso denegado o ubicación no disponible.',
              permissionGranted: false,
            }));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      } else {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: 'Geolocalización no soportada.',
        }));
      }
    } catch (error: any) {
      console.log('Error getting location:', error);
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al obtener la ubicación.',
        permissionGranted: false,
      }));
    }
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  return {
    ...location,
    requestUserLocation,
  };
}

