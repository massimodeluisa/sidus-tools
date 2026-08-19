/**
 * Expected numeric results for RF/comms pilot tools, sourced from shipped physics.
 * See expected/index.ts for the verification chain this module feeds.
 */
import { effectiveAperture, linkBudget, nyquistSampleRate } from '../../../physics'
import { num, put, type ExpectedFn } from './shared'

export const RF_EXPECTED: Record<string, ExpectedFn> = {
  'link-budget': (bag) => {
    const gtDbi = num(bag, 'gt_dbi', 'gtDbi')
    const res = linkBudget({
      ptW: num(bag, 'pt_w', 'ptW'),
      gtDbi,
      grDbi: num(bag, 'gr_dbi', 'grDbi'),
      freqHz: num(bag, 'f_hz', 'fHz'),
      rangeM: num(bag, 'range_km', 'rangeKm') * 1000,
      otherLossDb: num(bag, 'other_loss_db', 'otherLossDb'),
      tSysK: num(bag, 't_sys_k', 'tSysK'),
      requiredCn0DbHz: num(bag, 'required_cn0_dbhz', 'requiredCn0'),
    })
    const out: Record<string, number> = {}
    if (!res) return out
    put(out, ['lfs_db', 'lfsDb'], res.lfsDb)
    put(out, ['pt_dbw', 'ptDbw'], res.eirpDbw - gtDbi)
    put(out, ['eirp'], res.eirpDbw)
    put(out, ['pr_dbw', 'prDbw'], res.prDbw)
    put(out, ['pr_w', 'prW'], res.prW)
    put(out, ['cn0_dbhz', 'cn0DbHz'], res.cn0DbHz)
    put(out, ['margin'], res.marginDb)
    put(out, ['lam'], res.wavelengthM)
    return out
  },

  'antenna-gain-effective': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['Ae'], effectiveAperture(num(bag, 'G'), num(bag, 'lam')))
    return out
  },

  'nyquist-rate': (bag) => {
    const out: Record<string, number> = {}
    put(out, ['fs'], nyquistSampleRate(num(bag, 'f_max', 'fmax')))
    return out
  },
}
