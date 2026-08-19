import { describe, expect, it } from 'vitest'
import {
  eciSiToEcefSi,
  eciSiToGeodetic,
  findNextPass,
  lookAnglesFromEci,
  observerEciPosition,
  parseTle,
  propagateEci,
  topocentricSezSi,
} from './sgp4'
import { ecfToEci, ecfToLookAngles, degreesToRadians, gstime, sgp4, twoline2satrec } from '../vendor/satellite-js-pure'

/**
 * Published SGP4/SDP4 verification vectors and TLEs, copied verbatim from:
 * Vallado, Crawford, Hujsak, Kelso, "Revisiting Spacetrack Report #3",
 * AIAA 2006-6753. Verification files SGP4-VER.TLE and tcppver.out,
 * https://celestrak.org/publications/AIAA/2006-6753/
 * (mirror: https://github.com/brandon-rhodes/python-sgp4/blob/master/sgp4/tcppver.out).
 * Values copied verbatim; km and km/s converted to m and m/s (x1000).
 */
type Vallado3Row = { t: number; r: [number, number, number]; v: [number, number, number] }
type Vallado3Case = {
  satnum: string
  name: string
  kind: 'near-earth' | 'deep-space'
  l1: string
  l2: string
  rows: Vallado3Row[]
}

const VALLADO_CASES: Vallado3Case[] = [
  {
    satnum: '00005',
    name: 'STR#3 SGP4 test object (original Spacetrack Report #3 SGP4 test object)',
    kind: 'near-earth',
    l1: '1 00005U 58002B   00179.78495062  .00000023  00000-0  28098-4 0  4753',
    l2: '2 00005  34.2682 348.7242 1859667 331.7664  19.3264 10.82419157413667',
    rows: [
      {
        t: 0,
        r: [7022.46529266, -1400.08296755, 0.03995155],
        v: [1.893841015, 6.405893759, 4.534807250],
      },
      {
        t: 360,
        r: [-7154.03120202, -3783.17682504, -3536.19412294],
        v: [4.741887409, -4.151817765, -2.093935425],
      },
      {
        t: 4320,
        r: [-9060.47373569, 4658.70952502, 813.68673153],
        v: [-2.232832783, -4.110453490, -3.157345433],
      },
    ],
  },
  {
    satnum: '06251',
    name: 'DELTA 1 DEB, perigee 377 km (near-Earth with drag)',
    kind: 'near-earth',
    l1: '1 06251U 62025E   06176.82412014  .00008885  00000-0  12808-3 0  3985',
    l2: '2 06251  58.0579  54.0425 0030035 139.1568 221.1854 15.56387291  6774',
    rows: [
      {
        t: 0,
        r: [3988.31022699, 5498.96657235, 0.90055879],
        v: [-3.290032738, 2.357652820, 6.496623475],
      },
      {
        t: 120,
        r: [-3935.69800083, 409.10980837, 5471.33577327],
        v: [-3.374784183, -6.635211043, -1.942056221],
      },
      {
        t: 2880,
        r: [1159.27802897, 5056.60175495, 4353.49418579],
        v: [-5.968060341, -2.314790406, 4.230722669],
      },
    ],
  },
  {
    satnum: '28129',
    name: 'NAVSTAR 53 / USA 175 GPS, 12h non-resonant (deep-space SDP4)',
    kind: 'deep-space',
    l1: '1 28129U 03058A   06175.57071136 -.00000104  00000-0  10000-3 0   459',
    l2: '2 28129  54.7298 324.8098 0048506 266.2640  93.1663  2.00562768 18443',
    rows: [
      {
        t: 0,
        r: [21707.46412351, -15318.61752390, 0.13551152],
        v: [1.304029214, 1.816904974, 3.161919976],
      },
      {
        t: 720,
        r: [21858.23838148, -15101.51661554, 387.34517048],
        v: [1.247973967, 1.856017403, 3.161439948],
      },
      {
        t: 1440,
        r: [22002.20074562, -14879.72595593, 774.32827099],
        v: [1.191573619, 1.894561165, 3.159953047],
      },
    ],
  },
  {
    satnum: '24208',
    name: 'ITALSAT 2 GEO, 24h resonant, inclination > 3° (deep-space SDP4)',
    kind: 'deep-space',
    l1: '1 24208U 96044A   06177.04061740 -.00000094  00000-0  10000-3 0  1600',
    l2: '2 24208   3.8536  80.0121 0026640 311.0977  48.3000  1.00778054 36119',
    rows: [
      {
        t: 0,
        r: [7534.10987189, 41266.39266843, -0.10801028],
        v: [-3.027168008, 0.558848996, 0.207982755],
      },
      {
        t: 720,
        r: [-6874.77975542, -41530.38329422, -46.60245459],
        v: [3.027415087, -0.494671177, -0.207337260],
      },
      {
        t: 1440,
        r: [5501.08137100, 41590.27784405, 138.32522930],
        v: [-3.050691874, 0.409203052, 0.207958133],
      },
    ],
  },
]

