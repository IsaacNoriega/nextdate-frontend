import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';

// Ensure Leaflet CSS & Plugin CSS are injected into document head on web
if (typeof document !== 'undefined') {
  const cssUrls = [
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css',
    'https://unpkg.com/leaflet-control-geocoder@2.4.0/dist/Control.Geocoder.css',
  ];

  cssUrls.forEach((url) => {
    if (!document.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
  });

  const styleId = 'nextdate-leaflet-overrides';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.innerHTML = `
      .leaflet-container {
        width: 100%;
        height: 100%;
        background-color: #0d0d0d !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }
      .leaflet-routing-container {
        background-color: rgba(28, 28, 30, 0.95) !important;
        color: #ffffff !important;
        border-radius: 12px !important;
        padding: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(10px) !important;
        max-width: 320px !important;
        font-size: 12px !important;
      }
      .leaflet-routing-alt {
        max-height: 180px !important;
        overflow-y: auto !important;
        color: #e5e5ea !important;
      }
      .leaflet-routing-alt table tr:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
      }
      .leaflet-control-geocoder {
        background: #1c1c1e !important;
        color: #ffffff !important;
        border-radius: 10px !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
      }
      .leaflet-control-geocoder-form input {
        color: #ffffff !important;
        background: transparent !important;
      }
      .leaflet-control-geocoder-icon {
        filter: invert(1) !important;
      }
      .leaflet-control-geocoder-throbber .leaflet-control-geocoder-icon {
        filter: invert(1) !important;
      }
      .leaflet-control-geocoder-expanded .leaflet-control-geocoder-form {
        padding: 4px 8px !important;
      }
      .leaflet-control-geocoder-alternatives {
        background: #1c1c1e !important;
        border-color: #2c2c2e !important;
      }
      .leaflet-control-geocoder-alternatives a {
        color: #ffffff !important;
      }
      .leaflet-control-geocoder-alternatives a:hover {
        background-color: #2c2c2e !important;
      }
    `;
    document.head.appendChild(styleTag);
  }
}

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

interface LeafletMapWebProps {
  waypoints: MapWaypoint[];
  activeStepIndex?: number;
  onSelectWaypoint?: (index: number) => void;
  onMapClick?: (event: MapClickEvent) => void;
  showRoutingMachine?: boolean;
  showGeocoder?: boolean;
  userLocation?: { lat: number; lng: number };
  isDark?: boolean;
}

// Custom Leaflet Pin Icon generator
const createPinIcon = (stepNum: number, isActive: boolean) => {
  const bg = isActive ? '#007AFF' : '#ffffff';
  const textColor = isActive ? '#ffffff' : '#007AFF';
  const border = isActive ? '#ffffff' : '#007AFF';
  const scale = isActive ? 1.2 : 1;

  const html = `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${bg};
      border: 2.5px solid ${border};
      color: ${textColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      transform: scale(${scale});
      transition: transform 0.2s ease;
    ">
      ${stepNum}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Clicked location pin icon
const clickedPinIcon = L.divIcon({
  html: `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #FF2D55;
      border: 3px solid #ffffff;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(255,45,85,0.5);
    ">
      📍
    </div>
  `,
  className: 'clicked-leaflet-pin',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// User GPS icon
const userGpsIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,122,255,0.3); animation: pulse 2s infinite;"></div>
      <div style="width: 14px; height: 14px; border-radius: 50%; background: #007AFF; border: 2.5px solid #ffffff; z-index: 2;"></div>
    </div>
  `,
  className: 'user-gps-icon',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export default function LeafletMapWeb({
  waypoints,
  activeStepIndex = 0,
  onSelectWaypoint,
  onMapClick,
  showRoutingMachine = true,
  showGeocoder = true,
  userLocation,
  isDark = true,
}: LeafletMapWebProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const clickedMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<any>(null);
  const geocoderControlRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Initialize Map instance
    if (!mapRef.current) {
      const initialLat = waypoints[0]?.lat ?? userLocation?.lat ?? 20.6736;
      const initialLng = waypoints[0]?.lng ?? userLocation?.lng ?? -103.3698;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Map Click Listener
    map.off('click');
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (clickedMarkerRef.current) {
        clickedMarkerRef.current.setLatLng([lat, lng]);
      } else {
        clickedMarkerRef.current = L.marker([lat, lng], { icon: clickedPinIcon }).addTo(map);
      }

      let addressName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            addressName = parts.slice(0, 3).join(',').trim();
          }
        }
      } catch (err) {
        console.log('Error reverse geocoding map click:', err);
      }

      clickedMarkerRef.current.bindPopup(`<b>${addressName}</b>`).openPopup();

      if (onMapClick) {
        onMapClick({ lat, lng, address: addressName });
      }
    });

    // Update User GPS Marker & map center
    if (userLocation && userLocation.lat && userLocation.lng) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userGpsIcon })
          .addTo(map)
          .bindPopup('<b>Tu ubicación actual</b>');
      }

      if (!waypoints || waypoints.length === 0) {
        map.setView([userLocation.lat, userLocation.lng], map.getZoom() || 14);
      }
    }

    // Nominatim Geocoder Integration
    if (showGeocoder && !geocoderControlRef.current) {
      const geocoder = (L.Control as any).geocoder({
        defaultMarkGeocode: true,
        placeholder: 'Buscar dirección (Nominatim)...',
        errorMessage: 'No se encontró la dirección.',
        position: 'topleft',
      }).addTo(map);

      geocoder.on('markgeocode', (e: any) => {
        if (e && e.geocode && onMapClick) {
          const center = e.geocode.center;
          const name = e.geocode.name || e.geocode.html || '';
          onMapClick({ lat: center.lat, lng: center.lng, address: name });
        }
      });

      geocoderControlRef.current = geocoder;
    }

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add Waypoint Markers
    if (waypoints && waypoints.length > 0) {
      const latLngs: L.LatLng[] = [];

      waypoints.forEach((wp, idx) => {
        const isActive = idx === activeStepIndex;
        const icon = createPinIcon(wp.stepNumber ?? idx + 1, isActive);
        const marker = L.marker([wp.lat, wp.lng], { icon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: system-ui; color: #1c1c1e;">
            <b style="font-size: 14px;">Paso ${wp.stepNumber ?? idx + 1}: ${wp.title}</b><br/>
            <span style="font-size: 12px; color: #666;">${wp.placeName || ''}</span>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectWaypoint) onSelectWaypoint(idx);
        });

        markersRef.current.push(marker);
        latLngs.push(L.latLng(wp.lat, wp.lng));
      });

      // Fit bounds to waypoints
      if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (latLngs.length === 1) {
        map.setView(latLngs[0], 15);
      }

      // Leaflet Routing Machine Integration (OSRM Motor)
      if (showRoutingMachine && latLngs.length >= 2) {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }

        const leafletAny = L as any;
        const routingControl = leafletAny.Routing.control({
          waypoints: latLngs,
          router: leafletAny.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'foot',
          }),
          lineOptions: {
            styles: [{ color: '#007AFF', opacity: 0.85, weight: 5 }],
          },
          show: true,
          addWaypoints: false,
          routeWhileDragging: false,
          fitSelectedRoutes: true,
          collapsible: true,
        }).addTo(map);

        routingControlRef.current = routingControl;
      }
    }
  }, [waypoints, activeStepIndex, isDark, showRoutingMachine, showGeocoder, userLocation, onMapClick, onSelectWaypoint]);

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
