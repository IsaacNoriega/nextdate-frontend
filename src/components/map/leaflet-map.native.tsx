import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface MapWaypoint {
  lat: number;
  lng: number;
  title: string;
  placeName?: string;
  stepNumber?: number;
}

export interface MapClickEvent {
  lat: number;
  lng: number;
  address?: string;
}

interface LeafletMapNativeProps {
  waypoints: MapWaypoint[];
  activeStepIndex?: number;
  onSelectWaypoint?: (index: number) => void;
  onMapClick?: (event: MapClickEvent) => void;
  showRoutingMachine?: boolean;
  showGeocoder?: boolean;
  userLocation?: { lat: number; lng: number };
  isDark?: boolean;
}

export default function LeafletMapNative({
  waypoints,
  activeStepIndex = 0,
  onSelectWaypoint,
  onMapClick,
  showRoutingMachine = true,
  showGeocoder = false,
  userLocation,
  isDark = true,
}: LeafletMapNativeProps) {
  const webViewRef = useRef<WebView>(null);

  const initialLat = waypoints.length > 0 ? waypoints[0].lat : userLocation?.lat ?? 20.6736;
  const initialLng = waypoints.length > 0 ? waypoints[0].lng : userLocation?.lng ?? -103.3698;

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
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          #map { width: 100%; height: 100%; }
          .leaflet-routing-container {
            background-color: rgba(28, 28, 30, 0.95) !important;
            color: #ffffff !important;
            border-radius: 12px !important;
            padding: 10px !important;
            font-size: 12px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            max-width: 280px !important;
          }
          .custom-pin {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #007AFF;
            color: white;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          }
          .custom-pin.active {
            background: #FF2D55;
            transform: scale(1.15);
            box-shadow: 0 0 15px rgba(255, 45, 85, 0.6);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${initialLat}, ${initialLng}], 14);
          L.tileLayer('${isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}', {
            maxZoom: 19
          }).addTo(map);

          ${showGeocoder ? "L.Control.geocoder({ position: 'topleft', placeholder: 'Buscar lugar...' }).addTo(map);" : ''}

          const waypointsData = ${JSON.stringify(waypoints)};
          const activeIndex = ${activeStepIndex};

          waypointsData.forEach((w, idx) => {
            const isActive = idx === activeIndex;
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: '<div class="custom-pin ' + (isActive ? 'active' : '') + '">' + (w.stepNumber || (idx + 1)) + '</div>',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            const marker = L.marker([w.lat, w.lng], { icon: icon }).addTo(map);
            marker.on('click', () => {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClick', index: idx }));
              }
            });
          });

          ${
            showRoutingMachine && waypoints.length >= 2
              ? `
          L.Routing.control({
            waypoints: waypointsData.map(w => L.latLng(w.lat, w.lng)),
            router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'foot' }),
            lineOptions: { styles: [{ color: '#007AFF', opacity: 0.85, weight: 5 }] },
            show: false,
            createMarker: () => null
          }).addTo(map);
          `
              : ''
          }

          map.on('click', (e) => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                lat: e.latlng.lat,
                lng: e.latlng.lng
              }));
            }
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick' && onSelectWaypoint) {
        onSelectWaypoint(data.index);
      } else if (data.type === 'mapClick' && onMapClick) {
        onMapClick({ lat: data.lat, lng: data.lng });
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
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
  webView: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
});

