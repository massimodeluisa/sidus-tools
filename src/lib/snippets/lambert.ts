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

# Example: coplanar r1,r2 magnitudes + angle → vectors in XY, then lambert(mu,r1,r2,tof)`,

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
}`,

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
}`,

    c: `/* Lambert: educational core: ${ASSUMPTIONS}
 * Free vars: mu, r1_m, r2_m, ang_rad, tof_s (coplanar XY terminals).
 * Full z-iteration in Python/JS; here closed-form f,g after z,y known.
 */
const double r1n = r1_m;
const double r2n = r2_m;
const double dnu = ang_rad;
const double A = sin(dnu) * sqrt(r1n * r2n / (1.0 - cos(dnu)));
const double z = 0.0; /* solve z so TOF(z)=tof_s (Newton on universal variable) */
const double C = 0.5 - z/24.0 + z*z/720.0;
const double S = 1.0/6.0 - z/120.0 + z*z/5040.0;
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
// Free vars: mu, r1_m, r2_m, ang_rad, tof_s. f,g after universal z (see Python for Newton).
const double r1n = r1_m;
const double r2n = r2_m;
const double dnu = ang_rad;
const double A = std::sin(dnu) * std::sqrt(r1n * r2n / (1.0 - std::cos(dnu)));
const double z = 0.0; // iterate z so TOF(z) = tof_s
const double C = 0.5 - z/24.0 + z*z/720.0;
const double S = 1.0/6.0 - z/120.0 + z*z/5040.0;
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
// Free vars: mu, r1_m, r2_m, ang_rad, tof_s. f,g after universal z (Python has full Newton).
let r1n = r1_m;
let r2n = r2_m;
let dnu = ang_rad;
let a_lam = dnu.sin() * (r1n * r2n / (1.0 - dnu.cos())).sqrt();
let z = 0.0_f64; // iterate z so TOF(z) = tof_s
let c = 0.5 - z/24.0 + z*z/720.0;
let s = 1.0/6.0 - z/120.0 + z*z/5040.0;
let y = r1n + r2n + a_lam*(z*s - 1.0)/c.sqrt();
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
// Free vars: mu, r1_m, r2_m, ang_rad, tof_s. f,g after universal z (Python has full Newton).
const r1n = r1_m;
const r2n = r2_m;
const dnu = ang_rad;
const A = std.math.sin(dnu) * std.math.sqrt(r1n * r2n / (1.0 - std.math.cos(dnu)));
const z: f64 = 0.0; // iterate z so TOF(z) = tof_s
const C = 0.5 - z/24.0 + z*z/720.0;
const S = 1.0/6.0 - z/120.0 + z*z/5040.0;
const y = r1n + r2n + A*(z*S - 1.0)/std.math.sqrt(C);
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
! Free vars: mu, r1_m, r2_m, ang_rad, tof_s. f,g after universal z.
r1n = r1_m
r2n = r2_m
dnu = ang_rad
A = sin(dnu) * sqrt(r1n * r2n / (1.0d0 - cos(dnu)))
z = 0.0d0
C = 0.5d0 - z/24.0d0 + z*z/720.0d0
S = 1.0d0/6.0d0 - z/120.0d0 + z*z/5040.0d0
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
function [v1,v2] = lambert(mu,r1,r2,tof,short)
  r1n = norm(r1); r2n = norm(r2);
  dnu = acos(max(-1, min(1, dot(r1,r2)/(r1n*r2n))));
  if ~short, dnu = 2*pi - dnu; elseif dnu > pi, dnu = 2*pi - dnu; end
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
    z = z + (tof - dt)/((dtp-dt)/dz);
    if abs(tof-dt) < 1e-8, break; end
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
end`,

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
