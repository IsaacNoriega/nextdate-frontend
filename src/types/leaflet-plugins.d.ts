declare module 'leaflet-routing-machine' {
  import * as L from 'leaflet';

  namespace Routing {
    interface RoutingControlOptions extends L.ControlOptions {
      waypoints?: L.LatLng[];
      router?: any;
      plan?: any;
      geocoder?: any;
      fitSelectedRoutes?: boolean | string;
      lineOptions?: {
        styles?: L.PathOptions[];
        extendToWaypoints?: boolean;
        missingRouteStyles?: L.PathOptions[];
      };
      routeWhileDragging?: boolean;
      routeDragInterval?: number;
      addWaypoints?: boolean;
      show?: boolean;
      collapsible?: boolean;
      autoRoute?: boolean;
      showAlternatives?: boolean;
    }

    function control(options?: RoutingControlOptions): L.Control;
    function osrmv1(options?: any): any;
  }

  export function control(options?: Routing.RoutingControlOptions): L.Control;
}

declare module 'leaflet-control-geocoder' {
  import * as L from 'leaflet';

  namespace Control {
    interface GeocoderOptions {
      defaultMarkGeocode?: boolean;
      placeholder?: string;
      errorMessage?: string;
      geocoder?: any;
      position?: L.ControlPosition;
      collapsed?: boolean;
      expand?: string;
    }

    class Geocoder extends L.Control {
      constructor(options?: GeocoderOptions);
    }

    function geocoder(options?: GeocoderOptions): Geocoder;

    namespace Geocoders {
      class Nominatim {
        constructor(options?: any);
      }
      function nominatim(options?: any): Nominatim;
    }
  }

  export function geocoder(options?: Control.GeocoderOptions): Control.Geocoder;
  export namespace Geocoders {
    class Nominatim {
      constructor(options?: any);
    }
    function nominatim(options?: any): Nominatim;
  }
}
