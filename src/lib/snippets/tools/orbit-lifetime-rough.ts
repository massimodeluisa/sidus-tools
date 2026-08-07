import type { FormulaSnippet } from '../types'

const A = 'Circular drag lifetime: t ≈ H β / (ρ v a); SI.'

export const orbitLifetimeRoughSnippets: FormulaSnippet = {
  formulaId: 'orbit-lifetime-rough',
  assumptions: A,
  code: {
    python: `# ${A}
t = H * beta / (rho * v * a)`,
    javascript: `// ${A}
const t = H * beta / (rho * v * a)`,
    typescript: `// ${A}
const t = H * beta / (rho * v * a)`,
    c: `/* ${A} */
const double t = H * beta / (rho * v * a);`,
    cpp: `// ${A}
const double t = H * beta / (rho * v * a);`,
    rust: `// ${A}
let t = H * beta / (rho * v * a);`,
    zig: `// ${A}
const t = H * beta / (rho * v * a);`,
    fortran: `! ${A}
  t = H * beta / (rho * v * a)`,
    matlab: `% ${A}
t = H * beta / (rho * v * a)`,
    julia: `# ${A}
t = H * beta / (rho * v * a)`,
    latex: `% circular drag lifetime
\\[t\\approx \\frac{H\\beta}{\\rho v a}\\]`,
  },
}
