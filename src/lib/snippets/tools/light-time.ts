import type { FormulaSnippet } from '../types'

/**
 * Light-time: one-way and RTT RF / light travel time for range.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches LightTimeTool + lib/physics/mission.ts (lightTime, lightTimeRoundTrip).
 */
const A =
  'One-way light time t = range_m / c; RTT = 2 t; c = 299792458 m/s. SI.'

export const lightTimeSnippets: FormulaSnippet = {
  formulaId: 'light-time',
  assumptions: A,
  code: {
    python: `# Light-time: ${A}
c = 299792458  # m/s
t = range_m / c
rtt = 2 * t`,

    javascript: `// Light-time: ${A}
const c = 299792458 // m/s
const t = range_m / c
const rtt = 2 * t`,

    typescript: `// Light-time: ${A}
const c: number = 299792458 // m/s
const t: number = range_m / c
const rtt: number = 2 * t`,

    c: `/* Light-time: ${A} */
const double c = 299792458.0; /* m/s */
const double t = range_m / c;
const double rtt = 2.0 * t;`,

    cpp: `// Light-time: ${A}
const double c = 299792458.0; // m/s
const double t = range_m / c;
const double rtt = 2.0 * t;`,

    rust: `// Light-time: ${A}
let c = 299792458.0_f64; // m/s
let t = range_m / c;
let rtt = 2.0 * t;`,

    zig: `// Light-time: ${A}
const c: f64 = 299792458.0; // m/s
const t = range_m / c;
const rtt = 2.0 * t;`,

    fortran: `! Light-time: ${A}
c = 299792458.0d0
t = range_m / c
rtt = 2.0d0 * t`,

    matlab: `% Light-time: ${A}
c = 299792458; % m/s
t = range_m / c;
rtt = 2 * t;`,

    julia: `# Light-time: ${A}
c = 299792458  # m/s
t = range_m / c
rtt = 2 * t`,

    latex: `% Light-time: pure SI
\\[
  t = \\frac{d}{c},\\quad
  t_{\\mathrm{RTT}} = 2t,\\quad
  c = 299\\,792\\,458\\,\\mathrm{m/s}
\\]`,
  },
}
