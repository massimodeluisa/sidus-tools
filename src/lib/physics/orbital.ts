/** Pure orbital mechanics: no UI imports. SI units (m, s, kg). */

export function circularOrbitVelocity(mu: number, r: number): number {
  return Math.sqrt(mu / r)
}

export function orbitalPeriod(mu: number, a: number): number {
  return 2 * Math.PI * Math.sqrt((a * a * a) / mu)
}

export function escapeVelocity(mu: number, r: number): number {
  return Math.sqrt((2 * mu) / r)
}

export function localGravity(mu: number, r: number): number {
  return mu / (r * r)
}

export function specificEnergyCircular(mu: number, r: number): number {
  return -mu / (2 * r)
}

export function visViva(mu: number, r: number, a: number): number {
  return Math.sqrt(mu * (2 / r - 1 / a))
}

export function hohmannTransfer(mu: number, r1: number, r2: number) {
  const a = (r1 + r2) / 2
  const v1 = Math.sqrt(mu / r1)
  const v2 = Math.sqrt(mu / r2)
  const vPeri = Math.sqrt(mu * (2 / r1 - 1 / a))
  const vApo = Math.sqrt(mu * (2 / r2 - 1 / a))
  const dv1 = Math.abs(vPeri - v1)
  const dv2 = Math.abs(v2 - vApo)
  const tof = Math.PI * Math.sqrt((a * a * a) / mu)
  return { a, dv1, dv2, dvTotal: dv1 + dv2, tof, v1, v2, vPeri, vApo }
}

export function biellipticTransfer(mu: number, r1: number, r2: number, rb: number) {
  const a1 = (r1 + rb) / 2
  const a2 = (r2 + rb) / 2
  const v1 = Math.sqrt(mu / r1)
  const v2 = Math.sqrt(mu / r2)
  const v1p = Math.sqrt(mu * (2 / r1 - 1 / a1))
  const v1b = Math.sqrt(mu * (2 / rb - 1 / a1))
  const v2b = Math.sqrt(mu * (2 / rb - 1 / a2))
  const v2p = Math.sqrt(mu * (2 / r2 - 1 / a2))
  const dv1 = Math.abs(v1p - v1)
  const dv2 = Math.abs(v2b - v1b)
  const dv3 = Math.abs(v2 - v2p)
  const tof =
    Math.PI * Math.sqrt((a1 * a1 * a1) / mu) +
    Math.PI * Math.sqrt((a2 * a2 * a2) / mu)
  return { dv1, dv2, dv3, dvTotal: dv1 + dv2 + dv3, tof, a1, a2 }
}

export function planeChangeDeltaV(v: number, deltaIRad: number): number {
  return 2 * v * Math.sin(Math.abs(deltaIRad) / 2)
}

/**
 * Multi-stage ideal rocket: sum of stage Δv = ve_i · ln(m0_i / mf_i).
 * Each stage mass is independent (payload of lower stages not auto-stacked).
 */
export function multiStageDeltaV(
  stages: { ve: number; m0: number; mf: number }[],
): { dv: number[]; dvTotal: number } | null {
  if (!stages.length) return null
  const dv: number[] = []
  let total = 0
  for (const s of stages) {
    if (!(s.ve > 0) || !(s.m0 > s.mf) || !(s.mf > 0)) return null
    const d = s.ve * Math.log(s.m0 / s.mf)
    dv.push(d)
    total += d
  }
  return { dv, dvTotal: total }
}

export function apsides(a: number, e: number) {
  return { rp: a * (1 - e), ra: a * (1 + e) }
}

/** Periapsis / apoapsis radii and speeds (vis-viva) for an ellipse. */
export function apsidesWithSpeeds(mu: number, a: number, e: number) {
  if (!(a > 0) || e < 0 || e >= 1) {
    return null
  }
  const { rp, ra } = apsides(a, e)
  const vp = visViva(mu, rp, a)
  const va = visViva(mu, ra, a)
  return { rp, ra, vp, va }
}

/** Specific mechanical energy of a two-body orbit (ellipse/hyperbola). */
export function specificEnergy(mu: number, a: number): number {
  return -mu / (2 * a)
}

/** Tsiolkovsky rocket equation: Δv = Isp · g0 · ln(m0/mf). */
export function rocketDeltaV(ispS: number, m0: number, mf: number, g0 = 9.80665): number {
  if (!(ispS > 0) || !(m0 > 0) || !(mf > 0) || m0 <= mf) return NaN
  return ispS * g0 * Math.log(m0 / mf)
}

/** Exhaust velocity from Isp: ve = Isp · g0. */
export function exhaustVelocity(ispS: number, g0 = 9.80665): number {
  return ispS * g0
}

/** Required initial mass for target Δv and dry mass mf. */
export function rocketMassInitial(
  ispS: number,
  deltaV: number,
  mf: number,
  g0 = 9.80665,
): number {
  if (!(ispS > 0) || !(mf > 0) || !(deltaV >= 0)) return NaN
  const ve = ispS * g0
  return mf * Math.exp(deltaV / ve)
}

export function propellantMass(m0: number, mf: number): number {
  return m0 - mf
}


