/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Marker {
    constructor(options: { map?: Map; position: LatLng; image?: MarkerImage });
    setMap(map: Map | null): void;
  }

  class MarkerImage {
    constructor(src: string, size: Size);
  }

  class Size {
    constructor(width: number, height: number);
  }

  class InfoWindow {
    constructor(options: { content: string; removable?: boolean });
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  class CustomOverlay {
    constructor(options: { content: string; position: LatLng; map?: Map; yAnchor?: number });
    setMap(map: Map | null): void;
  }

  function load(callback: () => void): void;

  namespace services {
    class Places {
      categorySearch(
        code: string,
        callback: (result: PlaceResult[], status: Status) => void,
        options?: { location?: LatLng; radius?: number; sort?: any }
      ): void;
    }

    interface PlaceResult {
      id: string;
      place_name: string;
      address_name: string;
      road_address_name: string;
      phone: string;
      x: string;
      y: string;
      distance: string;
    }

    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    const SortBy: { DISTANCE: any };
  }
}

interface Window {
  kakao: typeof kakao;
}
