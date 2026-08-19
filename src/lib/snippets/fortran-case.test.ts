/**
 * Structural gate: Fortran identifiers are case-insensitive. A body that
 * assigns two distinct spellings of the same lowercase name (e.g. `dOmega`
 * and `domega`, or `G` and `g`) silently collapses them onto one variable —
 * the second assignment overwrites the first, corrupting the result.
 *
 * This only checks assigned-vs-assigned collisions inside the body itself.
 * Collisions between a body-assigned name and an injected free-var/UI
 * parameter are handled separately by fortranDisambiguateInputs (renames the
 * injected parameter), so they are out of scope here by design.
 */
import { describe, expect, it } from 'vitest'
import { TOOLS } from '../../data/tools'
import { getSnippets } from './index'

/** Line-start `name = ...` assigns, same approach as the manual sweep. */
function extractAssigned(body: string): string[] {
  const names: string[] = []
  for (const line of body.split('\n')) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/.exec(line)
    if (m) names.push(m[1]!)
  }
  return names
}

describe('Fortran case-insensitive identifier collisions', () => {
  const ids = TOOLS.filter((t) => getSnippets(t.id)).map((t) => t.id)

  it('scans a non-trivial number of fortran bodies', () => {
    expect(ids.length).toBeGreaterThan(50)
  })

  it('no two distinct assigned spellings collide case-insensitively', () => {
    const failures: string[] = []
    for (const id of ids) {
      const body = getSnippets(id)?.code.fortran
      if (!body || !body.trim()) continue

      const byLower = new Map<string, Set<string>>()
      for (const name of extractAssigned(body)) {
        const lower = name.toLowerCase()
        if (!byLower.has(lower)) byLower.set(lower, new Set())
        byLower.get(lower)!.add(name)
      }

      for (const spellings of byLower.values()) {
        if (spellings.size < 2) continue
        const pair = Array.from(spellings).join(' vs ')
        failures.push(`${id}: ${pair}`)
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
