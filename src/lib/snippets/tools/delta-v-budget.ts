import type { FormulaSnippet } from '../types'

/**
 * Δv budget: linear sum of impulsive phase Δv (educational).
 * total = d1 + d2 + d3 + d4 + d5 + d6
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches DeltaVBudgetTool + lib/physics/ops.ts deltaVBudget.
 */
const A = 'Linear sum of non-negative impulsive phase Δv (educational budget). SI (m/s).'

export const deltaVBudgetSnippets: FormulaSnippet = {
  formulaId: 'delta-v-budget',
  assumptions: A,
  code: {
    python: `# Δv budget: ${A}
total = d1 + d2 + d3 + d4 + d5 + d6`,

    javascript: `// Δv budget: ${A}
const total = d1 + d2 + d3 + d4 + d5 + d6`,

    typescript: `// Δv budget: ${A}
const total: number = d1 + d2 + d3 + d4 + d5 + d6`,

    c: `/* Δv budget: ${A} */
const double total = d1 + d2 + d3 + d4 + d5 + d6;`,

    cpp: `// Δv budget: ${A}
const double total = d1 + d2 + d3 + d4 + d5 + d6;`,

    rust: `// Δv budget: ${A}
let total = d1 + d2 + d3 + d4 + d5 + d6;`,

    zig: `// Δv budget: ${A}
const total = d1 + d2 + d3 + d4 + d5 + d6;`,

    fortran: `! Δv budget: ${A}
total = d1 + d2 + d3 + d4 + d5 + d6`,

    matlab: `% Δv budget: ${A}
total = d1 + d2 + d3 + d4 + d5 + d6;`,

    julia: `# Δv budget: ${A}
total = d1 + d2 + d3 + d4 + d5 + d6`,

    latex: `% Δv budget: pure SI
\\[
  \\Delta v_{\\mathrm{tot}} = \\sum_{i=1}^{6} \\Delta v_i
\\]`,
  },
}
