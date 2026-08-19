/**
 * Night hemisphere polygon for the globe view, from the closed-form
 * terminator. Pure math: no React, no MapLibre, no physics imports. The
 * caller supplies the subsolar point in degrees.
 */

const DEG = Math.PI / 180

/**
 * Web Mercator latitude limit (MapLibre ships the same 85.051129 figure).
 * Tiled GeoJSON beyond it has no mercator representation, so the polygon's
 * polar edge stops here instead of at the pole.
 */
export const MAX_MERCATOR_LAT_DEG = 85.051129

export type NightPolygon = {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    properties: { night: true }
    geometry: { type: 'Polygon'; coordinates: [number, number][][] }
  }[]
}

/**
 * Terminator boundary latitude [deg] at `lonDeg` for a subsolar point:
 * sin(lat)sin(latS) + cos(lat)cos(latS)cos(dLon) = 0 solved for lat.
 * `Math.atan` gives the unique root in (-90, 90) deg for a fixed meridian
 * half; IEEE-754 division by a signed zero saturates to +-90 deg, which
 * correctly degenerates to the equinox case (subsolar latitude 0) with no
 * separate branch.
 */
export function terminatorBoundaryLatDeg(
  lonDeg: number,
  subLatDeg: number,
  subLonDeg: number,
): number {
  const latS = subLatDeg * DEG
  const dLon = (lonDeg - subLonDeg) * DEG
  const sz = Math.sin(latS)
  const a = Math.cos(latS) * Math.cos(dLon)
  if (sz === 0 && a === 0) return 0
  return Math.atan(-a / sz) / DEG
}

function clampToMercator(latDeg: number): number {
  return Math.max(-MAX_MERCATOR_LAT_DEG, Math.min(MAX_MERCATOR_LAT_DEG, latDeg))
}

/**
 * Closed ring covering the dark hemisphere: the terminator curve sampled
 * from lon -180 to 180, closed along the polar edge of whichever pole is
 * in darkness. The pole opposite the subsolar hemisphere is always dark,
 * so the night side is south of the curve when the subsolar point is north
 * of (or on) the equator, and north of it otherwise.
 */
export function nightPolygon(
  subsolarLatDeg: number,
  subsolarLonDeg: number,
  steps = 180,
): NightPolygon {
  const southAnchored = Math.sin(subsolarLatDeg * DEG) >= 0
  const edgeLat = southAnchored ? -MAX_MERCATOR_LAT_DEG : MAX_MERCATOR_LAT_DEG
  const ring: [number, number][] = [[-180, edgeLat]]
  for (let i = 0; i <= steps; i++) {
    const lon = -180 + (360 * i) / steps
    ring.push([lon, clampToMercator(terminatorBoundaryLatDeg(lon, subsolarLatDeg, subsolarLonDeg))])
  }
  ring.push([180, edgeLat])
  ring.push([-180, edgeLat])
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { night: true },
        geometry: { type: 'Polygon', coordinates: [ring] },
      },
    ],
  }
}
