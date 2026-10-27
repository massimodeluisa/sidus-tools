import type { LookAnglesSi } from './physics/sgp4'

/**
 * What the look-angle page shows after a successful element parse.
 * Latitude rejection stays on the page, ahead of this choice, so an
 * out-of-range site is not reported as a zero-range line of sight.
 */
export type LookAnglePresentation =
  | { status: 'propagation_failed' }
  | { status: 'no_look' }
  | { status: 'zenith'; elevationRad: number; rangeM: number }
  | { status: 'look'; azimuthRad: number; elevationRad: number; rangeM: number }

export function presentLookAngles(
  propagated: boolean,
  look: LookAnglesSi | null,
): LookAnglePresentation {
  if (!propagated) return { status: 'propagation_failed' }
  if (!look) return { status: 'no_look' }
  if (look.azimuthRad == null) {
    return { status: 'zenith', elevationRad: look.elevationRad, rangeM: look.rangeM }
  }
  return {
    status: 'look',
    azimuthRad: look.azimuthRad,
    elevationRad: look.elevationRad,
    rangeM: look.rangeM,
  }
}
