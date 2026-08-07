/**
 * Major orbital launch ranges / spaceports (educational geodetic approx.).
 * Heights are pad / range-center order of magnitude, not surveyed benchmarks.
 */

export type GeoSite = {
  id: string
  /** Short chip label */
  label: string
  /** Full English name (tooltip / a11y) */
  name: string
  latDeg: number
  lonDeg: number
  /** Site altitude above ellipsoid / MSL class [m] */
  heightM: number
}

/**
 * Primary vector launch sites worldwide (active or historically major orbital pads).
 * Default for ground-site tools is CCSFS/KSC (Cape range).
 */
export const LAUNCH_SITES: readonly GeoSite[] = [
  {
    id: 'ccsfs',
    label: 'CCSFS/KSC',
    name: 'Cape Canaveral Space Force Station / Kennedy Space Center (USA)',
    latDeg: 28.5721,
    lonDeg: -80.648,
    heightM: 3,
  },
  {
    id: 'vsfb',
    label: 'VSFB',
    name: 'Vandenberg Space Force Base (USA)',
    latDeg: 34.742,
    lonDeg: -120.5724,
    heightM: 110,
  },
  {
    id: 'starbase',
    label: 'Starbase',
    name: 'SpaceX Starbase, Boca Chica (USA)',
    latDeg: 25.9971,
    lonDeg: -97.1565,
    heightM: 2,
  },
  {
    id: 'wallops',
    label: 'Wallops',
    name: 'Mid-Atlantic Regional Spaceport / Wallops (USA)',
    latDeg: 37.8339,
    lonDeg: -75.4881,
    heightM: 5,
  },
  {
    id: 'kourou',
    label: 'Kourou',
    name: 'Centre Spatial Guyanais, Kourou (France/ESA)',
    latDeg: 5.239,
    lonDeg: -52.768,
    heightM: 10,
  },
  {
    id: 'baikonur',
    label: 'Baikonur',
    name: 'Baikonur Cosmodrome (Kazakhstan / Roscosmos)',
    latDeg: 45.9647,
    lonDeg: 63.305,
    heightM: 90,
  },
  {
    id: 'plesetsk',
    label: 'Plesetsk',
    name: 'Plesetsk Cosmodrome (Russia)',
    latDeg: 62.9271,
    lonDeg: 40.575,
    heightM: 160,
  },
  {
    id: 'vostochny',
    label: 'Vostochny',
    name: 'Vostochny Cosmodrome (Russia)',
    latDeg: 51.8844,
    lonDeg: 128.3341,
    heightM: 280,
  },
  {
    id: 'jiuquan',
    label: 'Jiuquan',
    name: 'Jiuquan Satellite Launch Center (China)',
    latDeg: 40.958,
    lonDeg: 100.291,
    heightM: 1000,
  },
  {
    id: 'xichang',
    label: 'Xichang',
    name: 'Xichang Satellite Launch Center (China)',
    latDeg: 28.246,
    lonDeg: 102.028,
    heightM: 1800,
  },
  {
    id: 'wenchang',
    label: 'Wenchang',
    name: 'Wenchang Spacecraft Launch Site (China)',
    latDeg: 19.6143,
    lonDeg: 110.951,
    heightM: 20,
  },
  {
    id: 'tanegashima',
    label: 'Tanegashima',
    name: 'Tanegashima Space Center (Japan / JAXA)',
    latDeg: 30.401,
    lonDeg: 130.977,
    heightM: 30,
  },
  {
    id: 'sdsc',
    label: 'SDSC',
    name: 'Satish Dhawan Space Centre, Sriharikota (India / ISRO)',
    latDeg: 13.72,
    lonDeg: 80.23,
    heightM: 10,
  },
  {
    id: 'mahia',
    label: 'Mahia',
    name: 'Rocket Lab Launch Complex 1, Mahia (New Zealand)',
    latDeg: -39.2615,
    lonDeg: 177.8649,
    heightM: 80,
  },
  {
    id: 'alcantara',
    label: 'Alcântara',
    name: 'Centro de Lançamento de Alcântara (Brazil / AEB)',
    latDeg: -2.373,
    lonDeg: -44.396,
    heightM: 50,
  },
] as const

/** Default educational ground site: Cape range (CCSFS/KSC). */
export const DEFAULT_LAUNCH_SITE: GeoSite = LAUNCH_SITES[0]!

/** Look up a catalog site by id (e.g. `'kourou'`, `'vsfb'`). */
export function getLaunchSite(id: string): GeoSite | undefined {
  return LAUNCH_SITES.find((s) => s.id === id)
}

/** Match a site by lat/lon within ~1 km class tolerance. */
export function matchLaunchSite(
  latDeg: number,
  lonDeg: number,
  tolDeg = 0.05,
): GeoSite | undefined {
  return LAUNCH_SITES.find(
    (s) => Math.abs(s.latDeg - latDeg) <= tolDeg && Math.abs(s.lonDeg - lonDeg) <= tolDeg,
  )
}
