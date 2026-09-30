import type { FormulaSnippet } from '../types'

/**
 * Propellant mass: invert Tsiolkovsky for wet mass and propellant given dry mass.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Free vars: mf, dv, isp, g0. Matches PropellantMassTool + lib/physics/propulsion.ts.
 */
const A =
  'Invert ideal Tsiolkovsky for nonnegative delta-v and positive Isp, g0, and dry mass; no gravity/drag losses; use expm1 for small propellant masses; SI (m, s, kg).'

export const propellantMassSnippets: FormulaSnippet = {
  formulaId: 'propellant-mass',
  assumptions: A,
  code: {
    python: `# Propellant mass: ${A}
import math
exponent = dv / (isp * g0)
m0 = mf * math.exp(exponent)
prop = mf * math.expm1(exponent)`,

    javascript: `// Propellant mass: ${A}
const exponent = dv / (isp * g0)
const m0 = mf * Math.exp(exponent)
const prop = mf * Math.expm1(exponent)`,

    typescript: `// Propellant mass: ${A}
const exponent: number = dv / (isp * g0)
const m0: number = mf * Math.exp(exponent)
const prop: number = mf * Math.expm1(exponent)`,

    c: `/* Propellant mass: ${A} */
const double exponent = dv / (isp * g0);
const double m0 = mf * exp(exponent);
const double prop = mf * expm1(exponent);`,

    cpp: `// Propellant mass: ${A}
const double exponent = dv / (isp * g0);
const double m0 = mf * std::exp(exponent);
const double prop = mf * std::expm1(exponent);`,

    rust: `// Propellant mass: ${A}
let exponent = dv / (isp * g0);
let m0 = mf * exponent.exp();
let prop = mf * exponent.exp_m1();`,

    zig: `// Propellant mass: ${A}
const exponent = dv / (isp * g0);
const m0 = mf * @exp(exponent);
const prop = mf * (if (@abs(exponent) < 1e-3) exponent * (1.0 + exponent * (0.5 + exponent * (1.0 / 6.0 + exponent * (1.0 / 24.0 + exponent / 120.0)))) else @exp(exponent) - 1.0);`,

    fortran: `! Propellant mass: ${A}
exponent = dv / (isp * g0)
m0 = mf * exp(exponent)
if (abs(exponent) < 1.0d-3) then
    prop = mf * exponent * (1.0d0 + exponent * (0.5d0 + exponent * (1.0d0 / 6.0d0 + exponent * (1.0d0 / 24.0d0 + exponent / 120.0d0))))
else
    prop = mf * (exp(exponent) - 1.0d0)
end if`,

    matlab: `% Propellant mass: ${A}
exponent = dv / (isp * g0);
m0 = mf * exp(exponent);
prop = mf * expm1(exponent);`,

    julia: `# Propellant mass: ${A}
exponent = dv / (isp * g0)
m0 = mf * exp(exponent)
prop = mf * expm1(exponent)`,

    latex: `% Invert Tsiolkovsky: pure SI
\\[
  x = \\frac{\\Delta v}{I_{sp} g_0},\\quad
  m_0 = m_f e^x,\\quad
  m_{\\mathrm{prop}} = m_f \\operatorname{expm1}(x)
\\]`,
  },
}
