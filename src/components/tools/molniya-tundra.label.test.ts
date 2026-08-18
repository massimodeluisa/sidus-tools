import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('MolniyaTundraTool inclination label', () => {
  it('labels i with critical_inclination, not SSO', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/tools/MolniyaTundraTool.tsx'),
      'utf8',
    )
    expect(src).toContain("t('fields.critical_inclination')")
    expect(src).not.toContain("t('fields.sso_inclination')")
  })
})
