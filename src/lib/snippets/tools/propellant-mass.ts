import type { FormulaSnippet } from '../types'

/**
 * Propellant mass: invert Tsiolkovsky for wet mass and propellant given dry mass.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Free vars: mf, dv, isp, g0. Matches PropellantMassTool + lib/physics/propulsion.ts.
 */
const A =
  'Invert Tsiolkovsky; ideal rocket, constant Isp, no gravity/drag losses; SI (m, s, kg).'

export const propellantMassSnippets: FormulaSnippet = {
  formulaId: 'propellant-mass',
  assumptions: A,
  code: {
    python: `# Propellant mass: ${A}
import math
m0 = mf * math.exp(dv / (isp * g0))
prop = m0 - mf`,

    javascript: `// Propellant mass: ${A}
const m0 = mf * Math.exp(dv / (isp * g0))
const prop = m0 - mf`,

    typescript: `// Propellant mass: ${A}
const m0: number = mf * Math.exp(dv / (isp * g0))
const prop: number = m0 - mf`,

    c: `/* Propellant mass: ${A} */
const double m0 = mf * exp(dv / (isp * g0));
const double prop = m0 - mf;`,

    cpp: `// Propellant mass: ${A}
const double m0 = mf * std::exp(dv / (isp * g0));
const double prop = m0 - mf;`,

    rust: `// Propellant mass: ${A}
let m0 = mf * (dv / (isp * g0)).exp();
let prop = m0 - mf;`,

    zig: `// Propellant mass: ${A}
const m0 = mf * std.math.exp(dv / (isp * g0));
const prop = m0 - mf;`,

    fortran: `! Propellant mass: ${A}
m0 = mf * exp(dv / (isp * g0))
prop = m0 - mf`,

    matlab: `% Propellant mass: ${A}
m0 = mf * exp(dv / (isp * g0));
prop = m0 - mf;`,

    julia: `# Propellant mass: ${A}
m0 = mf * exp(dv / (isp * g0))
prop = m0 - mf`,

    latex: `% Invert Tsiolkovsky: pure SI
\\[
  m_0 = m_f\\, e^{\\Delta v/(I_{sp} g_0)},\\quad
  m_{\\mathrm{prop}} = m_0 - m_f
\\]`,
  },
}
