/**
 * Discovery-wave pure-SI helpers: RF extras, ballistics, ADCS, coverage, GEO ops.
 */

import { C, EARTH_MU, EARTH_RADIUS, G0 } from './constants'

// —— RF extras ——

/** Voltage reflection coefficient |Γ| = |(ZL − Z0)/(ZL + Z0)| for real Z. */
export function reflectionCoeff(z0: number, zL: number): number | null {
  if (!(z0 > 0) || !(zL >= 0)) return null
  const g = Math.abs((zL - z0) / (zL + z0))
  return Number.isFinite(g) ? g : null
}

/** VSWR = (1+|Γ|)/(1−|Γ|). Matched load Γ=0 → VSWR=1. */
export function vswrFromGamma(gamma: number): number | null {
  if (!(gamma >= 0) || gamma >= 1) return null
  if (gamma === 0) return 1
  return (1 + gamma) / (1 - gamma)
}

/**
 * Return loss [dB] = −20 log10(|Γ|).
 * Matched load Γ→0 → +∞; report a large finite educational ceiling.
 */
export function returnLossDb(gamma: number): number | null {
  if (!(gamma >= 0) || gamma >= 1) return null
  if (gamma === 0) return 200 // practical infinity for UI
  return -20 * Math.log10(gamma)
}

/** Effective aperture Ae = G λ² / (4π). */
export function effectiveAperture(gainLin: number, wavelengthM: number): number | null {
  if (!(gainLin > 0) || !(wavelengthM > 0)) return null
  return (gainLin * wavelengthM * wavelengthM) / (4 * Math.PI)
}

/** Gain from Ae: G = 4π Ae / λ². */
export function gainFromAperture(ae: number, wavelengthM: number): number | null {
  if (!(ae > 0) || !(wavelengthM > 0)) return null
  return (4 * Math.PI * ae) / (wavelengthM * wavelengthM)
}

/** LEO Doppler: fd = f0 * v_radial / c. */
export function dopplerShiftHz(f0: number, vRadial: number, c = C): number | null {
  if (!(f0 > 0) || !Number.isFinite(vRadial) || !(c > 0)) return null
  return (f0 * vRadial) / c
}

/** Educational rain attenuation [dB]: k R^α L_eff (ITU-like toy). */
export function rainAttenuationDb(
  rateMmH: number,
  pathKm: number,
  k = 0.01,
  alpha = 1.1,
): number | null {
  if (!(rateMmH >= 0) || !(pathKm > 0) || !(k > 0) || !(alpha > 0)) return null
  return k * rateMmH ** alpha * pathKm
}

/** Radar equation Pr = Pt G² λ² σ / ((4π)³ R⁴) monostatic. */
export function radarReceivedPower(opts: {
  pt: number
  g: number
  wavelength: number
  rcs: number
  range: number
}): number | null {
  const { pt, g, wavelength: lam, rcs, range: R } = opts
  if (!(pt > 0) || !(g > 0) || !(lam > 0) || !(rcs > 0) || !(R > 0)) return null
  const pr =
    (pt * g * g * lam * lam * rcs) / ((4 * Math.PI) ** 3 * R ** 4)
  return Number.isFinite(pr) && pr > 0 ? pr : null
}

/** Eb/N0 linear from CN0 and bit rate: Eb/N0 = CN0 / Rb. */
export function ebN0FromCn0(cn0Hz: number, bitRate: number): number | null {
  if (!(cn0Hz > 0) || !(bitRate > 0)) return null
  return cn0Hz / bitRate
}

// —— Ballistics ——

/** Free-fall time constant g: t = sqrt(2 h / g). */
export function freeFallTimeConstG(h: number, g = G0): number | null {
  if (!(h > 0) || !(g > 0)) return null
  return Math.sqrt((2 * h) / g)
}

/** Impact speed constant g: v = sqrt(2 g h). */
export function freeFallSpeedConstG(h: number, g = G0): number | null {
  if (!(h > 0) || !(g > 0)) return null
  return Math.sqrt(2 * g * h)
}

