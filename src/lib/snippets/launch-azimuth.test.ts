import { describe, expect, it } from 'vitest'
import { extractAssignedNames } from './live-values'
import { launchAzimuthSnippets } from './launch-azimuth'
import { CODE_LANGS } from './types'

const rad = (deg: number) => (deg * Math.PI) / 180

type LaunchValues = { beta: number; az1: number; az2: number; v_boost: number }

function evalJs(body: string, lat: number, i: number, h: number): LaunchValues {
  const fn = new Function(
    'lat',
    'i',
    'h',
    `${body}\nreturn { beta, az1, az2, v_boost };`,
  ) as (lat: number, i: number, h: number) => LaunchValues
  return fn(lat, i, h)
}

const INVALID: [string, number, number][] = [
  ['lat 28.5° / i 160°', 28.5, 160],
  ['lat 100° / i 80°', 100, 80],
  ['lat 0° / i 200°', 0, 200],
  ['lat 90° / i 90° (pole)', 90, 90],
]

describe('launch-azimuth snippet (#172)', () => {
  it('ships every language', () => {
    for (const { id } of CODE_LANGS) {
      expect(launchAzimuthSnippets.code[id]?.trim(), id).toBeTruthy()
    }
  })

  it('keeps beta, az1, az2 and v_boost at top-level brace depth', () => {
    const names = ['beta', 'az1', 'az2', 'v_boost']
    const langs = CODE_LANGS.map((l) => l.id).filter((id) => id !== 'latex')
    for (const lang of langs) {
      const found = extractAssignedNames(launchAzimuthSnippets.code[lang]!, lang)
      for (const name of names) {
        expect(found, `${lang}:${name}`).toContain(name)
      }
    }
  })

  it('javascript returns NaN beta for unreachable geometry', () => {
    const body = launchAzimuthSnippets.code.javascript!
    for (const [label, latDeg, iDeg] of INVALID) {
      const out = evalJs(body, rad(latDeg), rad(iDeg), 200_000)
      expect(Number.isNaN(out.beta), label).toBe(true)
    }
  })

  it('javascript guards asin behind the domain check', () => {
    const body = launchAzimuthSnippets.code.javascript!
    const asinLines = body
      .split('\n')
      .filter((line) => line.includes('Math.asin'))
    expect(asinLines.length).toBeGreaterThan(0)
    for (const line of asinLines) {
      expect(line).toContain('ok ?')
    }
  })

  it('javascript matches the raw asin principal value on valid input', () => {
    const body = launchAzimuthSnippets.code.javascript!
    const lat = rad(28.5)
    const i = rad(51.6)
    const out = evalJs(body, lat, i, 200_000)
    const expected = Math.asin(Math.cos(i) / Math.cos(lat))
    expect(Number.isFinite(out.beta)).toBe(true)
    expect(out.beta).toBeCloseTo(expected, 12)
    expect(out.az1).toBe(out.beta)
    expect(out.az2).toBeCloseTo(Math.PI - expected, 12)
    expect(Number.isFinite(out.v_boost)).toBe(true)
  })
})
