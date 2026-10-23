import { describe, expect, it } from 'vitest'
import { MCP_TOOL_DEFS } from '../../../mcp/full-catalog'
import { AU, C, EARTH_MU, EARTH_RADIUS, SUN_MU } from './constants'

function run(name: string, args: Record<string, number>): unknown {
  const tool = MCP_TOOL_DEFS.find((candidate) => candidate.name === name)
  if (!tool) throw new Error(`Unknown MCP tool: ${name}`)
  return tool.run(args)
}

function result(name: string, args: Record<string, number>): Record<string, unknown> {
  const value = run(name, args)
  if (value == null || typeof value !== 'object') throw new Error(`${name} did not return an object`)
  return value as Record<string, unknown>
}

function numberField(output: Record<string, unknown>, key: string): number {
  const value = output[key]
  if (typeof value !== 'number') throw new Error(`Expected numeric ${key}, got ${String(value)}`)
  return value
}

describe('MCP scientific adapters', () => {
  it('binds J2 rates to a, e, inclination, J2 and equatorial radius', () => {
    const a = 6_778_137
    const e = 0.001
    const i = (51.6 * Math.PI) / 180
    const j2 = 1.08262668e-3
    const p = a * (1 - e * e)
    const n = Math.sqrt(EARTH_MU / a ** 3)
    const factor = (EARTH_RADIUS / p) ** 2
    const actual = result('j2_drift', { a_m: a, e, i_deg: 51.6 })

    expect(numberField(actual, 'raan_rate_rad_s')).toBeCloseTo(-1.5 * n * j2 * factor * Math.cos(i), 14)
    expect(numberField(actual, 'argp_rate_rad_s')).toBeCloseTo(0.75 * n * j2 * factor * (5 * Math.cos(i) ** 2 - 1), 14)
  })

  it('uses hole area as the leak area', () => {
    const V = 100
    const A = 1e-4
    const p0 = 101_325
    const p1 = 70_000
    const T = 293.15
    const gamma = 1.4
    const R = 287.05
    const factor = (2 / (gamma + 1)) ** ((gamma + 1) / (2 * (gamma - 1)))
    const K = factor * Math.sqrt(gamma / (R * T))
    const expected = (V / (0.65 * A * K * R * T)) * Math.log(p0 / p1)

    expect(numberField(result('cabin_leak', { volume_m3: V, p0_pa: p0, p_final_pa: p1, hole_area_m2: A, temp_k: T }), 't_s'))
      .toBeCloseTo(expected, 8)
  })

  it('computes circular eclipse duration from semi-major axis, radius and gravitational parameter', () => {
    const a = EARTH_RADIUS + 400_000
    const period = 2 * Math.PI * Math.sqrt(a ** 3 / EARTH_MU)
    const beta = Math.asin(EARTH_RADIUS / a)
    const actual = result('eclipse_duration', { a_m: a })

    expect(numberField(actual, 'period')).toBeCloseTo(period, 8)
    expect(numberField(actual, 'eclipseS')).toBeCloseTo((period * beta) / Math.PI, 8)
  })

  it('returns solar pressure acceleration as force divided by mass', () => {
    const actual = result('solar_pressure', { area_m2: 10, mass_kg: 500, cr: 1.2, r_au: 1 })
    const force = (4.56e-6 * 10 * 1.2)

    expect(numberField(actual, 'force_n')).toBeCloseTo(force, 14)
    expect(numberField(actual, 'accel_m_s2')).toBeCloseTo(force / 500, 14)
  })

  it('computes delta-a from the circular speed and tangential impulse', () => {
    const a = EARTH_RADIUS + 400_000
    const dv = 1
    const expected = (2 * a * dv) / Math.sqrt(EARTH_MU / a)

    expect(numberField(result('delta_a_burn', { a_m: a, dv_m_s: dv }), 'da_m')).toBeCloseTo(expected, 8)
  })

  it('uses mu, not mean motion, for coelliptic drift', () => {
    const a = EARTH_RADIUS + 400_000
    const deltaA = -5_000
    const n = Math.sqrt(EARTH_MU / a ** 3)
    const nRel = -1.5 * n * (deltaA / a)
    const actual = result('coelliptic', { a_m: a, delta_a_m: deltaA, phase_gain_deg: 10 })

    expect(numberField(actual, 'n')).toBeCloseTo(n, 12)
    expect(numberField(actual, 'nRel')).toBeCloseTo(nRel, 12)
    expect(numberField(actual, 't_phase_s')).toBeCloseTo(((10 * Math.PI) / 180) / Math.abs(nRel), 8)
  })

  it('returns mean motion as a scalar with matching period and speed', () => {
    const h = 400_000
    const a = EARTH_RADIUS + h
    const n = Math.sqrt(EARTH_MU / a ** 3)
    const actual = result('mean_motion', { altitude_m: h })

    expect(numberField(actual, 'n_rad_s')).toBeCloseTo(n, 14)
    expect(numberField(actual, 'period_s')).toBeCloseTo((2 * Math.PI) / n, 8)
    expect(numberField(actual, 'velocity_m_s')).toBeCloseTo(Math.sqrt(EARTH_MU / a), 8)
  })

  it('uses incidence degrees for solar array power', () => {
    const actual = result('solar_array', { area_m2: 5, eta: 0.3, incidence_deg: 60, r_au: 1.3 })
    const expected = (1361 * 0.3 * 5 * Math.cos(Math.PI / 3)) / 1.3 ** 2
    expect(numberField(actual, 'p_w')).toBeCloseTo(expected, 10)
  })

  it('computes horizon slant range from altitude and body radius', () => {
    const h = 400_000
    const expected = Math.sqrt(2 * EARTH_RADIUS * h + h ** 2)
    expect(numberField(result('horizon_range', { altitude_m: h }), 'slant_m')).toBeCloseTo(expected, 8)
  })

  it('binds antenna frequency before diameter', () => {
    const freq = 12e9
    const diameter = 1
    const expected = ((70 * Math.PI) / 180) * (C / freq / diameter)
    expect(numberField(result('antenna_beamwidth', { diameter_m: diameter, freq_hz: freq }), 'beamwidth_rad'))
      .toBeCloseTo(expected, 14)
  })

  it('uses radius, not diameter, for angular diameter', () => {
    const diameter = 6_378_137
    const distance = 6_778_137
    expect(numberField(result('angular_diameter', { diameter_m: diameter, distance_m: distance }), 'angle_rad'))
      .toBeCloseTo(2 * Math.atan((diameter / 2) / distance), 14)
  })

  it('converts wavelength to frequency and returns scalar diffraction angle', () => {
    const wavelength = 5e-7
    const diameter = 0.3
    const expected = (1.22 * wavelength) / diameter
    expect(numberField(result('diffraction', { wavelength_m: wavelength, diameter_m: diameter }), 'theta_rad'))
      .toBeCloseTo(expected, 14)
  })

  it('computes beta-angle eclipse duration in seconds', () => {
    const a = EARTH_RADIUS + 400_000
    const beta = (20 * Math.PI) / 180
    const period = 2 * Math.PI * Math.sqrt(a ** 3 / EARTH_MU)
    const argument = Math.sqrt(1 - (EARTH_RADIUS / a) ** 2) / Math.cos(beta)
    const expected = argument >= 1 ? 0 : (period / Math.PI) * Math.acos(argument)
    const actual = run('eclipse_beta', { a_m: a, beta_deg: 20 })
    expect(typeof actual).toBe('number')
    expect(actual as number).toBeCloseTo(expected, 8)
  })

  it('uses E then e for both mean-anomaly interfaces', () => {
    const e = 0.1
    const E = Math.PI / 6
    const expected = E - e * Math.sin(E)
    expect(numberField(result('eccentric_anomaly', { e, E_deg: 30 }), 'M_rad')).toBeCloseTo(expected, 14)
    expect(numberField(result('mean_anomaly_from_e', { e, E_rad: E }), 'M_rad')).toBeCloseTo(expected, 14)
  })

  it('evaluates exponential density as rho0 times exp(-h/H)', () => {
    const h = 400_000
    const rho0 = 1.225
    const H = 8_500
    const expected = rho0 * Math.exp(-h / H)
    expect(numberField(result('scale_height', { h_m: h, rho0_kg_m3: rho0, H_m: H }), 'rho_kg_m3')).toBeCloseTo(expected, 28)
    expect(numberField(result('exponential_density', { rho0, h_m: h, H_m: H }), 'rho_kg_m3')).toBeCloseTo(expected, 28)
  })

  it('binds heliocentric Hohmann radii and solar mu in the documented order', () => {
    const r1 = AU
    const r2 = 1.523679 * AU
    const aTransfer = (r1 + r2) / 2
    const expectedTof = Math.PI * Math.sqrt(aTransfer ** 3 / SUN_MU)
    const actual = result('helio_hohmann', { r1_m: r1, r2_m: r2 })
    expect(numberField(actual, 'tof')).toBeCloseTo(expectedTof, 7)
  })

  it('adds a positive receiver clock bias to GNSS pseudorange', () => {
    const dt = 0.07
    const bias = 1e-6
    const expected = C * (dt + bias)
    expect(numberField(result('gnss_pseudorange', { dt_s: dt, clock_bias_s: bias }), 'rho_m')).toBeCloseTo(expected, 5)
  })

  it('orders rain-rate, path, k and alpha correctly', () => {
    expect(numberField(result('rain_attenuation_simple', { k: 0.01, rate_mm_h: 10, alpha: 1, path_km: 5 }), 'atten_db'))
      .toBeCloseTo(0.5, 14)
  })

  it('returns Eb/N0 in dB from C/N0 in dB-Hz', () => {
    expect(numberField(result('ttc_ebno', { cn0_dbhz: 55, rb_bps: 1e6 }), 'eb_n0_db')).toBeCloseTo(-5, 14)
  })

  it('uses flux, area, mass and reflectivity in solar-sail order', () => {
    const eta = 0.9
    const flux = 1361
    const area = 100
    const mass = 10
    const expected = (2 * eta * flux * area) / (C * mass)
    expect(numberField(result('solar_sail_accel', { eta, flux_w_m2: flux, area_m2: area, mass_kg: mass }), 'a_m_s2'))
      .toBeCloseTo(expected, 16)
  })

  it('uses density, scale height and orbital radius in rough lifetime', () => {
    const h = 400_000
    const rho = 2e-12
    const beta = 100
    const speed = 7_660
    const scaleHeight = 50_000
    const expected = (scaleHeight * beta) / (rho * speed * (EARTH_RADIUS + h))
    expect(numberField(result('orbit_lifetime_rough', { h_m: h, beta_kg_m2: beta, rho_kg_m3: rho, v_m_s: speed }), 't_s'))
      .toBeCloseTo(expected, 8)
  })

  it('converts heliocentric distance from AU to metres for solar flux', () => {
    expect(numberField(result('solar_flux_distance', { r_au: 1.5 }), 'flux_w_m2')).toBeCloseTo(1361 / 1.5 ** 2, 10)
  })
})
