import { describe, expect, it } from 'vitest'
import { gnssDopFromUnitVectors } from './gnss-optical'

const regularTetrahedron: [number, number, number][] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
]

describe('gnssDopFromUnitVectors', () => {
  it('matches the independent matrix result for the calculator defaults', () => {
    const dop = gnssDopFromUnitVectors([
      [1, 0, 0.5],
      [-0.5, 0.866, 0.5],
      [-0.5, -0.866, 0.5],
      [0, 0, 1],
    ])

    expect(dop).not.toBeNull()
    expect(dop!.gdop).toBeCloseTo(2.788467994682272, 12)
    expect(dop!.pdop).toBeCloseTo(2.4556362247583032, 12)
    expect(dop!.hdop).toBeCloseTo(1.290998236047225, 12)
    expect(dop!.vdop).toBeCloseTo(2.088892726510427, 12)
  })

  it('matches the analytic four-satellite regular-tetrahedron DOP', () => {
    // H^T H = diag(4/3, 4/3, 4/3, 4), so Q has diagonal (3/4, 3/4, 3/4, 1/4).
    const dop = gnssDopFromUnitVectors(regularTetrahedron)

    expect(dop).not.toBeNull()
    expect(dop!.gdop).toBeCloseTo(Math.sqrt(5 / 2), 12)
    expect(dop!.pdop).toBeCloseTo(3 / 2, 12)
    expect(dop!.hdop).toBeCloseTo(Math.sqrt(3 / 2), 12)
    expect(dop!.vdop).toBeCloseTo(Math.sqrt(3) / 2, 12)
  })

  it('normalizes each finite nonzero LOS vector before solving', () => {
    const scaled = regularTetrahedron.map(([x, y, z], index) => {
      const scale = index + 2
      return [scale * x, scale * y, scale * z] as [number, number, number]
    })

    const scaledDop = gnssDopFromUnitVectors(scaled)
    const unitDop = gnssDopFromUnitVectors(regularTetrahedron)
    expect(scaledDop).not.toBeNull()
    expect(unitDop).not.toBeNull()
    expect(scaledDop!.gdop).toBeCloseTo(unitDop!.gdop, 12)
    expect(scaledDop!.pdop).toBeCloseTo(unitDop!.pdop, 12)
    expect(scaledDop!.hdop).toBeCloseTo(unitDop!.hdop, 12)
    expect(scaledDop!.vdop).toBeCloseTo(unitDop!.vdop, 12)
  })

  it('rejects a rank-deficient coplanar geometry', () => {
    expect(
      gnssDopFromUnitVectors([
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
      ]),
    ).toBeNull()
  })

  it('rejects zero and non-finite LOS vectors', () => {
    expect(
      gnssDopFromUnitVectors([
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ]),
    ).toBeNull()
    expect(
      gnssDopFromUnitVectors([
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [Infinity, 0, 1],
      ]),
    ).toBeNull()
  })
})