const AXES = ['x', 'y', 'z'] as const

describe('TLE checksum (CelesTrak TLE format)', () => {
  it('all 8 published TLE lines have length 69 and a valid modulo-10 checksum', () => {
    // Standard TLE modulo-10 checksum over columns 1-68: digits add their value,
    // '-' adds 1, everything else (letters, '.', '+', spaces) adds 0.
    // https://celestrak.org/columns/v04n03/
    const checksum = (line: string): number => {
      let sum = 0
      for (const ch of line.slice(0, 68)) {
        if (ch >= '0' && ch <= '9') sum += Number(ch)
        else if (ch === '-') sum += 1
      }
      return sum % 10
    }

    for (const c of VALLADO_CASES) {
      for (const [lineNum, text] of [
        [1, c.l1],
        [2, c.l2],
      ] as const) {
        expect(text.length, `satnum ${c.satnum} line ${lineNum}: length`).toBe(69)
        expect(checksum(text), `satnum ${c.satnum} line ${lineNum}: checksum`).toBe(
          Number(text[68]),
        )
      }
    }
  })
})

describe('vendor sgp4(tsince) matches published TEME vectors', () => {
  // Same-algorithm port of Vallado's sgp4unit; agreement is limited by IEEE-754
  // round-off. Measured max residual across all four cases: 8e-6 m and 7e-7 m/s.
  // Tolerances below carry margin for platform libm variation (python-sgp4
  // verifies the same file at 1e-8 km class).
  const POS_TOL_TSINCE = 1e-3 // m
  const VEL_TOL_TSINCE = 1e-5 // m/s

  for (const c of VALLADO_CASES) {
    it(`${c.satnum} ${c.name}: r,v match published TEME vectors`, () => {
      const satrec = twoline2satrec(c.l1, c.l2)
      expect(satrec.error, `satnum ${c.satnum}: satrec.error`).toBe(0)
      expect(
        (satrec as unknown as { method: string }).method,
        `satnum ${c.satnum}: deep-space flag`,
      ).toBe(c.kind === 'deep-space' ? 'd' : 'n')

      for (const row of c.rows) {
        const result = sgp4(satrec, row.t)
        expect(result, `satnum ${c.satnum} t=${row.t}: sgp4 returned null`).toBeTruthy()
        if (!result) throw new Error('unreachable: narrowed by expect above')
        expect(
          typeof result.position,
          `satnum ${c.satnum} t=${row.t}: position not an object`,
        ).toBe('object')
        expect(
          typeof result.velocity,
          `satnum ${c.satnum} t=${row.t}: velocity not an object`,
        ).toBe('object')

        const gotR = [result.position.x, result.position.y, result.position.z].map(
          (x) => x * 1000,
        )
        const gotV = [result.velocity.x, result.velocity.y, result.velocity.z].map(
          (x) => x * 1000,
        )
        const expR = row.r.map((x) => x * 1000)
        const expV = row.v.map((x) => x * 1000)

        for (let i = 0; i < 3; i++) {
          expect(
            Math.abs(gotR[i] - expR[i]),
            `satnum ${c.satnum} t=${row.t} r_${AXES[i]}: |${gotR[i]} - ${expR[i]}| > ${POS_TOL_TSINCE} m`,
          ).toBeLessThanOrEqual(POS_TOL_TSINCE)
          expect(
            Math.abs(gotV[i] - expV[i]),
            `satnum ${c.satnum} t=${row.t} v_${AXES[i]}: |${gotV[i]} - ${expV[i]}| > ${VEL_TOL_TSINCE} m/s`,
          ).toBeLessThanOrEqual(VEL_TOL_TSINCE)
        }
      }
    })
  }
})

