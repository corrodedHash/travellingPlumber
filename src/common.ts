import type { LatLngLiteral } from "leaflet";

export interface LocationInfo {
  location: LatLngLiteral;
  displayName: string;
  streetname: string;
}

// export const OSRM_URL = 'osrm.thasky.one'
export const OSRM_URL = 'router.project-osrm.org'