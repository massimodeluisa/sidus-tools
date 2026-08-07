/** Simplified one-way RF free-space link budget (dB). Comms / constellation roles. */

/**
 * Free-space path loss (dB), frequency in MHz, range in km (Friis / ITU form).
 * L_fs = 20 log10(d_km) + 20 log10(f_MHz) + 32.44
 */
export function freeSpacePathLossDb(rangeKm: number, freqMHz: number): number | null {
  if (!(rangeKm > 0) || !(freqMHz > 0)) return null
  return 20 * Math.log10(rangeKm) + 20 * Math.log10(freqMHz) + 32.44
}

export type LinkBudgetInput = {
  /** Transmit power [W] */
  ptW: number
  /** Tx antenna gain [dBi] */
  gtDbi: number
  /** Rx antenna gain [dBi] */
  grDbi: number
  /** Frequency [Hz] */
  freqHz: number
  /** Range [m] */
  rangeM: number
  /** Extra losses (cables, atmosphere, impl.) [dB] ≥ 0 */
  otherLossDb?: number
  /** Required C/N0 or Eb/N0 threshold [dB-Hz] optional for margin */
  requiredCn0DbHz?: number
  /** Noise temperature [K] for C/N0 estimate */
  tSysK?: number
  /** Boltzmann k = 1.380649e-23 */
}

export type LinkBudgetResult = {
  eirpDbw: number
  lfsDb: number
  prDbw: number
  prW: number
  cn0DbHz: number | null
  marginDb: number | null
  wavelengthM: number
}

const K_BOLTZ = 1.380649e-23

export function linkBudget(input: LinkBudgetInput): LinkBudgetResult | null {
  const { ptW, gtDbi, grDbi, freqHz, rangeM } = input
  if (!(ptW > 0) || !(freqHz > 0) || !(rangeM > 0)) return null
  const other = input.otherLossDb ?? 0
  const freqMHz = freqHz / 1e6
  const rangeKm = rangeM / 1000
  const lfs = freeSpacePathLossDb(rangeKm, freqMHz)
  if (lfs == null) return null
  const ptDbw = 10 * Math.log10(ptW)
  const eirp = ptDbw + gtDbi
  const prDbw = eirp + grDbi - lfs - other
  const prW = 10 ** (prDbw / 10)
  const wavelengthM = 299_792_458 / freqHz

  let cn0DbHz: number | null = null
  let marginDb: number | null = null
  const tSys = input.tSysK ?? 290
  if (tSys > 0 && prW > 0) {
    const n0 = K_BOLTZ * tSys
    const cn0 = prW / n0
    cn0DbHz = 10 * Math.log10(cn0)
    if (input.requiredCn0DbHz != null) {
      marginDb = cn0DbHz - input.requiredCn0DbHz
    }
  }

  return { eirpDbw: eirp, lfsDb: lfs, prDbw, prW, cn0DbHz, marginDb, wavelengthM }
}
