import type { FormulaSnippet } from './types'

/**
 * Ideal-gas cabin partial pressures from gas masses.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CabinAtmosphereTool + lib/physics/eclss.ts cabinFromMasses.
 * Free vars: V [m³], T [K], m_O2, m_N2, m_CO2 [kg].
 */
const A = 'Ideal gas mixture; Dalton partial pressures; closed cabin. SI (Pa, K, m³, kg).'

export const cabinAtmosphereSnippets: FormulaSnippet = {
  formulaId: 'cabin-atmosphere',
  assumptions: A,
  code: {
    python: `# Cabin partial pressures: ${A}
R = 8.314462618  # J/(mol·K)
n_O2 = m_O2 / 0.031998
n_N2 = m_N2 / 0.028014
n_CO2 = m_CO2 / 0.04401
n = n_O2 + n_N2 + n_CO2
P = n * R * T / V
ppO2 = n_O2 * R * T / V
ppCO2 = n_CO2 * R * T / V
ppCO2_mmHg = ppCO2 / 133.322`,

    javascript: `// Cabin partial pressures: ${A}
const R = 8.314462618 // J/(mol·K)
const nO2 = m_O2 / 0.031998
const nN2 = m_N2 / 0.028014
const nCO2 = m_CO2 / 0.04401
const n = nO2 + nN2 + nCO2
const P = (n * R * T) / V
const ppO2 = (nO2 * R * T) / V
const ppCO2 = (nCO2 * R * T) / V
const ppCO2_mmHg = ppCO2 / 133.322`,

    typescript: `// Cabin partial pressures: ${A}
const R: number = 8.314462618 // J/(mol·K)
const nO2: number = m_O2 / 0.031998
const nN2: number = m_N2 / 0.028014
const nCO2: number = m_CO2 / 0.04401
const n: number = nO2 + nN2 + nCO2
const P: number = (n * R * T) / V
const ppO2: number = (nO2 * R * T) / V
const ppCO2: number = (nCO2 * R * T) / V
const ppCO2_mmHg: number = ppCO2 / 133.322`,

    c: `/* Cabin partial pressures: ${A} */
const double R = 8.314462618; /* J/(mol·K) */
const double n_O2 = m_O2 / 0.031998;
const double n_N2 = m_N2 / 0.028014;
const double n_CO2 = m_CO2 / 0.04401;
const double n = n_O2 + n_N2 + n_CO2;
const double P = n * R * T / V;
const double ppO2 = n_O2 * R * T / V;
const double ppCO2 = n_CO2 * R * T / V;
const double ppCO2_mmHg = ppCO2 / 133.322;`,

    cpp: `// Cabin partial pressures: ${A}
const double R = 8.314462618; // J/(mol·K)
const double n_O2 = m_O2 / 0.031998;
const double n_N2 = m_N2 / 0.028014;
const double n_CO2 = m_CO2 / 0.04401;
const double n = n_O2 + n_N2 + n_CO2;
const double P = n * R * T / V;
const double ppO2 = n_O2 * R * T / V;
const double ppCO2 = n_CO2 * R * T / V;
const double ppCO2_mmHg = ppCO2 / 133.322;`,

    rust: `// Cabin partial pressures: ${A}
let r_univ = 8.314462618_f64; // J/(mol·K)
let n_o2 = m_O2 / 0.031998;
let n_n2 = m_N2 / 0.028014;
let n_co2 = m_CO2 / 0.04401;
let n = n_o2 + n_n2 + n_co2;
let p = n * r_univ * T / V;
let pp_o2 = n_o2 * r_univ * T / V;
let pp_co2 = n_co2 * r_univ * T / V;
let pp_co2_mmhg = pp_co2 / 133.322;`,

    zig: `// Cabin partial pressures: ${A}
const R: f64 = 8.314462618; // J/(mol·K)
const n_O2 = m_O2 / 0.031998;
const n_N2 = m_N2 / 0.028014;
const n_CO2 = m_CO2 / 0.04401;
const n = n_O2 + n_N2 + n_CO2;
const P = n * R * T / V;
const ppO2 = n_O2 * R * T / V;
const ppCO2 = n_CO2 * R * T / V;
const ppCO2_mmHg = ppCO2 / 133.322;`,

    fortran: `! Cabin partial pressures: ${A}
R = 8.314462618d0
n_O2 = m_O2 / 0.031998d0
n_N2 = m_N2 / 0.028014d0
n_CO2 = m_CO2 / 0.04401d0
n = n_O2 + n_N2 + n_CO2
P = n * R * T / V
ppO2 = n_O2 * R * T / V
ppCO2 = n_CO2 * R * T / V
ppCO2_mmHg = ppCO2 / 133.322d0`,

    matlab: `% Cabin partial pressures: ${A}
R = 8.314462618; % J/(mol·K)
n_O2 = m_O2 / 0.031998;
n_N2 = m_N2 / 0.028014;
n_CO2 = m_CO2 / 0.04401;
n = n_O2 + n_N2 + n_CO2;
P = n * R * T / V;
ppO2 = n_O2 * R * T / V;
ppCO2 = n_CO2 * R * T / V;
ppCO2_mmHg = ppCO2 / 133.322;`,

    julia: `# Cabin partial pressures: ${A}
R = 8.314462618  # J/(mol·K)
n_O2 = m_O2 / 0.031998
n_N2 = m_N2 / 0.028014
n_CO2 = m_CO2 / 0.04401
n = n_O2 + n_N2 + n_CO2
P = n * R * T / V
ppO2 = n_O2 * R * T / V
ppCO2 = n_CO2 * R * T / V
ppCO2_mmHg = ppCO2 / 133.322`,

    latex: `% Cabin atmosphere: pure SI
\\[
  p_i = \\frac{n_i R T}{V},\\quad p=\\sum_i p_i,\\quad
  n_i = m_i / M_i
\\]`,
  },
}
