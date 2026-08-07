/**
 * GNSS geometry / delays and free-space optical link models (pure SI, educational).
 */

import { C } from './constants'

/** Pseudorange ρ = c (t_rx − t_tx) + c·clockBias (bias in seconds). */
export function gnssPseudorange(
  tTx: number,
  tRx: number,
  clockBiasS = 0,
  c = C,
): number | null {
  if (!(c > 0)) return null
  const dt = tRx - tTx
  if (!Number.isFinite(dt)) return null
  return c * dt + c * clockBiasS
}

/**
 * GDOP from design matrix H (n×4) with rows [ux, uy, uz, 1].
 * Returns GDOP, PDOP, HDOP, VDOP when n ≥ 4 and HᵀH invertible.
 */
export function gnssDopFromUnitVectors(
  los: ReadonlyArray<readonly [number, number, number]>,
): { gdop: number; pdop: number; hdop: number; vdop: number } | null {
  if (los.length < 4) return null
  // Build H: n×4
  const n = los.length
  const H: number[][] = []
  for (let i = 0; i < n; i++) {
    const [ux, uy, uz] = los[i]!
    const norm = Math.hypot(ux, uy, uz)
    if (!(norm > 0)) return null
    H.push([ux / norm, uy / norm, uz / norm, 1])
  }
  // Q = (Hᵀ H)^{-1}
  const HtH = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let s = 0
      for (let k = 0; k < n; k++) s += H[k]![i]! * H[k]![j]!
      HtH[i]![j] = s
    }
  }
  const inv = invert4(HtH)
  if (!inv) return null
  const qxx = inv[0]![0]!
  const qyy = inv[1]![1]!
  const qzz = inv[2]![2]!
  const qtt = inv[3]![3]!
  if ([qxx, qyy, qzz, qtt].some((q) => !(q >= 0) || !Number.isFinite(q))) return null
  const pdop = Math.sqrt(qxx + qyy + qzz)
  const hdop = Math.sqrt(qxx + qyy)
  const vdop = Math.sqrt(qzz)
  const gdop = Math.sqrt(qxx + qyy + qzz + qtt)
  return { gdop, pdop, hdop, vdop }
}

function invert4(a: number[][]): number[][] | null {
  // Gauss-Jordan
  const m = a.map((row) => row.slice())
  const inv = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]
  for (let col = 0; col < 4; col++) {
    let piv = col
    for (let r = col + 1; r < 4; r++) {
      if (Math.abs(m[r]![col]!) > Math.abs(m[piv]![col]!)) piv = r
    }
    if (Math.abs(m[piv]![col]!) < 1e-14) return null
    ;[m[col], m[piv]] = [m[piv]!, m[col]!]
    ;[inv[col], inv[piv]] = [inv[piv]!, inv[col]!]
    const div = m[col]![col]!
    for (let j = 0; j < 4; j++) {
      m[col]![j]! /= div
      inv[col]![j]! /= div
    }
    for (let r = 0; r < 4; r++) {
      if (r === col) continue
      const f = m[r]![col]!
      for (let j = 0; j < 4; j++) {
        m[r]![j]! -= f * m[col]![j]!
        inv[r]![j]! -= f * inv[col]![j]!
      }
    }
  }
  return inv
}

/** Saastamoinen-class dry troposphere delay [m] (educational). elev rad, lat rad, height m. */
export function saastamoinenTropoDelay(
  elevRad: number,
  latRad: number,
  heightM: number,
  pHpa = 1013.25,
  tK = 288.15,
  eHpa = 11.0,
): number | null {
  if (!(elevRad > 0.05) || elevRad > Math.PI / 2) return null
  if (!(heightM >= -500) || heightM > 1e5) return null
  const z = Math.PI / 2 - elevRad
  // Simplified form used in textbooks (meters)
  const d =
    (0.002277 / Math.cos(z)) *
    (pHpa +
      (1255 / tK + 0.05) * eHpa -
      Math.tan(z) ** 2)
  // crude height scaling
  const scale = Math.exp(-heightM / 7000)
  const delay = d * scale * (1 + 0.1 * Math.cos(2 * latRad))
  return Number.isFinite(delay) && delay > 0 ? delay : null
}

/** Klobuchar-like vertical iono delay [m] at L1: 40.3 TEC / f² educational TECU. */
export function klobucharIonoDelayM(
  elevRad: number,
  tecu: number,
  fHz = 1.57542e9,
): number | null {
  if (!(elevRad > 0.05) || !(tecu >= 0) || !(fHz > 0)) return null
  // slant factor ~ 1/sqrt(1 - (cos elev * Re/(Re+h))^2) simplified as 1/sin(elev)
  const mf = 1 / Math.sin(elevRad)
  const dVert = (40.3e16 * tecu) / (fHz * fHz) // meters if TEC in m^-2; TECU = 1e16
  // tecu is TECU → electrons/m² = tecu * 1e16
  const dV = (40.3 * tecu * 1e16) / (fHz * fHz)
  const d = dV * mf
  return Number.isFinite(d) && d >= 0 ? d : Number.isFinite(dVert) ? dVert * mf : null
}

/** Optical free-space received power: Pr = Pt ηt ηr Gt Gr (λ/(4π R))² / L. */
export function opticalLinkReceivedPower(opts: {
  ptW: number
  etaT: number
  etaR: number
  gt: number
  gr: number
  wavelengthM: number
  rangeM: number
  lossLin?: number
}): number | null {
  const { ptW, etaT, etaR, gt, gr, wavelengthM: lam, rangeM: R } = opts
  const L = opts.lossLin ?? 1
  if (
    !(ptW > 0) ||
    !(etaT > 0) ||
    !(etaR > 0) ||
    !(gt > 0) ||
    !(gr > 0) ||
    !(lam > 0) ||
    !(R > 0) ||
    !(L > 0)
  )
    return null
  const fspl = (lam / (4 * Math.PI * R)) ** 2
  const pr = ptW * etaT * etaR * gt * gr * fspl / L
  return Number.isFinite(pr) && pr > 0 ? pr : null
}

/** Spot radius ≈ R * θ (θ half-angle rad, small-angle). */
export function laserSpotRadius(rangeM: number, halfAngleRad: number): number | null {
  if (!(rangeM > 0) || !(halfAngleRad > 0)) return null
  return rangeM * halfAngleRad
}

/** Range from one-way light time. */
export function laserRangeFromTof(tofS: number, c = C): number | null {
  if (!(tofS > 0) || !(c > 0)) return null
  return c * tofS
}

/** Range from round-trip time. */
export function laserRangeFromRtt(rttS: number, c = C): number | null {
  if (!(rttS > 0) || !(c > 0)) return null
  return (c * rttS) / 2
}

/** Educational Q-factor from SNR linear: Q ≈ sqrt(SNR) for OOK-class sketch. */
export function opticalQFromSnr(snrLin: number): number | null {
  if (!(snrLin > 0)) return null
  return Math.sqrt(snrLin)
}