/** Flat-Earth vacuum ballistic range: R = v0² sin(2γ) / g. */
export function ballisticRangeFlat(
  v0: number,
  gammaRad: number,
  g = G0,
): { range: number; tof: number; hMax: number } | null {
  if (!(v0 > 0) || !(g > 0) || !(gammaRad > 0) || gammaRad >= Math.PI / 2) return null
  const range = (v0 * v0 * Math.sin(2 * gammaRad)) / g
  const tof = (2 * v0 * Math.sin(gammaRad)) / g
  const hMax = (v0 * v0 * Math.sin(gammaRad) ** 2) / (2 * g)
  if (![range, tof, hMax].every((x) => Number.isFinite(x) && x >= 0)) return null
  return { range, tof, hMax }
}

/** Terminal velocity v = sqrt(2 m g / (ρ Cd A)). */
export function terminalVelocity(
  mass: number,
  cd: number,
  area: number,
  rho: number,
  g = G0,
): number | null {
  if (!(mass > 0) || !(cd > 0) || !(area > 0) || !(rho > 0) || !(g > 0)) return null
  return Math.sqrt((2 * mass * g) / (rho * cd * area))
}

/** Bank angle for coordinated turn: tan φ = v² / (g R). */
export function bankAngleRad(v: number, turnRadius: number, g = G0): number | null {
  if (!(v > 0) || !(turnRadius > 0) || !(g > 0)) return null
  return Math.atan((v * v) / (g * turnRadius))
}

// —— ADCS / pointing ——

/**
 * Minimum slew time for rest-to-rest with limits ω_max, α_max (bang-coast-bang).
 * If Δθ ≤ ω²/α use triangular profile: t = 2 sqrt(Δθ/α).
 */
export function slewTimeMin(
  deltaTheta: number,
  wMax: number,
  aMax: number,
): number | null {
  const d = Math.abs(deltaTheta)
  if (!(d > 0) || !(wMax > 0) || !(aMax > 0)) return null
  const thSwitch = (wMax * wMax) / aMax
  if (d <= thSwitch) return 2 * Math.sqrt(d / aMax)
  return d / wMax + wMax / aMax
}

/** Angle between body +Z and sun unit vectors. */
export function sunSensorAngle(
  bodyZ: readonly [number, number, number],
  sun: readonly [number, number, number],
): number | null {
  const nb = Math.hypot(...bodyZ)
  const ns = Math.hypot(...sun)
  if (!(nb > 0) || !(ns > 0)) return null
  const c =
    (bodyZ[0] * sun[0] + bodyZ[1] * sun[1] + bodyZ[2] * sun[2]) / (nb * ns)
  return Math.acos(Math.min(1, Math.max(-1, c)))
}

/** Star tracker noise: σ_θ ≈ pixel_scale / sqrt(N_pixels) educational. */
export function starTrackerNoiseRad(
  pixelScaleRad: number,
  nPixels: number,
): number | null {
  if (!(pixelScaleRad > 0) || !(nPixels >= 1)) return null
  return pixelScaleRad / Math.sqrt(nPixels)
}

/** Reaction-wheel angular momentum h = I ω. */
export function rwMomentum(inertia: number, omega: number): number | null {
  if (!(inertia > 0) || !Number.isFinite(omega)) return null
  return inertia * omega
}

/** Magnetic torque |τ| = |m| |B| sinθ. */
export function magneticTorque(
  mAm2: number,
  bTesla: number,
  angleRad: number,
): number | null {
  if (!(mAm2 > 0) || !(bTesla > 0) || !Number.isFinite(angleRad)) return null
  return mAm2 * bTesla * Math.abs(Math.sin(angleRad))
}

/** Gravity-gradient torque magnitude ~ (3 μ / r³) |I3 − I1| sin(2δ) / 2 educational. */
export function gravityGradientTorque(
  mu: number,
  r: number,
  inertiaDiff: number,
  deltaRad: number,
): number | null {
  if (!(mu > 0) || !(r > 0) || !(inertiaDiff >= 0)) return null
  return ((3 * mu) / (r * r * r)) * (inertiaDiff / 2) * Math.abs(Math.sin(2 * deltaRad))
}

