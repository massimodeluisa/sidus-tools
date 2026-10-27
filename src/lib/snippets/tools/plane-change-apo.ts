import type { FormulaSnippet } from '../types'

/**
 * Plane change at apoapsis: Δv = 2 v_a sin(θ/2) on the transfer ellipse.
 * θ is the principal included angle in [0, π], so a signed or wrapped Δi
 * still yields a nonnegative burn magnitude.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Free vars: R, hp, ha, mu, di (SI; di in rad). Matches PlaneChangeApoTool + planeChangeAtApsides.
 */
const A =
  'Δv = 2 v_a sin(θ/2) at apoapsis of the transfer ellipse; θ is the principal included angle in [0, π]; two-body impulsive; SI (di in rad).'

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
two_pi = 2 * math.pi
theta = abs(di) % two_pi
if theta > math.pi:
    theta = two_pi - theta
dv = 2 * v * math.sin(theta / 2)`,

    javascript: `// Plane change at apoapsis: ${A}
const rp = R + hp
const ra = R + ha
const a = 0.5 * (rp + ra)
const v = Math.sqrt(mu * (2 / ra - 1 / a))
const twoPi = 2 * Math.PI
let theta = Math.abs(di) % twoPi
if (theta > Math.PI) theta = twoPi - theta
const dv = 2 * v * Math.sin(theta / 2)`,

    typescript: `// Plane change at apoapsis: ${A}
const rp: number = R + hp
const ra: number = R + ha
const a: number = 0.5 * (rp + ra)
const v: number = Math.sqrt(mu * (2 / ra - 1 / a))
const twoPi: number = 2 * Math.PI
let theta: number = Math.abs(di) % twoPi
if (theta > Math.PI) theta = twoPi - theta
const dv: number = 2 * v * Math.sin(theta / 2)`,

    c: `/* Plane change at apoapsis: ${A} */
const double rp = R + hp;
const double ra = R + ha;
const double a = 0.5 * (rp + ra);
const double v = sqrt(mu * (2.0 / ra - 1.0 / a));
const double two_pi = 2.0 * M_PI;
double theta = fmod(fabs(di), two_pi);
if (theta > M_PI) theta = two_pi - theta;
const double dv = 2.0 * v * sin(theta / 2.0);`,

    cpp: `// Plane change at apoapsis: ${A}
const double rp = R + hp;
const double ra = R + ha;
const double a = 0.5 * (rp + ra);
const double v = std::sqrt(mu * (2.0 / ra - 1.0 / a));
const double two_pi = 2.0 * M_PI;
double theta = std::fmod(std::fabs(di), two_pi);
if (theta > M_PI) theta = two_pi - theta;
const double dv = 2.0 * v * std::sin(theta / 2.0);`,

    rust: `// Plane change at apoapsis: ${A}
let rp = R + hp;
let ra = R + ha;
let a = 0.5 * (rp + ra);
let v = (mu * (2.0 / ra - 1.0 / a)).sqrt();
let two_pi = 2.0 * std::f64::consts::PI;
let mut theta = di.abs() % two_pi;
if theta > std::f64::consts::PI {
    theta = two_pi - theta;
}
let dv = 2.0 * v * (theta / 2.0).sin();`,

    zig: `// Plane change at apoapsis: ${A}
const rp = R + hp;
const ra = R + ha;
const a = 0.5 * (rp + ra);
const v = std.math.sqrt(mu * (2.0 / ra - 1.0 / a));
const two_pi = 2.0 * std.math.pi;
var theta = @mod(@abs(di), two_pi);
if (theta > std.math.pi) theta = two_pi - theta;
const dv = 2.0 * v * std.math.sin(theta / 2.0);`,

    fortran: `! Plane change at apoapsis: ${A}
rp = R + hp
ra = R + ha
a = 0.5d0 * (rp + ra)
v = sqrt(mu * (2.0d0 / ra - 1.0d0 / a))
two_pi = 2.0d0 * acos(-1.0d0)
theta = mod(abs(di), two_pi)
if (theta > acos(-1.0d0)) then
  theta = two_pi - theta
endif
dv = 2.0d0 * v * sin(theta / 2.0d0)`,

    matlab: `% Plane change at apoapsis: ${A}
rp = R + hp;
ra = R + ha;
a = 0.5 * (rp + ra);
v = sqrt(mu * (2 / ra - 1 / a));
two_pi = 2 * pi;
theta = mod(abs(di), two_pi);
if theta > pi
  theta = two_pi - theta;
end
dv = 2 * v * sin(theta / 2);`,

    julia: `# Plane change at apoapsis: ${A}
rp = R + hp
ra = R + ha
a = 0.5 * (rp + ra)
v = sqrt(mu * (2 / ra - 1 / a))
two_pi = 2 * pi
theta = mod(abs(di), two_pi)
if theta > pi
  theta = two_pi - theta
end
dv = 2 * v * sin(theta / 2)`,

    latex: `% Plane change at apoapsis. \\theta is the principal included angle in [0, \\pi].
\\[
  r_p = R + h_p,\\quad
  r_a = R + h_a,\\quad
  a = \\tfrac{1}{2}(r_p + r_a)
\\]
\\[
  v_a = \\sqrt{\\mu\\left(\\frac{2}{r_a} - \\frac{1}{a}\\right)},\\quad
  \\Delta v = 2 v_a \\sin\\!\\left(\\frac{\\theta}{2}\\right)
\\]`,
  },
}
