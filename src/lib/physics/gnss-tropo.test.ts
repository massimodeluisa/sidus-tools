import { describe, expect, it } from 'vitest'
import { saastamoinenTropoDelay } from './gnss-optical'

describe('saastamoinenTropoDelay', () => {
  it('matches the original 1972 equation at independent reference conditions', () => {
    // Original 0.002277 m/hPa expression independently converted to Pa for the SI core.
    expect(saastamoinenTropoDelay(Math.PI / 6, 101325, 288.15, 1100)).toBeCloseTo(
      4.81917520816242,
      12,
    )
    expect(saastamoinenTropoDelay(Math.PI / 2, 101325, 288.15, 1100)).toBeCloseTo(
      2.41751156408121,
      12,
    )
    expect(
      saastamoinenTropoDelay((5 * Math.PI) / 180, 101325, 288.15, 1100),
    ).toBeCloseTo(23.7785067673106, 11)
  })

  it('uses live meteorology and elevation inputs', () => {
    expect(saastamoinenTropoDelay(Math.PI / 4, 90000, 270, 500)).toBeCloseTo(
      2.97005650708448,
      12,
    )
  })

  it('rejects the unsupported near-horizon and above-zenith angles', () => {
    expect(saastamoinenTropoDelay((4.99 * Math.PI) / 180)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 2 + 1e-12)).toBeNull()
    expect(saastamoinenTropoDelay(Number.NaN)).toBeNull()
    expect(saastamoinenTropoDelay(Number.POSITIVE_INFINITY)).toBeNull()
  })

  it('rejects invalid surface meteorological states', () => {
    expect(saastamoinenTropoDelay(Math.PI / 6, 0, 288.15, 1100)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 6, 101325, 0, 1100)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 6, 101325, 288.15, -1)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 6, 101325, 288.15, 101326)).toBeNull()
    expect(saastamoinenTropoDelay(Math.PI / 6, Number.NaN, 288.15, 1100)).toBeNull()
  })
})