// —— Coverage / mission ——

/** Walker constellation: mean angular spacing 2π/T in plane. */
export function walkerSpacing(tSats: number, planes: number): {
  satsPerPlane: number
  inPlaneSpacingRad: number
  planeSpacingRad: number
} | null {
  if (!(tSats >= 1) || !(planes >= 1) || tSats % planes !== 0) return null
  const spp = tSats / planes
  return {
    satsPerPlane: spp,
    inPlaneSpacingRad: (2 * Math.PI) / spp,
    planeSpacingRad: (2 * Math.PI) / planes,
  }
}

/**
 * Nadir FOV ground swath [m] on a sphere.
 * Half FOV α = fov/2; surface central half-angle λ = asin((r/R) sin α) − α;
 * full swath = 2 R λ. Flat fallback 2 h tan(α) for tiny FOV.
 */
export function coverageSwathWidth(
  altitude: number,
  fovRad: number,
  bodyR = EARTH_RADIUS,
): number | null {
  if (!(altitude > 0) || !(fovRad > 0) || fovRad >= Math.PI || !(bodyR > 0))
    return null
  const r = bodyR + altitude
  const alpha = fovRad / 2
  const sinArg = (r / bodyR) * Math.sin(alpha)
  if (!(sinArg < 1)) return null
  const lambda = Math.asin(sinArg) - alpha
  if (!(lambda > 0)) return null
  const sph = 2 * bodyR * lambda
  const flat = 2 * altitude * Math.tan(alpha)
  const w = Number.isFinite(sph) && sph > 0 ? sph : flat
  return w > 0 ? w : null
}

/** Rough revisit [s]: T_orb * (360° / (swathEarthAngle * revs per day factor)) educational. */
export function revisitTimeSimple(
  periodS: number,
  swathWidthM: number,
  bodyR = EARTH_RADIUS,
): number | null {
  if (!(periodS > 0) || !(swathWidthM > 0) || !(bodyR > 0)) return null
  const earthCirc = 2 * Math.PI * bodyR
  const strips = earthCirc / swathWidthM
  return periodS * Math.max(1, strips)
}

/** GEO yearly N/S stationkeeping Δv ≈ 50 m/s class scaled by i drift educational default 40–50. */
export function geoStationkeepingDvYear(
  northSouth = 45,
  eastWest = 5,
): { dVYear: number; dVNS: number; dVEW: number } {
  return {
    dVNS: northSouth,
    dVEW: eastWest,
    dVYear: northSouth + eastWest,
  }
}

/** Propellant for yearly Δv over life years: m_p = m_dry (exp(Δv tot/(Isp g0)) − 1). */
export function geoPropellantBudget(
  dryMass: number,
  isp: number,
  dvPerYear: number,
  lifeYears: number,
  g0 = G0,
): { mProp: number; m0: number; dvTotal: number } | null {
  if (!(dryMass > 0) || !(isp > 0) || !(dvPerYear >= 0) || !(lifeYears > 0))
    return null
  const dvTotal = dvPerYear * lifeYears
  const m0 = dryMass * Math.exp(dvTotal / (isp * g0))
  return { mProp: m0 - dryMass, m0, dvTotal }
}

/** Drag makeup Δv per rev ≈ π (Cd A / m) ρ a v  (order of magnitude). */
export function dragMakeupDvPerRev(
  rho: number,
  a: number,
  v: number,
  ballisticB: number,
): number | null {
  // ballisticB = m/(Cd A)
  if (!(rho > 0) || !(a > 0) || !(v > 0) || !(ballisticB > 0)) return null
  return (Math.PI * rho * a * v) / ballisticB
}

/** Orbit-average power rough: P_avg = P_sun * (1 − f_ecl) * η − P_load terms educational. */
export function epsOrbitAverage(
  pSun: number,
  eclipseFraction: number,
  eta = 0.28,
): number | null {
  if (!(pSun > 0) || !(eclipseFraction >= 0) || eclipseFraction >= 1 || !(eta > 0))
    return null
  return pSun * (1 - eclipseFraction) * eta
}

