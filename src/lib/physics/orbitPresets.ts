/**
 * Shared educational orbit-class altitudes and transfer pairs (Earth).
 * Used by tool FieldPresets chips and SCHEMA defaults — keep numbers SI-metres
 * and convert in UI with fromSi(..., unitId).
 */

/** Representative Earth altitudes [m] above mean radius. */
export const EARTH_ORBIT_ALT_M = {
  /** Low LEO parking / injection class */
  LEO_LOW: 200_000,
  /** ISS-class mean altitude */
  ISS: 400_000,
  /** Typical LEO remote-sensing / mid LEO */
  LEO_MID: 500_000,
  /** Dawn–dusk SSO class */
  SSO: 700_000,
  /** GPS / GNSS MEO class */
  GPS: 20_200_000,
  /** GEO / GSO altitude */
  GEO: 35_786_000,
} as const

/** Transfer scenario chips (altitudes in m). */
export const EARTH_TRANSFER_PRESETS = [
  {
    id: 'iss-geo',
    label: 'ISS → GEO',
    h1: EARTH_ORBIT_ALT_M.ISS,
    h2: EARTH_ORBIT_ALT_M.GEO,
  },
  {
    id: 'leo-meo',
    label: 'LEO → MEO',
    h1: EARTH_ORBIT_ALT_M.LEO_LOW,
    h2: 2_000_000,
  },
  {
    id: 'leo-gps',
    label: 'LEO → GPS-class MEO',
    h1: EARTH_ORBIT_ALT_M.LEO_LOW,
    h2: EARTH_ORBIT_ALT_M.GPS,
  },
  {
    id: 'leo-geo',
    label: 'LEO → GEO',
    h1: EARTH_ORBIT_ALT_M.LEO_LOW,
    h2: EARTH_ORBIT_ALT_M.GEO,
  },
] as const

/** Single-altitude chips for circular-orbit class tools. */
export const EARTH_ALTITUDE_CHIPS = [
  { label: 'LEO 200 km', m: EARTH_ORBIT_ALT_M.LEO_LOW },
  { label: 'ISS ~400 km', m: EARTH_ORBIT_ALT_M.ISS },
  { label: 'SSO ~700 km', m: EARTH_ORBIT_ALT_M.SSO },
  { label: 'GEO 35786 km', m: EARTH_ORBIT_ALT_M.GEO },
] as const

/** Representative vacuum Isp values [s] for propulsion chips. */
export const ISP_PRESETS_S = [
  { label: 'Cold gas N₂ ~70 s', v: 70 },
  { label: 'Hydrazine ~220 s', v: 220 },
  { label: 'RP-1/LOX ~330 s', v: 330 },
  { label: 'LH2/LOX ~450 s', v: 450 },
  { label: 'Hall/ion ~1600 s', v: 1600 },
  { label: 'Ion ~3000 s', v: 3000 },
] as const
