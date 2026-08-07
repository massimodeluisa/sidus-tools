import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Ideal Tsiolkovsky rocket: constant ve (or isp·g0), no gravity/drag losses, instantaneous exhaust model; SI units.'

export const rocketSnippets: FormulaSnippet = {
  formulaId: 'rocket-equation',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# Rocket equation: ${ASSUMPTIONS}
import math
g0 = 9.80665
ve = isp * g0
dv = ve * math.log(m0 / mf)`,

    javascript: `// Rocket equation: ${ASSUMPTIONS}
const g0 = 9.80665
const ve = isp * g0
const dv = ve * Math.log(m0 / mf)`,

    typescript: `// Rocket equation: ${ASSUMPTIONS}
const g0: number = 9.80665
const ve: number = isp * g0
const dv: number = ve * Math.log(m0 / mf)`,

    c: `/* Rocket equation: ${ASSUMPTIONS} */
const double g0 = 9.80665;
const double ve = isp * g0;
const double dv = ve * log(m0 / mf);`,

    cpp: `// Rocket equation: ${ASSUMPTIONS}
const double g0 = 9.80665;
const double ve = isp * g0;
const double dv = ve * std::log(m0 / mf);`,

    rust: `// Rocket equation: ${ASSUMPTIONS}
let g0 = 9.80665_f64;
let ve = isp * g0;
let dv = ve * (m0 / mf).ln();`,

    zig: `// Rocket equation: ${ASSUMPTIONS}
const g0: f64 = 9.80665;
const ve = isp * g0;
const dv = ve * @log(m0 / mf);`,

    fortran: `! Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665d0
ve = isp * g0
dv = ve * log(m0 / mf)`,

    matlab: `% Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665;
ve = isp * g0;
dv = ve * log(m0 / mf);`,

    julia: `# Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665
ve = isp * g0
dv = ve * log(m0 / mf)`,

    latex: `% Tsiolkovsky
\\[
\\Delta v = I_{sp} g_0 \\ln\\frac{m_0}{m_f} = v_e \\ln\\frac{m_0}{m_f}
\\]`,
  },
}