describe('shipped parseTle + propagateEci(Date) matches published vectors in SI', () => {
  // JS Date has 1 ms resolution, so epoch-plus-minutes conversion carries up to
  // 0.5 ms of time error. At up to 8 km/s that bounds position error by ~4 m,
  // and (accel up to ~9 m/s^2) velocity error by ~5e-3 m/s. Measured max
  // residual across all four cases: 3.6 m and 3.5e-3 m/s.
  const POS_TOL_DATE = 10 // m
  const VEL_TOL_DATE = 0.01 // m/s

  for (const c of VALLADO_CASES) {
    it(`${c.satnum} ${c.name}: propagateEci(Date) matches published r,v`, () => {
      const p = parseTle(`${c.l1}\n${c.l2}`)
      expect(p.ok, `satnum ${c.satnum}: parseTle failed`).toBe(true)
      if (!p.ok) throw new Error('unreachable: narrowed by expect above')
      const epochMs = (p.satrec.jdsatepoch - 2440587.5) * 86400000

      for (const row of c.rows) {
        const date = new Date(Math.round(epochMs + row.t * 60000))
        const st = propagateEci(p.satrec, date)
        expect(st, `satnum ${c.satnum} t=${row.t}: propagateEci returned null`).toBeTruthy()
        if (!st) throw new Error('unreachable: narrowed by expect above')

        const expR = row.r.map((x) => x * 1000)
        const expV = row.v.map((x) => x * 1000)

        for (let i = 0; i < 3; i++) {
          expect(
            Math.abs(st.r[i] - expR[i]),
            `satnum ${c.satnum} t=${row.t} r_${AXES[i]}: |${st.r[i]} - ${expR[i]}| > ${POS_TOL_DATE} m`,
          ).toBeLessThanOrEqual(POS_TOL_DATE)
          expect(
            Math.abs(st.v[i] - expV[i]),
            `satnum ${c.satnum} t=${row.t} v_${AXES[i]}: |${st.v[i]} - ${expV[i]}| > ${VEL_TOL_DATE} m/s`,
          ).toBeLessThanOrEqual(VEL_TOL_DATE)
        }
      }
    })
  }
})

describe('TLE parsing', () => {
  it('rejects garbage input', () => {
    const p = parseTle('not a tle')
    expect(p.ok).toBe(false)
  })

  it('parses a 3-line TLE (name + lines) and returns the name', () => {
    const caseA = VALLADO_CASES[0]
    const p = parseTle(`STR#3 SGP4 TEST\n${caseA.l1}\n${caseA.l2}`)
    expect(p.ok).toBe(true)
    if (p.ok) expect(p.name).toBe('STR#3 SGP4 TEST')
  })
})

