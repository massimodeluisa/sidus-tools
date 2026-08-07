import type { FormulaSnippet } from '../types'

/**
 * Reaction wheel: H = I ω; T = I α; ω from rpm.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches ReactionWheelTool + lib/physics/power.ts wheelMomentum / wheelTorque.
 * Free vars: I, rpm, alpha (rad/s²).
 */
const A =
  'H = I ω with ω = rpm · 2π/60; torque T = I α. Rigid rotor educational model. SI.'

export const wheelSnippets: FormulaSnippet = {
  formulaId: 'reaction-wheel',
  assumptions: A,
  code: {
    python: `# Reaction wheel: ${A}
import math
omega = rpm * 2 * math.pi / 60
H = I * omega
torque = I * alpha`,

    javascript: `// Reaction wheel: ${A}
const omega = (rpm * 2 * Math.PI) / 60
const H = I * omega
const torque = I * alpha`,

    typescript: `// Reaction wheel: ${A}
const omega: number = (rpm * 2 * Math.PI) / 60
const H: number = I * omega
const torque: number = I * alpha`,

    c: `/* Reaction wheel: ${A} */
const double omega = rpm * 2.0 * M_PI / 60.0;
const double H = I * omega;
const double torque = I * alpha;`,

    cpp: `// Reaction wheel: ${A}
const double omega = rpm * 2.0 * M_PI / 60.0;
const double H = I * omega;
const double torque = I * alpha;`,

    rust: `// Reaction wheel: ${A}
let omega = rpm * 2.0 * std::f64::consts::PI / 60.0;
let h = I * omega;
let torque = I * alpha;`,

    zig: `// Reaction wheel: ${A}
const omega = rpm * 2.0 * std.math.pi / 60.0;
const H = I * omega;
const torque = I * alpha;`,

    fortran: `! Reaction wheel: ${A}
omega = rpm * 2.0d0 * 3.141592653589793d0 / 60.0d0
H = I * omega
torque = I * alpha`,

    matlab: `% Reaction wheel: ${A}
omega = rpm * 2 * pi / 60;
H = I * omega;
torque = I * alpha;`,

    julia: `# Reaction wheel: ${A}
omega = rpm * 2 * π / 60
H = I * omega
torque = I * alpha`,

    latex: `% Reaction wheel: pure SI
\\[
  \\omega = \\mathrm{rpm}\\cdot\\frac{2\\pi}{60},\\quad
  H = I\\omega,\\quad
  T = I\\alpha
\\]`,
  },
}
