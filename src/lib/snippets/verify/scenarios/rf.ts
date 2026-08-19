/**
 * Verification scenarios for RF/comms pilot tools.
 * See scenarios/index.ts for how these merge into the runner's SCENARIOS map.
 */
import type { Scenario } from '../inputs'

export const RF_SCENARIOS: Record<string, Scenario[]> = {
  'link-budget': [
    {
      name: 'sband-2000km',
      source: 'common S-band downlink (2.2 GHz) at 2000 km slant range',
      bag: {
        f_hz: 2.2e9,
        range_km: 2000,
        pt_w: 10,
        gt_dbi: 5,
        gr_dbi: 20,
        other_loss_db: 1,
        t_sys_k: 290,
        required_cn0_dbhz: 50,
      },
    },
    {
      name: 'xband-geo',
      source: 'well-known X-band (8.4 GHz) GEO-range downlink with high-gain dishes',
      bag: {
        f_hz: 8.4e9,
        range_km: 38_000,
        pt_w: 100,
        gt_dbi: 35,
        gr_dbi: 45,
        other_loss_db: 2,
        t_sys_k: 150,
        required_cn0_dbhz: 45,
      },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round link parameters',
      bag: {
        f_hz: 6.427e9,
        range_km: 1734.9,
        pt_w: 17.3,
        gt_dbi: 8.4,
        gr_dbi: 27.6,
        other_loss_db: 3.2,
        t_sys_k: 212.5,
        required_cn0_dbhz: 41.7,
      },
    },
  ],

  'antenna-gain-effective': [
    {
      name: 'xband-dish',
      source: 'well-known X-band (8.4 GHz, λ≈35.69 mm) large high-gain dish (G=100000, ~50 dBi)',
      bag: { G: 100_000, lam: 0.03569 },
    },
    {
      name: 'sband-near-omni',
      source: 'common S-band (2.2 GHz, λ≈136.27 mm) near-omni TT&C antenna (G=3, ~4.77 dBi)',
      bag: { G: 3, lam: 0.13627 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round G/λ',
      bag: { G: 743.6, lam: 0.0847 },
    },
  ],

  'nyquist-rate': [
    {
      name: 'audio-band',
      source: 'well-known audio bandwidth (20 kHz)',
      bag: { f_max: 20_000, fmax: 20_000 },
    },
    {
      name: 'gps-chipping-rate',
      source: 'well-known GNSS C/A chipping-rate-scale bandwidth (10.23 MHz)',
      bag: { f_max: 10_230_000, fmax: 10_230_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round bandwidth',
      bag: { f_max: 734_912.6, fmax: 734_912.6 },
    },
  ],
}