/** Relative clock rate: gravitational + velocity (weak field): Δf/f ≈ ΔΦ/c² − v²/(2c²). */
export function relativityClockRate(
  deltaPotential: number,
  speed: number,
  c = C,
): number | null {
  if (!(c > 0) || !Number.isFinite(deltaPotential) || !(speed >= 0)) return null
  return deltaPotential / (c * c) - (speed * speed) / (2 * c * c)
}

/** Tisserand parameter wrt planet: T = a_p/a + 2 cos(i) sqrt(a/a_p (1−e²)). */
export function tisserandParameter(
  a: number,
  e: number,
  iRad: number,
  aPlanet: number,
): number | null {
  if (!(a > 0) || !(e >= 0) || e >= 1 || !(aPlanet > 0) || !Number.isFinite(iRad))
    return null
  return aPlanet / a + 2 * Math.cos(iRad) * Math.sqrt((a / aPlanet) * (1 - e * e))
}

/** Circular orbital period helper. */
export function circularPeriod(mu: number, r: number): number | null {
  if (!(mu > 0) || !(r > 0)) return null
  return 2 * Math.PI * Math.sqrt((r * r * r) / mu)
}

export { EARTH_MU, EARTH_RADIUS }

// ─── Pass 3: remaining high-value pure-SI helpers ───────────────────────────

/** Optical / EO ground sample distance [m]: GSD ≈ h · IFOV (small-angle). */
export function opticalGsd(altitudeM: number, ifovRad: number): number | null {
  if (!(altitudeM > 0) || !(ifovRad > 0)) return null
  const gsd = altitudeM * ifovRad
  return Number.isFinite(gsd) && gsd > 0 ? gsd : null
}

/** Solar-sail characteristic acceleration [m/s²]: a = 2 η P A / (c m) (ideal reflection η≤1). */
export function solarSailAccel(
  powerFlux: number,
  area: number,
  mass: number,
  eta = 1,
  c = C,
): number | null {
  if (!(powerFlux > 0) || !(area > 0) || !(mass > 0) || !(eta > 0) || !(c > 0)) return null
  const a = (2 * eta * powerFlux * area) / (c * mass)
  return Number.isFinite(a) && a > 0 ? a : null
}

/** Constant-thrust finite burn Δv [m/s] via rocket equation (no gravity/drag). */
export function finiteBurnDv(
  ve: number,
  m0: number,
  mdot: number,
  burnTime: number,
): number | null {
  if (!(ve > 0) || !(m0 > 0) || !(mdot > 0) || !(burnTime > 0)) return null
  const mf = m0 - mdot * burnTime
  if (!(mf > 0) || mf >= m0) return null
  const dv = ve * Math.log(m0 / mf)
  return Number.isFinite(dv) && dv > 0 ? dv : null
}

/**
 * B-plane impact parameter magnitude [m] for pure gravity turn:
 * b = (μ / v∞²) · cot(δ/2) with turn angle δ (educational).
 */
export function bPlaneImpactParameter(
  mu: number,
  vInf: number,
  turnAngleRad: number,
): number | null {
  if (!(mu > 0) || !(vInf > 0) || !(turnAngleRad > 0) || turnAngleRad >= Math.PI) return null
  const b = (mu / (vInf * vInf)) / Math.tan(turnAngleRad / 2)
  return Number.isFinite(b) && b > 0 ? b : null
}

/**
 * Circular restricted 3-body Jacobi constant (synodic, planar educational):
 * C = x² + y² + 2(1−μ)/r1 + 2μ/r2 − (vx² + vy²)  with μ mass ratio.
 */
export function jacobiConstant(
  x: number,
  y: number,
  vx: number,
  vy: number,
  mu: number,
): number | null {
  if (!(mu > 0) || mu >= 1) return null
  const r1 = Math.hypot(x + mu, y)
  const r2 = Math.hypot(x - (1 - mu), y)
  if (!(r1 > 0) || !(r2 > 0)) return null
  const C =
    x * x +
    y * y +
    (2 * (1 - mu)) / r1 +
    (2 * mu) / r2 -
    (vx * vx + vy * vy)
  return Number.isFinite(C) ? C : null
}