describe('findNextPass refineS: bisected AOS/LOS/peak vs coarse scan', () => {
  it('refines AOS/LOS/peak within the coarse-scan bracket (satnum 00005, observer 34.0N/-118.0W)', () => {
    // Reuses the published CASE A TLE (satnum 00005) above. Observer and
    // start date (the TLE epoch) are both fixed, so the test is deterministic.
    const caseA = VALLADO_CASES[0]
    const p = parseTle(`${caseA.l1}\n${caseA.l2}`)
    expect(p.ok, 'parseTle(caseA)').toBe(true)
    if (!p.ok) throw new Error('unreachable: narrowed by expect above')

    const observer = { latDeg: 34.0, lonDeg: -118.0, heightM: 100 }
    const start = new Date(Math.round((p.satrec.jdsatepoch - 2440587.5) * 86400000))
    const minElDeg = 10
    const minElRad = (minElDeg * Math.PI) / 180

    const coarse = findNextPass({
      satrec: p.satrec,
      observer,
      start,
      horizonH: 24,
      stepS: 30,
      minElDeg,
    })
    const refined = findNextPass({
      satrec: p.satrec,
      observer,
      start,
      horizonH: 24,
      stepS: 30,
      minElDeg,
      refineS: 1,
    })

    expect(coarse, 'coarse pass').toBeTruthy()
    expect(refined, 'refined pass').toBeTruthy()
    if (!coarse || !refined) throw new Error('unreachable: narrowed by expect above')

    // (a) refined AOS within 30 s of coarse AOS
    expect(Math.abs(refined.aos.getTime() - coarse.aos.getTime())).toBeLessThanOrEqual(30_000)

    // (b) elevation >= minEl at refined AOS, and < minEl 2 s before it
    const stAos = propagateEci(p.satrec, refined.aos)
    expect(stAos, 'propagateEci at refined AOS').toBeTruthy()
    if (!stAos) throw new Error('unreachable: narrowed by expect above')
    const lookAos = lookAnglesFromEci(observer, stAos.r, refined.aos)
    expect(lookAos, 'lookAnglesFromEci at refined AOS').toBeTruthy()
    if (!lookAos) throw new Error('unreachable: narrowed by expect above')
    expect(lookAos.elevationRad).toBeGreaterThanOrEqual(minElRad)

    const beforeAos = new Date(refined.aos.getTime() - 2000)
    const stBefore = propagateEci(p.satrec, beforeAos)
    expect(stBefore, 'propagateEci 2s before refined AOS').toBeTruthy()
    if (!stBefore) throw new Error('unreachable: narrowed by expect above')
    const lookBefore = lookAnglesFromEci(observer, stBefore.r, beforeAos)
    expect(lookBefore, 'lookAnglesFromEci 2s before refined AOS').toBeTruthy()
    if (!lookBefore) throw new Error('unreachable: narrowed by expect above')
    expect(lookBefore.elevationRad).toBeLessThan(minElRad)

    // (c) refined peak is not lower than the coarse peak
    expect(refined.maxElDeg).toBeGreaterThanOrEqual(coarse.maxElDeg - 1e-6)

    // (d) refined LOS within 30 s of coarse LOS
    expect(Math.abs(refined.los.getTime() - coarse.los.getTime())).toBeLessThanOrEqual(30_000)

    // (e) durationS consistent with los - aos within 1 ms
    const expectedDurationS = (refined.los.getTime() - refined.aos.getTime()) / 1000
    expect(Math.abs(refined.durationS - expectedDurationS)).toBeLessThanOrEqual(0.001)
  })
})

describe('observerEciPosition round-trips through eciSiToGeodetic', () => {
  it('recovers the input geodetic lat/lon/height within tight tolerance', () => {
    // Same ellipsoid on both sides of the round trip, so the residual is
    // pure floating-point error, not a modeling difference.
    const observer = { latDeg: 34.0, lonDeg: -118.0, heightM: 100 }
    const date = new Date('2024-01-01T00:00:00.000Z')

    const eci = observerEciPosition(observer, date)
    const back = eciSiToGeodetic(eci, date)

    expect(back, 'eciSiToGeodetic(observerEciPosition(...))').toBeTruthy()
    if (!back) throw new Error('unreachable: narrowed by expect above')

    expect(Math.abs(back.latDeg - observer.latDeg)).toBeLessThanOrEqual(1e-6)
    expect(Math.abs(back.lonDeg - observer.lonDeg)).toBeLessThanOrEqual(1e-6)
    expect(Math.abs(back.heightM - observer.heightM)).toBeLessThanOrEqual(1)
  })
})

