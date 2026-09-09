import * as THREE from "three";

/**
 * Real, calibrated 3D points on each aircraft model's actual mesh surface,
 * captured by right-clicking the rendered model in the corresponding camera
 * view (see aircraft-viewer.tsx's onAddPoint hit-testing). Replaces the
 * previous hand-guessed coordinates, which were never checked against the
 * real geometry and rendered damage markers floating off the aircraft.
 *
 * These are zone-level anchors, not per-defect coordinates: no defect record
 * stores a real X/Y/Z or ATA/station reference (only a free-text `location`
 * string), so every defect whose location matches the same keyword bucket
 * (e.g. two different "RH Inner Wing" defects) renders at the same point.
 */

export type AircraftModelKind = "SUKHOI" | "HORNET";
export type AircraftView = "TOP" | "LEFT" | "RIGHT" | "BOTTOM" | "FRONT" | "AFT";

export type ZoneKey =
  | "wingRH"
  | "wingLH"
  | "wingGeneric"
  | "fuselageForward"
  | "fuselageAft"
  | "fuselageGeneric"
  | "verticalTail"
  | "horizontalStabiliser"
  | "finCap"
  | "door"
  | "spar"
  | "rib"
  | "bulkhead"
  | "former"
  | "longeron"
  | "pylon";

type ZoneEntry = { pos: THREE.Vector3; view: AircraftView };

function zone(x: number, y: number, z: number, view: AircraftView): ZoneEntry {
  return { pos: new THREE.Vector3(x, y, z), view };
}

export const ZONE_CALIBRATION: Record<AircraftModelKind, Record<ZoneKey, ZoneEntry>> = {
  HORNET: {
    wingRH: zone(19.9, 3.39, 83.39, "RIGHT"),
    wingLH: zone(-19.9, 3.39, 83.39, "LEFT"),
    wingGeneric: zone(19.9, 3.39, 83.39, "TOP"),
    fuselageForward: zone(2.01, 6.25, 148.66, "FRONT"),
    fuselageAft: zone(-1.59, 2.9, -86.04, "AFT"),
    fuselageGeneric: zone(22.56, 7.77, -7.02, "LEFT"),
    verticalTail: zone(25.45, 38.26, -57.28, "AFT"),
    horizontalStabiliser: zone(15, 5, -65, "AFT"),
    finCap: zone(30, 55, -50, "AFT"),
    door: zone(22.56, 7.77, -7.02, "LEFT"),
    spar: zone(2.15, 6.66, 36.32, "TOP"),
    rib: zone(-6.34, 5.85, 48.2, "TOP"),
    bulkhead: zone(-1.59, 10, -80, "AFT"),
    former: zone(2.52, 13.18, 125.59, "FRONT"),
    longeron: zone(59.7, -10.9, 39.4, "LEFT"),
    pylon: zone(18.29, -10.34, -18.43, "RIGHT"),
  },
  SUKHOI: {
    wingRH: zone(88.34, 35.78, -39.52, "RIGHT"),
    wingLH: zone(-88.34, 35.78, -39.52, "LEFT"),
    wingGeneric: zone(88.34, 35.78, -39.52, "TOP"),
    fuselageForward: zone(2.62, 43.36, 108.01, "FRONT"),
    fuselageAft: zone(-1.54, 38.27, -101.2, "AFT"),
    fuselageGeneric: zone(11.11, 42.36, 70.39, "LEFT"),
    verticalTail: zone(29.42, 79.7, -79.32, "AFT"),
    horizontalStabiliser: zone(60, 35, -60, "AFT"),
    finCap: zone(35, 100, -75, "AFT"),
    door: zone(11.11, 42.36, 70.39, "LEFT"),
    spar: zone(26.82, 38.19, -3.39, "TOP"),
    rib: zone(27.31, 34.45, 44.02, "TOP"),
    bulkhead: zone(-1.54, 45, -95, "AFT"),
    former: zone(2.62, 43.36, 88, "FRONT"),
    longeron: zone(1.77, 19.49, 55.68, "LEFT"),
    pylon: zone(1.77, 5, 55.68, "RIGHT"),
  },
};