/**
 * Rough circular-orbit drag lifetime [s] to lose ~one scale height of altitude.
 * da/dt ≈ −(ρ v a)/β with β = m/(Cd A) ⇒ Δt ≈ H β / (ρ v a).
 */
export function orbitLifetimeRough(
  density: number,
  ballisticCoeff: number,
  speed: number,
  scaleHeight: number,
  orbitRadius: number,
): number | null {
  // ballisticCoeff β = m/(Cd A) [kg/m²]
  if (
    !(density > 0) ||
    !(ballisticCoeff > 0) ||
    !(speed > 0) ||
    !(scaleHeight > 0) ||
    !(orbitRadius > 0)
  )
    return null
  const t =
    (scaleHeight * ballisticCoeff) / (density * speed * orbitRadius)
  return Number.isFinite(t) && t > 0 ? t : null
}

/** GEO longitude drift rate [rad/s] from semi-major vs GEO: Ω̇ ≈ −(3/2) n_geo (a−a_geo)/a_geo. */
export function geoDriftRate(
  a: number,
  aGeo: number,
  nGeo: number,
): number | null {
  if (!(a > 0) || !(aGeo > 0) || !(nGeo > 0)) return null
  const rate = -1.5 * nGeo * ((a - aGeo) / aGeo)
  return Number.isFinite(rate) ? rate : null
}

/** Stefan–Boltzmann radiated power [W]: P = ε σ A T⁴. */
export function stefanBoltzmannPower(
  area: number,
  tempK: number,
  emissivity = 1,
  sigma = 5.670374419e-8,
): number | null {
  if (!(area > 0) || !(tempK > 0) || !(emissivity > 0) || !(emissivity <= 1)) return null
  const P = emissivity * sigma * area * tempK ** 4
  return Number.isFinite(P) && P > 0 ? P : null
}

/** Wien displacement peak wavelength [m]: λ_max = b / T. */
export function wienPeakWavelength(tempK: number, b = 2.897771955e-3): number | null {
  if (!(tempK > 0)) return null
  const l = b / tempK
  return Number.isFinite(l) && l > 0 ? l : null
}

/** Thruster impulse bit [N·s]: I_bit = F · t_on. */
export function thrusterImpulseBit(force: number, ton: number): number | null {
  if (!(force > 0) || !(ton > 0)) return null
  return force * ton
}

/** J2 argument of perigee drift [rad/s]: ω̇ = ¾ n J2 (R/p)² (5 cos²i − 1). */
export function argPerigeeDriftJ2(
  n: number,
  j2: number,
  bodyR: number,
  p: number,
  iRad: number,
): number | null {
  if (!(n > 0) || !(bodyR > 0) || !(p > 0) || !Number.isFinite(j2) || !Number.isFinite(iRad))
    return null
  const c = Math.cos(iRad)
  const wdot = 0.75 * n * j2 * (bodyR / p) ** 2 * (5 * c * c - 1)
  return Number.isFinite(wdot) ? wdot : null
}

/** SAR azimuth resolution educational: δ_az ≈ λ / (2 θ_syn) [m] with synthetic angle θ. */
export function sarAzimuthResolution(wavelength: number, synthAngleRad: number): number | null {
  if (!(wavelength > 0) || !(synthAngleRad > 0)) return null
  const d = wavelength / (2 * synthAngleRad)
  return Number.isFinite(d) && d > 0 ? d : null
}

/** Radar range resolution [m]: δ_r = c / (2 B). */
export function radarRangeResolution(bandwidthHz: number, c = C): number | null {
  if (!(bandwidthHz > 0) || !(c > 0)) return null
  return c / (2 * bandwidthHz)
}

/** Link margin [dB]: CN0_dBHz − CN0_required. */
export function linkMarginDb(cn0DbHz: number, requiredDbHz: number): number | null {
  if (!Number.isFinite(cn0DbHz) || !Number.isFinite(requiredDbHz)) return null
  return cn0DbHz - requiredDbHz
}

