import { describe, expect, it } from 'vitest'
import { compassOctant } from './compass'

describe('compassOctant', () => {
  const rad = (deg: number) => (deg * Math.PI) / 180

  it('bins azimuth from north toward east into eight points', () => {
    expect(compassOctant(rad(0))).toBe('n')
    expect(compassOctant(rad(22))).toBe('n')
    expect(compassOctant(rad(23))).toBe('ne')
    expect(compassOctant(rad(90))).toBe('e')
    expect(compassOctant(rad(180))).toBe('s')
    expect(compassOctant(rad(270))).toBe('w')
    expect(compassOctant(rad(337))).toBe('nw')
    expect(compassOctant(rad(359))).toBe('n')
    expect(compassOctant(rad(-90))).toBe('w')
  })
})
