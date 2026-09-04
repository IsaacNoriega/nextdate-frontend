import { Linking, Platform } from 'react-native';

/**
 * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine.
 */
export function calculateDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formatea la distancia calculada en metros o kilómetros.
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm <= 0) return 'Cerca de ti';
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}

/**
 * Estima el tiempo de traslado según distancia en auto o a pie.
 */
export function estimateTravelTime(distanceInKm: number): string {
  if (distanceInKm <= 0) return 'Inmediato';
  if (distanceInKm < 1.5) {
    const walkingMinutes = Math.max(2, Math.round(distanceInKm * 12));
    return `${walkingMinutes} min caminando`;
  }
  const drivingMinutes = Math.max(3, Math.round(distanceInKm * 2.8));
  return `${drivingMinutes} min en auto`;
}

/**
 * Abre la navegación en la aplicación de mapas nativa del dispositivo (Google Maps, Apple Maps o Waze).
 */
export function openExternalMaps(lat: number, lng: number, label?: string) {
  const destination = `${lat},${lng}`;
  const encodedLabel = encodeURIComponent(label || 'Destino NextDate');

  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${destination}`,
    android: `geo:0,0?q=${destination}(${encodedLabel})`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  });

  if (url) {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
        }
      })
      .catch(() => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
      });
  }
}
