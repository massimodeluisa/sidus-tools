import { describe, it, expect } from 'vitest'
import { getSnippets } from '../index'
import { safeIdent } from '../live-values'
import type { CodeLang } from '../types'
import { EXPECTED, UNVERIFIABLE } from './expected'
import { asInjected, inputBagFor, scenariosFor } from './inputs'

/** Original pilot scope for the snippet verification harness. */
const PILOT = [
  'circular-orbit',
  'hohmann',
  'vis-viva',
  'plane-change',
  'rocket-equation',
  'link-budget',
  'heat-flux',
  'metabolic-load',
  'j2-drift',
  'dynamic-pressure',
  'antenna-gain-effective',
  'nyquist-rate',
  'quaternion-euler',
  'look-angles',
  'kepler-propagate',
] as const

/**
 * Orbits/maneuvers coverage wave: every category:'orbital' tool minus the
 * pilots above, minus sgp4 (hard exclusion) and the satellite-category tools
 * (j2-drift, quaternion-euler, sgp4 — out of this wave's scope).
 */
const ORBITS_WAVE = [
  'escape',
  'bielliptic',
  'lambert',
  'rv-elements',
  'apsides',
  'bodies',
  'launch-azimuth',
  'sso',
  'cw-rendezvous',
  'phasing',
  'hyperbolic-c3',
  'hohmann-plane',
  'soi',
  'synodic-period',
  'circularize',
  'geo-orbit',
  'delta-a-burn',
  'plane-change-apo',
  'coelliptic',
  'los-range-rate',
  'oberth',
  'deorbit',
  'mean-motion',
  'apo-raise',
  'along-track',
  'period-match',
  'hohmann-time',
  'orbital-energy',
  'true-anomaly',
  'flyby-speed',
  'eccentric-anomaly',
  'rendezvous-catchup',
  'sso-period',
  'critical-inclination',
  'relative-period',
  'energy-vinf',
  'specific-angular-momentum',
  'escape-margin',
  'constellation-walker',
  'coverage-swath',
  'revisit-time-simple',
  'geo-stationkeeping-dv',
  'drag-make-up-dv',
  'optical-gsd',
  'cr3bp-jacobi',
  'orbit-lifetime-rough',
  'geo-drift-rate',
  'arg-perigee-drift-j2',
  'umbra-length',
  'mean-anomaly-from-e',
  'flight-path-angle',
  'repeating-ground-track',
  'molniya-tundra',
  'frozen-orbit',
  'herrick-gibbs',
  'lunisolar-rates',
  'schweighart-sedwick',
] as const

/**
 * Propulsion/launch/aero coverage wave: every category:'propulsion' tool
 * (plus the 'utilities'-category ones this wave also covered) minus the
 * pilots above.
 */
const PROPULSION_WAVE = [
  'blowdown-tank',
  'boiloff-rate',
  'characteristic-velocity-cstar',
  'cold-gas-thrust',
  'delta-v-budget',
  'edelbaum-dv',
  'equal-stage',
  'finite-burn-dv',
  'geo-propellant-budget',
  'gravity-loss',
  'hall-thruster-isp',
  'ideal-thrust',
  'impulse-budget',
  'ion-thruster-efficiency',
  'isentropic-nozzle',
  'mass-ratio-stack',
  'mixture-ratio',
  'multi-stage',
  'payload-fraction',
  'propellant-density-impulse',
  'propellant-mass',
  'rcs',
  'rocket-thrust-chamber',
  'solar-sail-accel',
  'tank-ullage',
  'throat-area-sizing',
  'thrust-to-weight',
  'thruster-impulse-bit',
  'low-thrust-escape',
] as const

/**
 * RF/link/GNSS/optical + ADCS/pointing coverage wave: every category:'satellite'
 * tool this wave covered, minus the pilots above.
 */
