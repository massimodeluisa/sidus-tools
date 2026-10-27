/**
 * Domain regressions for issues 88, 90, 93, 112, 113, 129, 136, 143, 144,
 * 145, 146, 147, 148, and 150. Helpers and the JavaScript export must agree.
 */
import { describe, expect, it } from 'vitest'
import { keplerPropagate } from './kepler'
import { j2ArgpRate, j2RaanRate } from './j2'
import { meanMotionFromAltitude } from './ops'
import {
  batteryDepthOfDischarge,
  edelbaumDv,
  flightPathAngle,
  geoDriftRate,
  hillSphere,
  meanAnomalyFromE,
  orbitLifetimeRough,
  repeatingGroundTrackPeriod,
  solarSailAccel,
  umbraLength,
} from './discovery-wave'
import { getSnippets } from '../snippets'
import { formatCodeNumber } from '../snippets/live-values'

function evalJs(body: string, names: string[], ret: string) {
  const fn = new Function(...names, `${body}\nreturn ${ret}`) as (...args: number[]) => number
  return (...args: number[]) => fn(...args)
}

function relativeGap(got: number, ref: number): number {
  return Math.abs(got / ref - 1)
}

describe('issue 88 and 90: elliptic mean anomaly', () => {
  const body = getSnippets('mean-anomaly-from-e')!.code.javascript!
  const M = evalJs(body, ['E', 'e'], 'M')

  it('refuses the parabolic and hyperbolic domains in the export', () => {
    expect(meanAnomalyFromE(1, 1)).toBeNull()
    expect(meanAnomalyFromE(1, 1.5)).toBeNull()
    expect(Number.isFinite(M(1, 1))).toBe(false)
    expect(Number.isFinite(M(1, 1.5))).toBe(false)
  })

  it('matches the 80-digit reference where direct subtraction cancels', () => {
    const E = 1e-8
    const cases = [
      { e: 0.999999999999, ref: 9.9999454494654517e-21, directRel: 9e-5 },
      { e: 0.9999999999999999, ref: 1.2768896912918232e-24, directRel: 0.2 },
    ]
    for (const c of cases) {
      const e = Number(formatCodeNumber(c.e))
      expect(e).toBeLessThan(1)
      const helper = meanAnomalyFromE(E, e)
      expect(helper).not.toBeNull()
      expect(relativeGap(helper as number, c.ref)).toBeLessThan(1e-12)
      expect(relativeGap(M(E, e), c.ref)).toBeLessThan(1e-12)
      const direct = E - e * Math.sin(E)
      expect(relativeGap(direct, c.ref)).toBeGreaterThan(c.directRel)
    }
  })
})

describe('issue 93: conic flight-path angle', () => {
  const phi = evalJs(getSnippets('flight-path-angle')!.code.javascript!, ['e', 'nu'], 'phi')

  it('accepts the parabola and both hyperbolic branches', () => {
    expect(flightPathAngle(1, Math.PI / 3)).toBeCloseTo(Math.PI / 6, 12)
    expect(flightPathAngle(2, Math.PI / 3)).toBeCloseTo(0.7137243789447656, 12)
    expect(flightPathAngle(2, -Math.PI / 3)).toBeCloseTo(-0.7137243789447656, 12)
    expect(phi(1, Math.PI / 3)).toBeCloseTo(Math.PI / 6, 12)
    expect(phi(2, Math.PI / 3)).toBeCloseTo(0.7137243789447656, 12)
    expect(phi(2, -Math.PI / 3)).toBeCloseTo(-0.7137243789447656, 12)
  })

  it('rejects the asymptote, a degree-rounded asymptote, and negative eccentricity', () => {
    const asymptote = Math.acos(-1 / 2)
    expect(flightPathAngle(2, asymptote)).toBeNull()
    expect(flightPathAngle(2, (120 * Math.PI) / 180)).toBeNull()
    expect(flightPathAngle(-0.1, 0.4)).toBeNull()
    expect(Number.isFinite(phi(2, asymptote))).toBe(false)
    expect(Number.isFinite(phi(-0.1, 0.4))).toBe(false)
    expect(flightPathAngle(2, asymptote - 1e-14)).not.toBeNull()
    expect(Number.isFinite(phi(2, asymptote - 1e-14))).toBe(true)
  })
})

