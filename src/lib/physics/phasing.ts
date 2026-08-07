/** Circular coplanar phasing for rendezvous timing. SI. */

/**
 * One-rev phasing: coelliptic wait orbit with period T_phase so that after N revs
 * the chaser gains phase angle Δθ relative to target on circular r_t.
 *
 * Target mean motion n_t = √(μ/r_t³).
 * Desired relative phase gain δθ in (−2π, 2π) over N chaser revs:
 *   N * T_c = N * T_t + δθ / n_t
 *   T_c = T_t + δθ / (N n_t)
 *   a_c from T_c; burns for circular→phase→circular (two Hohmann-like radial?).
 *
 * Simplified two-burn coelliptic phasing Δv (same altitude family):
 * Use period change via small Δa.
 */
export function phasingOrbit(
  mu: number,
  rTarget: number,
  phaseGainRad: number,
  nRevs = 1,
): {
  aPhase: number
  tPhase: number
  tTarget: number
  /** Two-burn Δv total to enter and exit coelliptic phase orbit (circular-circular). */
  dvTotal: number
  dv1: number
  dv2: number
} | null {
  if (!(mu > 0) || !(rTarget > 0) || !(nRevs >= 1)) return null
  const nT = Math.sqrt(mu / (rTarget * rTarget * rTarget))
  const tTarget = (2 * Math.PI) / nT
  // Phase gain: positive means chaser waits longer (higher orbit)
  const tPhase = tTarget + phaseGainRad / (nRevs * nT)
  if (!(tPhase > 0)) return null
  const aPhase = Math.cbrt((mu * tPhase * tPhase) / (4 * Math.PI * Math.PI))
  // Two-impulse transfer circular r_t → circular a_phase → back
  // Actually phasing is usually coelliptic: burn to elliptical then recircularize.
  // Approximate with Hohmann-like between r_t and a_phase if a≠r:
  const r1 = rTarget
  const r2 = aPhase
  const aH = (r1 + r2) / 2
  const v1 = Math.sqrt(mu / r1)
  const v2 = Math.sqrt(mu / r2)
  const vp = Math.sqrt(mu * (2 / r1 - 1 / aH))
  const va = Math.sqrt(mu * (2 / r2 - 1 / aH))
  const dv1 = Math.abs(vp - v1)
  const dv2 = Math.abs(v2 - va)
  // Round-trip phasing: enter + exit ≈ 2 * one-way if symmetric
  // For pure period adjust, exit mirrors enter:
  return {
    aPhase,
    tPhase,
    tTarget,
    dv1,
    dv2,
    dvTotal: 2 * (dv1 + dv2), // go up (or down) and return
  }
}