/** Aerobraking Δv sketch [m/s]: Δv ≈ (Cd A / m) ρ v² L / (2 v) = (Cd A/m) ρ v L / 2. */
export function aerobrakingDv(
  ballisticInv: number,
  density: number,
  speed: number,
  pathLength: number,
): number | null {
  // ballisticInv = Cd A / m [m²/kg]
  if (
    !(ballisticInv > 0) ||
    !(density > 0) ||
    !(speed > 0) ||
    !(pathLength > 0)
  )
    return null
  const dv = 0.5 * ballisticInv * density * speed * pathLength
  return Number.isFinite(dv) && dv > 0 ? dv : null
}

/** Ideal diffraction-limited half-angle [rad]: θ ≈ 1.22 λ / D. */
export function diffractionLimitAngle(wavelength: number, diameter: number): number | null {
  if (!(wavelength > 0) || !(diameter > 0)) return null
  return (1.22 * wavelength) / diameter
}

/** Panel end-of-life power: P = P0 (1 − d)^years. */
export function panelEolPower(p0: number, degradationPerYear: number, years: number): number | null {
  if (!(p0 > 0) || !(degradationPerYear >= 0) || degradationPerYear >= 1 || !(years >= 0))
    return null
  const p = p0 * (1 - degradationPerYear) ** years
  return Number.isFinite(p) && p >= 0 ? p : null
}

/** Magnetorquer magnetic moment [A·m²]: m = N I A. */
export function magnetorquerMoment(turns: number, current: number, area: number): number | null {
  if (!(turns > 0) || !(current > 0) || !(area > 0)) return null
  return turns * current * area
}

/** Capture Δv circularize at periapsis from hyperbolic: Δv = v_p_hyp − v_circ. */
export function captureCircularizeDv(mu: number, rp: number, vInf: number): number | null {
  if (!(mu > 0) || !(rp > 0) || !(vInf >= 0)) return null
  const vp = Math.sqrt(vInf * vInf + (2 * mu) / rp)
  const vc = Math.sqrt(mu / rp)
  const dv = vp - vc
  return Number.isFinite(dv) && dv >= 0 ? dv : null
}

/** Gravity-loss sketch [m/s]: Δv_gl ≈ g · t_burn · sin(γ) (constant pitch educational). */
export function gravityLossDv(g: number, burnTime: number, gammaRad: number): number | null {
  if (!(g > 0) || !(burnTime > 0) || !Number.isFinite(gammaRad)) return null
  return g * burnTime * Math.sin(gammaRad)
}

/** Battery depth of discharge fraction: DoD = E_used / E_capacity. */
export function batteryDepthOfDischarge(eUsed: number, eCapacity: number): number | null {
  if (!(eUsed >= 0) || !(eCapacity > 0)) return null
  const d = eUsed / eCapacity
  return Number.isFinite(d) && d >= 0 ? d : null
}

/** Earth geometric umbra length [m] from Sun-Earth distance (point-Sun cone sketch). */
export function umbraLength(
  sunDistance: number,
  sunRadius: number,
  bodyRadius: number,
): number | null {
  if (!(sunDistance > 0) || !(sunRadius > bodyRadius) || !(bodyRadius > 0)) return null
  // L = R_body * d / (R_sun - R_body)
  const L = (bodyRadius * sunDistance) / (sunRadius - bodyRadius)
  return Number.isFinite(L) && L > 0 ? L : null
}

/** Mean anomaly from eccentric anomaly (radians): M = E − e sin E. */
export function meanAnomalyFromE(E: number, e: number): number | null {
  if (!(e >= 0) || e >= 1 || !Number.isFinite(E)) return null
  return E - e * Math.sin(E)
}

/** Flight-path angle from e, ν: tan φ = e sin ν / (1 + e cos ν). */
export function flightPathAngle(e: number, nuRad: number): number | null {
  if (!(e >= 0) || e >= 1 || !Number.isFinite(nuRad)) return null
  const den = 1 + e * Math.cos(nuRad)
  if (Math.abs(den) < 1e-15) return null
  return Math.atan2(e * Math.sin(nuRad), den)
}

