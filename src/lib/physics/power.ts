/** Power, thermal, sensors, RCS: educational SI helpers. */

/** Solar constant at 1 AU [W/m²]. */
export const SOLAR_CONSTANT_1AU = 1361

/**
 * Solar array electrical power:
 * P = S₀ η A cosθ (1 AU / r)²   (θ = sun incidence from normal; cosθ≥0)
 */
export function solarArrayPower(
  areaM2: number,
  eta: number,
  incidenceDeg: number,
  rAu = 1,
  s0 = SOLAR_CONSTANT_1AU,
): number | null {
  if (!(areaM2 > 0) || !(eta > 0) || !(eta <= 1) || !(rAu > 0)) return null
  const c = Math.cos((incidenceDeg * Math.PI) / 180)
  if (c <= 0) return 0
  return (s0 * eta * areaM2 * c) / (rAu * rAu)
}

/** Battery energy E = C · V  (C in Ah → need hours: E_J = C_Ah * V * 3600). */
export function batteryEnergyJ(capacityAh: number, voltageV: number): number | null {
  if (!(capacityAh > 0) || !(voltageV > 0)) return null
  return capacityAh * voltageV * 3600
}

/** Endurance [s] at constant load P: t = E / P. */
export function batteryEndurance(energyJ: number, loadW: number): number | null {
  if (!(energyJ > 0) || !(loadW > 0)) return null
  return energyJ / loadW
}

/** RCS: impulse I = F·t; Δv = I / m. */
export function rcsDeltaV(thrustN: number, burnS: number, massKg: number): number | null {
  if (!(thrustN > 0) || !(burnS > 0) || !(massKg > 0)) return null
  return (thrustN * burnS) / massKg
}

/** Impulse bit I_bit = F · t_min. */
export function impulseBit(thrustN: number, minPulseS: number): number | null {
  if (!(thrustN > 0) || !(minPulseS > 0)) return null
  return thrustN * minPulseS
}

/** Angular diameter of a body [rad]: α = 2 atan(R / d). */
export function angularDiameter(radiusM: number, distanceM: number): number | null {
  if (!(radiusM > 0) || !(distanceM > radiusM)) return null
  return 2 * Math.atan(radiusM / distanceM)
}

/**
 * Diffraction-limited angular resolution [rad]: θ ≈ 1.22 λ / D
 * Ground sample distance ≈ θ · range.
 */
export function diffractionResolution(
  freqHz: number,
  apertureM: number,
  rangeM?: number,
): { thetaRad: number; gsdM: number | null } | null {
  if (!(freqHz > 0) || !(apertureM > 0)) return null
  const lambda = 299_792_458 / freqHz
  const thetaRad = (1.22 * lambda) / apertureM
  const gsdM = rangeM != null && rangeM > 0 ? thetaRad * rangeM : null
  return { thetaRad, gsdM }
}

/** Stefan-Boltzmann radiated power Q = ε σ A T⁴. */
export const STEFAN_BOLTZMANN = 5.670374419e-8

export function thermalRadiatedPower(
  areaM2: number,
  tempK: number,
  emissivity = 0.8,
): number | null {
  if (!(areaM2 > 0) || !(tempK > 0) || !(emissivity > 0) || emissivity > 1) return null
  return emissivity * STEFAN_BOLTZMANN * areaM2 * tempK ** 4
}

/**
 * Equilibrium temperature for flat plate facing sun (simplified):
 * ε σ T⁴ A = (1−a) S A cosθ  ⇒ T = [ (1−a) S cosθ / (ε σ) ]^{1/4}
 * for two-sided radiator factor 2 often used: here single-side educational.
 */
export function equilibriumTemperature(
  absorptivity: number,
  emissivity: number,
  incidenceDeg: number,
  rAu = 1,
  s0 = SOLAR_CONSTANT_1AU,
): number | null {
  if (!(absorptivity >= 0) || absorptivity > 1) return null
  if (!(emissivity > 0) || emissivity > 1) return null
  const c = Math.max(0, Math.cos((incidenceDeg * Math.PI) / 180))
  const s = (s0 * c) / (rAu * rAu)
  // absorbed = α S cosθ (single-sided educational plate)
  const absorbed = absorptivity * s
  if (!(absorbed > 0)) return 0
  return (absorbed / (emissivity * STEFAN_BOLTZMANN)) ** 0.25
}

