import type { FormulaSnippet } from '../types'

const A =
  'Local circular-orbit drag timescale t = H*beta/(rho*v*a) with density frozen at the supplied value. This is H/|da/dt|, not the integrated time to descend one scale height under rho = rho0*exp(-x/H). SI.'

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
    latex: `% ${A}
\\[t=\\frac{H\\beta}{\\rho v a}\\]`,
  },
}