const SATELLITE_WAVE = [
  'antenna-beamwidth',
  'conjunction-pc',
  'data-volume',
  'diffraction',
  'diffraction-limit',
  'allan-range-rate',
  'doppler-shift-leo',
  'dsn-array-gain',
  'eclipse-beta',
  'eclipse-duration',
  'eirp-gt',
  'geo-light-time',
  'gnss-ionosphere-klobuchar',
  'gnss-pseudorange',
  'gravity-gradient-torque',
  'ground-track',
  'ground-track-shift',
  'horizon-range',
  'impedance-matching',
  'laser-link-budget',
  'laser-pointing-jitter',
  'laser-time-of-flight',
  'link-margin',
  'magnetic-torque',
  'magnetorquer-moment',
  'nodal-period',
  'optical-ber-q',
  'pointing-budget-rss',
  'quest-attitude',
  'radar-equation',
  'radar-range-resolution',
  'rain-attenuation-simple',
  'reaction-wheel',
  'residual-dipole-torque',
  'rw-momentum-capacity',
  'sar-azimuth-resolution',
  'slew-rate-pointing',
  'solar-pressure',
  'star-tracker-noise',
  'sun-sensor-cone',
  'ttc-ebno',
] as const

/**
 * Systems/power/thermal + misc-utilities coverage wave: every category:'utilities'
 * tool this wave covered, minus the pilots above.
 */
const UTILITIES_WAVE = [
  'aerobraking-pass',
  'angular-diameter',
  'ballistic-drag',
  'ballistic-range',
  'battery',
  'battery-dod',
  'coordinated-turn-bank',
  'custom-body',
  'drag-force',
  'earth-ir-flux',
  'eps-orbit-average',
  'exponential-density',
  'free-fall-time',
  'hoop-stress',
  'light-time',
  'orbit-3d',
  'panel-eol-power',
  'parachute-descent',
  'planck-radiance',
  'plotter',
  'relativity-clock-rate',
  'scale-height',
  'solar-array',
  'solar-flux-distance',
  'stefan-boltzmann',
  'terminal-velocity',
  'units',
  'wien-peak',
] as const

/**
 * Crew/ECLSS + planetary/interplanetary + geometry coverage wave: every tool
 * in category 'crew', 'planetary', or 'geometry', minus the pilots above
 * (metabolic-load is the only pilot in those categories).
 */
const PLANETARY_WAVE = [
  'b-plane-impact',
  'b-plane-target',
  'cabin-atmosphere',
  'cabin-leak',
  'capture-circularize',
  'elevation-azimuth',
  'helio-hohmann',
  'hill-sphere',
  'hyperbolic-eccentricity',
  'lioh-scrubber',
  'patched-conic-depart',
  'porkchop-earth-mars',
  'pump-crank',
  'spherical-distance',
  'surface-g-escape',
  'thermal-loop',
  'thermal-rad',
  'tisserand-parameter',
  'vector-angle',
] as const

/** ODC thermal wave (radiator, dawn-dusk SSO, two-phase loop, heat pump, sizing, cold plate, shield). */
const ODC_WAVE = [
  'radiator-net-flux',
  'sso-dawn-dusk',
  'two-phase-loop',
  'radiator-heat-pump',
  'odc-power-thermal-sizing',
  'cold-plate-dt',
  'shield-mass-scaling',
] as const

/** All tool ids currently covered by EXPECTED, across every wave. */
const COVERED = [
  ...PILOT,
  ...ORBITS_WAVE,
  ...PROPULSION_WAVE,
  ...SATELLITE_WAVE,
  ...UTILITIES_WAVE,
  ...PLANETARY_WAVE,
  ...ODC_WAVE,
] as const

/** Languages whose bodies may rename a result through `safeIdent`. */
const IDENT_LANGS: CodeLang[] = ['c', 'rust', 'zig', 'fortran']
const BODY_LANGS: CodeLang[] = [
  'c',
  'cpp',
  'rust',
  'zig',
  'python',
  'javascript',
  'typescript',
  'matlab',
  'julia',
  'fortran',
]

function expectedFor(id: string): Record<string, number> {
  const fn = EXPECTED[id]
  if (!fn) throw new Error(`no EXPECTED entry for ${id}`)
  return fn(asInjected(inputBagFor(id)) as Record<string, number | string>)
}

