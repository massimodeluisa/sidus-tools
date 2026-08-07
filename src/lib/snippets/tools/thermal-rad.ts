import type { FormulaSnippet } from '../types'

/**
 * Thermal radiated power: Q = ε σ A T⁴ (Stefan-Boltzmann).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches ThermalRadTool + lib/physics/power.ts thermalRadiatedPower.
 * Free vars: A, T (K, alias T_K), eps.
 */
const A =
  'Stefan-Boltzmann: Q = ε σ A T⁴; σ = 5.670374419e-8 W/(m²·K⁴). Educational gray body. SI.'

export const thermSnippets: FormulaSnippet = {
  formulaId: 'thermal-rad',
  assumptions: A,
  code: {
    python: `# Thermal radiated power: ${A}
sigma = 5.670374419e-8  # W/(m²·K⁴)
Q = eps * sigma * A * T**4`,

    javascript: `// Thermal radiated power: ${A}
const sigma = 5.670374419e-8 // W/(m²·K⁴)
const Q = eps * sigma * A * T ** 4`,

    typescript: `// Thermal radiated power: ${A}
const sigma: number = 5.670374419e-8 // W/(m²·K⁴)
const Q: number = eps * sigma * A * T ** 4`,

    c: `/* Thermal radiated power: ${A} */
const double sigma = 5.670374419e-8; /* W/(m²·K⁴) */
const double Q = eps * sigma * A * pow(T, 4.0);`,

    cpp: `// Thermal radiated power: ${A}
const double sigma = 5.670374419e-8; // W/(m²·K⁴)
const double Q = eps * sigma * A * std::pow(T, 4.0);`,

    rust: `// Thermal radiated power: ${A}
let sigma = 5.670374419e-8_f64; // W/(m²·K⁴)
let q = eps * sigma * A * T.powi(4);`,

    zig: `// Thermal radiated power: ${A}
const sigma: f64 = 5.670374419e-8; // W/(m²·K⁴)
const Q = eps * sigma * A * std.math.pow(f64, T, 4.0);`,

    fortran: `! Thermal radiated power: ${A}
sigma = 5.670374419d-8
Q = eps * sigma * A * T**4`,

    matlab: `% Thermal radiated power: ${A}
sigma = 5.670374419e-8; % W/(m^2·K^4)
Q = eps * sigma * A * T^4;`,

    julia: `# Thermal radiated power: ${A}
sigma = 5.670374419e-8  # W/(m²·K⁴)
Q = eps * sigma * A * T^4`,

    latex: `% Thermal radiated power: pure SI
\\[
  Q = \\varepsilon\\,\\sigma\\,A\\,T^{4},\\quad
  \\sigma = 5.670374419\\times 10^{-8}\\,\\mathrm{W/(m^{2}\\cdot K^{4})}
\\]`,
  },
}
