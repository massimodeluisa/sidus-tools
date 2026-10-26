/**
 * GitHub #14: MCP adapters must call the library with its real argument order,
 * units, and scalar field names. Anchors are the magnitudes the swapped calls
 * used to return. Convention fields are GitHub #117 / #126 / #65 / #115 / #61.
 */
import { describe, expect, it } from 'vitest'
import * as z from 'zod/v4'
import { MCP_TOOL_DEFS } from '../../mcp/full-catalog'
import {
  AU,
  C,
  EARTH_MU,
  EARTH_RADIUS,
  SUN_MU,
  angularDiameter,
  circularEclipseDuration,
  circularOrbitVelocity,
  coellipticDrift,
  coplanarRadii,
  deltaAFromTangentialDv,
  diffractionResolution,
  ebN0FromCn0,
  eclipseWithBeta,
  elevationFromRangeHeight,
  exponentialDensity,
  gnssDopFromUnitVectors,
  gnssPseudorange,
  heliocentricHohmann,
  horizonSlantRange,
  j2ArgpRate,
  j2RaanRate,
  lambertSolve,
  leakDepressTime,
  meanAnomalyFromE,
  meanMotionFromAltitude,
  orbitLifetimeRough,
  orbitalPeriod,
  rainAttenuationDb,
  slantRange,
  solarArrayPower,
  solarFluxAtDistance,
  solarRadiationAccel,
  solarRadiationForce,
  solarSailAccel,
  timeForPhaseGain,
  vnorm,
} from '@/lib/physics'

function runTool(name: string, input: unknown): unknown {
  const tool = MCP_TOOL_DEFS.find((entry) => entry.name === name)
  if (!tool) throw new Error(`missing MCP tool ${name}`)
  const schema = z.object(tool.inputSchema)
  return tool.run(schema.parse(input))
}

