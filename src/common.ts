import type { LatLngLiteral } from "leaflet";

export interface LocationInfo {
  location: LatLngLiteral;
  displayName: string;
  streetname: string;
}