/** Drag force F_d = ½ ρ v² C_d A. */
export function dragForce(rho: number, v: number, cd: number, areaM2: number): number | null {
  if (!(rho > 0) || !(v > 0) || !(cd > 0) || !(areaM2 > 0)) return null
  return 0.5 * rho * v * v * cd * areaM2
}

/** Reaction wheel: H = I · ω  [N·m·s]; torque T = I α. */
export function wheelMomentum(inertia: number, omegaRadS: number): number | null {
  if (!(inertia > 0) || !Number.isFinite(omegaRadS)) return null
  return inertia * omegaRadS
}

export function wheelTorque(inertia: number, alphaRadS2: number): number | null {
  if (!(inertia > 0) || !Number.isFinite(alphaRadS2)) return null
  return inertia * alphaRadS2
}

/**
 * Along-track separation for coelliptic from mean anomaly offset:
 * Δy ≈ a · ΔM  (small ΔM in rad, circular).
 */
export function alongTrackFromDeltaM(a: number, deltaMRad: number): number | null {
  if (!(a > 0) || !Number.isFinite(deltaMRad)) return null
  return a * deltaMRad
}

/** ΔM from along-track: ΔM = Δy / a. */
export function deltaMFromAlongTrack(a: number, deltaY: number): number | null {
  if (!(a > 0) || !Number.isFinite(deltaY)) return null
  return deltaY / a
}

/**
 * Apogee-raise (or periapsis-raise): burn at peri to raise apo.
 * Ellipse from r_p fixed, r_a new: a = (rp+ra)/2; Δv = v_p_new − v_c or from old ellipse.
 * From circular r: raise apo to ra: a=(r+ra)/2; Δv = v_p − v_c where v_p at peri of new.
 */
export function apoapsisRaiseFromCircular(
  mu: number,
  r: number,
  ra: number,
): { a: number; dv: number; vp: number; vc: number } | null {
  if (!(mu > 0) || !(r > 0) || !(ra > r)) return null
  const a = (r + ra) / 2
  const vc = Math.sqrt(mu / r)
  const vp = Math.sqrt(mu * (2 / r - 1 / a))
  return { a, dv: vp - vc, vp, vc }
}

/** Period from mean motion or a: T = 2π √(a³/μ). */
export function semiMajorFromPeriod(mu: number, periodS: number): number | null {
  if (!(mu > 0) || !(periodS > 0)) return null
  return Math.cbrt((mu * periodS * periodS) / (4 * Math.PI * Math.PI))
}

/**
 * Ground-track longitude shift per orbit (Earth, no J2):
 * ΔL ≈ −ω_earth · T  [rad east negative for prograde]
 */
export const EARTH_ROTATION_RATE = 7.292115e-5

export function groundTrackShiftPerOrbit(
  periodS: number,
  omegaEarth = EARTH_ROTATION_RATE,
): number | null {
  if (!(periodS > 0)) return null
  return -omegaEarth * periodS
}

/**
 * Simple β-angle eclipse fraction correction (circular):
 * f ≈ (1/π) acos( √(1−(R/a)²) / cos β ) for |β| small enough; if cosβ small eclipse shortens.
 * Educational: eclipse duration ≈ T/π · acos( √(h(h+2R))/( (R+h) cosβ ) ) when argument in range.
 */
export function eclipseWithBeta(
  a: number,
  bodyR: number,
  betaRad: number,
  periodS: number,
): number | null {
  if (!(a > bodyR) || !(periodS > 0)) return null
  const cosb = Math.cos(betaRad)
  if (Math.abs(cosb) < 1e-6) return 0 // high beta → no eclipse often
  const arg = Math.sqrt(1 - (bodyR / a) ** 2) / cosb
  if (arg >= 1) return 0
  if (arg <= -1) return periodS
  const betaShadow = Math.acos(Math.min(1, Math.max(-1, arg)))
  return (periodS / Math.PI) * betaShadow
}