describe('MCP adapter argument order (#14)', () => {
  it('j2_drift passes inclination in radians', () => {
    const a = 6_778_137
    const e = 0.001
    const i = (51.6 * Math.PI) / 180
    const expected = {
      raan_rate_rad_s: j2RaanRate(EARTH_MU, a, e, i),
      argp_rate_rad_s: j2ArgpRate(EARTH_MU, a, e, i),
    }
    expect(runTool('j2_drift', { a_m: a, e, i_deg: 51.6 })).toEqual(expected)
    expect(Math.abs(expected.raan_rate_rad_s ?? 0)).toBeGreaterThan(1e-8)
  })

  it('cabin_leak uses volume, hole area, pressures, then temperature', () => {
    const t = leakDepressTime(100, 1e-4, 101_325, 70_000, 293.15)
    expect(
      runTool('cabin_leak', {
        volume_m3: 100,
        p0_pa: 101_325,
        p_final_pa: 70_000,
        hole_area_m2: 1e-4,
        temp_k: 293.15,
      }),
    ).toEqual({ t_s: t })
    expect(t ?? 0).toBeGreaterThan(1)
  })

  it('eclipse_duration returns the circular eclipse record', () => {
    const record = circularEclipseDuration(6_778_137, EARTH_RADIUS, EARTH_MU)
    expect(runTool('eclipse_duration', { a_m: 6_778_137 })).toEqual(record)
    expect(record?.period).toBeGreaterThan(5_400)
    expect(record?.period).toBeLessThan(5_700)
  })

  it('solar_pressure acceleration is force over mass', () => {
    const force = solarRadiationForce(10, 1.2, 1)
    const accel = solarRadiationAccel(500, 10, 1.2, 1)
    expect(runTool('solar_pressure', { area_m2: 10, mass_kg: 500, cr: 1.2, r_au: 1 })).toEqual({
      force_n: force,
      accel_m_s2: accel,
    })
    expect(accel).toBeCloseTo(4.56e-6 * 1.2 * 10 / 500, 16)
  })

  it('delta_a_burn uses circular speed as the middle argument', () => {
    const a = 6_778_137
    const v = circularOrbitVelocity(EARTH_MU, a)
    const da = deltaAFromTangentialDv(a, v!, 1)
    expect(runTool('delta_a_burn', { a_m: a, dv_m_s: 1 })).toEqual({ da_m: da })
    expect(da).toBeCloseTo((2 * a * 1) / v!, 8)
  })

  it('coelliptic phase time uses the relative mean motion', () => {
    const drift = coellipticDrift(EARTH_MU, 6_778_137, -5_000)
    const t = timeForPhaseGain(drift!.nRel, (10 * Math.PI) / 180)
    expect(
      runTool('coelliptic', { a_m: 6_778_137, delta_a_m: -5_000, phase_gain_deg: 10 }),
    ).toEqual({ ...drift, t_phase_s: t })
  })

  it('mean_motion returns only n from altitude', () => {
    const motion = meanMotionFromAltitude(400_000, EARTH_MU, EARTH_RADIUS)
    expect(runTool('mean_motion', { altitude_m: 400_000 })).toEqual({ n_rad_s: motion?.n })
    expect(motion?.n ?? 0).toBeGreaterThan(0.001)
    expect(motion?.n ?? 0).toBeLessThan(0.002)
  })

  it('solar_array treats incidence as degrees', () => {
    const faceOn = solarArrayPower(5, 0.3, 0, 1)
    const tilted = solarArrayPower(5, 0.3, 60, 1)
    expect(
      runTool('solar_array', { area_m2: 5, eta: 0.3, incidence_deg: 60, r_au: 1 }),
    ).toEqual({ p_w: tilted })
    expect(tilted).toBeCloseTo((faceOn ?? 0) / 2, 10)
    expect(tilted ?? 0).toBeGreaterThan(0)
  })

  it('horizon_range is the spherical slant range', () => {
    expect(runTool('horizon_range', { altitude_m: 400_000 })).toEqual({
      slant_m: horizonSlantRange(400_000, EARTH_RADIUS),
    })
  })

  it('angular_diameter passes the radius, not the diameter', () => {
    const angle = angularDiameter(6_378_137 / 2, 6_778_137)
    expect(runTool('angular_diameter', { diameter_m: 6_378_137, distance_m: 6_778_137 })).toEqual({
      angle_rad: angle,
    })
    expect(angle).toBeCloseTo(2 * Math.atan((6_378_137 / 2) / 6_778_137), 12)
  })

  it('diffraction converts wavelength to frequency before the aperture', () => {
    const resolved = diffractionResolution(C / 5e-7, 0.3)
    expect(runTool('diffraction', { wavelength_m: 5e-7, diameter_m: 0.3 })).toEqual({
      theta_rad: resolved?.thetaRad,
    })
    expect(resolved?.thetaRad).toBeCloseTo((1.22 * 5e-7) / 0.3, 12)
  })

  it('eclipse_beta returns eclipse seconds for a 20 deg beta', () => {
    const a = 6_778_137
    const period = orbitalPeriod(EARTH_MU, a)
    const eclipse = eclipseWithBeta(a, EARTH_RADIUS, (20 * Math.PI) / 180, period)
    expect(runTool('eclipse_beta', { a_m: a, beta_deg: 20 })).toEqual({ eclipse_s: eclipse })
    expect(eclipse ?? 0).toBeGreaterThan(0)
  })

  it('eccentric_anomaly converts E to radians before meanAnomalyFromE', () => {
    const E = (30 * Math.PI) / 180
    const M = meanAnomalyFromE(E, 0.1)
    expect(runTool('eccentric_anomaly', { e: 0.1, E_deg: 30 })).toEqual({ M_rad: M })
    expect(M).toBeCloseTo(E - 0.1 * Math.sin(E), 12)
  })

  it('scale_height is an exponential density far below the surface value', () => {
    const rho = exponentialDensity(400_000, 1.225, 8_500)
    expect(runTool('scale_height', { h_m: 400_000, rho0_kg_m3: 1.225, H_m: 8_500 })).toEqual({
      rho_kg_m3: rho,
    })
    expect(rho ?? 1).toBeLessThan(1e-10)
  })

  it('helio_hohmann uses the solar gravitational parameter', () => {
    const r1 = 149_600_000_000
    const r2 = 227_900_000_000
    expect(runTool('helio_hohmann', { r1_m: r1, r2_m: r2 })).toEqual(
      heliocentricHohmann(r1, r2, SUN_MU),
    )
  })

  it('gnss_pseudorange adds c times the clock bias', () => {
    const biased = gnssPseudorange(0, 0.07, 1e-6)
    const unbiased = gnssPseudorange(0, 0.07, 0)
    expect(runTool('gnss_pseudorange', { dt_s: 0.07, clock_bias_s: 1e-6 })).toEqual({
      rho_m: biased,
    })
    expect(runTool('gnss_pseudorange', { dt_s: 0.07 })).toEqual({ rho_m: unbiased })
    expect((biased ?? 0) - (unbiased ?? 0)).toBeCloseTo(C * 1e-6, 6)
  })

  it('rain_attenuation_simple keeps k, rate, alpha, path in library order', () => {
    const atten = rainAttenuationDb(10, 5, 0.01, 1)
    expect(
      runTool('rain_attenuation_simple', { k: 0.01, rate_mm_h: 10, alpha: 1, path_km: 5 }),
    ).toEqual({ atten_db: atten })
    expect(atten).toBeCloseTo(0.5, 12)
  })

  it('ttc_ebno converts C/N0 from dB-Hz and returns Eb/N0 in dB', () => {
    const linear = 10 ** (55 / 10)
    const eb = ebN0FromCn0(linear, 1e6)
    expect(runTool('ttc_ebno', { cn0_dbhz: 55, rb_bps: 1e6 })).toEqual({
      eb_n0_db: 10 * Math.log10(eb!),
    })
    expect(10 * Math.log10(eb!)).toBeCloseTo(-5, 10)
  })

  it('solar_sail_accel uses flux, area, mass, then efficiency', () => {
    const accel = solarSailAccel(1361, 100, 10, 0.9)
    expect(
      runTool('solar_sail_accel', { eta: 0.9, area_m2: 100, mass_kg: 10, flux_w_m2: 1361 }),
    ).toEqual({ a_m_s2: accel })
    expect(accel).toBeCloseTo((2 * 0.9 * 1361 * 100) / (C * 10), 8)
  })

  it('orbit_lifetime_rough uses density, beta, speed, scale height, then radius', () => {
    const radius = EARTH_RADIUS + 400_000
    const t = orbitLifetimeRough(2e-12, 100, 7660, 50_000, radius)
    expect(
      runTool('orbit_lifetime_rough', {
        h_m: 400_000,
        beta_kg_m2: 100,
        rho_kg_m3: 2e-12,
        v_m_s: 7660,
        scale_h_m: 50_000,
      }),
    ).toEqual({ t_s: t })
    expect(t).toBe((50_000 * 100) / (2e-12 * 7660 * radius))
  })

  it('mean_anomaly_from_e is M = E - e sin E', () => {
    const M = meanAnomalyFromE(0.5, 0.1)
    expect(runTool('mean_anomaly_from_e', { e: 0.1, E_rad: 0.5 })).toEqual({ M_rad: M })
    expect(M).toBeCloseTo(0.5 - 0.1 * Math.sin(0.5), 12)
  })

  it('exponential_density reads rho0, not rho0_kg_m3', () => {
    const rho = exponentialDensity(400_000, 1.225, 8_500)
    expect(runTool('exponential_density', { rho0: 1.225, h_m: 400_000, H_m: 8_500 })).toEqual({
      rho_kg_m3: rho,
    })
    expect(rho ?? 1).toBeLessThan(1e-10)
  })

  it('solar_flux_distance scales the solar constant by AU over range', () => {
    const flux = solarFluxAtDistance(1.5 * AU, 1361)
    expect(runTool('solar_flux_distance', { r_au: 1.5 })).toEqual({ flux_w_m2: flux })
    expect(flux).toBeCloseTo(1361 / 2.25, 6)
  })
})

