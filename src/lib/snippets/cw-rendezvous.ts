import type { FormulaSnippet } from './types'

/**
 * Clohessy-Wiltshire closed-form LVLH relative motion (circular target).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CwRendezvousTool + lib/physics/cw.ts cwPropagate / cwMeanMotion.
 * Free vars: mu, a, x, y, z, vx, vy, vz, tf (or n, dt).
 */
const A =
  'Clohessy-Wiltshire linear relative motion; circular target; LVLH; closed-form STM. SI.'

export const cwSnippets: FormulaSnippet = {
  formulaId: 'cw-rendezvous',
  assumptions: A,
  code: {
    python: `# CW propagate (LVLH): ${A}
import math
n = math.sqrt(mu / a**3)
nt = n * tf
s = math.sin(nt)
c = math.cos(nt)
x_f = (4 - 3 * c) * x + (s / n) * vx + 2 * (1 - c) / n * vy
y_f = 6 * (s - nt) * x + y - 2 * (1 - c) / n * vx + (4 * s / n - 3 * tf) * vy
z_f = z * c + (vz / n) * s
vx_f = 3 * n * s * x + c * vx + 2 * s * vy
vy_f = 6 * n * (c - 1) * x - 2 * s * vx + (4 * c - 3) * vy
vz_f = -z * n * s + vz * c
# Two-impulse to origin: solve Φ_rv v0 = -Φ_rr r0, then Δv2 = -v(tf)`,

    javascript: `// CW propagate (LVLH): ${A}
const n = Math.sqrt(mu / a ** 3)
const nt = n * tf
const s = Math.sin(nt)
const c = Math.cos(nt)
const xF = (4 - 3 * c) * x + (s / n) * vx + (2 * (1 - c) / n) * vy
const yF = 6 * (s - nt) * x + y - (2 * (1 - c) / n) * vx + (4 * s / n - 3 * tf) * vy
const zF = z * c + (vz / n) * s
const vxF = 3 * n * s * x + c * vx + 2 * s * vy
const vyF = 6 * n * (c - 1) * x - 2 * s * vx + (4 * c - 3) * vy
const vzF = -z * n * s + vz * c`,

    typescript: `// CW propagate (LVLH): ${A}
const n: number = Math.sqrt(mu / a ** 3)
const nt: number = n * tf
const s: number = Math.sin(nt)
const c: number = Math.cos(nt)
const xF: number = (4 - 3 * c) * x + (s / n) * vx + (2 * (1 - c) / n) * vy
const yF: number = 6 * (s - nt) * x + y - (2 * (1 - c) / n) * vx + (4 * s / n - 3 * tf) * vy
const zF: number = z * c + (vz / n) * s
const vxF: number = 3 * n * s * x + c * vx + 2 * s * vy
const vyF: number = 6 * n * (c - 1) * x - 2 * s * vx + (4 * c - 3) * vy
const vzF: number = -z * n * s + vz * c`,

    c: `/* CW propagate (LVLH): ${A} */
const double n = sqrt(mu / (a * a * a));
const double nt = n * tf;
const double s = sin(nt);
const double c = cos(nt);
const double x_f = (4.0 - 3.0 * c) * x + (s / n) * vx + 2.0 * (1.0 - c) / n * vy;
const double y_f = 6.0 * (s - nt) * x + y - 2.0 * (1.0 - c) / n * vx + (4.0 * s / n - 3.0 * tf) * vy;
const double z_f = z * c + (vz / n) * s;
const double vx_f = 3.0 * n * s * x + c * vx + 2.0 * s * vy;
const double vy_f = 6.0 * n * (c - 1.0) * x - 2.0 * s * vx + (4.0 * c - 3.0) * vy;
const double vz_f = -z * n * s + vz * c;`,

    cpp: `// CW propagate (LVLH): ${A}
const double n = std::sqrt(mu / (a * a * a));
const double nt = n * tf;
const double s = std::sin(nt);
const double c = std::cos(nt);
const double x_f = (4.0 - 3.0 * c) * x + (s / n) * vx + 2.0 * (1.0 - c) / n * vy;
const double y_f = 6.0 * (s - nt) * x + y - 2.0 * (1.0 - c) / n * vx + (4.0 * s / n - 3.0 * tf) * vy;
const double z_f = z * c + (vz / n) * s;
const double vx_f = 3.0 * n * s * x + c * vx + 2.0 * s * vy;
const double vy_f = 6.0 * n * (c - 1.0) * x - 2.0 * s * vx + (4.0 * c - 3.0) * vy;
const double vz_f = -z * n * s + vz * c;`,

    rust: `// CW propagate (LVLH): ${A}
let n = (mu / (a * a * a)).sqrt();
let nt = n * tf;
let s = nt.sin();
let c = nt.cos();
let x_f = (4.0 - 3.0 * c) * x + (s / n) * vx + 2.0 * (1.0 - c) / n * vy;
let y_f = 6.0 * (s - nt) * x + y - 2.0 * (1.0 - c) / n * vx + (4.0 * s / n - 3.0 * tf) * vy;
let z_f = z * c + (vz / n) * s;
let vx_f = 3.0 * n * s * x + c * vx + 2.0 * s * vy;
let vy_f = 6.0 * n * (c - 1.0) * x - 2.0 * s * vx + (4.0 * c - 3.0) * vy;
let vz_f = -z * n * s + vz * c;`,

    zig: `// CW propagate (LVLH): ${A}
const n = std.math.sqrt(mu / (a * a * a));
const nt = n * tf;
const s = std.math.sin(nt);
const c = std.math.cos(nt);
const x_f = (4.0 - 3.0 * c) * x + (s / n) * vx + 2.0 * (1.0 - c) / n * vy;
const y_f = 6.0 * (s - nt) * x + y - 2.0 * (1.0 - c) / n * vx + (4.0 * s / n - 3.0 * tf) * vy;
const z_f = z * c + (vz / n) * s;
const vx_f = 3.0 * n * s * x + c * vx + 2.0 * s * vy;
const vy_f = 6.0 * n * (c - 1.0) * x - 2.0 * s * vx + (4.0 * c - 3.0) * vy;
const vz_f = -z * n * s + vz * c;`,

    fortran: `! CW propagate (LVLH): ${A}
n = sqrt(mu / a**3)
nt = n * tf
s = sin(nt)
c = cos(nt)
x_f = (4.0d0 - 3.0d0 * c) * x + (s / n) * vx + 2.0d0 * (1.0d0 - c) / n * vy
y_f = 6.0d0 * (s - nt) * x + y - 2.0d0 * (1.0d0 - c) / n * vx + (4.0d0 * s / n - 3.0d0 * tf) * vy
z_f = z * c + (vz / n) * s
vx_f = 3.0d0 * n * s * x + c * vx + 2.0d0 * s * vy
vy_f = 6.0d0 * n * (c - 1.0d0) * x - 2.0d0 * s * vx + (4.0d0 * c - 3.0d0) * vy
vz_f = -z * n * s + vz * c`,

    matlab: `% CW propagate (LVLH): ${A}
n = sqrt(mu / a^3);
nt = n * tf;
s = sin(nt); c = cos(nt);
x_f = (4-3*c)*x + (s/n)*vx + 2*(1-c)/n*vy;
y_f = 6*(s-nt)*x + y - 2*(1-c)/n*vx + (4*s/n - 3*tf)*vy;
z_f = z*c + (vz/n)*s;
vx_f = 3*n*s*x + c*vx + 2*s*vy;
vy_f = 6*n*(c-1)*x - 2*s*vx + (4*c-3)*vy;
vz_f = -z*n*s + vz*c;`,

    julia: `# CW propagate (LVLH): ${A}
n = sqrt(mu / a^3)
nt = n * tf
s = sin(nt)
c = cos(nt)
x_f = (4 - 3 * c) * x + (s / n) * vx + 2 * (1 - c) / n * vy
y_f = 6 * (s - nt) * x + y - 2 * (1 - c) / n * vx + (4 * s / n - 3 * tf) * vy
z_f = z * c + (vz / n) * s
vx_f = 3 * n * s * x + c * vx + 2 * s * vy
vy_f = 6 * n * (c - 1) * x - 2 * s * vx + (4 * c - 3) * vy
vz_f = -z * n * s + vz * c`,

    latex: `% Clohessy-Wiltshire (LVLH)
\\[
  \\ddot x-2n\\dot y-3n^2 x=0,\\quad
  \\ddot y+2n\\dot x=0,\\quad
  \\ddot z+n^2 z=0
\\]
\\[
  n=\\sqrt{\\mu/a^3}
\\]`,
  },
}
