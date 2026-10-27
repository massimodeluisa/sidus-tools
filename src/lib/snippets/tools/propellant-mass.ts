import type { FormulaSnippet } from '../types'

/**
 * Propellant mass: invert Tsiolkovsky for wet mass and propellant given dry mass.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Free vars: mf, dv, isp, g0. Matches PropellantMassTool + lib/physics/propulsion.ts.
 * Propellant uses mf*expm1(dv/(isp*g0)), not the rounded difference m0-mf.
 */
const A =
  'Invert Tsiolkovsky; ideal rocket, constant Isp, no gravity/drag losses; SI (m, s, kg). Propellant is mf*expm1(Δv/(Isp*g0)).'

export const propellantMassSnippets: FormulaSnippet = {
  formulaId: 'propellant-mass',
  assumptions: A,
  code: {
    python: `# Propellant mass: ${A}
import math
x = dv / (isp * g0)
m0 = mf * math.exp(x)
prop = mf * math.expm1(x)`,

    javascript: `// Propellant mass: ${A}
const x = dv / (isp * g0)
const m0 = mf * Math.exp(x)
const prop = mf * Math.expm1(x)`,

    typescript: `// Propellant mass: ${A}
const x: number = dv / (isp * g0)
const m0: number = mf * Math.exp(x)
const prop: number = mf * Math.expm1(x)`,

    c: `/* Propellant mass: ${A} */
const double x = dv / (isp * g0);
const double m0 = mf * exp(x);
const double prop = mf * expm1(x);`,

    cpp: `// Propellant mass: ${A}
const double x = dv / (isp * g0);
const double m0 = mf * std::exp(x);
const double prop = mf * std::expm1(x);`,

    rust: `// Propellant mass: ${A}
let x = dv / (isp * g0);
let m0 = mf * x.exp();
let prop = mf * x.exp_m1();`,

    zig: `// Propellant mass: ${A}
const x = dv / (isp * g0);
const m0 = mf * @exp(x);
const prop = mf * std.math.expm1(x);`,

    fortran: `! Propellant mass: ${A}
x = dv / (isp * g0)
m0 = mf * exp(x)
prop = mf * expm1(x)`,

    matlab: `% Propellant mass: ${A}
x = dv / (isp * g0);
m0 = mf * exp(x);
prop = mf * expm1(x);`,

    julia: `# Propellant mass: ${A}
x = dv / (isp * g0)
m0 = mf * exp(x)
prop = mf * expm1(x)`,

    latex: `% Invert Tsiolkovsky: pure SI. Propellant keeps the expm1 form.
\\[
  m_0 = m_f\\, e^{\\Delta v/(I_{sp} g_0)},\\quad
  m_{\\mathrm{prop}} = m_f\\,\\mathrm{expm1}\\!\\left(\\frac{\\Delta v}{I_{sp} g_0}\\right)
\\]`,
  },
}
