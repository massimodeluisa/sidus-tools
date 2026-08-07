import type { FormulaSnippet } from '../types'

/**
 * Plane change at apoapsis: Δv = 2 v_a sin(Δi/2) on transfer ellipse.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Free vars: R, hp, ha, mu, di (SI; di in rad). Matches PlaneChangeApoTool + planeChangeAtApsides.
 */
const A =
  'Δv = 2 v_a sin(Δi/2) at apoapsis of transfer ellipse; two-body impulsive; SI (di in rad).'

export const planeApoSnippets: FormulaSnippet = {
  formulaId: 'plane-change-apo',
  assumptions: A,
  code: {
    python: `# Plane change at apoapsis: ${A}
import math
rp = R + hp
ra = R + ha
a = 0.5 * (rp + ra)
v = math.sqrt(mu * (2 / ra - 1 / a))
dv = 2 * v * math.sin(di / 2)`,

    javascript: `// Plane change at apoapsis: ${A}
const rp = R + hp
const ra = R + ha
const a = 0.5 * (rp + ra)
const v = Math.sqrt(mu * (2 / ra - 1 / a))
const dv = 2 * v * Math.sin(di / 2)`,

    typescript: `// Plane change at apoapsis: ${A}
const rp: number = R + hp
const ra: number = R + ha
const a: number = 0.5 * (rp + ra)
const v: number = Math.sqrt(mu * (2 / ra - 1 / a))
const dv: number = 2 * v * Math.sin(di / 2)`,

    c: `/* Plane change at apoapsis: ${A} */
const double rp = R + hp;
const double ra = R + ha;
const double a = 0.5 * (rp + ra);
const double v = sqrt(mu * (2.0 / ra - 1.0 / a));
const double dv = 2.0 * v * sin(di / 2.0);`,

    cpp: `// Plane change at apoapsis: ${A}
const double rp = R + hp;
const double ra = R + ha;
const double a = 0.5 * (rp + ra);
const double v = std::sqrt(mu * (2.0 / ra - 1.0 / a));
const double dv = 2.0 * v * std::sin(di / 2.0);`,

    rust: `// Plane change at apoapsis: ${A}
let rp = R + hp;
let ra = R + ha;
let a = 0.5 * (rp + ra);
let v = (mu * (2.0 / ra - 1.0 / a)).sqrt();
let dv = 2.0 * v * (di / 2.0).sin();`,

    zig: `// Plane change at apoapsis: ${A}
const rp = R + hp;
const ra = R + ha;
const a = 0.5 * (rp + ra);
const v = std.math.sqrt(mu * (2.0 / ra - 1.0 / a));
const dv = 2.0 * v * std.math.sin(di / 2.0);`,

    fortran: `! Plane change at apoapsis: ${A}
rp = R + hp
ra = R + ha
a = 0.5d0 * (rp + ra)
v = sqrt(mu * (2.0d0 / ra - 1.0d0 / a))
dv = 2.0d0 * v * sin(di / 2.0d0)`,

    matlab: `% Plane change at apoapsis: ${A}
rp = R + hp;
ra = R + ha;
a = 0.5 * (rp + ra);
v = sqrt(mu * (2 / ra - 1 / a));
dv = 2 * v * sin(di / 2);`,

    julia: `# Plane change at apoapsis: ${A}
rp = R + hp
ra = R + ha
a = 0.5 * (rp + ra)
v = sqrt(mu * (2 / ra - 1 / a))
dv = 2 * v * sin(di / 2)`,

    latex: `% Plane change at apoapsis: pure SI
\\[
  r_p = R + h_p,\\quad
  r_a = R + h_a,\\quad
  a = \\tfrac{1}{2}(r_p + r_a)
\\]
\\[
  v_a = \\sqrt{\\mu\\left(\\frac{2}{r_a} - \\frac{1}{a}\\right)},\\quad
  \\Delta v = 2 v_a \\sin\\!\\left(\\frac{\\Delta i}{2}\\right)
\\]`,
  },
}
