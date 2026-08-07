import type { FormulaSnippet } from '../types'

/**
 * Payload fraction: f_pl = m_pl / m_0.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches PayloadFractionTool. Free vars: mpl, m0.
 */
const A = 'Payload mass fraction f_pl = m_pl / m_0. Pure SI (kg).'

export const plFracSnippets: FormulaSnippet = {
  formulaId: 'payload-fraction',
  assumptions: A,
  code: {
    python: `# Payload fraction: ${A}
f_pl = mpl / m0`,

    javascript: `// Payload fraction: ${A}
const f_pl = mpl / m0`,

    typescript: `// Payload fraction: ${A}
const f_pl: number = mpl / m0`,

    c: `/* Payload fraction: ${A} */
const double f_pl = mpl / m0;`,

    cpp: `// Payload fraction: ${A}
const double f_pl = mpl / m0;`,

    rust: `// Payload fraction: ${A}
let f_pl = mpl / m0;`,

    zig: `// Payload fraction: ${A}
const f_pl = mpl / m0;`,

    fortran: `! Payload fraction: ${A}
f_pl = mpl / m0`,

    matlab: `% Payload fraction: ${A}
f_pl = mpl / m0;`,

    julia: `# Payload fraction: ${A}
f_pl = mpl / m0`,

    latex: `% Payload fraction: pure SI
\\[
  f_{\\mathrm{pl}} = \\frac{m_{\\mathrm{pl}}}{m_{0}}
\\]`,
  },
}
