import { describe, expect, it } from 'vitest'
import { TOOLS } from '@/data/tools'
import { SOURCES } from '@/data/sources'
import { normalizeTags } from '@/lib/tags'

/**
 * Catalog quality gates (sources + tags). Survey markdown is local-only
 * and is not part of the public repo.
 */
describe('tools catalog quality gates', () => {
  it('every live tool has ≥2 resolvable sources with https urls', () => {
    for (const tool of TOOLS.filter((t) => t.status === 'live')) {
      const ids = tool.sourceIds ?? []
      expect(ids.length, tool.id).toBeGreaterThanOrEqual(2)
      for (const id of ids) {
        const s = SOURCES[id]
        expect(s, `${tool.id} missing source ${id}`).toBeTruthy()
        expect(s.url.startsWith('http'), `${id} url`).toBe(true)
      }
    }
  })

  it('normalizeTags merges partial-pressure and thermal synonyms', () => {
    expect(normalizeTags(['ppO2', 'ppCO2', 'cabin'])).toEqual(['atmosphere'])
    expect(normalizeTags(['cooling', 'TCS', 'thermal'])).toEqual(['thermal'])
    expect(normalizeTags(['life-support', 'ECLSS'])).toEqual(['ECLSS'])
  })

  it('published tags are already normalized (no legacy ppO2 leftover)', () => {
    for (const tool of TOOLS) {
      expect(tool.tags).toEqual(normalizeTags(tool.tags))
      expect(tool.tags).not.toContain('ppO2')
      expect(tool.tags).not.toContain('ppCO2')
      expect(tool.tags).not.toContain('cooling')
      expect(tool.tags).not.toContain('TCS')
    }
  })
})