/** Language bodies of `id` that mention any of `keys` verbatim or via safeIdent. */
function bodiesMentioning(id: string, keys: string[]): number {
  const snip = getSnippets(id)
  let hits = 0
  for (const lang of BODY_LANGS) {
    const body = snip?.code[lang]
    if (!body) continue
    const spellings = new Set(keys)
    if (IDENT_LANGS.includes(lang)) for (const k of keys) spellings.add(safeIdent(lang, k))
    const found = [...spellings].some((s) =>
      new RegExp(`(?<![A-Za-z0-9_])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9_])`).test(body),
    )
    if (found) hits++
  }
  return hits
}

describe('snippet verification expected values', () => {
  for (const id of COVERED) {
    describe(id, () => {
      it('has an EXPECTED entry', () => {
        expect(EXPECTED[id]).toBeTypeOf('function')
      })

      if (id in UNVERIFIABLE) {
        it('is documented as unverifiable and returns no expected values', () => {
          expect(UNVERIFIABLE[id]).toBeTruthy()
          expect(Object.keys(expectedFor(id))).toHaveLength(0)
        })
        return
      }

      it('returns finite numbers for the tool input bag', () => {
        const out = expectedFor(id)
        expect(Object.keys(out).length).toBeGreaterThan(0)
        for (const [key, value] of Object.entries(out)) {
          expect(Number.isFinite(value), `${id}.${key} = ${value}`).toBe(true)
        }
      })

      it('names at least one result that appears in 8+ language bodies', () => {
        const keys = Object.keys(expectedFor(id))
        const best = Math.max(...keys.map((k) => bodiesMentioning(id, [k])))
        expect(best).toBeGreaterThanOrEqual(8)
      })
    })
  }

  it('covers exactly the pilots plus every landed coverage wave', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual([...COVERED].sort())
  })

  it('matches the analytic southwest ENU look-angle vector', () => {
    const fixed = EXPECTED['elevation-azimuth']({ east: -1, north: 0, up: 1 })
    expect(fixed.rho).toBeCloseTo(Math.sqrt(2), 14)
    expect(fixed.el).toBeCloseTo(Math.PI / 4, 14)
    expect(fixed.az).toBeCloseTo((3 * Math.PI) / 2, 14)
    expect(fixed.az).toBeGreaterThanOrEqual(0)
    expect(fixed.az).toBeLessThan(2 * Math.PI)
  })

  it('matches the analytic west-quadrant look-angle vector', () => {
    const fixed = EXPECTED['look-angles']({
      sat_x: 6_379_137,
      sat_y: -1000,
      sat_z: 0,
      lat: 0,
      lon: 0,
      h_m: 0,
    })
    expect(fixed.range_m).toBeCloseTo(Math.sqrt(2_000_000), 9)
    expect(fixed.el).toBeCloseTo(Math.PI / 4, 14)
    expect(fixed.az).toBeCloseTo((3 * Math.PI) / 2, 14)
    expect(fixed.az).toBeGreaterThanOrEqual(0)
    expect(fixed.az).toBeLessThan(2 * Math.PI)
  })

  it('matches analytic north/east/south/west vectors at an equatorial WGS-84 observer', () => {
    const cases = [
      { name: 'north', sat_x: 6_379_137, sat_y: 0, sat_z: 1000, az: 0 },
      { name: 'east', sat_x: 6_379_137, sat_y: 1000, sat_z: 0, az: Math.PI / 2 },
      { name: 'south', sat_x: 6_379_137, sat_y: 0, sat_z: -1000, az: Math.PI },
      { name: 'west', sat_x: 6_379_137, sat_y: -1000, sat_z: 0, az: (3 * Math.PI) / 2 },
    ]

    for (const c of cases) {
      const got = EXPECTED['look-angles']({
        sat_x: c.sat_x,
        sat_y: c.sat_y,
        sat_z: c.sat_z,
        lat: 0,
        lon: 0,
        h_m: 0,
      })
      expect(got.range_m, c.name).toBeCloseTo(Math.sqrt(2_000_000), 9)
      expect(got.el, c.name).toBeCloseTo(Math.PI / 4, 14)
      expect(got.az, c.name).toBeCloseTo(c.az, 14)
    }
  })
})