describe('MCP convention payloads', () => {
  it('sgp4 names a Kepler mean-motion proxy, not a TEME state', () => {
    expect(runTool('sgp4', { n_rev_day: 15.5 })).toMatchObject({
      n_rad_s: 0.0011271918085796711,
      period_s: 5574.193548387097,
      convention: {
        frame: 'none',
        time_scale: 'none',
        element_kind: 'Kepler circular mean motion from n_rev_day, not SGP4 and not TEME',
        angle_unit: 'rad',
        validity: 'The page position and velocity are TEME. This payload is only mean motion n and period.',
      },
    })
  })

  it('look_angles stays a right triangle and says the page is SEZ', () => {
    const elev = elevationFromRangeHeight(500_000, 400_000)
    const slant = slantRange(500_000, 400_000)
    expect(runTool('look_angles', { ground_range_m: 500_000, delta_h_m: 400_000 })).toMatchObject({
      elev_rad: elev,
      slant_m: slant,
      convention: {
        frame: 'vertical plane of ground range and height difference, not SEZ and not TEME',
        time_scale: 'none',
        element_kind: 'elevation from a right triangle',
        angle_unit: 'rad',
        validity:
          'Azimuth is not computed. The page uses WGS-84 ECEF and compass azimuth in [0, 2pi).',
      },
    })
  })

  it('lambert reports way, convergence, and transfer angle, and refuses the bad long way', () => {
    const mu = EARTH_MU
    const { r1, r2 } = coplanarRadii(7e6, 7e6, Math.PI / 2)
    const sol = lambertSolve(mu, r1, r2, 2_000, false)
    expect(sol).not.toBeNull()
    expect(
      runTool('lambert', {
        r1_m: 7e6,
        r2_m: 7e6,
        ang_rad: Math.PI / 2,
        tof_s: 2_000,
        way: 'long',
        mu,
      }),
    ).toMatchObject({
      v1x: sol!.v1[0],
      v1y: sol!.v1[1],
      v1z: sol!.v1[2],
      v1_m_s: vnorm(sol!.v1),
      way: 'long',
      converged: true,
      dnu_rad: sol!.dnu,
      convention: {
        frame: 'two-body inertial, r1 on +x, transfer in the xy plane',
        time_scale: 'TOF is a duration, not a civil time scale',
        element_kind: 'single-revolution Lambert terminal velocities',
        angle_unit: 'rad',
      },
    })
    expect(sol!.dnu).toBeGreaterThan(Math.PI)

    expect(
      runTool('lambert', {
        mu: 3.986004418e14,
        r1_m: 7_000_000,
        r2_m: 8_000_000,
        ang_rad: Math.PI / 2,
        tof_s: 10_000,
        way: 'long',
      }),
    ).toBeNull()
  })

  it('gnss_geometry_gdop spreads the library DOP and refuses a repeated line of sight', () => {
    const los = [
      [0.5, 0.5, 0.7],
      [-0.3, 0.4, 0.86],
      [0.2, -0.6, 0.77],
      [-0.4, -0.2, 0.89],
    ] as const
    const dop = gnssDopFromUnitVectors(los)
    expect(
      runTool('gnss_geometry_gdop', {
        ux1: 0.5, uy1: 0.5, uz1: 0.7,
        ux2: -0.3, uy2: 0.4, uz2: 0.86,
        ux3: 0.2, uy3: -0.6, uz3: 0.77,
        ux4: -0.4, uy4: -0.2, uz4: 0.89,
      }),
    ).toMatchObject({
      ...dop,
      convention: {
        frame: 'local East, North, Up',
        time_scale: 'none',
        element_kind: 'not orbital elements',
        angle_unit: 'dimensionless DOP',
      },
    })
    expect(dop).not.toBeNull()

    expect(
      runTool('gnss_geometry_gdop', {
        ux1: 1, uy1: 0, uz1: 0,
        ux2: 1, uy2: 0, uz2: 0,
        ux3: 1, uy3: 0, uz3: 0,
        ux4: 1, uy4: 0, uz4: 0,
      }),
    ).toBeNull()
  })
})
