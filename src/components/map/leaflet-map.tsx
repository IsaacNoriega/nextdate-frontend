import React from 'react';
import { Platform } from 'react-native';
import LeafletMapWeb, { MapWaypoint, MapClickEvent } from './leaflet-map.web';
import LeafletMapNative from './leaflet-map.native';

export { MapWaypoint, MapClickEvent };

export interface LeafletMapProps {
  waypoints: MapWaypoint[];
  activeStepIndex?: number;
  onSelectWaypoint?: (index: number) => void;
  onMapClick?: (event: MapClickEvent) => void;
  showRoutingMachine?: boolean;
  showGeocoder?: boolean;
  userLocation?: { lat: number; lng: number };
  isDark?: boolean;
}

export default function LeafletMap(props: LeafletMapProps) {
  if (Platform.OS === 'web') {
    return <LeafletMapWeb {...props} />;
  }
  return <LeafletMapNative {...props} />;
}
