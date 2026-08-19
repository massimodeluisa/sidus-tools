/**
 * Unit test for the plotter expression compiler (`compile` in ./PlotterTool.tsx).
 * Not a physics golden case: no physics-domain function under test, just the compiler.
 *
 * SECURITY FINDING (asserted here as current behavior, not fixed; out of scope to change):
 * `compile()` substitutes only known math tokens (log, ln, sin, cos, tan, exp, sqrt, abs,
 * pi, e) via word-boundary regex, then runs the result through `new Function('x', ...)`.
 * Anything outside those tokens reaches `new Function` as literal JavaScript with `x` in
 * scope: it is effectively `eval`, not a math-only sandbox. `compile()` also calls the
 * compiled function once (`fn(1)`) as an internal type check, so side effects run
 * immediately at compile time, not only when the plot is later evaluated.
 *
 * The probe below proves this with a non-destructive expression (a global assignment)
 * rather than a real process/IO/network call. Under this repo's `vitest.config.ts`
 * (`environment: 'node'`), `process` is the real Node process object inside test files,
 * so a literal `process.exit(1)` probe would terminate the Vitest worker instead of
 * producing an assertion; it is deliberately not used here.
 */
import { describe, expect, it } from 'vitest'
import { compile } from './PlotterTool'

describe('PlotterTool compile', () => {
  it('evaluates a valid math expression', () => {
    const fn = compile('sqrt(x)+1')
    expect(fn).not.toBeNull()
    expect(fn!(4)).toBe(3)
  })

  it('returns null (safe failure) for a syntactically invalid expression', () => {
    const fn = compile('sqrt(x')
    expect(fn).toBeNull()
  })

  it('does NOT sandbox non-math JavaScript: a side-effecting expression compiles and runs', () => {
    const probeKey = '__plotterCompileProbe__'
    const fn = compile(`(globalThis.${probeKey} = 1337)`)
    expect(fn).not.toBeNull()
    expect(fn!(0)).toBe(1337)
    expect((globalThis as Record<string, unknown>)[probeKey]).toBe(1337)
    delete (globalThis as Record<string, unknown>)[probeKey]
  })
})