describe('issue 112: mean motion without an a^3 overflow', () => {
  it('keeps a huge finite semimajor axis finite', () => {
    const mu = 3.986004418e14
    const h = 1e103
    const R = 6_378_137
    expect(Number.isFinite((R + h) ** 3)).toBe(false)
    const m = meanMotionFromAltitude(h, mu, R)
    expect(m).not.toBeNull()
    expect(m!.n).not.toBe(0)
    expect(relativeGap(m!.n, 6.313481145928924e-148)).toBeLessThan(1e-12)
    expect(Number.isFinite(m!.period)).toBe(true)
    expect(m!.period).toBeGreaterThan(1e147)
    const n = evalJs(getSnippets('mean-motion')!.code.javascript!, ['R', 'h', 'mu'], 'n')(R, h, mu)
    expect(Number.isFinite(n)).toBe(true)
    expect(n).not.toBe(0)
    expect(relativeGap(n, m!.n)).toBeLessThan(1e-12)
  })
})

describe('issue 113: hyperbolic Kepler export converges', () => {
  const mu = 3.986004418e14
  const rx = 7_000_000
  const vy = 25027.4274113136
  const dt = 10_000

  it('matches the core on the published hyperbola', () => {
    const core = keplerPropagate(mu, { r: [rx, 0, 0], v: [0, vy, 0] }, dt)
    expect(core).not.toBeNull()
    const body = getSnippets('kepler-propagate')!.code.javascript!
    const fn = new Function(
      'mu',
      'rx',
      'ry',
      'rz',
      'vx',
      'vy',
      'vz',
      'dt_s',
      `${body}\nreturn { r_x, r_y, r_z, v_x, v_y, v_z }`,
    ) as (...args: number[]) => { r_x: number; r_y: number; v_x: number; v_y: number }
    const got = fn(mu, rx, 0, 0, 0, vy, 0, dt)
    expect(relativeGap(got.r_x, core!.r[0])).toBeLessThan(1e-12)
    expect(relativeGap(got.r_y, core!.r[1])).toBeLessThan(1e-12)
    expect(relativeGap(got.v_x, core!.v[0])).toBeLessThan(1e-12)
    expect(got.r_y).toBeLessThan(1e9)
  })

  it('fails closed in every executable language when Newton does not converge', () => {
    const snip = getSnippets('kepler-propagate')!
    for (const lang of [
      'python',
      'javascript',
      'typescript',
      'c',
      'cpp',
      'rust',
      'zig',
      'fortran',
      'matlab',
      'julia',
    ] as const) {
      const body = snip.code[lang] ?? ''
      expect(body, lang).toMatch(/log|ln\(/)
      expect(body, lang).toMatch(/kepler_ok|converged|nothing|None/)
    }
  })
})

describe('issue 129: solar-sail efficiency', () => {
  const a = evalJs(getSnippets('solar-sail-accel')!.code.javascript!, ['eta', 'flux', 'A', 'm'], 'a')

  it('accepts η = 1 and rejects η > 1', () => {
    const ideal = solarSailAccel(1361, 100, 10, 1)
    expect(ideal).toBeCloseTo(9.079614671293698e-5, 16)
    expect(solarSailAccel(1361, 100, 10, 1.5)).toBeNull()
    expect(a(1, 1361, 100, 10)).toBeCloseTo(ideal as number, 16)
    expect(Number.isFinite(a(1.5, 1361, 100, 10))).toBe(false)
  })
})

describe('issue 136: battery depth of discharge', () => {
  const dod = evalJs(getSnippets('battery-dod')!.code.javascript!, ['eUsed', 'eCap'], 'DoD')

  it('stays on (0, 1] and does not turn infinite capacity into zero', () => {
    expect(batteryDepthOfDischarge(0, 100)).toBeNull()
    expect(batteryDepthOfDischarge(100, 100)).toBe(1)
    expect(batteryDepthOfDischarge(50, 100)).toBe(0.5)
    expect(batteryDepthOfDischarge(750, 500)).toBeNull()
    expect(batteryDepthOfDischarge(-10, 100)).toBeNull()
    expect(batteryDepthOfDischarge(50, Number.POSITIVE_INFINITY)).toBeNull()
    expect(batteryDepthOfDischarge(Number.NaN, 100)).toBeNull()
    expect(dod(100, 100)).toBe(1)
    expect(Number.isFinite(dod(50, Number.POSITIVE_INFINITY))).toBe(false)
    expect(dod(50, Number.POSITIVE_INFINITY)).not.toBe(0)
  })
})

describe('issue 143: umbra overlap', () => {
  const L = evalJs(getSnippets('umbra-length')!.code.javascript!, ['d', 'Rs', 'Rb'], 'L')
  const au = 149_597_870_700
  const rs = 695_700_000

  it('rejects overlap, allows contact, and matches the Earth and Moon cones', () => {
    expect(umbraLength(1, 2, 1)).toBeNull()
    expect(umbraLength(3, 2, 1)).toBe(3)
    expect(umbraLength(au, rs, 6_371_000)).toBeCloseTo(1_382_631_565.23, 1)
    expect(umbraLength(au, rs, 1_737_400)).toBeCloseTo(374_532_201.81, 1)
    expect(Number.isFinite(L(1, 2, 1))).toBe(false)
    expect(L(3, 2, 1)).toBe(3)
  })
})

describe('issue 144: Hill radius mass hierarchy', () => {
  const rH = evalJs(getSnippets('hill-sphere')!.code.javascript!, ['a', 'm', 'M'], 'rH')

  it('rejects m >= M and keeps a low mass-ratio anchor', () => {
    expect(hillSphere(1, 1, 1)).toBeNull()
    expect(hillSphere(1, 2, 1)).toBeNull()
    const a = 149_597_870_700
    const m = 5.9722e24
    const M = 1.98847e30
    const earth = hillSphere(a, m, M)
    expect(earth).toBeCloseTo(a * Math.cbrt(m / (3 * M)), 6)
    expect(Number.isFinite(rH(1, 1, 1))).toBe(false)
    expect(rH(a, m, M)).toBeCloseTo(earth as number, 6)
  })
})

describe('issue 145: Edelbaum inclination range', () => {
  const dv = evalJs(getSnippets('edelbaum-dv')!.code.javascript!, ['v1', 'v2', 'di'], 'dv')

  it('stops at 2 rad and keeps the NASA 28.7 degree anchor', () => {
    const v1 = 7700
    const v2 = 3100
    const justBelow = edelbaumDv(v1, v2, 1.999)
    const lower = edelbaumDv(v1, v2, 1)
    expect(justBelow).not.toBeNull()
    expect(lower).not.toBeNull()
    expect(lower as number).toBeLessThan(justBelow as number)
    expect(justBelow as number).toBeLessThan(10800)
    expect(edelbaumDv(v1, v2, 2)).toBeNull()
    expect(edelbaumDv(v1, v2, Math.PI)).toBeNull()
    expect(edelbaumDv(7613, 3075, (28.7 * Math.PI) / 180)).toBeCloseTo(5861.23, 1)
    expect(Number.isFinite(dv(v1, v2, 2))).toBe(false)
    expect(Number.isFinite(dv(v1, v2, Math.PI))).toBe(false)
    expect(dv(v1, v2, 1.999)).toBeCloseTo(justBelow as number, 6)
  })
})

describe('issue 146: integer repeating-ground-track count', () => {
  const T = evalJs(getSnippets('repeating-ground-track')!.code.javascript!, ['k', 'days'], 'T')

  it('uses the same rounded revolution count on the page helper and the export', () => {
    expect(repeatingGroundTrackPeriod(14.4, 1)).toBe(86400 / 14)
    expect(repeatingGroundTrackPeriod(14, 1)).toBe(86400 / 14)
    expect(T(14.4, 1)).toBe(86400 / 14)
    expect(T(14, 1)).toBe(86400 / 14)
    expect(T(14.4, 1)).toBe(repeatingGroundTrackPeriod(Math.round(14.4), 1))
  })
})

describe('issue 147: local drag timescale', () => {
  it('does not report the integrated one-scale-height time as the local timescale', () => {
    const local = orbitLifetimeRough(1e-12, 100, 7500, 50_000, 6_778_000)
    expect(local).toBeCloseTo(98_357_430.9, 0)
    const integrated = (local as number) * (1 - Math.exp(-1))
    expect(integrated).toBeCloseTo(62_173_754.2, 0)
    expect(Math.abs((local as number) - integrated) / (local as number)).toBeGreaterThan(0.3)
    const assumptions = getSnippets('orbit-lifetime-rough')!.assumptions
    expect(assumptions).toMatch(/frozen/i)
    expect(assumptions).toMatch(/not the integrated/i)
    const t = evalJs(
      getSnippets('orbit-lifetime-rough')!.code.javascript!,
      ['H', 'beta', 'rho', 'v', 'a'],
      't',
    )(50_000, 100, 1e-12, 7500, 6_778_000)
    expect(t).toBeCloseTo(local as number, 6)
    expect(Math.abs(t - integrated) / t).toBeGreaterThan(0.3)
  })
})

describe('issue 148: near-GEO linear drift', () => {
  const rate = evalJs(getSnippets('geo-drift-rate')!.code.javascript!, ['a', 'aGeo', 'nGeo'], 'rate')
  const aGeo = 42_164_000
  const nGeo = 7.292115e-5

  it('keeps a small offset and rejects a 10% offset', () => {
    expect(geoDriftRate(aGeo, aGeo, nGeo)).toBeCloseTo(0, 15)
    const small = geoDriftRate(42_170_000, aGeo, nGeo)
    expect(small).toBeCloseTo(-1.5 * nGeo * (42_170_000 - aGeo) / aGeo, 12)
    expect(geoDriftRate(0.9 * aGeo, aGeo, nGeo)).toBeNull()
    expect(geoDriftRate(1.1 * aGeo, aGeo, nGeo)).toBeNull()
    expect(rate(aGeo, aGeo, nGeo)).toBeCloseTo(0, 15)
    expect(Number.isFinite(rate(0.9 * aGeo, aGeo, nGeo))).toBe(false)
    expect(Number.isFinite(rate(1.1 * aGeo, aGeo, nGeo))).toBe(false)
  })
})

describe('issue 150: circular-orbit argument of perigee', () => {
  const mu = 3.986004418e14
  const a = 6_778_137
  const i = (51.6 * Math.PI) / 180

  it('returns null for argp at e = 0 and keeps the RAAN rate', () => {
    expect(j2ArgpRate(mu, a, 0, i)).toBeNull()
    const raan = j2RaanRate(mu, a, 0, i)
    expect(raan).not.toBeNull()
    expect(Number.isFinite(raan as number)).toBe(true)
    const ecc = j2ArgpRate(mu, a, 0.001, i)
    expect(ecc).not.toBeNull()
    const body = getSnippets('j2-drift')!.code.javascript!
    const fn = new Function(
      'mu',
      'a',
      'e',
      'i',
      'R',
      `${body}\nreturn { dOmega, domega }`,
    ) as (
      mu: number,
      a: number,
      e: number,
      i: number,
      R: number,
    ) => { dOmega: number; domega: number }
    const circular = fn(mu, a, 0, i, 6_378_137)
    expect(Number.isFinite(circular.dOmega)).toBe(true)
    expect(Number.isFinite(circular.domega)).toBe(false)
    const elliptic = fn(mu, a, 0.001, i, 6_378_137)
    expect(elliptic.domega).toBeCloseTo(ecc as number, 8)
    expect(getSnippets('arg-perigee-drift-j2')!.assumptions).toMatch(/e > 0/)
  })
})