describe('eciSiToEcefSi', () => {
  const rM: [number, number, number] = [
    7022.46529266 * 1000,
    -1400.08296755 * 1000,
    0.03995155 * 1000,
  ]
  const date = new Date('2024-01-01T00:00:00.000Z')

  it('preserves the vector norm (pure rotation about Z)', () => {
    const ecef = eciSiToEcefSi(rM, date)
    const normEci = Math.hypot(rM[0], rM[1], rM[2])
    const normEcef = Math.hypot(ecef[0], ecef[1], ecef[2])
    expect(Math.abs(normEcef - normEci) / normEci).toBeLessThanOrEqual(1e-6)
  })

  it('round-trips through vendor ecfToEci at the same date', () => {
    const ecef = eciSiToEcefSi(rM, date)
    const gmst = gstime(date)
    const back = ecfToEci({ x: ecef[0] / 1000, y: ecef[1] / 1000, z: ecef[2] / 1000 }, gmst)
    const backM: [number, number, number] = [back.x * 1000, back.y * 1000, back.z * 1000]

    for (let i = 0; i < 3; i++) {
      const rel = Math.abs(backM[i] - rM[i]) / Math.abs(rM[i])
      expect(rel, `component ${AXES[i]}`).toBeLessThanOrEqual(1e-6)
    }
  })
})

describe('topocentricSezSi: consistency with vendor ecfToLookAngles', () => {
  it('matches el/az/range reconstructed from the shipped library path (Vallado CASE A, observer 34N/-118W/100m)', () => {
    // Reuses the published CASE A TLE (satnum 00005) at its epoch (t=0).
    const caseA = VALLADO_CASES[0]
    const p = parseTle(`${caseA.l1}\n${caseA.l2}`)
    expect(p.ok, 'parseTle(caseA)').toBe(true)
    if (!p.ok) throw new Error('unreachable: narrowed by expect above')

    const epochMs = (p.satrec.jdsatepoch - 2440587.5) * 86400000
    const date = new Date(Math.round(epochMs))
    const row = caseA.rows[0] // t = 0, at epoch
    const rM: [number, number, number] = [row.r[0] * 1000, row.r[1] * 1000, row.r[2] * 1000]

    const observer = { latDeg: 34, lonDeg: -118, heightM: 100 }
    const satEcefM = eciSiToEcefSi(rM, date)
    const sez = topocentricSezSi(observer, satEcefM)

    const rangeM = Math.hypot(sez.southM, sez.eastM, sez.zenithM)
    const el = Math.asin(sez.zenithM / rangeM)
    let az = Math.atan2(sez.eastM, -sez.southM)
    if (az < 0) az += 2 * Math.PI

    const vendorLook = ecfToLookAngles(
      {
        longitude: degreesToRadians(observer.lonDeg),
        latitude: degreesToRadians(observer.latDeg),
        height: observer.heightM / 1000,
      },
      { x: satEcefM[0] / 1000, y: satEcefM[1] / 1000, z: satEcefM[2] / 1000 },
    )

    expect(Math.abs(el - vendorLook.elevation)).toBeLessThanOrEqual(1e-9)
    expect(Math.abs(az - vendorLook.azimuth)).toBeLessThanOrEqual(1e-9)
    const rangeRel = Math.abs(rangeM - vendorLook.rangeSat * 1000) / (vendorLook.rangeSat * 1000)
    expect(rangeRel).toBeLessThanOrEqual(1e-6)
  })
})
