import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body universal-variable propagation (ellipse/parabola/hyperbola). No drag, J2, or third body. SI (m, s).'

export const keplerSnippets: FormulaSnippet = {
  formulaId: 'kepler-propagate',
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
    python: `# Universal Kepler propagate: ${ASSUMPTIONS}
import math
import numpy as np

def stumpff_C(z):
    if z > 1e-8:
        s = math.sqrt(z)
        return (1 - math.cos(s)) / z
    if z < -1e-8:
        s = math.sqrt(-z)
        return (1 - math.cosh(s)) / z
    return 0.5 - z/24 + z*z/720

def stumpff_S(z):
    if z > 1e-8:
        s = math.sqrt(z)
        return (s - math.sin(s)) / (s**3)
    if z < -1e-8:
        s = math.sqrt(-z)
        return (math.sinh(s) - s) / (s**3)
    return 1/6 - z/120 + z*z/5040

def kepler_propagate(mu, r0, v0, dt, tol=1e-10, max_iter=50):
    r0 = np.asarray(r0, float); v0 = np.asarray(v0, float)
    r0n = np.linalg.norm(r0); v0n = np.linalg.norm(v0)
    alpha = 2/r0n - v0n**2/mu          # 1/a
    chi = math.sqrt(mu) * abs(alpha) * dt
    for _ in range(max_iter):
        z = alpha * chi*chi
        C, S = stumpff_C(z), stumpff_S(z)
        r = (chi*chi*C
             + np.dot(r0, v0)/math.sqrt(mu) * chi*(1 - z*S)
             + r0n*(1 - z*C))
        dchi = (math.sqrt(mu)*dt - chi**3*S
                - np.dot(r0, v0)/math.sqrt(mu)*chi*chi*C
                - r0n*chi*(1 - z*S)) / r
        chi += dchi
        if abs(dchi) < tol:
            break
    z = alpha * chi*chi
    C, S = stumpff_C(z), stumpff_S(z)
    f  = 1 - (chi*chi/r0n)*C
    g  = dt - (chi**3)/math.sqrt(mu)*S
    r  = f*r0 + g*v0
    rn = np.linalg.norm(r)
    fd = math.sqrt(mu)/(rn*r0n)*(z*S - 1)*chi
    gd = 1 - (chi*chi/rn)*C
    v  = fd*r0 + gd*v0
    return r, v

# Example LEO (Earth μ, m, m/s, s):
r0 = [rx, ry, rz]
v0 = [vx, vy, vz]
result = kepler_propagate(mu, r0, v0, dt_s)
r_x = result[0][0]
r_y = result[0][1]
r_z = result[0][2]
v_x = result[1][0]
v_y = result[1][1]
v_z = result[1][2]`,

    javascript: `// Universal Kepler propagate: ${ASSUMPTIONS}
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
function keplerPropagate(mu, r0, v0, dt, tol = 1e-10, maxIter = 50) {
  const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
  const norm = (a) => Math.hypot(a[0], a[1], a[2])
  const r0n = norm(r0), v0n = norm(v0)
  const alpha = 2/r0n - (v0n*v0n)/mu
  let chi = Math.sqrt(mu) * Math.abs(alpha) * dt
  for (let i = 0; i < maxIter; i++) {
    const z = alpha * chi * chi
    const C = stumpffC(z), S = stumpffS(z)
    const r = chi*chi*C + dot(r0,v0)/Math.sqrt(mu)*chi*(1-z*S) + r0n*(1-z*C)
    const dchi = (Math.sqrt(mu)*dt - chi**3*S
      - dot(r0,v0)/Math.sqrt(mu)*chi*chi*C - r0n*chi*(1-z*S)) / r
    chi += dchi
    if (Math.abs(dchi) < tol) break
  }
  const z = alpha * chi * chi, C = stumpffC(z), S = stumpffS(z)
  const f = 1 - (chi*chi/r0n)*C
  const g = dt - (chi**3)/Math.sqrt(mu)*S
  const r = [f*r0[0]+g*v0[0], f*r0[1]+g*v0[1], f*r0[2]+g*v0[2]]
  const rn = norm(r)
  const fd = Math.sqrt(mu)/(rn*r0n)*(z*S - 1)*chi
  const gd = 1 - (chi*chi/rn)*C
  const v = [fd*r0[0]+gd*v0[0], fd*r0[1]+gd*v0[1], fd*r0[2]+gd*v0[2]]
  return { r, v }
}

const r0 = [rx, ry, rz]
const v0 = [vx, vy, vz]
const state = keplerPropagate(mu, r0, v0, dt_s)
const r_x = state.r[0]
const r_y = state.r[1]
const r_z = state.r[2]
const v_x = state.v[0]
const v_y = state.v[1]
const v_z = state.v[2]`,

    typescript: `// Universal Kepler propagate: ${ASSUMPTIONS}
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
function keplerPropagate(mu: number, r0: Vec3, v0: Vec3, dt: number) {
  const dot = (a: Vec3, b: Vec3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
  const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
  const r0n = norm(r0), v0n = norm(v0)
  const alpha = 2/r0n - (v0n*v0n)/mu
  let chi = Math.sqrt(mu) * Math.abs(alpha) * dt
  for (let i = 0; i < 50; i++) {
    const z = alpha*chi*chi, C = stumpffC(z), S = stumpffS(z)
    const rmag = chi*chi*C + dot(r0,v0)/Math.sqrt(mu)*chi*(1-z*S) + r0n*(1-z*C)
    const dchi = (Math.sqrt(mu)*dt - chi**3*S - dot(r0,v0)/Math.sqrt(mu)*chi*chi*C
      - r0n*chi*(1-z*S)) / rmag
    chi += dchi
    if (Math.abs(dchi) < 1e-10) break
  }
  const z = alpha*chi*chi, C = stumpffC(z), S = stumpffS(z)
  const f = 1 - (chi*chi/r0n)*C, g = dt - (chi**3)/Math.sqrt(mu)*S
  const r: Vec3 = [f*r0[0]+g*v0[0], f*r0[1]+g*v0[1], f*r0[2]+g*v0[2]]
  const rn = norm(r)
  const fd = Math.sqrt(mu)/(rn*r0n)*(z*S-1)*chi, gd = 1 - (chi*chi/rn)*C
  const v: Vec3 = [fd*r0[0]+gd*v0[0], fd*r0[1]+gd*v0[1], fd*r0[2]+gd*v0[2]]
  return { r, v }
}

const r0 = [rx, ry, rz]
const v0 = [vx, vy, vz]
const state = keplerPropagate(mu, r0, v0, dt_s)
const r_x = state.r[0]
const r_y = state.r[1]
const r_z = state.r[2]
const v_x = state.v[0]
const v_y = state.v[1]
const v_z = state.v[2]`,

    c: `/* Universal Kepler: full universal-variable propagator: ${ASSUMPTIONS}
 * Free vars: mu, rx,ry,rz, vx,vy,vz, dt_s. Newton on chi (Vallado Alg. 8),
 * Stumpff c2(z)/c3(z): trig for z>1e-8, hyperbolic for z<-1e-8, series near 0.
 */
const double r0n = sqrt(rx*rx + ry*ry + rz*rz);
const double v0n = sqrt(vx*vx + vy*vy + vz*vz);
const double rdv = rx*vx + ry*vy + rz*vz;
const double alpha = 2.0/r0n - (v0n*v0n)/mu;
double chi = sqrt(mu) * fabs(alpha) * dt_s;
double z = 0.0, c2 = 0.5, c3 = 1.0/6.0;
for (int iter = 0; iter < 50; iter++) {
  double s, rmag, dchi;
  z = alpha * chi * chi;
  if (z > 1e-8) {
    s = sqrt(z);
    c2 = (1.0 - cos(s)) / z;
    c3 = (s - sin(s)) / (s*s*s);
  } else if (z < -1e-8) {
    s = sqrt(-z);
    c2 = (1.0 - cosh(s)) / z;
    c3 = (sinh(s) - s) / (s*s*s);
  } else {
    c2 = 0.5 - z/24.0 + z*z/720.0;
    c3 = 1.0/6.0 - z/120.0 + z*z/5040.0;
  }
  rmag = chi*chi*c2 + (rdv/sqrt(mu))*chi*(1.0 - z*c3) + r0n*(1.0 - z*c2);
  dchi = (sqrt(mu)*dt_s - chi*chi*chi*c3 - (rdv/sqrt(mu))*chi*chi*c2 - r0n*chi*(1.0 - z*c3)) / rmag;
  chi += dchi;
  if (fabs(dchi) < 1e-10) break;
}
const double f = 1.0 - (chi*chi/r0n)*c2;
const double g = dt_s - (chi*chi*chi/sqrt(mu))*c3;
const double r_x = f*rx + g*vx;
const double r_y = f*ry + g*vy;
const double r_z = f*rz + g*vz;
const double rn = sqrt(r_x*r_x + r_y*r_y + r_z*r_z);
const double fd = sqrt(mu)/(rn*r0n)*(z*c3 - 1.0)*chi;
const double gd = 1.0 - (chi*chi/rn)*c2;
const double v_x = fd*rx + gd*vx;
const double v_y = fd*ry + gd*vy;
const double v_z = fd*rz + gd*vz;`,

    cpp: `// Universal Kepler: full universal-variable propagator: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz, dt_s. Newton on chi (Vallado Alg. 8),
// Stumpff c2(z)/c3(z): trig for z>1e-8, hyperbolic for z<-1e-8, series near 0.
const double r0n = std::sqrt(rx*rx + ry*ry + rz*rz);
const double v0n = std::sqrt(vx*vx + vy*vy + vz*vz);
const double rdv = rx*vx + ry*vy + rz*vz;
const double alpha = 2.0/r0n - (v0n*v0n)/mu;
double chi = std::sqrt(mu) * std::fabs(alpha) * dt_s;
double z = 0.0, c2 = 0.5, c3 = 1.0/6.0;
for (int iter = 0; iter < 50; iter++) {
  double s, rmag, dchi;
  z = alpha * chi * chi;
  if (z > 1e-8) {
    s = std::sqrt(z);
    c2 = (1.0 - std::cos(s)) / z;
    c3 = (s - std::sin(s)) / (s*s*s);
  } else if (z < -1e-8) {
    s = std::sqrt(-z);
    c2 = (1.0 - std::cosh(s)) / z;
    c3 = (std::sinh(s) - s) / (s*s*s);
  } else {
    c2 = 0.5 - z/24.0 + z*z/720.0;
    c3 = 1.0/6.0 - z/120.0 + z*z/5040.0;
  }
  rmag = chi*chi*c2 + (rdv/std::sqrt(mu))*chi*(1.0 - z*c3) + r0n*(1.0 - z*c2);
  dchi = (std::sqrt(mu)*dt_s - chi*chi*chi*c3 - (rdv/std::sqrt(mu))*chi*chi*c2 - r0n*chi*(1.0 - z*c3)) / rmag;
  chi += dchi;
  if (std::fabs(dchi) < 1e-10) break;
}
const double f = 1.0 - (chi*chi/r0n)*c2;
const double g = dt_s - (chi*chi*chi/std::sqrt(mu))*c3;
const double r_x = f*rx + g*vx;
const double r_y = f*ry + g*vy;
const double r_z = f*rz + g*vz;
const double rn = std::sqrt(r_x*r_x + r_y*r_y + r_z*r_z);
const double fd = std::sqrt(mu)/(rn*r0n)*(z*c3 - 1.0)*chi;
const double gd = 1.0 - (chi*chi/rn)*c2;
const double v_x = fd*rx + gd*vx;
const double v_y = fd*ry + gd*vy;
const double v_z = fd*rz + gd*vz;`,

    rust: `// Universal Kepler: full universal-variable propagator: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz, dt_s. Newton on chi (Vallado Alg. 8),
// Stumpff c2(z)/c3(z): trig for z>1e-8, hyperbolic for z<-1e-8, series near 0.
let r0n = (rx*rx + ry*ry + rz*rz).sqrt();
let v0n = (vx*vx + vy*vy + vz*vz).sqrt();
let rdv = rx*vx + ry*vy + rz*vz;
let alpha = 2.0/r0n - (v0n*v0n)/mu;
let mut chi = mu.sqrt() * alpha.abs() * dt_s;
let mut z = 0.0;
let mut c2 = 0.5;
let mut c3 = 1.0/6.0;
for _ in 0..50 {
    z = alpha * chi * chi;
    if z > 1e-8 {
        let s = z.sqrt();
        c2 = (1.0 - s.cos()) / z;
        c3 = (s - s.sin()) / (s*s*s);
    } else if z < -1e-8 {
        let s = (-z).sqrt();
        c2 = (1.0 - s.cosh()) / z;
        c3 = (s.sinh() - s) / (s*s*s);
    } else {
        c2 = 0.5 - z/24.0 + z*z/720.0;
        c3 = 1.0/6.0 - z/120.0 + z*z/5040.0;
    }
    let rmag = chi*chi*c2 + (rdv/mu.sqrt())*chi*(1.0 - z*c3) + r0n*(1.0 - z*c2);
    let dchi = (mu.sqrt()*dt_s - chi*chi*chi*c3 - (rdv/mu.sqrt())*chi*chi*c2 - r0n*chi*(1.0 - z*c3)) / rmag;
    chi += dchi;
    if dchi.abs() < 1e-10 { break; }
}
let f = 1.0 - (chi*chi/r0n)*c2;
let g = dt_s - (chi*chi*chi/mu.sqrt())*c3;
let r_x = f*rx + g*vx;
let r_y = f*ry + g*vy;
let r_z = f*rz + g*vz;
let rn = (r_x*r_x + r_y*r_y + r_z*r_z).sqrt();
let fd = mu.sqrt()/(rn*r0n)*(z*c3 - 1.0)*chi;
let gd = 1.0 - (chi*chi/rn)*c2;
let v_x = fd*rx + gd*vx;
let v_y = fd*ry + gd*vy;
let v_z = fd*rz + gd*vz;`,

    zig: `// Universal Kepler: full universal-variable propagator: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz, dt_s. Newton on chi (Vallado Alg. 8),
// Stumpff c2(z)/c3(z): trig for z>1e-8, hyperbolic for z<-1e-8, series near 0.
const r0n = std.math.sqrt(rx*rx + ry*ry + rz*rz);
const v0n = std.math.sqrt(vx*vx + vy*vy + vz*vz);
const rdv = rx*vx + ry*vy + rz*vz;
const alpha = 2.0/r0n - (v0n*v0n)/mu;
var chi = std.math.sqrt(mu) * @abs(alpha) * dt_s;
var z: f64 = 0.0;
var c2: f64 = 0.5;
var c3: f64 = 1.0 / 6.0;
var iter: usize = 0;
while (iter < 50) : (iter += 1) {
    z = alpha * chi * chi;
    if (z > 1e-8) {
        const s = std.math.sqrt(z);
        c2 = (1.0 - std.math.cos(s)) / z;
        c3 = (s - std.math.sin(s)) / (s * s * s);
    } else if (z < -1e-8) {
        const s = std.math.sqrt(-z);
        c2 = (1.0 - std.math.cosh(s)) / z;
        c3 = (std.math.sinh(s) - s) / (s * s * s);
    } else {
        c2 = 0.5 - z / 24.0 + z * z / 720.0;
        c3 = 1.0 / 6.0 - z / 120.0 + z * z / 5040.0;
    }
    const rmag = chi*chi*c2 + (rdv/std.math.sqrt(mu))*chi*(1.0 - z*c3) + r0n*(1.0 - z*c2);
    const dchi = (std.math.sqrt(mu)*dt_s - chi*chi*chi*c3 - (rdv/std.math.sqrt(mu))*chi*chi*c2 - r0n*chi*(1.0 - z*c3)) / rmag;
    chi += dchi;
    if (@abs(dchi) < 1e-10) break;
}
const f = 1.0 - (chi*chi/r0n)*c2;
const g = dt_s - (chi*chi*chi/std.math.sqrt(mu))*c3;
const r_x = f*rx + g*vx;
const r_y = f*ry + g*vy;
const r_z = f*rz + g*vz;
const rn = std.math.sqrt(r_x*r_x + r_y*r_y + r_z*r_z);
const fd = std.math.sqrt(mu)/(rn*r0n)*(z*c3 - 1.0)*chi;
const gd = 1.0 - (chi*chi/rn)*c2;
const v_x = fd*rx + gd*vx;
const v_y = fd*ry + gd*vy;
const v_z = fd*rz + gd*vz;`,

    fortran: `! Universal Kepler: full universal-variable propagator: ${ASSUMPTIONS}
! Free vars: mu, rx,ry,rz, vx,vy,vz, dt_s. Newton on chi (Vallado Alg. 8),
! Stumpff c2(z)/c3(z): trig for z>1e-8, hyperbolic for z<-1e-8, series near 0.
r0n = sqrt(rx*rx + ry*ry + rz*rz)
v0n = sqrt(vx*vx + vy*vy + vz*vz)
rdv = rx*vx + ry*vy + rz*vz
alpha = 2.0d0/r0n - (v0n*v0n)/mu
chi = sqrt(mu) * abs(alpha) * dt_s
z = 0.0d0
c2 = 0.5d0
c3 = 1.0d0/6.0d0
s = 0.0d0
rmag = r0n
dchi = 0.0d0
iter = 0.0d0
do while (iter < 50.0d0)
  z = alpha * chi * chi
  if (z > 1.0d-8) then
    s = sqrt(z)
    c2 = (1.0d0 - cos(s)) / z
    c3 = (s - sin(s)) / (s*s*s)
  else if (z < -1.0d-8) then
    s = sqrt(-z)
    c2 = (1.0d0 - cosh(s)) / z
    c3 = (sinh(s) - s) / (s*s*s)
  else
    c2 = 0.5d0 - z/24.0d0 + z*z/720.0d0
    c3 = 1.0d0/6.0d0 - z/120.0d0 + z*z/5040.0d0
  end if
  rmag = chi*chi*c2 + (rdv/sqrt(mu))*chi*(1.0d0 - z*c3) + r0n*(1.0d0 - z*c2)
  dchi = (sqrt(mu)*dt_s - chi*chi*chi*c3 - (rdv/sqrt(mu))*chi*chi*c2 - r0n*chi*(1.0d0 - z*c3)) / rmag
  chi = chi + dchi
  iter = iter + 1.0d0
  if (abs(dchi) < 1.0d-10) exit
end do
f = 1.0d0 - (chi*chi/r0n)*c2
g = dt_s - (chi*chi*chi/sqrt(mu))*c3
r_x = f*rx + g*vx
r_y = f*ry + g*vy
r_z = f*rz + g*vz
rn = sqrt(r_x*r_x + r_y*r_y + r_z*r_z)
fd = sqrt(mu)/(rn*r0n)*(z*c3 - 1.0d0)*chi
gd = 1.0d0 - (chi*chi/rn)*c2
v_x = fd*rx + gd*vx
v_y = fd*ry + gd*vy
v_z = fd*rz + gd*vz`,

    matlab: `% Universal Kepler: ${ASSUMPTIONS}
% Full Newton on chi with Stumpff C,S; free vars mu,rx,ry,rz,vx,vy,vz,dt_s
% Pure top-level script (no local function): for/if are legal at top level in
% both MATLAB and Octave, and this avoids the local-function ordering rule.
r0 = [rx, ry, rz];
v0 = [vx, vy, vz];
r0n = norm(r0); v0n = norm(v0);
alpha = 2/r0n - dot(v0,v0)/mu;
chi = sqrt(mu)*abs(alpha)*dt_s;
for k = 1:50
  z = alpha*chi^2;
  if z > 1e-8
    s = sqrt(z); C = (1-cos(s))/z; S = (s-sin(s))/s^3;
  elseif z < -1e-8
    s = sqrt(-z); C = (1-cosh(s))/z; S = (sinh(s)-s)/s^3;
  else
    C = 0.5 - z/24 + z^2/720; S = 1/6 - z/120 + z^2/5040;
  end
  rmag = chi^2*C + dot(r0,v0)/sqrt(mu)*chi*(1-z*S) + r0n*(1-z*C);
  dchi = (sqrt(mu)*dt_s - chi^3*S - dot(r0,v0)/sqrt(mu)*chi^2*C ...
          - r0n*chi*(1-z*S)) / rmag;
  chi = chi + dchi; if abs(dchi) < 1e-10, break; end
end
z = alpha*chi^2;
if z > 1e-8
  s = sqrt(z); C = (1-cos(s))/z; S = (s-sin(s))/s^3;
elseif z < -1e-8
  s = sqrt(-z); C = (1-cosh(s))/z; S = (sinh(s)-s)/s^3;
else
  C = 0.5 - z/24 + z^2/720; S = 1/6 - z/120 + z^2/5040;
end
f = 1 - chi^2/r0n*C; g = dt_s - chi^3/sqrt(mu)*S;
r = f*r0 + g*v0; rn = norm(r);
fd = sqrt(mu)/(rn*r0n)*(z*S-1)*chi; gd = 1 - chi^2/rn*C;
v = fd*r0 + gd*v0;
r_x = r(1);
r_y = r(2);
r_z = r(3);
v_x = v(1);
v_y = v(2);
v_z = v(3);
fprintf('r_x = %g\\n', r_x);
fprintf('r_y = %g\\n', r_y);
fprintf('r_z = %g\\n', r_z);
fprintf('v_x = %g\\n', v_x);
fprintf('v_y = %g\\n', v_y);
fprintf('v_z = %g\\n', v_z);`,

    julia: `# Universal Kepler propagate: ${ASSUMPTIONS}
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
function kepler_propagate(mu, r0, v0, dt; tol=1e-10, max_iter=50)
    r0n = hypot(r0...); v0n = hypot(v0...)
    alpha = 2/r0n - v0n^2/mu
    chi = sqrt(mu) * abs(alpha) * dt
    for _ in 1:max_iter
        z = alpha * chi^2
        C, S = stumpff_C(z), stumpff_S(z)
        rmag = chi^2*C + dot(r0,v0)/sqrt(mu)*chi*(1-z*S) + r0n*(1-z*C)
        dchi = (sqrt(mu)*dt - chi^3*S - dot(r0,v0)/sqrt(mu)*chi^2*C
                - r0n*chi*(1-z*S)) / rmag
        chi += dchi
        abs(dchi) < tol && break
    end
    z = alpha * chi^2
    C, S = stumpff_C(z), stumpff_S(z)
    f = 1 - (chi^2/r0n)*C
    g = dt - chi^3/sqrt(mu)*S
    r = f .* r0 .+ g .* v0
    rn = hypot(r...)
    fd = sqrt(mu)/(rn*r0n)*(z*S - 1)*chi
    gd = 1 - (chi^2/rn)*C
    v = fd .* r0 .+ gd .* v0
    return r, v
end

r0 = [rx, ry, rz]
v0 = [vx, vy, vz]
result = kepler_propagate(mu, r0, v0, dt_s)
r_x = result[1][1]
r_y = result[1][2]
r_z = result[1][3]
v_x = result[2][1]
v_y = result[2][2]
v_z = result[2][3]`,

    latex: `% Universal variable (Stumpff)
\\[
z=\\alpha\\chi^2,\\quad
r=\\chi^2 C(z)+\\frac{\\mathbf r_0\\cdot\\mathbf v_0}{\\sqrt\\mu}\\chi(1-zS)+r_0(1-zC)
\\]
\\[
f=1-\\frac{\\chi^2}{r_0}C,\\quad g=\\Delta t-\\frac{\\chi^3}{\\sqrt\\mu}S,\\quad
\\mathbf r=f\\mathbf r_0+g\\mathbf v_0
\\]`,
  },
}
