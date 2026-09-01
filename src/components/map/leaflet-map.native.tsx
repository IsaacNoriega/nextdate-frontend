import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export interface MapWaypoint {
  lat: number;
  lng: number;
  title: string;
  placeName?: string;
  stepNumber?: number;
}

interface LeafletMapNativeProps {
  waypoints: MapWaypoint[];
  activeStepIndex?: number;
  onSelectWaypoint?: (index: number) => void;
  showRoutingMachine?: boolean;
  showGeocoder?: boolean;
  userLocation?: { lat: number; lng: number };
  isDark?: boolean;
}

export default function LeafletMapNative({
  waypoints,
  activeStepIndex = 0,
  isDark = true,
}: LeafletMapNativeProps) {
  // Generate HTML for Leaflet + Leaflet Routing Machine + Nominatim Geocoder
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder@2.4.0/dist/Control.Geocoder.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
        <script src="https://unpkg.com/leaflet-control-geocoder@2.4.0/dist/Control.Geocoder.js"></script>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #0d0d0d; }
          #map { width: 100%; height: 100%; }
          .leaflet-routing-container {
            background-color: rgba(28, 28, 30, 0.95) !important;
            color: #ffffff !important;
            border-radius: 12px !important;
            padding: 10px !important;
            font-size: 12px !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${waypoints[0]?.lat ?? 20.6736}, ${waypoints[0]?.lng ?? -103.3698}], 14);
          L.tileLayer('${isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}', {
            maxZoom: 19
          }).addTo(map);

          L.Control.geocoder({ position: 'topleft', placeholder: 'Buscar dirección (Nominatim)...' }).addTo(map);

          const waypoints = ${JSON.stringify(waypoints.map((w) => ({ lat: w.lat, lng: w.lng })))};
          if (waypoints.length >= 2) {
            L.Routing.control({
              waypoints: waypoints.map(w => L.latLng(w.lat, w.lng)),
              router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'foot' }),
              lineOptions: { styles: [{ color: '#007AFF', opacity: 0.85, weight: 5 }] },
              show: true
            }).addTo(map);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <iframe
        srcDoc={htmlContent}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Leaflet Map Native View"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
