import { describe, expect, it } from 'vitest'
import { eciSiToGeodetic, sunEciSi } from '@/lib/physics'
import { MAX_MERCATOR_LAT_DEG, nightPolygon, terminatorBoundaryLatDeg } from './terminator'

/** Subsolar point [deg] from the same physics the tools feed the globe. */
function subsolarAt(date: Date): { lat: number; lon: number } {
  const g = eciSiToGeodetic(sunEciSi(date), date)
  if (!g) throw new Error('subsolar point unavailable')
  return { lat: g.latDeg, lon: g.lonDeg }
}

function wrapLon(lonDeg: number): number {
  return ((((lonDeg + 180) % 360) + 360) % 360) - 180
}

/** Ray casting on the polygon's single ring, in the lon/lat plane. */
function isInsidePolygon(ring: [number, number][], lon: number, lat: number): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const straddles = yi > lat !== yj > lat
    if (straddles && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const CASES: { name: string; date: Date }[] = [
  { name: 'March equinox', date: new Date('2026-03-20T14:46:00Z') },
  { name: 'June solstice', date: new Date('2026-06-21T08:24:00Z') },
  { name: 'mid-season date', date: new Date('2026-05-05T03:17:00Z') },
]

describe('night terminator polygon', () => {
  for (const { name, date } of CASES) {
    it(`puts the antisolar point inside and the subsolar point outside at ${name}`, () => {
      const sub = subsolarAt(date)
      const ring = nightPolygon(sub.lat, sub.lon).features[0].geometry.coordinates[0]

      expect(isInsidePolygon(ring, wrapLon(sub.lon + 180), -sub.lat)).toBe(true)
      expect(isInsidePolygon(ring, wrapLon(sub.lon), sub.lat)).toBe(false)
    })

    it(`keeps the ring closed and inside the mercator latitude limit at ${name}`, () => {
      const sub = subsolarAt(date)
      const ring = nightPolygon(sub.lat, sub.lon).features[0].geometry.coordinates[0]

      expect(ring[0]).toEqual(ring[ring.length - 1])
      for (const [lon, lat] of ring) {
        expect(Math.abs(lat)).toBeLessThanOrEqual(MAX_MERCATOR_LAT_DEG + 1e-9)
        expect(Math.abs(lon)).toBeLessThanOrEqual(180)
      }
    })
  }

  it('degenerates to a meridian split when the subsolar point is on the equator', () => {
    // sin(latS) = 0 makes the closed form saturate to +-90 deg, so the night
    // side is the hemisphere more than 90 deg of longitude from the sun and
    // the day side collapses to a zero-height strip at the polar edge.
    expect(terminatorBoundaryLatDeg(0, 0, 0)).toBe(-90)
    expect(terminatorBoundaryLatDeg(180, 0, 0)).toBe(90)
    expect(Math.abs(terminatorBoundaryLatDeg(120, 0, 0))).toBe(90)
  })
})
