/**
 * Verification scenarios for RF/comms/GNSS/optical/ADCS satellite-category tools.
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

  // —— GNSS / optical ——

  'gnss-pseudorange': [
    {
      name: 'gnss-mid-orbit-range',
      source: 'well-known GNSS user-to-satellite slant range scale (~21,700 km) with a 1 μs clock bias',
      bag: { tTx: 0, tRx: 0.072_397_9, bias: 1e-6 },
    },
    {
      name: 'gnss-min-range',
      source: 'well-known GNSS near-minimum slant range (~20,200 km altitude case) with a negative bias',
      bag: { tTx: 0, tRx: 0.067_38, bias: -2e-6 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round tx/rx epochs and bias',
      bag: { tTx: 0.000_137, tRx: 0.083_412_6, bias: 3.7e-6 },
    },
  ],

  'gnss-ionosphere-klobuchar': [
    {
      name: 'zenith-typical',
      source: 'zenith elevation (well-known baseline, mapping function = 1) with typical daytime TEC and GPS L1',
      bag: { elev: Math.PI / 2, tecu: 20, f: 1.575_42e9 },
    },
    {
      name: 'low-el-high-tec',
      source: 'low elevation with well-known high-solar-activity TEC and GPS L2',
      bag: { elev: 0.3, tecu: 50, f: 1.227_6e9 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round elevation/TEC/frequency',
      bag: { elev: 0.853_2, tecu: 33.7, f: 1.5e9 },
    },
  ],

  'laser-link-budget': [
    {
      name: 'isl-telecom-wavelength',
      source: 'well-known telecom laser wavelength (1550 nm) over a 1000 km inter-satellite link',
      bag: { lam: 1.55e-6, R: 1_000_000, etaT: 0.8, etaR: 0.7, gt: 1e6, gr: 1e6, L: 1, pt: 1 },
    },
    {
      name: 'ndyag-geo-downlink',
      source: 'well-known Nd:YAG laser wavelength (1064 nm) over a GEO-scale downlink range',
      bag: { lam: 1.064e-6, R: 38_000_000, etaT: 0.85, etaR: 0.75, gt: 5e5, gr: 8e5, L: 1.2, pt: 2 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round optical link parameters',
      bag: { lam: 1.31e-6, R: 1_873_456, etaT: 0.763, etaR: 0.812, gt: 734_000, gr: 612_000, L: 1.05, pt: 1.47 },
    },
  ],

  'laser-pointing-jitter': [
    {
      name: 'isl-microrad-jitter',
      source: 'well-known 1 μrad-class pointing jitter over a 1000 km inter-satellite link',
      bag: { R: 1_000_000, theta: 1e-6 },
    },
    {
      name: 'geo-downlink-jitter',
      source: 'well-known 2 μrad-class pointing jitter over a GEO-scale downlink',
      bag: { R: 38_000_000, theta: 2e-6 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round range/jitter',
      bag: { R: 734_521, theta: 1.37e-6 },
    },
  ],

  'laser-time-of-flight': [
    {
      name: 'ms-scale',
      source: 'well-known millisecond-scale laser ranging time interval',
      bag: { t: 0.001 },
    },
    {
      name: 'longer-interval',
      source: 'well-known longer laser-ranging time interval (5 ms)',
      bag: { t: 0.005 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round time interval',
      bag: { t: 0.002_347 },
    },
  ],

  'optical-ber-q': [
    {
      name: 'moderate-snr',
      source: 'well-known moderate optical link SNR (10 dB)',
      bag: { snrDb: 10 },
    },
    {
      name: 'high-snr',
      source: 'well-known high optical link SNR (20 dB)',
      bag: { snrDb: 20 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round SNR',
      bag: { snrDb: 13.73 },
    },
  ],

  'geo-light-time': [
    {
      // Only one meaningful scenario: the snippet hardcodes h_GEO and c as
      // internal constants (no free vars), so every scenario computes the
      // exact same t = h_GEO / c. Duplicating identical bags would be a
      // degenerate scenario, not additional coverage.
      name: 'geo-altitude',
      source: 'well-known GEO altitude above surface (35,786 km) one-way light time',
      bag: {},
    },
  ],

  // —— RF extras ——

  'impedance-matching': [
    {
      name: 'z0-50-zl-75',
      source: 'well-known 50 Ω system driving a common 75 Ω mismatch',
      bag: { z0: 50, zL: 75 },
    },
    {
      name: 'z0-50-zl-35',
      source: 'well-known 50 Ω system driving a common 35 Ω mismatch',
      bag: { z0: 50, zL: 35 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round load impedance (avoids Γ=0, where shipped physics and this snippet diverge: physics caps VSWR/RL at a practical-infinity constant while the snippet computes an unclamped ±∞)',
      bag: { z0: 50, zL: 61.8 },
    },
  ],

  'doppler-shift-leo': [
    {
      name: 'sband-approaching',
      source: 'common S-band carrier with a well-known near-max LEO closing radial speed',
      bag: { f0: 2.2e9, vr: 7000 },
    },
    {
      name: 'xband-receding',
      source: 'well-known X-band carrier with a receding (negative) radial speed',
      bag: { f0: 8.4e9, vr: -7000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round frequency/radial speed',
      bag: { f0: 6.427e9, vr: 4823.6 },
    },
  ],

  'radar-equation': [
    {
      name: 'xband-1m2-rcs',
      source: 'well-known X-band radar parameters against a reference 1 m² RCS target at 500 km',
      bag: { pt: 1000, G: 1000, lam: 0.03, rcs: 1, R: 500_000 },
    },
    {
      name: 'cband-10m2-rcs',
      source: 'well-known C-band radar parameters against a larger 10 m² RCS target',
      bag: { pt: 5000, G: 5000, lam: 0.056, rcs: 10, R: 800_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round radar link parameters',
      bag: { pt: 734.6, G: 1873.2, lam: 0.0347, rcs: 3.7, R: 612_345 },
    },
  ],

  'rain-attenuation-simple': [
    {
      name: 'moderate-rain-default-k',
      source: 'default educational k/alpha with well-known moderate rain rate (10 mm/h) over a 5 km path',
      bag: { k: 0.01, rate: 10, alpha: 1.1, path: 5 },
    },
    {
      name: 'heavy-rain',
      source: 'well-known heavy rain rate (25 mm/h) with slightly steeper k/alpha over a shorter path',
      bag: { k: 0.0175, rate: 25, alpha: 1.15, path: 3 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rain-attenuation parameters',
      bag: { k: 0.013_4, rate: 17.3, alpha: 1.087, path: 4.7 },
    },
  ],

  'ttc-ebno': [
    {
      name: 'common-cn0-1mbps',
      source: 'common C/N0 (50 dB-Hz) at a well-known 1 Mbps bit rate',
      bag: { cn0: 50, rb: 1e6 },
    },
    {
      name: 'lower-cn0-2mbps',
      source: 'well-known lower C/N0 margin case at 2 Mbps',
      bag: { cn0: 45, rb: 2e6 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round C/N0 and bit rate',
      bag: { cn0: 41.7, rb: 734_000 },
    },
  ],

  'sar-azimuth-resolution': [
    {
      name: 'xband-sar',
      source: 'well-known X-band SAR wavelength (~3 cm) with a typical synthetic aperture angle',
      bag: { lam: 0.03, theta: 0.001 },
    },
    {
      name: 'cband-sentinel-scale',
      source: 'well-known C-band SAR wavelength (Sentinel-1 class, 5.6 cm) with a wider aperture angle',
      bag: { lam: 0.056, theta: 0.005 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round wavelength/aperture angle',
      bag: { lam: 0.034_7, theta: 0.002_63 },
    },
  ],

  'radar-range-resolution': [
    {
      name: 'common-10mhz',
      source: 'well-known common radar bandwidth (10 MHz)',
      bag: { B: 10e6 },
    },
    {
      name: 'wideband-100mhz',
      source: 'well-known wideband imaging-radar bandwidth (100 MHz)',
      bag: { B: 100e6 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round bandwidth',
      bag: { B: 37.4e6 },
    },
  ],

  'link-margin': [
    {
      name: 'positive-margin',
      source: 'well-known positive-margin case: C/N0 above the required threshold',
      bag: { cn0: 55, req: 50 },
    },
    {
      name: 'negative-margin',
      source: 'well-known negative-margin case: C/N0 below the required threshold (sign branch)',
      bag: { cn0: 42, req: 45 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round C/N0 and required threshold',
      bag: { cn0: 48.7, req: 41.3 },
    },
  ],

  'diffraction-limit': [
    {
      name: 'visible-500mm',
      source: 'well-known visible light (550 nm) through a 500 mm aperture',
      bag: { lam: 0.5e-6, D: 0.5 },
    },
    {
      name: 'optical-comms-100mm',
      source: 'well-known optical-comms wavelength (1550 nm) through a 100 mm aperture',
      bag: { lam: 1.55e-6, D: 0.1 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round wavelength/aperture',
      bag: { lam: 0.86e-6, D: 0.235 },
    },
  ],

  'data-volume': [
    {
      name: 'low-rate-10min-pass',
      source: 'well-known 1 Mbps downlink over a common 10-minute contact',
      bag: { R: 1e6, T: 600, eta: 0.9 },
    },
    {
      name: 'xband-high-rate',
      source: 'well-known 100 Mbps X-band downlink over a shorter contact',
      bag: { R: 100e6, T: 300, eta: 0.85 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rate/duration/efficiency',
      bag: { R: 43.7e6, T: 487.3, eta: 0.763 },
    },
  ],

  // —— Antenna / horizon / diffraction ——

  'horizon-range': [
    {
      name: 'iss-altitude',
      source: 'well-known ISS-class LEO altitude (400 km) radio horizon',
      bag: { R: 6_378_137, h: 400_000 },
    },
    {
      name: 'geo-altitude',
      source: 'well-known GEO altitude (35,786 km) radio horizon',
      bag: { R: 6_378_137, h: 35_786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round radius/altitude',
      bag: { R: 6_371_000, h: 712_345.6 },
    },
  ],

  'antenna-beamwidth': [
    {
      name: 'xband-3m-dish',
      source: 'well-known X-band frequency (8.4 GHz) on a common 3 m dish with the default k=70',
      bag: { f: 8.4e9, D: 3, k: 70 },
    },
    {
      name: 'sband-1m-dish',
      source: 'well-known S-band frequency (2.2 GHz) on a 1 m dish with the default k=70',
      bag: { f: 2.2e9, D: 1, k: 70 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round frequency/diameter/k',
      bag: { f: 6.427e9, D: 1.734, k: 65 },
    },
  ],

  diffraction: [
    {
      name: 'xband-sar-diffraction',
      source: 'well-known X-band SAR frequency (9.6 GHz) with a 1 m aperture at a common LEO SAR range',
      bag: { f: 9.6e9, D: 1, range_m: 700_000 },
    },
    {
      name: 'cband-diffraction',
      source: 'well-known C-band frequency (5.4 GHz) with a wider aperture at a shorter range',
      bag: { f: 5.4e9, D: 2, range_m: 650_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round frequency/aperture/range',
      bag: { f: 3.7e9, D: 0.87, range_m: 734_521 },
    },
  ],

  'eirp-gt': [
    {
      name: 'common-10w-30dbi',
      source: 'well-known 10 W transmitter with a 30 dBi (G=1000) dish at room-temperature Tsys',
      bag: { P: 10, G: 1000, Tsys: 290 },
    },
    {
      name: 'high-power-45dbi',
      source: 'well-known 100 W transmitter with a 45 dBi (G≈31623) dish and a cooled Tsys',
      bag: { P: 100, G: 31_623, Tsys: 150 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round power/gain/system temperature',
      bag: { P: 17.3, G: 6812.9, Tsys: 212.5 },
    },
  ],

  // —— ADCS / pointing ——

  'reaction-wheel': [
    {
      name: 'smallsat-wheel',
      source: 'well-known smallsat reaction-wheel inertia/speed scale',
      bag: { I: 0.02, rpm: 3000, alpha: 0.5 },
    },
    {
      name: 'larger-wheel',
      source: 'well-known larger reaction-wheel inertia/speed scale',
      bag: { I: 0.05, rpm: 6000, alpha: 1.0 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round inertia/speed/acceleration',
      bag: { I: 0.034_7, rpm: 4123.6, alpha: 0.837 },
    },
  ],

  'slew-rate-pointing': [
    {
      // All three tiers stay in the triangular (accel-limited) regime dth <= wmax^2/amax,
      // which is the only regime the snippet's hardcoded t=t_acc actually implements
      // (see UNVERIFIABLE-style note in the RF_EXPECTED comment for slew-rate-pointing).
      name: 'small-slew',
      source: 'well-known small-angle rest-to-rest slew rate/accel limits',
      bag: { wmax: 0.05, amax: 0.01, dth: 0.1 },
    },
    {
      name: 'larger-slew',
      source: 'well-known larger rest-to-rest slew rate/accel limits',
      bag: { wmax: 0.1, amax: 0.02, dth: 0.3 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round rate/accel/angle within the triangular regime',
      bag: { wmax: 0.083, amax: 0.017_3, dth: 0.221 },
    },
  ],

  'magnetic-torque': [
    {
      name: 'perpendicular-dipole',
      source: 'well-known smallsat magnetorquer dipole against a typical LEO field, at the perpendicular (max-torque) angle',
      bag: { m: 0.2, B: 3e-5, ang: Math.PI / 2 },
    },
    {
      name: 'oblique-dipole',
      source: 'well-known larger dipole/field scale at a 45° angle',
      bag: { m: 1.0, B: 5e-5, ang: Math.PI / 4 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round dipole/field/angle',
      bag: { m: 0.347, B: 2.83e-5, ang: 1.9106 },
    },
  ],

  'gravity-gradient-torque': [
    {
      name: 'leo-45deg',
      source: 'well-known LEO altitude with a smallsat-scale inertia difference at 45°',
      bag: { mu: 3.986_004_418e14, r: 6_778_137, dI: 50, delta: Math.PI / 4 },
    },
    {
      name: 'higher-leo',
      source: 'well-known higher LEO altitude with a larger inertia difference',
      bag: { mu: 3.986_004_418e14, r: 7_078_137, dI: 120, delta: 0.2 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/radius/inertia/angle',
      bag: { mu: 3.9e14, r: 7_215_432.6, dI: 87.3, delta: 1.1 },
    },
  ],

  'rw-momentum-capacity': [
    {
      name: 'smallsat-wheel-momentum',
      source: 'well-known smallsat reaction-wheel inertia at a moderate spin rate',
      bag: { I: 0.005, w: 200 },
    },
    {
      name: 'larger-wheel-momentum',
      source: 'well-known larger reaction-wheel inertia at a higher spin rate',
      bag: { I: 0.012, w: 350 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round inertia/spin rate',
      bag: { I: 0.007_34, w: 418.6 },
    },
  ],

  'sun-sensor-cone': [
    {
      name: 'sun-aligned',
      source: 'well-known baseline: sun vector aligned with the body +Z sensor axis (zero angle)',
      bag: { bx: 0, by: 0, bz: 1, sx: 0, sy: 0, sz: 1 },
    },
    {
      name: 'sun-45deg',
      source: 'well-known 45° sun-incidence case off the body +Z axis',
      bag: { bx: 0, by: 0, bz: 1, sx: 1, sy: 0, sz: 1 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round, non-normalized body/sun vectors',
      bag: { bx: 0.3, by: 0.1, bz: 0.95, sx: 0.6, sy: -0.2, sz: 0.77 },
    },
  ],

  'star-tracker-noise': [
    {
      name: 'common-pixel-scale',
      source: 'well-known star-tracker pixel scale (~1 arcsec ≈ 5 μrad) centroided over 100 stars',
      bag: { pix: 5e-6, n: 100 },
    },
    {
      name: 'coarser-pixel-scale',
      source: 'well-known coarser pixel scale centroided over more stars',
      bag: { pix: 1e-5, n: 400 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round pixel scale/star count',
      bag: { pix: 7.3e-6, n: 237 },
    },
  ],

  'magnetorquer-moment': [
    {
      name: 'smallsat-torquer',
      source: 'well-known smallsat magnetorquer coil scale (200 turns, 0.5 A, 100 cm²)',
      bag: { N: 200, I: 0.5, A: 0.01 },
    },
    {
      name: 'larger-torquer',
      source: 'well-known larger torquer coil scale',
      bag: { N: 500, I: 1.0, A: 0.02 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round turns/current/area',
      bag: { N: 347, I: 0.734, A: 0.015_6 },
    },
  ],

  'pointing-budget-rss': [
    {
      name: 'typical-error-stack',
      source: 'well-known typical arcsecond-scale pointing-error budget stack',
      bag: { s1: 0.001, s2: 0.0005, s3: 0.0008 },
    },
    {
      name: 'larger-error-stack',
      source: 'well-known larger pointing-error budget stack',
      bag: { s1: 0.002, s2: 0.0015, s3: 0.001 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round error contributions',
      bag: { s1: 0.001_37, s2: 0.000_89, s3: 0.001_56 },
    },
  ],

  'residual-dipole-torque': [
    {
      name: 'smallsat-residual-dipole',
      source: 'well-known smallsat residual magnetic dipole against a typical LEO field',
      bag: { m: 0.01, B: 3e-5 },
    },
    {
      name: 'larger-residual-dipole',
      source: 'well-known larger residual dipole scale',
      bag: { m: 0.05, B: 5e-5 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round dipole/field',
      bag: { m: 0.023_7, B: 4.13e-5 },
    },
  ],

  'conjunction-pc': [
    {
      name: 'head-on-worst-case',
      source: 'well-known worst-case head-on conjunction (zero miss distance)',
      bag: { miss: 0, sx: 100, sy: 50, rad: 10 },
    },
    {
      name: 'offset-miss',
      source: 'well-known offset-miss conjunction case with tighter covariance',
      bag: { miss: 500, sx: 200, sy: 100, rad: 5 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round miss distance/covariance/combined radius',
      bag: { miss: 137.4, sx: 84.6, sy: 52.3, rad: 7.8 },
    },
  ],

  'quest-attitude': [
    {
      name: 'identity-alignment',
      source: 'well-known baseline: body and reference vector pairs already aligned (identity rotation, zero residual)',
      bag: {
        w1x: 1, w1y: 0, w1z: 0,
        w2x: 0, w2y: 1, w2z: 0,
        v1x: 1, v1y: 0, v1z: 0,
        v2x: 0, v2y: 1, v2z: 0,
      },
    },
    {
      name: 'slight-misalignment',
      source: 'well-known small-misalignment case between body and reference vector pairs',
      bag: {
        w1x: 0, w1y: 0, w1z: 1,
        w2x: 1, w2y: 0, w2z: 0,
        v1x: 0, v1y: 0, v1z: 1,
        v2x: 0.9, v2y: 0.1, v2z: 0,
      },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round, non-orthogonal vector pairs',
      bag: {
        w1x: 0.5, w1y: 0.3, w1z: 0.8,
        w2x: -0.2, w2y: 0.9, w2z: 0.1,
        v1x: 0.6, v1y: 0.1, v1z: 0.79,
        v2x: -0.15, v2y: 0.85, v2z: 0.2,
      },
    },
  ],

  // —— Orbit-adjacent satellite-ops tools ——

  'ground-track': [
    {
      name: 'iss-altitude',
      source: 'well-known ISS-class LEO altitude (400 km) ground-track shift per revolution',
      bag: { mu: 3.986_004_418e14, R: 6_378_137, h: 400_000 },
    },
    {
      name: 'geo-altitude',
      source: 'well-known GEO altitude, where the period nears a sidereal day (near-zero net drift)',
      bag: { mu: 3.986_004_418e14, R: 6_378_137, h: 35_786_000 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/radius/altitude',
      bag: { mu: 3.5e14, R: 6_300_000, h: 850_321 },
    },
  ],

  'eclipse-duration': [
    {
      name: 'iss-altitude',
      source: 'well-known ISS-class LEO altitude (400 km) with its well-known ~92.7 min period',
      bag: { R: 6_378_137, h: 400_000, T: 5561 },
    },
    {
      name: 'geo-altitude',
      source: 'well-known GEO altitude with its well-known ~23h56m sidereal period',
      bag: { R: 6_378_137, h: 35_786_000, T: 86_164 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round radius/altitude/period',
      bag: { R: 6_360_412, h: 971_234, T: 6032.7 },
    },
  ],

  'eclipse-beta': [
    {
      name: 'iss-zero-beta',
      source: 'well-known ISS-class LEO altitude at zero β-angle (worst-case long eclipse)',
      bag: { mu: 3.986_004_418e14, R: 6_378_137, h: 400_000, betaRad: 0 },
    },
    {
      name: 'iss-moderate-beta',
      source: 'well-known ISS-class LEO altitude at a moderate β-angle (~17°)',
      bag: { mu: 3.986_004_418e14, R: 6_378_137, h: 400_000, betaRad: 0.3 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/radius/altitude/β kept inside the valid (non-clamped) eclipse geometry',
      bag: { mu: 3.9e14, R: 6_371_000, h: 850_000, betaRad: 0.55 },
    },
  ],

  'nodal-period': [
    {
      name: 'sso-altitude',
      source: 'well-known sun-synchronous altitude/inclination pairing (~700 km, ~98.2°)',
      bag: { mu: 3.986_004_418e14, a: 7_078_137, e: 0.001, i: 98.2 * (Math.PI / 180), R: 6_378_137 },
    },
    {
      name: 'iss-inclination',
      source: 'well-known ISS-class altitude/inclination pairing (400 km, 51.6°)',
      bag: { mu: 3.986_004_418e14, a: 6_778_137, e: 0.0005, i: 51.6 * (Math.PI / 180), R: 6_378_137 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round mu/sma/eccentricity/inclination',
      bag: { mu: 3.9e14, a: 7_500_321, e: 0.015, i: 63.4 * (Math.PI / 180), R: 6_378_137 },
    },
  ],

  'solar-pressure': [
    {
      name: 'small-plate-1au',
      source: 'well-known small flat-plate area/reflectivity at 1 AU (Earth orbit)',
      // Cr/cr: both spellings set (PHYSICS_ID_ALIASES maps Cr->cr; SAMPLE already
      // defines cr, and first-write-wins would otherwise discard a Cr-only override).
      bag: { A: 1, Cr: 1.2, cr: 1.2, r_au: 1, m: 100 },
    },
    {
      name: 'larger-plate-mars-distance',
      source: 'well-known larger reflective area at the Mars heliocentric distance (~1.524 AU)',
      bag: { A: 10, Cr: 2.0, cr: 2.0, r_au: 1.524, m: 500 },
    },
    {
      name: 'synthetic',
      source: 'adversarial synthetic: distinct non-round area/reflectivity/distance/mass',
      bag: { A: 3.7, Cr: 1.35, cr: 1.35, r_au: 0.723, m: 245.6 },
    },
  ],
}
