import type { FormulaSnippet } from './types'

/**
 * Coolant loop heat transport: Q = ṁ cp ΔT.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches ThermalLoopTool + lib/physics/eclss.ts coolantMassFlow / heatFromFlow.
 * Free vars: Q [W], dT [K]; cp default water.
 */
const A = 'Single-phase coolant; Q = ṁ cp ΔT; cp water≈4184 J/(kg·K). SI.'

export const thermalLoopSnippets: FormulaSnippet = {
  formulaId: 'thermal-loop',
  assumptions: A,
  code: {
    python: `# Thermal loop: ${A}
cp = 4184  # J/(kg·K) water
mdot = Q / (cp * dT)  # kg/s for heat load Q [W]
Q_check = mdot * cp * dT`,

    javascript: `// Thermal loop: ${A}
const cp = 4184 // J/(kg·K) water
const mdot = Q / (cp * dT)
const Qcheck = mdot * cp * dT`,

    typescript: `// Thermal loop: ${A}
const cp: number = 4184 // J/(kg·K) water
const mdot: number = Q / (cp * dT)
const Qcheck: number = mdot * cp * dT`,

    c: `/* Thermal loop: ${A} */
const double cp = 4184.0; /* J/(kg·K) water */
const double mdot = Q / (cp * dT);
const double Q_check = mdot * cp * dT;`,

    cpp: `// Thermal loop: ${A}
const double cp = 4184.0; // J/(kg·K) water
const double mdot = Q / (cp * dT);
const double Q_check = mdot * cp * dT;`,

    rust: `// Thermal loop: ${A}
let cp = 4184.0_f64; // J/(kg·K) water
let mdot = Q / (cp * dT);
let q_check = mdot * cp * dT;`,

    zig: `// Thermal loop: ${A}
const cp: f64 = 4184.0; // J/(kg·K) water
const mdot = Q / (cp * dT);
const Q_check = mdot * cp * dT;`,

    fortran: `! Thermal loop: ${A}
cp = 4184.0d0
mdot = Q / (cp * dT)
Q_check = mdot * cp * dT`,

    matlab: `% Thermal loop: ${A}
cp = 4184; % J/(kg·K) water
mdot = Q / (cp * dT);
Q_check = mdot * cp * dT;`,

    julia: `# Thermal loop: ${A}
cp = 4184  # J/(kg·K) water
mdot = Q / (cp * dT)
Q_check = mdot * cp * dT`,

    latex: `% Thermal loop: pure SI
\\[
  \\dot Q = \\dot m\\, c_p\\, \\Delta T,\\quad
  \\dot m = \\dot Q / (c_p\\,\\Delta T)
\\]`,
  },
}
