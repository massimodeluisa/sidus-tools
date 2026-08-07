import type { FormulaSnippet } from '../types'

/**
 * RCS Δv and impulse bit: Δv = F t / m; I_bit = F · t_min.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches RcsTool + lib/physics/power.ts rcsDeltaV / impulseBit.
 * Free vars: F, t, m, tmin.
 */
const A =
  'Impulse I = F·t; Δv = I/m; impulse bit I_bit = F·t_min (minimum pulse). SI.'

export const rcsSnippets: FormulaSnippet = {
  formulaId: 'rcs',
  assumptions: A,
  code: {
    python: `# RCS Δv / impulse bit: ${A}
I = F * t
dv = I / m
I_bit = F * tmin`,

    javascript: `// RCS Δv / impulse bit: ${A}
const I = F * t
const dv = I / m
const I_bit = F * tmin`,

    typescript: `// RCS Δv / impulse bit: ${A}
const I: number = F * t
const dv: number = I / m
const I_bit: number = F * tmin`,

    c: `/* RCS Δv / impulse bit: ${A} */
const double I = F * t;
const double dv = I / m;
const double I_bit = F * tmin;`,

    cpp: `// RCS Δv / impulse bit: ${A}
const double I = F * t;
const double dv = I / m;
const double I_bit = F * tmin;`,

    rust: `// RCS Δv / impulse bit: ${A}
let i = F * t;
let dv = i / m;
let i_bit = F * tmin;`,

    zig: `// RCS Δv / impulse bit: ${A}
const I = F * t;
const dv = I / m;
const I_bit = F * tmin;`,

    fortran: `! RCS Δv / impulse bit: ${A}
I = F * t
dv = I / m
I_bit = F * tmin`,

    matlab: `% RCS Δv / impulse bit: ${A}
I = F * t;
dv = I / m;
I_bit = F * tmin;`,

    julia: `# RCS Δv / impulse bit: ${A}
I = F * t
dv = I / m
I_bit = F * tmin`,

    latex: `% RCS Δv / impulse bit: pure SI
\\[
  I = F t,\\quad
  \\Delta v = I/m,\\quad
  I_{\\mathrm{bit}} = F\\,t_{\\min}
\\]`,
  },
}
