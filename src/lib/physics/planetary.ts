/**
 * Planetary / interplanetary mission-design helpers (educational patched-conic class).
 * Body-agnostic; Moon / Mars are demo presets, not the only targets.
 */

import { AU, SUN_MU } from './constants'
import {
  circularOrbitVelocity,
  escapeVelocity,
  hohmannTransfer,
  orbitalPeriod,
} from './orbital'
import { characteristicEnergy, departureBurnFromCircular } from './hyperbolic'
import { sphereOfInfluence, surfaceGravity, synodicPeriod } from './mission'
import type { Body } from './bodies'

/** Mean heliocentric SMA [m] for circular coplanar teaching models (JPL-class order). */
export const HELIO_SMA_M: Record<string, number> = {
  mercury: 0.387098 * AU,
  venus: 0.723332 * AU,
  earth: 1.000000 * AU,
  mars: 1.523679 * AU,
  jupiter: 5.203363 * AU,
  saturn: 9.53707 * AU,
  uranus: 19.19126 * AU,
  neptune: 30.06896 * AU,
  pluto: 39.482 * AU,
}

export function heliocentricSma(bodyId: string): number | null {
  const a = HELIO_SMA_M[bodyId]
  return a != null && a > 0 ? a : null
}

/**
 * Coplanar circular heliocentric Hohmann between two planet SMAs about the Sun.
 * Returns heliocentric Δv at each orbit + TOF (not planetary parking Δv).
 */
export function heliocentricHohmann(
  r1M: number,
  r2M: number,
  muSun = SUN_MU,
): ReturnType<typeof hohmannTransfer> | null {
  if (!(r1M > 0) || !(r2M > 0) || r1M === r2M) return null
  return hohmannTransfer(muSun, r1M, r2M)
}

/**
 * Ideal phase angle at departure for coplanar Hohmann (lead angle of outer body) [rad].
 * φ = π (1 − ((r1+r2)/(2 r2))^{3/2}) for transfer outerward (Curtis/Vallado class).
 */
export function hohmannPhaseAngle(r1M: number, r2M: number): number | null {
  if (!(r1M > 0) || !(r2M > 0) || r1M === r2M) return null
  const aT = 0.5 * (r1M + r2M)
  // Mean motion of destination
  // Lead angle of target: π − n2 * TOF with TOF = π √(aT³/μ) → φ = π (1 − (aT/r2)^{3/2})
  const ratio = aT / r2M
  const phi = Math.PI * (1 - ratio ** 1.5)
  return phi
}

/**
 * Synodic period between two circular heliocentric orbits (launch opportunity cadence).
 */
export function heliocentricSynodic(r1M: number, r2M: number, muSun = SUN_MU): number | null {
  return synodicPeriod(muSun, r1M, r2M)
}

/**
 * Patched-conic departure sketch from circular parking orbit:
 * heliocentric Hohmann sets v_∞ ≈ |v_transfer_peri − v_planet|, then
 * Δv from circular parking to escape hyperbola at r_park.
 *
 * Educational: assumes circular coplanar planets, impulsive, no plane change.
 */
export function patchedConicDeparture(opts: {
  rParkM: number
  muPlanet: number
  rPlanetHelioM: number
  rTargetHelioM: number
  muSun?: number
}): {
  hohmann: NonNullable<ReturnType<typeof hohmannTransfer>>
  vInf: number
  c3: number
  dvPark: number
  vCircPark: number
  vHypPeri: number
  phaseRad: number
  tSynS: number | null
} | null {
  const muS = opts.muSun ?? SUN_MU
  // Always (r1=departure planet, r2=target): h.dv1 is |v_t − v_circ| at departure SMA
  // for both outward and inward transfers (vis-viva at r1).
  const h = heliocentricHohmann(opts.rPlanetHelioM, opts.rTargetHelioM, muS)
  if (!h) return null
  // Collinear patched-conic: |v_∞| ≈ Hohmann Δv at the departure heliocentric orbit
  const vInf = h.dv1
  const burn = departureBurnFromCircular(opts.muPlanet, opts.rParkM, vInf)
  if (!burn) return null
  const phase = hohmannPhaseAngle(opts.rPlanetHelioM, opts.rTargetHelioM)
  if (phase == null) return null
  const tSyn = heliocentricSynodic(opts.rPlanetHelioM, opts.rTargetHelioM, muS)
  return {
    hohmann: h,
    vInf,
    c3: characteristicEnergy(vInf),
    dvPark: burn.dv,
    vCircPark: burn.vc,
    vHypPeri: burn.vp,
    phaseRad: phase,
    tSynS: tSyn,
  }
}

/** Surface access card: g, v_esc, circular LEO-class Δv rough, SOI if parent given. */
export function surfaceAccess(opts: {
  body: Body
  parkAltitudeM?: number
  parentMassKg?: number
  aAboutParentM?: number
}): {
  g: number
  vEsc: number
  vCirc: number
  dvCircToEsc: number
  rPark: number
  rSoi: number | null
  periodPark: number
} | null {
  const h = opts.parkAltitudeM ?? 200_000
  const rPark = opts.body.radius + h
  const g = surfaceGravity(opts.body.mu, opts.body.radius)
  if (g == null) return null
  const vEsc = escapeVelocity(opts.body.mu, opts.body.radius)
  const vCirc = circularOrbitVelocity(opts.body.mu, rPark)
  const vEscPark = escapeVelocity(opts.body.mu, rPark)
  const periodPark = orbitalPeriod(opts.body.mu, rPark)
  let rSoi: number | null = opts.body.soi ?? null
  if (opts.parentMassKg != null && opts.aAboutParentM != null) {
    rSoi = sphereOfInfluence(opts.aAboutParentM, opts.body.mass, opts.parentMassKg)
  }
  return {
    g,
    vEsc,
    vCirc,
    dvCircToEsc: vEscPark - vCirc,
    rPark,
    rSoi,
    periodPark,
  }
}

/**
 * Simple “porkchop slice”: fixed TOF not used: returns Hohmann TOF + phase + synodic
 * as the coplanar ideal launch-window package.
 */
export function coplanarTransferWindow(r1M: number, r2M: number, muSun = SUN_MU) {
  const h = heliocentricHohmann(r1M, r2M, muSun)
  if (!h) return null
  const phase = hohmannPhaseAngle(r1M, r2M)
  const tSyn = heliocentricSynodic(r1M, r2M, muSun)
  if (phase == null) return null
  return {
    tofS: h.tof,
    dvHelio1: h.dv1,
    dvHelio2: h.dv2,
    dvHelioTotal: h.dvTotal,
    phaseRad: phase,
    tSynS: tSyn,
    aTransfer: h.a,
  }
}
