import { describe, expect, it } from 'vitest'
import {
  catalogFilterPath,
  parseCatalogTagsParam,
  serializeCatalogTags,
} from './catalogTags'

describe('catalogFilterPath', () => {
  it('builds the same ?tags= URL as the catalog filter', () => {
    expect(catalogFilterPath(['delta-v'])).toBe('/tools?tags=delta-v')
    expect(catalogFilterPath(['#ORBITAL'])).toBe('/tools?tags=orbital')
    expect(catalogFilterPath(['crew', 'delta-v'])).toBe('/tools?tags=crew,delta-v')
    expect(catalogFilterPath(['unknown'])).toBe('/tools')
  })
})

describe('parseCatalogTagsParam', () => {
  it('reads canonical tags= and legacy tag=/cat=', () => {
    expect(parseCatalogTagsParam(new URLSearchParams('tags=orbital,crew'))).toEqual([
      'crew',
      'orbital',
    ])
    expect(parseCatalogTagsParam(new URLSearchParams('tag=delta-v'))).toEqual(['delta-v'])
    expect(parseCatalogTagsParam(new URLSearchParams('cat=propulsion'))).toEqual([
      'propulsion',
    ])
  })
})

describe('serializeCatalogTags', () => {
  it('sorts and joins with commas', () => {
    expect(serializeCatalogTags(['delta-v', 'crew'])).toBe('crew,delta-v')
  })
})
