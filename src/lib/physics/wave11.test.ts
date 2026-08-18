import { describe, expect, it } from 'vitest'
import { EARTH_MU, EARTH_RADIUS, MOON_MU } from './constants'
import { EARTH_J2 } from './j2'
import { cwPropagate } from './cw'
import { keplerPropagate } from './kepler'
import { applyDcm, euler321ToQuat, quatToDcm } from './wave10'
import {
  HERRICK_ARC_LIMIT_RAD,
  bPlaneTarget,
  gibbs,
  herrickGibbs,
  lunisolarRates,
  positionArcs,
  pumpCrankFlyby,
  schweighartSedwick,
  triadQuest,
} from './wave11'

describe('B-plane targeting triad', () => {
  it('builds an orthonormal S,T,R frame and a consistent aiming point', () => {
    const res = bPlaneTarget({
      vInf: [3000, 400, 200],
      mu: EARTH_MU,
      rp: EARTH_RADIUS + 500_000,
      clock: Math.PI / 6,
    })
    expect(res).not.toBeNull()
    expect(res!.e).toBeGreaterThan(1)
    expect(res!.b).toBeGreaterThan(res!.rp)
    expect(res!.turn).toBeGreaterThan(0)
    expect(res!.turn).toBeLessThan(Math.PI)
    const { sHat: s, tHat: t, rHat: r } = res!
    expect(Math.hypot(s[0], s[1], s[2])).toBeCloseTo(1, 12)
    expect(Math.hypot(t[0], t[1], t[2])).toBeCloseTo(1, 12)
    expect(s[0] * t[0] + s[1] * t[1] + s[2] * t[2]).toBeCloseTo(0, 12)
    expect(s[0] * r[0] + s[1] * r[1] + s[2] * r[2]).toBeCloseTo(0, 12)
    expect(Math.hypot(res!.bDotT, res!.bDotR) / res!.b).toBeCloseTo(1, 12)
    const v = Math.hypot(3000, 400, 200)
    const e = 1 + (EARTH_RADIUS + 500_000) * v * v / EARTH_MU
    const bFromRp = (EARTH_RADIUS + 500_000) * Math.sqrt((e + 1) / (e - 1))
    expect(res!.b / bFromRp).toBeCloseTo(1, 10)
  })
})

describe('TRIAD / QUEST', () => {
  it('recovers a 90° yaw from two rotated reference vectors', () => {
    const qTrue = euler321ToQuat(Math.PI / 2, 0, 0)!
    const dcm = quatToDcm(qTrue)!
    const v1: [number, number, number] = [1, 0, 0]
    const v2: [number, number, number] = [0, 0, 1]
    const w1 = applyDcm(dcm, v1)
    const w2 = applyDcm(dcm, v2)
    const est = triadQuest({ w1, w2, v1, v2 })
    expect(est).not.toBeNull()
    expect(est!.residualTriad).toBeLessThan(1e-9)
    expect(est!.residualQuest).toBeLessThan(1e-3)
    const back = applyDcm(quatToDcm(est!.triad)!, v1)
    expect(back[0]).toBeCloseTo(w1[0], 8)
    expect(back[1]).toBeCloseTo(w1[1], 8)
  })
})

describe('Herrick–Gibbs', () => {
  it('recovers middle-epoch speed from three Kepler samples', () => {
    const r0: [number, number, number] = [EARTH_RADIUS + 700_000, 0, 0]
    const v0: [number, number, number] = [0, 7500, 200]
    const s0 = { r: r0, v: v0 }
    const s1 = keplerPropagate(EARTH_MU, s0, -300)
    const s2 = keplerPropagate(EARTH_MU, s0, 0)
    const s3 = keplerPropagate(EARTH_MU, s0, 400)
    expect(s1 && s2 && s3).toBeTruthy()
    const hg = herrickGibbs({
      r1: s1!.r,
      r2: s2!.r,
      r3: s3!.r,
      t1: -300,
      t2: 0,
      t3: 400,
      mu: EARTH_MU,
    })
    expect(hg).not.toBeNull()
    const trueV = Math.hypot(s2!.v[0], s2!.v[1], s2!.v[2])
    expect(Math.abs(hg!.v2n - trueV) / trueV).toBeLessThan(0.01)
    const err = Math.hypot(hg!.v2[0] - s2!.v[0], hg!.v2[1] - s2!.v[1], hg!.v2[2] - s2!.v[2])
    expect(err / trueV).toBeLessThan(0.02)
  })
})

describe('Gibbs three-position OD', () => {
  it('recovers the Kepler middle velocity on a wide arc better than Herrick', () => {
    const r0: [number, number, number] = [EARTH_RADIUS + 700_000, 0, 0]
    const v0: [number, number, number] = [0, Math.sqrt(EARTH_MU / (EARTH_RADIUS + 700_000)), 0]
    const s0 = { r: r0, v: v0 }
    const s1 = keplerPropagate(EARTH_MU, s0, -300)
    const s2 = keplerPropagate(EARTH_MU, s0, 0)
    const s3 = keplerPropagate(EARTH_MU, s0, 400)
    expect(s1 && s2 && s3).toBeTruthy()
    const gb = gibbs({ r1: s1!.r, r2: s2!.r, r3: s3!.r, mu: EARTH_MU })
    const hg = herrickGibbs({
      r1: s1!.r,
      r2: s2!.r,
      r3: s3!.r,
      t1: -300,
      t2: 0,
      t3: 400,
      mu: EARTH_MU,
    })
    expect(gb).not.toBeNull()
    expect(hg).not.toBeNull()
    const trueV = Math.hypot(s2!.v[0], s2!.v[1], s2!.v[2])
    const gErr = Math.hypot(gb!.v2[0] - s2!.v[0], gb!.v2[1] - s2!.v[1], gb!.v2[2] - s2!.v[2])
    const hErr = Math.hypot(hg!.v2[0] - s2!.v[0], hg!.v2[1] - s2!.v[1], hg!.v2[2] - s2!.v[2])
    expect(gErr / trueV).toBeLessThan(1e-8)
    expect(gErr).toBeLessThan(hErr)
    const arcs = positionArcs(s1!.r, s2!.r, s3!.r)
    expect(arcs).not.toBeNull()
    expect(Math.max(arcs!.theta12, arcs!.theta23)).toBeGreaterThan(HERRICK_ARC_LIMIT_RAD)
    expect(arcs!.recommend).toBe('gibbs')
  })
})

