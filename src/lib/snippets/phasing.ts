import type { FormulaSnippet } from './types'

/**
 * Circular coplanar phasing orbit (period match over N revs) + Hohmann-proxy Δv.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches PhasingTool + lib/physics/phasing.ts phasingOrbit.
 * Free vars: mu, r (target radius), phase [rad], n (phasing revs).
 */
const A =
  'Circular coplanar phasing; period match over N revs; Δv via circular-circular Hohmann proxy. SI.'

export const phasingSnippets: FormulaSnippet = {
  formulaId: 'phasing',
  assumptions: A,
  code: {
    python: `# Phasing orbit: ${A}
import math
n_t = math.sqrt(mu / r**3)
T_t = 2 * math.pi / n_t
T_c = T_t + phase / (n * n_t)  # phase gain [rad] over n revs
a_c = (mu * T_c**2 / (4 * math.pi**2)) ** (1 / 3)
r1 = r
r2 = a_c
a_h = 0.5 * (r1 + r2)
v1 = math.sqrt(mu / r1)
v2 = math.sqrt(mu / r2)
vp = math.sqrt(mu * (2 / r1 - 1 / a_h))
va = math.sqrt(mu * (2 / r2 - 1 / a_h))
dv1 = abs(vp - v1)
dv2 = abs(v2 - va)
dv_total = 2 * (dv1 + dv2)  # enter + exit`,

    javascript: `// Phasing orbit: ${A}
const nT = Math.sqrt(mu / r ** 3)
const TT = (2 * Math.PI) / nT
const Tc = TT + phase / (n * nT)
const ac = Math.cbrt((mu * Tc * Tc) / (4 * Math.PI * Math.PI))
const r1 = r
const r2 = ac
const aH = 0.5 * (r1 + r2)
const v1 = Math.sqrt(mu / r1)
const v2 = Math.sqrt(mu / r2)
const vp = Math.sqrt(mu * (2 / r1 - 1 / aH))
const va = Math.sqrt(mu * (2 / r2 - 1 / aH))
const dv1 = Math.abs(vp - v1)
const dv2 = Math.abs(v2 - va)
const dvTotal = 2 * (dv1 + dv2)`,

    typescript: `// Phasing orbit: ${A}
const nT: number = Math.sqrt(mu / r ** 3)
const TT: number = (2 * Math.PI) / nT
const Tc: number = TT + phase / (n * nT)
const ac: number = Math.cbrt((mu * Tc * Tc) / (4 * Math.PI * Math.PI))
const r1: number = r
const r2: number = ac
const aH: number = 0.5 * (r1 + r2)
const v1: number = Math.sqrt(mu / r1)
const v2: number = Math.sqrt(mu / r2)
const vp: number = Math.sqrt(mu * (2 / r1 - 1 / aH))
const va: number = Math.sqrt(mu * (2 / r2 - 1 / aH))
const dv1: number = Math.abs(vp - v1)
const dv2: number = Math.abs(v2 - va)
const dvTotal: number = 2 * (dv1 + dv2)`,

    c: `/* Phasing orbit: ${A} */
const double n_t = sqrt(mu / (r * r * r));
const double T_t = 2.0 * M_PI / n_t;
const double T_c = T_t + phase / (n * n_t);
const double a_c = cbrt(mu * T_c * T_c / (4.0 * M_PI * M_PI));
const double r1 = r;
const double r2 = a_c;
const double a_h = 0.5 * (r1 + r2);
const double v1 = sqrt(mu / r1);
const double v2 = sqrt(mu / r2);
const double vp = sqrt(mu * (2.0 / r1 - 1.0 / a_h));
const double va = sqrt(mu * (2.0 / r2 - 1.0 / a_h));
const double dv1 = fabs(vp - v1);
const double dv2 = fabs(v2 - va);
const double dv_total = 2.0 * (dv1 + dv2);`,

    cpp: `// Phasing orbit: ${A}
const double n_t = std::sqrt(mu / (r * r * r));
const double T_t = 2.0 * M_PI / n_t;
const double T_c = T_t + phase / (n * n_t);
const double a_c = std::cbrt(mu * T_c * T_c / (4.0 * M_PI * M_PI));
const double r1 = r;
const double r2 = a_c;
const double a_h = 0.5 * (r1 + r2);
const double v1 = std::sqrt(mu / r1);
const double v2 = std::sqrt(mu / r2);
const double vp = std::sqrt(mu * (2.0 / r1 - 1.0 / a_h));
const double va = std::sqrt(mu * (2.0 / r2 - 1.0 / a_h));
const double dv1 = std::fabs(vp - v1);
const double dv2 = std::fabs(v2 - va);
const double dv_total = 2.0 * (dv1 + dv2);`,

    rust: `// Phasing orbit: ${A}
let n_t = (mu / (r * r * r)).sqrt();
let t_t = 2.0 * std::f64::consts::PI / n_t;
let t_c = t_t + phase / (n * n_t);
let a_c = (mu * t_c * t_c / (4.0 * std::f64::consts::PI * std::f64::consts::PI)).cbrt();
let r1 = r;
let r2 = a_c;
let a_h = 0.5 * (r1 + r2);
let v1 = (mu / r1).sqrt();
let v2 = (mu / r2).sqrt();
let vp = (mu * (2.0 / r1 - 1.0 / a_h)).sqrt();
let va = (mu * (2.0 / r2 - 1.0 / a_h)).sqrt();
let dv1 = (vp - v1).abs();
let dv2 = (v2 - va).abs();
let dv_total = 2.0 * (dv1 + dv2);`,

    zig: `// Phasing orbit: ${A}
const n_t = std.math.sqrt(mu / (r * r * r));
const T_t = 2.0 * std.math.pi / n_t;
const T_c = T_t + phase / (n * n_t);
const a_c = std.math.cbrt(mu * T_c * T_c / (4.0 * std.math.pi * std.math.pi));
const r1 = r;
const r2 = a_c;
const a_h = 0.5 * (r1 + r2);
const v1 = std.math.sqrt(mu / r1);
const v2 = std.math.sqrt(mu / r2);
const vp = std.math.sqrt(mu * (2.0 / r1 - 1.0 / a_h));
const va = std.math.sqrt(mu * (2.0 / r2 - 1.0 / a_h));
const dv1 = @abs(vp - v1);
const dv2 = @abs(v2 - va);
const dv_total = 2.0 * (dv1 + dv2);`,

    fortran: `! Phasing orbit: ${A}
n_t = sqrt(mu / r**3)
T_t = 2.0d0 * 3.141592653589793d0 / n_t
T_c = T_t + phase / (n * n_t)
a_c = (mu * T_c**2 / (4.0d0 * 3.141592653589793d0**2))**(1.0d0/3.0d0)
r1 = r
r2 = a_c
a_h = 0.5d0 * (r1 + r2)
v1 = sqrt(mu / r1)
v2 = sqrt(mu / r2)
vp = sqrt(mu * (2.0d0 / r1 - 1.0d0 / a_h))
va = sqrt(mu * (2.0d0 / r2 - 1.0d0 / a_h))
dv1 = abs(vp - v1)
dv2 = abs(v2 - va)
dv_total = 2.0d0 * (dv1 + dv2)`,

    matlab: `% Phasing orbit: ${A}
n_t = sqrt(mu / r^3);
T_t = 2*pi / n_t;
T_c = T_t + phase / (n * n_t);
a_c = (mu * T_c^2 / (4*pi^2))^(1/3);
r1 = r; r2 = a_c;
a_h = 0.5*(r1+r2);
v1 = sqrt(mu/r1); v2 = sqrt(mu/r2);
vp = sqrt(mu*(2/r1 - 1/a_h));
va = sqrt(mu*(2/r2 - 1/a_h));
dv1 = abs(vp - v1); dv2 = abs(v2 - va);
dv_total = 2*(dv1 + dv2);`,

    julia: `# Phasing orbit: ${A}
n_t = sqrt(mu / r^3)
T_t = 2π / n_t
T_c = T_t + phase / (n * n_t)
a_c = cbrt(mu * T_c^2 / (4π^2))
r1 = r
r2 = a_c
a_h = 0.5 * (r1 + r2)
v1 = sqrt(mu / r1)
v2 = sqrt(mu / r2)
vp = sqrt(mu * (2 / r1 - 1 / a_h))
va = sqrt(mu * (2 / r2 - 1 / a_h))
dv1 = abs(vp - v1)
dv2 = abs(v2 - va)
dv_total = 2 * (dv1 + dv2)`,

    latex: `% Phasing orbit: pure SI
\\[
  T_c=T_t+\\frac{\\Delta\\theta}{N n_t},\\quad
  a_c=\\left(\\frac{\\mu T_c^2}{4\\pi^2}\\right)^{1/3}
\\]
\\[
  \\Delta v_{\\mathrm{rt}} \\approx 2(\\Delta v_1+\\Delta v_2)_{\\mathrm{Hohmann}}(r\\leftrightarrow a_c)
\\]`,
  },
}