// ─── Pass 4: final high-value pure-SI before stop ───────────────────────────

/** Thin-wall pressure vessel hoop stress [Pa]: σ = p r / t. */
export function hoopStress(pressure: number, radius: number, thickness: number): number | null {
  if (!(pressure > 0) || !(radius > 0) || !(thickness > 0)) return null
  return (pressure * radius) / thickness
}

/** Hill sphere radius [m]: r_H ≈ a (m / (3 M))^{1/3}. */
export function hillSphere(a: number, m: number, M: number): number | null {
  if (!(a > 0) || !(m > 0) || !(M > 0)) return null
  return a * Math.cbrt(m / (3 * M))
}

/**
 * Edelbaum low-thrust combined plane change + circular transfer [m/s]:
 * Δv = √(v₁² + v₂² − 2 v₁ v₂ cos(π Δi / 2)).
 */
export function edelbaumDv(v1: number, v2: number, diRad: number): number | null {
  if (!(v1 > 0) || !(v2 > 0) || !(diRad >= 0) || diRad > Math.PI) return null
  const dv = Math.sqrt(
    Math.max(0, v1 * v1 + v2 * v2 - 2 * v1 * v2 * Math.cos((Math.PI * diRad) / 2)),
  )
  return Number.isFinite(dv) ? dv : null
}

/** Repeating ground track: k orbits in n days → a from mean motion (educational period). */
export function repeatingGroundTrackPeriod(
  orbitsPerCycle: number,
  cycleDays: number,
): number | null {
  if (!(orbitsPerCycle > 0) || !(cycleDays > 0)) return null
  const T = (cycleDays * 86400) / orbitsPerCycle
  return Number.isFinite(T) && T > 0 ? T : null
}

/** RSS pointing budget [rad]: σ = sqrt(Σ σ_i²). */
export function pointingBudgetRss(sigmas: number[]): number | null {
  if (!sigmas.length || sigmas.some((s) => !(s >= 0) || !Number.isFinite(s))) return null
  const sum = sigmas.reduce((a, s) => a + s * s, 0)
  return Math.sqrt(sum)
}

/** Cryogen boiloff mass rate [kg/s]: ṁ = Q̇ / h_fg. */
export function boiloffRate(heatIn: number, heatOfVaporization: number): number | null {
  if (!(heatIn > 0) || !(heatOfVaporization > 0)) return null
  return heatIn / heatOfVaporization
}

/** Residual magnetic dipole torque [N·m]: τ = m_res B. */
export function residualDipoleTorque(mRes: number, B: number): number | null {
  if (!(mRes > 0) || !(B > 0)) return null
  return mRes * B
}

/** Solar constant at distance: S = S0 (1 AU / r)². */
export function solarFluxAtDistance(
  r: number,
  s0 = 1361,
  au = 149_597_870_700,
): number | null {
  if (!(r > 0) || !(s0 > 0) || !(au > 0)) return null
  return s0 * (au / r) ** 2
}

/** Nyquist sample rate [Hz]: fs ≥ 2 f_max. */
export function nyquistSampleRate(fMax: number): number | null {
  if (!(fMax > 0)) return null
  return 2 * fMax
}

/** Downlink data volume [bit]: V = R · T_contact · η. */
export function dataVolumeBits(rateBps: number, contactS: number, eta = 1): number | null {
  if (!(rateBps > 0) || !(contactS > 0) || !(eta > 0) || eta > 1) return null
  return rateBps * contactS * eta
}

/** Earth IR flux at altitude sketch [W/m²]: F ≈ σ T_e^4 (R/(R+h))². */
export function earthIrFlux(
  altitude: number,
  te = 255,
  bodyR = EARTH_RADIUS,
  sigma = 5.670374419e-8,
): number | null {
  if (!(altitude >= 0) || !(te > 0) || !(bodyR > 0)) return null
  const F = sigma * te ** 4 * (bodyR / (bodyR + altitude)) ** 2
  return Number.isFinite(F) && F > 0 ? F : null
}
