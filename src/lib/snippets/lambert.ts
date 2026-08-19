import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body Lambert, single revolution, universal z-iteration (Vallado Ch.7 style). Short/long way. SI.'

export const lambertSnippets: FormulaSnippet = {
  formulaId: 'lambert',
  assumptions: ASSUMPTIONS,
  deps: [
    {
      name: 'numpy',
      ecosystem: 'pypi',
      url: 'https://pypi.org/project/numpy/',
      install: 'pip install numpy',
      note: 'Educational kernel uses ndarray helpers; not available on Compiler Explorer.',
      langs: ['python'],
    },
  ],
  code: {
    python: `# Lambert universal-z: ${ASSUMPTIONS}
import math
import numpy as np

def stumpff_C(z):
    if z > 1e-8:
        s = math.sqrt(z); return (1 - math.cos(s)) / z
    if z < -1e-8:
        s = math.sqrt(-z); return (1 - math.cosh(s)) / z
    return 0.5 - z/24 + z*z/720

def stumpff_S(z):
    if z > 1e-8:
        s = math.sqrt(z); return (s - math.sin(s)) / s**3
    if z < -1e-8:
        s = math.sqrt(-z); return (math.sinh(s) - s) / s**3
    return 1/6 - z/120 + z*z/5040

def lambert(mu, r1, r2, tof, short_way=True):
    r1 = np.asarray(r1, float); r2 = np.asarray(r2, float)
    r1n, r2n = np.linalg.norm(r1), np.linalg.norm(r2)
    cos_dnu = np.clip(np.dot(r1, r2) / (r1n * r2n), -1, 1)
    dnu = math.acos(cos_dnu)
    if not short_way:
        dnu = 2*math.pi - dnu
    elif dnu > math.pi:
        dnu = 2*math.pi - dnu
    A = math.sin(dnu) * math.sqrt(r1n * r2n / (1 - cos_dnu))
    z = 0.0
    for _ in range(60):
        C, S = stumpff_C(z), stumpff_S(z)
        y = r1n + r2n + A*(z*S - 1)/math.sqrt(C)
        if A > 0 and y < 0:
            z += 0.1; continue
        chi = math.sqrt(y / C)
        dt = (chi**3 * S + A*math.sqrt(y)) / math.sqrt(mu)
        # d(tof)/dz via finite difference
        dz = 1e-4
        Cp, Sp = stumpff_C(z+dz), stumpff_S(z+dz)
        yp = r1n + r2n + A*((z+dz)*Sp - 1)/math.sqrt(Cp)
        chip = math.sqrt(yp / Cp)
        dtp = (chip**3 * Sp + A*math.sqrt(yp)) / math.sqrt(mu)
        dtdz = (dtp - dt) / dz
        z += (tof - dt) / dtdz
        if abs(tof - dt) < 1e-8:
            break
    C, S = stumpff_C(z), stumpff_S(z)
    y = r1n + r2n + A*(z*S - 1)/math.sqrt(C)
    f  = 1 - y/r1n
    g  = A * math.sqrt(y / mu)
    gdot = 1 - y/r2n
    v1 = (r2 - f*r1) / g
    v2 = (gdot*r2 - r1) / g
    return v1, v2, dnu

r1 = [r1_m, 0.0, 0.0]
r2 = [r2_m * math.cos(ang_rad), r2_m * math.sin(ang_rad), 0.0]
result = lambert(mu, r1, r2, tof_s)
v1_x = result[0][0]
v1_y = result[0][1]
v1_z = result[0][2]
v2_x = result[1][0]
v2_y = result[1][1]
v2_z = result[1][2]
dnu = result[2]`,

    javascript: `// Lambert universal-z: ${ASSUMPTIONS}
function stumpffC(z) {
  if (z > 1e-8) { const s = Math.sqrt(z); return (1 - Math.cos(s)) / z }
  if (z < -1e-8) { const s = Math.sqrt(-z); return (1 - Math.cosh(s)) / z }
  return 0.5 - z/24 + (z*z)/720
}
function stumpffS(z) {
  if (z > 1e-8) { const s = Math.sqrt(z); return (s - Math.sin(s)) / (s**3) }
  if (z < -1e-8) { const s = Math.sqrt(-z); return (Math.sinh(s) - s) / (s**3) }
  return 1/6 - z/120 + (z*z)/5040
}
function lambert(mu, r1, r2, tof, shortWay = true) {
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
  const norm = (a) => Math.hypot(a[0],a[1],a[2])
  const r1n = norm(r1), r2n = norm(r2)
  let dnu = Math.acos(Math.min(1, Math.max(-1, dot(r1,r2)/(r1n*r2n))))
  if (!shortWay) dnu = 2*Math.PI - dnu
  else if (dnu > Math.PI) dnu = 2*Math.PI - dnu
  const A = Math.sin(dnu) * Math.sqrt((r1n*r2n)/(1 - Math.cos(dnu)))
  let z = 0
  for (let i = 0; i < 60; i++) {
    let C = stumpffC(z), S = stumpffS(z)
    let y = r1n + r2n + A*(z*S - 1)/Math.sqrt(C)
    if (A > 0 && y < 0) { z += 0.1; continue }
    const chi = Math.sqrt(y/C)
    const dt = (chi**3*S + A*Math.sqrt(y)) / Math.sqrt(mu)
    const dz = 1e-4
    const Cp = stumpffC(z+dz), Sp = stumpffS(z+dz)
    const yp = r1n + r2n + A*((z+dz)*Sp - 1)/Math.sqrt(Cp)
    const dtp = (Math.sqrt(yp/Cp)**3*Sp + A*Math.sqrt(yp)) / Math.sqrt(mu)
    z += (tof - dt) / ((dtp - dt)/dz)
    if (Math.abs(tof - dt) < 1e-8) break
  }
  const C = stumpffC(z), S = stumpffS(z)
  const y = r1n + r2n + A*(z*S - 1)/Math.sqrt(C)
  const f = 1 - y/r1n, g = A*Math.sqrt(y/mu), gdot = 1 - y/r2n
  const v1 = [(r2[0]-f*r1[0])/g, (r2[1]-f*r1[1])/g, (r2[2]-f*r1[2])/g]
  const v2 = [(gdot*r2[0]-r1[0])/g, (gdot*r2[1]-r1[1])/g, (gdot*r2[2]-r1[2])/g]
  return { v1, v2, dnu }
}

const r1 = [r1_m, 0, 0]
const r2 = [r2_m * Math.cos(ang_rad), r2_m * Math.sin(ang_rad), 0]
const result = lambert(mu, r1, r2, tof_s)
const v1_x = result.v1[0]
const v1_y = result.v1[1]
const v1_z = result.v1[2]
const v2_x = result.v2[0]
const v2_y = result.v2[1]
const v2_z = result.v2[2]
const dnu = result.dnu`,

    typescript: `// Lambert universal-z: ${ASSUMPTIONS}
type Vec3 = [number, number, number]
function stumpffC(z: number): number {
  if (z > 1e-8) { const s = Math.sqrt(z); return (1 - Math.cos(s)) / z }
  if (z < -1e-8) { const s = Math.sqrt(-z); return (1 - Math.cosh(s)) / z }
  return 0.5 - z/24 + (z*z)/720
}
function stumpffS(z: number): number {
  if (z > 1e-8) { const s = Math.sqrt(z); return (s - Math.sin(s)) / (s**3) }
  if (z < -1e-8) { const s = Math.sqrt(-z); return (Math.sinh(s) - s) / (s**3) }
  return 1/6 - z/120 + (z*z)/5040
}
function lambert(mu: number, r1: Vec3, r2: Vec3, tof: number, shortWay = true) {
  const dot = (a: Vec3, b: Vec3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
  const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
  const r1n = norm(r1), r2n = norm(r2)
  let dnu = Math.acos(Math.min(1, Math.max(-1, dot(r1, r2)/(r1n*r2n))))
  if (!shortWay) dnu = 2*Math.PI - dnu
  else if (dnu > Math.PI) dnu = 2*Math.PI - dnu
  const A = Math.sin(dnu) * Math.sqrt((r1n*r2n)/(1 - Math.cos(dnu)))
  let z = 0
  for (let i = 0; i < 60; i++) {
    let C = stumpffC(z), S = stumpffS(z)
    let y = r1n + r2n + A*(z*S - 1)/Math.sqrt(C)
    if (A > 0 && y < 0) { z += 0.1; continue }
    const chi = Math.sqrt(y/C)
    const dt = (chi**3*S + A*Math.sqrt(y)) / Math.sqrt(mu)
    const dz = 1e-4
    const Cp = stumpffC(z+dz), Sp = stumpffS(z+dz)
    const yp = r1n + r2n + A*((z+dz)*Sp - 1)/Math.sqrt(Cp)
    const dtp = (Math.sqrt(yp/Cp)**3*Sp + A*Math.sqrt(yp)) / Math.sqrt(mu)
    z += (tof - dt) / ((dtp - dt)/dz)
    if (Math.abs(tof - dt) < 1e-8) break
  }
  const C = stumpffC(z), S = stumpffS(z)
  const y = r1n + r2n + A*(z*S - 1)/Math.sqrt(C)
  const f = 1 - y/r1n, g = A*Math.sqrt(y/mu), gdot = 1 - y/r2n
  const v1: Vec3 = [(r2[0]-f*r1[0])/g, (r2[1]-f*r1[1])/g, (r2[2]-f*r1[2])/g]
  const v2: Vec3 = [(gdot*r2[0]-r1[0])/g, (gdot*r2[1]-r1[1])/g, (gdot*r2[2]-r1[2])/g]
  return { v1, v2, dnu }
}

const r1: Vec3 = [r1_m, 0, 0]
const r2: Vec3 = [r2_m * Math.cos(ang_rad), r2_m * Math.sin(ang_rad), 0]
const result = lambert(mu, r1, r2, tof_s)
const v1_x: number = result.v1[0]
const v1_y: number = result.v1[1]
const v1_z: number = result.v1[2]
const v2_x: number = result.v2[0]
const v2_y: number = result.v2[1]
const v2_z: number = result.v2[2]
const dnu: number = result.dnu`,

    c: `/* Lambert: educational core: ${ASSUMPTIONS}
 * Free vars: mu, r1_m, r2_m, ang_rad, tof_s (coplanar XY terminals).
 * Newton on z (Stumpff C(z)/S(z)); finite-difference dt/dz (same reference
 * as the Python/JS/TS/Julia/MATLAB bodies in this file).
 */
const double r1n = r1_m;
const double r2n = r2_m;
const double dnu = ang_rad;
const double A = sin(dnu) * sqrt(r1n * r2n / (1.0 - cos(dnu)));
double z = 0.0;
double C = 0.5, S = 1.0/6.0;
for (int iter = 0; iter < 60; iter++) {
  /* tofz/tofzp/Czp/Szp (not dt/Sp/Cp) so these loop-local scratch names never
   * collide with unrelated UI free vars injected by other tools (e.g. dt, Sp). */
  double s, y, chi, tofz, dz, zp, sp, Czp, Szp, yp, chip, tofzp, dtdz;
  if (z > 1e-8) {
    s = sqrt(z);
    C = (1.0 - cos(s)) / z;
    S = (s - sin(s)) / (s*s*s);
  } else if (z < -1e-8) {
    s = sqrt(-z);
    C = (1.0 - cosh(s)) / z;
    S = (sinh(s) - s) / (s*s*s);
  } else {
    C = 0.5 - z/24.0 + z*z/720.0;
    S = 1.0/6.0 - z/120.0 + z*z/5040.0;
  }
  y = r1n + r2n + A*(z*S - 1.0)/sqrt(C);
  if (A > 0.0 && y < 0.0) { z += 0.1; continue; }
  chi = sqrt(y / C);
  tofz = (chi*chi*chi*S + A*sqrt(y)) / sqrt(mu);
  dz = 1e-4;
  zp = z + dz;
  if (zp > 1e-8) {
    sp = sqrt(zp);
    Czp = (1.0 - cos(sp)) / zp;
    Szp = (sp - sin(sp)) / (sp*sp*sp);
  } else if (zp < -1e-8) {
    sp = sqrt(-zp);
    Czp = (1.0 - cosh(sp)) / zp;
    Szp = (sinh(sp) - sp) / (sp*sp*sp);
  } else {
    Czp = 0.5 - zp/24.0 + zp*zp/720.0;
    Szp = 1.0/6.0 - zp/120.0 + zp*zp/5040.0;
  }
  yp = r1n + r2n + A*(zp*Szp - 1.0)/sqrt(Czp);
  chip = sqrt(yp / Czp);
  tofzp = (chip*chip*chip*Szp + A*sqrt(yp)) / sqrt(mu);
  dtdz = (tofzp - tofz) / dz;
  z += (tof_s - tofz) / dtdz;
  if (fabs(tof_s - tofz) < 1e-8) break;
}
if (z > 1e-8) {
  double s = sqrt(z);
  C = (1.0 - cos(s)) / z;
  S = (s - sin(s)) / (s*s*s);
} else if (z < -1e-8) {
  double s = sqrt(-z);
  C = (1.0 - cosh(s)) / z;
  S = (sinh(s) - s) / (s*s*s);
} else {
  C = 0.5 - z/24.0 + z*z/720.0;
  S = 1.0/6.0 - z/120.0 + z*z/5040.0;
}
const double y = r1n + r2n + A*(z*S - 1.0)/sqrt(C);
const double f = 1.0 - y/r1n;
const double g = A * sqrt(y / mu);
const double gdot = 1.0 - y/r2n;
/* r1=(r1n,0,0), r2=(r2n cos dnu, r2n sin dnu, 0) → v1=(r2-f r1)/g */
const double r1x = r1n, r1y = 0.0, r1z = 0.0;
const double r2x = r2n * cos(dnu), r2y = r2n * sin(dnu), r2z = 0.0;
const double v1x = (r2x - f*r1x) / g;
const double v1y = (r2y - f*r1y) / g;
const double v1z = (r2z - f*r1z) / g;
const double v2x = (gdot*r2x - r1x) / g;
const double v2y = (gdot*r2y - r1y) / g;
const double v2z = (gdot*r2z - r1z) / g;`,

    cpp: `// Lambert: educational core: ${ASSUMPTIONS}
// Free vars: mu, r1_m, r2_m, ang_rad, tof_s. Newton on z (Stumpff C(z)/S(z));
// finite-difference dt/dz (same reference as the Python/JS/TS/Julia/MATLAB bodies).
const double r1n = r1_m;
const double r2n = r2_m;
const double dnu = ang_rad;
const double A = std::sin(dnu) * std::sqrt(r1n * r2n / (1.0 - std::cos(dnu)));
double z = 0.0;
double C = 0.5, S = 1.0/6.0;
for (int iter = 0; iter < 60; iter++) {
  // tofz/tofzp/Czp/Szp (not dt/Sp/Cp) so these loop-local scratch names never
  // collide with unrelated UI free vars injected by other tools (e.g. dt, Sp).
  double s, y, chi, tofz, dz, zp, sp, Czp, Szp, yp, chip, tofzp, dtdz;
  if (z > 1e-8) {
    s = std::sqrt(z);
    C = (1.0 - std::cos(s)) / z;
    S = (s - std::sin(s)) / (s*s*s);
  } else if (z < -1e-8) {
    s = std::sqrt(-z);
    C = (1.0 - std::cosh(s)) / z;
    S = (std::sinh(s) - s) / (s*s*s);
  } else {
    C = 0.5 - z/24.0 + z*z/720.0;
    S = 1.0/6.0 - z/120.0 + z*z/5040.0;
  }
  y = r1n + r2n + A*(z*S - 1.0)/std::sqrt(C);
  if (A > 0.0 && y < 0.0) { z += 0.1; continue; }
  chi = std::sqrt(y / C);
  tofz = (chi*chi*chi*S + A*std::sqrt(y)) / std::sqrt(mu);
  dz = 1e-4;
  zp = z + dz;
  if (zp > 1e-8) {
    sp = std::sqrt(zp);
    Czp = (1.0 - std::cos(sp)) / zp;
    Szp = (sp - std::sin(sp)) / (sp*sp*sp);
  } else if (zp < -1e-8) {
    sp = std::sqrt(-zp);
    Czp = (1.0 - std::cosh(sp)) / zp;
    Szp = (std::sinh(sp) - sp) / (sp*sp*sp);
  } else {
    Czp = 0.5 - zp/24.0 + zp*zp/720.0;
    Szp = 1.0/6.0 - zp/120.0 + zp*zp/5040.0;
  }
  yp = r1n + r2n + A*(zp*Szp - 1.0)/std::sqrt(Czp);
  chip = std::sqrt(yp / Czp);
  tofzp = (chip*chip*chip*Szp + A*std::sqrt(yp)) / std::sqrt(mu);
  dtdz = (tofzp - tofz) / dz;
  z += (tof_s - tofz) / dtdz;
  if (std::fabs(tof_s - tofz) < 1e-8) break;
}
if (z > 1e-8) {
  double s = std::sqrt(z);
  C = (1.0 - std::cos(s)) / z;
  S = (s - std::sin(s)) / (s*s*s);
} else if (z < -1e-8) {
  double s = std::sqrt(-z);
  C = (1.0 - std::cosh(s)) / z;
  S = (std::sinh(s) - s) / (s*s*s);
} else {
  C = 0.5 - z/24.0 + z*z/720.0;
  S = 1.0/6.0 - z/120.0 + z*z/5040.0;
}
const double y = r1n + r2n + A*(z*S - 1.0)/std::sqrt(C);
const double f = 1.0 - y/r1n;
const double g = A * std::sqrt(y / mu);
const double gdot = 1.0 - y/r2n;
const double r1x = r1n, r1y = 0.0, r1z = 0.0;
const double r2x = r2n * std::cos(dnu), r2y = r2n * std::sin(dnu), r2z = 0.0;
const double v1x = (r2x - f*r1x) / g;
const double v1y = (r2y - f*r1y) / g;
const double v1z = (r2z - f*r1z) / g;
const double v2x = (gdot*r2x - r1x) / g;
const double v2y = (gdot*r2y - r1y) / g;
const double v2z = (gdot*r2z - r1z) / g;`,

    rust: `// Lambert: educational core: ${ASSUMPTIONS}
// Free vars: mu, r1_m, r2_m, ang_rad, tof_s. Newton on z (Stumpff c(z)/s(z));
// finite-difference dt/dz (same reference as the Python/JS/TS/Julia/MATLAB bodies).
let r1n = r1_m;
let r2n = r2_m;
let dnu = ang_rad;
let a_lam = dnu.sin() * (r1n * r2n / (1.0 - dnu.cos())).sqrt();
let mut z = 0.0_f64;
let mut c = 0.5_f64;
let mut s = 1.0_f64 / 6.0;
for _ in 0..60 {
    if z > 1e-8 {
        let sq = z.sqrt();
        c = (1.0 - sq.cos()) / z;
        s = (sq - sq.sin()) / (sq * sq * sq);
    } else if z < -1e-8 {
        let sq = (-z).sqrt();
        c = (1.0 - sq.cosh()) / z;
        s = (sq.sinh() - sq) / (sq * sq * sq);
    } else {
        c = 0.5 - z / 24.0 + z * z / 720.0;
        s = 1.0 / 6.0 - z / 120.0 + z * z / 5040.0;
    }
    let y = r1n + r2n + a_lam * (z * s - 1.0) / c.sqrt();
    if a_lam > 0.0 && y < 0.0 {
        z += 0.1;
        continue;
    }
    let chi = (y / c).sqrt();
    // tofz/tofzp/czp/szp (not dt/cp/sp) so these loop-local scratch names never
    // collide with unrelated UI free vars injected by other tools (e.g. dt, cp).
    let tofz = (chi.powi(3) * s + a_lam * y.sqrt()) / mu.sqrt();
    let dz = 1e-4_f64;
    let zp = z + dz;
    let mut czp = 0.5_f64;
    let mut szp = 1.0_f64 / 6.0;
    if zp > 1e-8 {
        let sqp = zp.sqrt();
        czp = (1.0 - sqp.cos()) / zp;
        szp = (sqp - sqp.sin()) / (sqp * sqp * sqp);
    } else if zp < -1e-8 {
        let sqp = (-zp).sqrt();
        czp = (1.0 - sqp.cosh()) / zp;
        szp = (sqp.sinh() - sqp) / (sqp * sqp * sqp);
    } else {
        czp = 0.5 - zp / 24.0 + zp * zp / 720.0;
        szp = 1.0 / 6.0 - zp / 120.0 + zp * zp / 5040.0;
    }
    let yp = r1n + r2n + a_lam * (zp * szp - 1.0) / czp.sqrt();
    let chip = (yp / czp).sqrt();
    let tofzp = (chip.powi(3) * szp + a_lam * yp.sqrt()) / mu.sqrt();
    let dtdz = (tofzp - tofz) / dz;
    z += (tof_s - tofz) / dtdz;
    if (tof_s - tofz).abs() < 1e-8 {
        break;
    }
}
if z > 1e-8 {
    let sq = z.sqrt();
    c = (1.0 - sq.cos()) / z;
    s = (sq - sq.sin()) / (sq * sq * sq);
} else if z < -1e-8 {
    let sq = (-z).sqrt();
    c = (1.0 - sq.cosh()) / z;
    s = (sq.sinh() - sq) / (sq * sq * sq);
} else {
    c = 0.5 - z / 24.0 + z * z / 720.0;
    s = 1.0 / 6.0 - z / 120.0 + z * z / 5040.0;
}
let y = r1n + r2n + a_lam * (z * s - 1.0) / c.sqrt();
let f = 1.0 - y/r1n;
let g = a_lam * (y / mu).sqrt();
let gdot = 1.0 - y/r2n;
let r1x = r1n;
let r1y = 0.0_f64;
let r2x = r2n * dnu.cos();
let r2y = r2n * dnu.sin();
let v1x = (r2x - f*r1x) / g;
let v1y = (r2y - f*r1y) / g;
let v2x = (gdot*r2x - r1x) / g;
let v2y = (gdot*r2y - r1y) / g;`,

    zig: `// Lambert: educational core: ${ASSUMPTIONS}
// Free vars: mu, r1_m, r2_m, ang_rad, tof_s. Newton on z (Stumpff C(z)/S(z));
// finite-difference dt/dz (same reference as the Python/JS/TS/Julia/MATLAB bodies).
const r1n = r1_m;
const r2n = r2_m;
const dnu = ang_rad;
const A = std.math.sin(dnu) * std.math.sqrt(r1n * r2n / (1.0 - std.math.cos(dnu)));
var z: f64 = 0.0;
var C: f64 = 0.5;
var S: f64 = 1.0 / 6.0;
var iter: usize = 0;
while (iter < 60) : (iter += 1) {
    if (z > 1e-8) {
        const s = std.math.sqrt(z);
        C = (1.0 - std.math.cos(s)) / z;
        S = (s - std.math.sin(s)) / (s * s * s);
    } else if (z < -1e-8) {
        const s = std.math.sqrt(-z);
        C = (1.0 - std.math.cosh(s)) / z;
        S = (std.math.sinh(s) - s) / (s * s * s);
    } else {
        C = 0.5 - z / 24.0 + z * z / 720.0;
        S = 1.0 / 6.0 - z / 120.0 + z * z / 5040.0;
    }
    const y = r1n + r2n + A * (z * S - 1.0) / std.math.sqrt(C);
    if (A > 0.0 and y < 0.0) {
        z += 0.1;
        continue;
    }
    const chi = std.math.sqrt(y / C);
    // tofz/tofzp/Czp/Szp (not dt/Sp/Cp) so these loop-local scratch names never
    // collide with unrelated UI free vars injected by other tools (e.g. dt, Sp).
    const tofz = (chi * chi * chi * S + A * std.math.sqrt(y)) / std.math.sqrt(mu);
    const dz = 1e-4;
    const zp = z + dz;
    var Czp: f64 = 0.5;
    var Szp: f64 = 1.0 / 6.0;
    if (zp > 1e-8) {
        const sp = std.math.sqrt(zp);
        Czp = (1.0 - std.math.cos(sp)) / zp;
        Szp = (sp - std.math.sin(sp)) / (sp * sp * sp);
    } else if (zp < -1e-8) {
        const sp = std.math.sqrt(-zp);
        Czp = (1.0 - std.math.cosh(sp)) / zp;
        Szp = (std.math.sinh(sp) - sp) / (sp * sp * sp);
    } else {
        Czp = 0.5 - zp / 24.0 + zp * zp / 720.0;
        Szp = 1.0 / 6.0 - zp / 120.0 + zp * zp / 5040.0;
    }
    const yp = r1n + r2n + A * (zp * Szp - 1.0) / std.math.sqrt(Czp);
    const chip = std.math.sqrt(yp / Czp);
    const tofzp = (chip * chip * chip * Szp + A * std.math.sqrt(yp)) / std.math.sqrt(mu);
    const dtdz = (tofzp - tofz) / dz;
    z += (tof_s - tofz) / dtdz;
    if (@abs(tof_s - tofz) < 1e-8) break;
}
if (z > 1e-8) {
    const s = std.math.sqrt(z);
    C = (1.0 - std.math.cos(s)) / z;
    S = (s - std.math.sin(s)) / (s * s * s);
} else if (z < -1e-8) {
    const s = std.math.sqrt(-z);
    C = (1.0 - std.math.cosh(s)) / z;
    S = (std.math.sinh(s) - s) / (s * s * s);
} else {
    C = 0.5 - z / 24.0 + z * z / 720.0;
    S = 1.0 / 6.0 - z / 120.0 + z * z / 5040.0;
}
const y = r1n + r2n + A * (z * S - 1.0) / std.math.sqrt(C);
const f = 1.0 - y/r1n;
const g = A * std.math.sqrt(y / mu);
const gdot = 1.0 - y/r2n;
const r1x = r1n;
const r1y: f64 = 0.0;
const r2x = r2n * std.math.cos(dnu);
const r2y = r2n * std.math.sin(dnu);
const v1x = (r2x - f*r1x) / g;
const v1y = (r2y - f*r1y) / g;
const v2x = (gdot*r2x - r1x) / g;
const v2y = (gdot*r2y - r1y) / g;`,

    fortran: `! Lambert: educational core: ${ASSUMPTIONS}
! Free vars: mu, r1_m, r2_m, ang_rad, tof_s. Newton on z (Stumpff C(z)/S(z));
! finite-difference dt/dz (same reference as the Python/JS/TS/Julia/MATLAB bodies).
r1n = r1_m
r2n = r2_m
dnu = ang_rad
A = sin(dnu) * sqrt(r1n * r2n / (1.0d0 - cos(dnu)))
z = 0.0d0
C = 0.5d0
S = 1.0d0/6.0d0
sq = 0.0d0
y = 0.0d0
chi = 0.0d0
dt = 0.0d0
dz = 1.0d-4
zp = 0.0d0
Cp = 0.5d0
Sp = 1.0d0/6.0d0
sqp = 0.0d0
yp = 0.0d0
chip = 0.0d0
dtp = 0.0d0
dtdz = 0.0d0
iter = 0.0d0
do while (iter < 60.0d0)
  if (z > 1.0d-8) then
    sq = sqrt(z)
    C = (1.0d0 - cos(sq)) / z
    S = (sq - sin(sq)) / (sq*sq*sq)
  else if (z < -1.0d-8) then
    sq = sqrt(-z)
    C = (1.0d0 - cosh(sq)) / z
    S = (sinh(sq) - sq) / (sq*sq*sq)
  else
    C = 0.5d0 - z/24.0d0 + z*z/720.0d0
    S = 1.0d0/6.0d0 - z/120.0d0 + z*z/5040.0d0
  end if
  y = r1n + r2n + A*(z*S - 1.0d0)/sqrt(C)
  if (A > 0.0d0 .and. y < 0.0d0) then
    z = z + 0.1d0
    iter = iter + 1.0d0
    cycle
  end if
  chi = sqrt(y / C)
  dt = (chi*chi*chi*S + A*sqrt(y)) / sqrt(mu)
  zp = z + dz
  if (zp > 1.0d-8) then
    sqp = sqrt(zp)
    Cp = (1.0d0 - cos(sqp)) / zp
    Sp = (sqp - sin(sqp)) / (sqp*sqp*sqp)
  else if (zp < -1.0d-8) then
    sqp = sqrt(-zp)
    Cp = (1.0d0 - cosh(sqp)) / zp
    Sp = (sinh(sqp) - sqp) / (sqp*sqp*sqp)
  else
    Cp = 0.5d0 - zp/24.0d0 + zp*zp/720.0d0
    Sp = 1.0d0/6.0d0 - zp/120.0d0 + zp*zp/5040.0d0
  end if
  yp = r1n + r2n + A*(zp*Sp - 1.0d0)/sqrt(Cp)
  chip = sqrt(yp / Cp)
  dtp = (chip*chip*chip*Sp + A*sqrt(yp)) / sqrt(mu)
  dtdz = (dtp - dt) / dz
  z = z + (tof_s - dt) / dtdz
  iter = iter + 1.0d0
  if (abs(tof_s - dt) < 1.0d-8) exit
end do
if (z > 1.0d-8) then
  sq = sqrt(z)
  C = (1.0d0 - cos(sq)) / z
  S = (sq - sin(sq)) / (sq*sq*sq)
else if (z < -1.0d-8) then
  sq = sqrt(-z)
  C = (1.0d0 - cosh(sq)) / z
  S = (sinh(sq) - sq) / (sq*sq*sq)
else
  C = 0.5d0 - z/24.0d0 + z*z/720.0d0
  S = 1.0d0/6.0d0 - z/120.0d0 + z*z/5040.0d0
end if
y = r1n + r2n + A*(z*S - 1.0d0)/sqrt(C)
f = 1.0d0 - y/r1n
g = A * sqrt(y / mu)
gdot = 1.0d0 - y/r2n
r1x = r1n
r1y = 0.0d0
r2x = r2n * cos(dnu)
r2y = r2n * sin(dnu)
v1x = (r2x - f*r1x) / g
v1y = (r2y - f*r1y) / g
v2x = (gdot*r2x - r1x) / g
v2y = (gdot*r2y - r1y) / g`,

    matlab: `% Lambert: ${ASSUMPTIONS}
% Full universal-z Newton iteration; free vars mu,r1_m,r2_m,ang_rad,tof_s.
% Pure top-level script (no local function): for/if are legal at top level in
% both MATLAB and Octave, and this avoids the local-function ordering rule.
r1 = [r1_m, 0, 0];
r2 = [r2_m * cos(ang_rad), r2_m * sin(ang_rad), 0];
r1n = norm(r1); r2n = norm(r2);
dnu = acos(max(-1, min(1, dot(r1,r2)/(r1n*r2n))));
if dnu > pi, dnu = 2*pi - dnu; end
A = sin(dnu)*sqrt(r1n*r2n/(1-cos(dnu)));
z = 0;
for k = 1:60
  if z > 1e-8
    s = sqrt(z); C = (1-cos(s))/z; S = (s-sin(s))/s^3;
  elseif z < -1e-8
    s = sqrt(-z); C = (1-cosh(s))/z; S = (sinh(s)-s)/s^3;
  else
    C = 0.5 - z/24 + z^2/720; S = 1/6 - z/120 + z^2/5040;
  end
  y = r1n + r2n + A*(z*S-1)/sqrt(C);
  if A > 0 && y < 0, z = z + 0.1; continue; end
  chi = sqrt(y/C); dt = (chi^3*S + A*sqrt(y))/sqrt(mu);
  dz = 1e-4;
  zp = z+dz;
  if zp > 1e-8
    sp = sqrt(zp); Cp = (1-cos(sp))/zp; Sp = (sp-sin(sp))/sp^3;
  elseif zp < -1e-8
    sp = sqrt(-zp); Cp = (1-cosh(sp))/zp; Sp = (sinh(sp)-sp)/sp^3;
  else
    Cp = 0.5 - zp/24 + zp^2/720; Sp = 1/6 - zp/120 + zp^2/5040;
  end
  yp = r1n + r2n + A*(zp*Sp-1)/sqrt(Cp);
  chip = sqrt(yp/Cp); dtp = (chip^3*Sp + A*sqrt(yp))/sqrt(mu);
  z = z + (tof_s - dt)/((dtp-dt)/dz);
  if abs(tof_s-dt) < 1e-8, break; end
end
if z > 1e-8
  s = sqrt(z); C = (1-cos(s))/z; S = (s-sin(s))/s^3;
elseif z < -1e-8
  s = sqrt(-z); C = (1-cosh(s))/z; S = (sinh(s)-s)/s^3;
else
  C = 0.5 - z/24 + z^2/720; S = 1/6 - z/120 + z^2/5040;
end
y = r1n + r2n + A*(z*S-1)/sqrt(C);
f = 1 - y/r1n; g = A*sqrt(y/mu); gdot = 1 - y/r2n;
v1 = (r2 - f*r1)/g; v2 = (gdot*r2 - r1)/g;
v1_x = v1(1);
v1_y = v1(2);
v1_z = v1(3);
v2_x = v2(1);
v2_y = v2(2);
v2_z = v2(3);`,

    julia: `# Lambert universal-z: ${ASSUMPTIONS}
using LinearAlgebra

function stumpff_C(z)
    if z > 1e-8
        s = sqrt(z); return (1 - cos(s)) / z
    elseif z < -1e-8
        s = sqrt(-z); return (1 - cosh(s)) / z
    else
        return 0.5 - z/24 + z*z/720
    end
end
function stumpff_S(z)
    if z > 1e-8
        s = sqrt(z); return (s - sin(s)) / s^3
    elseif z < -1e-8
        s = sqrt(-z); return (sinh(s) - s) / s^3
    else
        return 1/6 - z/120 + z*z/5040
    end
end
function lambert(mu, r1, r2, tof; short_way=true)
    r1n, r2n = hypot(r1...), hypot(r2...)
    dnu = acos(clamp(dot(r1, r2) / (r1n * r2n), -1, 1))
    if !short_way
        dnu = 2π - dnu
    elseif dnu > π
        dnu = 2π - dnu
    end
    A = sin(dnu) * sqrt(r1n * r2n / (1 - cos(dnu)))
    z = 0.0
    for _ in 1:60
        C, S = stumpff_C(z), stumpff_S(z)
        y = r1n + r2n + A*(z*S - 1)/sqrt(C)
        if A > 0 && y < 0
            z += 0.1; continue
        end
        chi = sqrt(y / C)
        dt = (chi^3 * S + A*sqrt(y)) / sqrt(mu)
        dz = 1e-4
        Cp, Sp = stumpff_C(z+dz), stumpff_S(z+dz)
        yp = r1n + r2n + A*((z+dz)*Sp - 1)/sqrt(Cp)
        chip = sqrt(yp / Cp)
        dtp = (chip^3 * Sp + A*sqrt(yp)) / sqrt(mu)
        z += (tof - dt) / ((dtp - dt) / dz)
        abs(tof - dt) < 1e-8 && break
    end
    C, S = stumpff_C(z), stumpff_S(z)
    y = r1n + r2n + A*(z*S - 1)/sqrt(C)
    f = 1 - y/r1n
    g = A * sqrt(y / mu)
    gdot = 1 - y/r2n
    v1 = (r2 .- f .* r1) ./ g
    v2 = (gdot .* r2 .- r1) ./ g
    return v1, v2, dnu
end

r1 = [r1_m, 0.0, 0.0]
r2 = [r2_m * cos(ang_rad), r2_m * sin(ang_rad), 0.0]
result = lambert(mu, r1, r2, tof_s)
v1_x = result[1][1]
v1_y = result[1][2]
v1_z = result[1][3]
v2_x = result[2][1]
v2_y = result[2][2]
v2_z = result[2][3]
dnu = result[3]`,

    latex: `% Lambert (universal z)
\\[
A=\\sin\\Delta\\nu\\sqrt{\\frac{r_1 r_2}{1-\\cos\\Delta\\nu}},\\quad
y=r_1+r_2+A\\frac{zS-1}{\\sqrt C},\\quad \\chi=\\sqrt{y/C}
\\]
\\[
f=1-\\frac{y}{r_1},\\quad g=A\\sqrt{\\frac y\\mu},\\quad
\\mathbf v_1=\\frac{\\mathbf r_2-f\\mathbf r_1}{g}
\\]`,
  },
}