describe('lunisolar averaged rates', () => {
  it('vanishes nodal rate at i = 90° and keeps Kozai Θ in [-1, 1]', () => {
    const polar = lunisolarRates({
      a: EARTH_RADIUS + 800_000,
      e: 0.01,
      iRad: Math.PI / 2,
      mu: EARTH_MU,
      mu3: MOON_MU,
      d3: 384_400_000,
    })
    const eq = lunisolarRates({
      a: EARTH_RADIUS + 800_000,
      e: 0.01,
      iRad: 0,
      mu: EARTH_MU,
      mu3: MOON_MU,
      d3: 384_400_000,
    })
    expect(polar).not.toBeNull()
    expect(eq).not.toBeNull()
    expect(Math.abs(polar!.raanRate)).toBeLessThan(1e-16)
    expect(Math.abs(eq!.raanRate)).toBeGreaterThan(Math.abs(polar!.raanRate))
    expect(eq!.kozaiTheta).toBeGreaterThan(0.9)
    expect(eq!.kozaiTheta).toBeLessThanOrEqual(1)
    expect(eq!.scale).toBeCloseTo(1, 12)
    expect(eq!.p2).toBeCloseTo(1, 12)
  })

  it('scales by P2(cos i3) (1-e3^2)^{-3/2} and flips at i3 = 90°', () => {
    const base = {
      a: EARTH_RADIUS + 20_200_000,
      e: 0.005,
      iRad: (55 * Math.PI) / 180,
      mu: EARTH_MU,
      mu3: MOON_MU,
      d3: 384_400_000,
    }
    const eq = lunisolarRates(base)!
    const polar3 = lunisolarRates({ ...base, i3: Math.PI / 2 })!
    const ecc3 = lunisolarRates({ ...base, e3: 0.2 })!
    expect(polar3.p2).toBeCloseTo(-0.5, 12)
    expect(polar3.raanRate / eq.raanRate).toBeCloseTo(-0.5, 10)
    const e3Fac = (1 - 0.04) ** -1.5
    expect(ecc3.e3Fac / e3Fac).toBeCloseTo(1, 12)
    expect(ecc3.raanRate / eq.raanRate).toBeCloseTo(e3Fac, 10)
  })
})

describe('pump/crank flyby', () => {
  it('preserves |v∞| and reports a turning angle in (0, π)', () => {
    const res = pumpCrankFlyby({
      vInf: 5000,
      mu: EARTH_MU,
      rp: EARTH_RADIUS + 1_000_000,
      pump: 0.4,
      crank: 0.3,
      vPlanet: 29_780,
    })
    expect(res).not.toBeNull()
    expect(res!.vInfOutMag).toBeCloseTo(5000, 6)
    expect(res!.turn).toBeGreaterThan(0)
    expect(res!.turn).toBeLessThan(Math.PI)
    expect(res!.dvHelio).toBeGreaterThan(0)
    const other = pumpCrankFlyby({
      vInf: 5000,
      mu: EARTH_MU,
      rp: EARTH_RADIUS + 1_000_000,
      pump: 0.4,
      crank: 1.2,
      vPlanet: 29_780,
    })
    expect(other).not.toBeNull()
    const d = Math.hypot(
      res!.vInfOut[0] - other!.vInfOut[0],
      res!.vInfOut[1] - other!.vInfOut[1],
      res!.vInfOut[2] - other!.vInfOut[2],
    )
    expect(d).toBeGreaterThan(100)
  })
})

describe('Schweighart–Sedwick vs CW', () => {
  it('matches CW when J2 = 0 and diverges in z when J2 is on', () => {
    const s0 = { x: 1000, y: 0, z: 500, vx: 0, vy: 0.2, vz: 0 }
    const a = EARTH_RADIUS + 700_000
    const dt = 600
    const flat = schweighartSedwick({ a, iRad: 0.9, state0: s0, dt, j2: 0 })
    const pert = schweighartSedwick({ a, iRad: 0.9, state0: s0, dt })
    const cw = cwPropagate(Math.sqrt(EARTH_MU / a ** 3), s0, dt)!
    expect(flat).not.toBeNull()
    expect(pert).not.toBeNull()
    expect(flat!.state.x).toBeCloseTo(cw.x, 8)
    expect(flat!.state.y).toBeCloseTo(cw.y, 8)
    expect(flat!.state.z).toBeCloseTo(cw.z, 8)
    expect(Math.abs(pert!.state.z - cw.z)).toBeGreaterThan(1e-6)
    const sLit =
      (3 / 8) * EARTH_J2 * (EARTH_RADIUS / a) ** 2 * (1 + 3 * Math.cos(1.8))
    expect(pert!.s / sLit).toBeCloseTo(1, 12)
  })
})