/**
 * Tools whose snippet body has zero free vars (every constant is hardcoded, e.g.
 * geo-light-time's `t = h_GEO / c`): every possible scenario computes the exact
 * same result, so a second or third scenario would be a literal-duplicate bag,
 * not additional coverage. One scenario is the honest ceiling for these.
 */
const NO_FREE_VAR_TOOLS = new Set(['geo-light-time'])

describe('snippet verification scenarios', () => {
  for (const id of COVERED) {
    describe(id, () => {
      it('has at least 3 scenarios (or 1, if the formula has no free vars)', () => {
        const min = NO_FREE_VAR_TOOLS.has(id) ? 1 : 3
        expect(scenariosFor(id).length).toBeGreaterThanOrEqual(min)
      })

      it('every scenario has a name and a finite expected-value map', () => {
        const fn = EXPECTED[id]
        if (!fn) throw new Error(`no EXPECTED entry for ${id}`)
        for (const scenario of scenariosFor(id)) {
          expect(scenario.name, `${id} scenario name`).toBeTruthy()
          const out = fn(asInjected(scenario.bag) as Record<string, number | string>)
          for (const [key, value] of Object.entries(out)) {
            expect(Number.isFinite(value), `${id}[${scenario.name}].${key} = ${value}`).toBe(true)
          }
        }
      })
    })
  }
})

describe('dynamic-pressure independent USSA 1976 anchors', () => {
  const reference = EXPECTED['dynamic-pressure']!

  it('preserves the sea-level reference state', () => {
    const out = reference({ h: 0, v: 300 })
    expect(out.T).toBeCloseTo(288.15, 10)
    expect(out.p).toBeCloseTo(101_325, 8)
    expect(out.rho).toBeCloseTo(1.225, 7)
    expect(out.q).toBeCloseTo(55_125, 2)
  })

  it('is continuous at the geopotential 11 km and 20 km layer boundaries', () => {
    const h11 = 11_019.06815051547
    const at11 = reference({ h: h11, v: 300 })
    expect(at11.T).toBeCloseTo(216.65, 5)
    expect(at11.p).toBeCloseTo(22_632.040095, 3)

    const h20 = 20_063.12473763781
    const at20 = reference({ h: h20, v: 300 })
    expect(at20.T).toBeCloseTo(216.65, 5)
    expect(at20.p).toBeCloseTo(5_474.877424, 3)
  })

  it('matches the geometric 20 km isothermal-layer reference', () => {
    const out = reference({ h: 20_000, v: 300 })
    expect(out.T).toBeCloseTo(216.65, 8)
    expect(out.p).toBeCloseTo(5_529.30148278, 5)
    expect(out.rho).toBeCloseTo(0.0889098102871, 10)
    expect(out.q).toBeCloseTo(4_000.94146292, 6)
  })

  it('matches the geometric 32 km upper-limit stratosphere reference', () => {
    const out = reference({ h: 32_000, v: 300 })
    expect(out.T).toBeCloseTo(228.489715997, 8)
    expect(out.p).toBeCloseTo(889.061807060, 6)
    expect(out.rho).toBeCloseTo(0.0135551211255, 12)
    expect(out.q).toBeCloseTo(609.980450648, 8)
  })

  it('keeps the upper-layer cases in the cross-language scenario bag', () => {
    const names = scenariosFor('dynamic-pressure').map((scenario) => scenario.name)
    expect(names).toContain('sea-level')
    expect(names).toContain('geopotential-11-km-layer-boundary')
    expect(names).toContain('geometric-20-km-tropopause-layer')
    expect(names).toContain('geopotential-20-km-layer-boundary')
    expect(names).toContain('geometric-32-km-page-limit')
  })
})
