import type { FormulaSnippet } from '../types'

/**
 * RCS impulse-bit budget: I_tot = N F t_min.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches ImpulseBitBudgetTool. Free vars: N, F, t_min.
 */
const A = 'Sum of impulse bits I_tot = N F t_min. SI (N·s).'

export const impulseBudgetSnippets: FormulaSnippet = {
  formulaId: 'impulse-budget',
  assumptions: A,
  code: {
    python: `# Impulse budget: ${A}
I_tot = N * F * t_min`,

    javascript: `// Impulse budget: ${A}
const I_tot = N * F * t_min`,

    typescript: `// Impulse budget: ${A}
const I_tot: number = N * F * t_min`,

    c: `/* Impulse budget: ${A} */
const double I_tot = N * F * t_min;`,

    cpp: `// Impulse budget: ${A}
const double I_tot = N * F * t_min;`,

    rust: `// Impulse budget: ${A}
let i_tot = N * F * t_min;`,

    zig: `// Impulse budget: ${A}
const I_tot = N * F * t_min;`,

    fortran: `! Impulse budget: ${A}
I_tot = N * F * t_min`,

    matlab: `% Impulse budget: ${A}
I_tot = N * F * t_min;`,

    julia: `# Impulse budget: ${A}
I_tot = N * F * t_min`,

    latex: `% Impulse budget: pure SI
\\[
  I_{\\mathrm{tot}} = N\\,F\\,t_{\\min}
\\]`,
  },
}
