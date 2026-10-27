import { describe, expect, it } from 'vitest'
import { computeToolOg } from './compute'

describe('launch-azimuth OG rotation boost (#173)', () => {
  it('uses the pad altitude in the query, not a 200 km orbit', () => {
    const pad = computeToolOg('launch-azimuth', {
      lat: '28.5721',
      i: '51.6',
      h: '3',
      hu: 'm',
    })
    const orbit = computeToolOg('launch-azimuth', {
      lat: '28.5721',
      i: '51.6',
      h: '200',
      hu: 'km',
    })
    expect(pad.metrics?.find((metric) => metric.label === 'v_rot')?.value).toBe('408.5')
    expect(orbit.metrics?.find((metric) => metric.label === 'v_rot')?.value).toBe('421.3')
    expect(pad.formula).toContain('R+h')
  })
})
