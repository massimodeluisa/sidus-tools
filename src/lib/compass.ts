/** Eight-point compass key for an azimuth measured from north toward east. */
const OCTANTS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const

export type CompassOctant = (typeof OCTANTS)[number]

export function compassOctant(azimuthRad: number): CompassOctant {
  const deg = ((azimuthRad * 180) / Math.PI + 360) % 360
  const index = Math.round(deg / 45) % OCTANTS.length
  return OCTANTS[index] ?? 'n'
}
