import type { FormulaSnippet } from '../types'

/**
 * Ideal thrust: F = ṁ · v_e (vacuum); I_sp = v_e / g_0 (mode 0 form).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches IdealThrustTool + lib/physics/propulsion.ts idealThrust / ispFromVe.
 */
const A =
  'Vacuum ideal F = mdot·ve; isp = ve/g0 (mode 0 form). SI.'

export const idealThrustSnippets: FormulaSnippet = {
  formulaId: 'ideal-thrust',
  assumptions: A,
  code: {
    python: `# Ideal thrust: ${A}
g0 = 9.80665
F = mdot * ve
isp = ve / g0`,

    javascript: `// Ideal thrust: ${A}
const g0 = 9.80665
const F = mdot * ve
const isp = ve / g0`,

    typescript: `// Ideal thrust: ${A}
const g0: number = 9.80665
const F: number = mdot * ve
const isp: number = ve / g0`,

    c: `/* Ideal thrust: ${A} */
const double g0 = 9.80665;
const double F = mdot * ve;
const double isp = ve / g0;`,

    cpp: `// Ideal thrust: ${A}
const double g0 = 9.80665;
const double F = mdot * ve;
const double isp = ve / g0;`,

    rust: `// Ideal thrust: ${A}
let g0 = 9.80665_f64;
let F = mdot * ve;
let isp = ve / g0;`,

    zig: `// Ideal thrust: ${A}
const g0: f64 = 9.80665;
const F = mdot * ve;
const isp = ve / g0;`,

    fortran: `! Ideal thrust: ${A}
g0 = 9.80665d0
F = mdot * ve
isp = ve / g0`,

    matlab: `% Ideal thrust: ${A}
g0 = 9.80665;
F = mdot * ve;
isp = ve / g0;`,

    julia: `# Ideal thrust: ${A}
g0 = 9.80665
F = mdot * ve
isp = ve / g0`,

    latex: `% Ideal thrust: pure SI
\\[
  F = \\dot{m}\\, v_{e},\\quad
  I_{sp} = v_{e}/g_{0}
\\]`,
  },
}
