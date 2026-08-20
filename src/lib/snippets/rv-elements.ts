import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body, inertial equatorial frame, SI. Classical elements singular for e≈0 or i≈0.'

export const rvElementsSnippets: FormulaSnippet = {
  formulaId: 'rv-elements',
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
    python: `# State ↔ classical elements: ${ASSUMPTIONS}
import math
import numpy as np

def rv_to_elements(r, v, mu):
    r = np.asarray(r, float); v = np.asarray(v, float)
    rmag, vmag = np.linalg.norm(r), np.linalg.norm(v)
    hvec = np.cross(r, v); h = np.linalg.norm(hvec)
    nvec = np.cross([0, 0, 1], hvec); n = np.linalg.norm(nvec)
    v2 = vmag**2
    rdotv = r[0]*v[0] + r[1]*v[1] + r[2]*v[2]
    ex = ((v2 - mu/rmag)*r[0] - rdotv*v[0]) / mu
    ey = ((v2 - mu/rmag)*r[1] - rdotv*v[1]) / mu
    ez = ((v2 - mu/rmag)*r[2] - rdotv*v[2]) / mu
    evec = [ex, ey, ez]
    e = math.sqrt(ex*ex + ey*ey + ez*ez)
    energy = v2/2 - mu/rmag
    a = np.inf if abs(e - 1) < 1e-10 else -mu/(2*energy)
    i = np.arccos(np.clip(hvec[2]/h, -1, 1))
    raan = 0.0
    if n > 1e-12:
        raan = np.arccos(np.clip(nvec[0]/n, -1, 1))
        if nvec[1] < 0: raan = 2*np.pi - raan
    argp = 0.0
    if n > 1e-12 and e > 1e-12:
        argp = np.arccos(np.clip(np.dot(nvec, evec)/(n*e), -1, 1))
        if evec[2] < 0: argp = 2*np.pi - argp
    elif e > 1e-12:
        # equatorial: longitude of periapsis from e_x, e_y
        argp = math.atan2(evec[1], evec[0])
        if argp < 0: argp += 2*np.pi
    nu = 0.0
    if e > 1e-12:
        dot_evec_r = evec[0]*r[0] + evec[1]*r[1] + evec[2]*r[2]
        nu = math.acos(max(-1.0, min(1.0, dot_evec_r/(e*rmag))))
        if rdotv < 0: nu = 2*math.pi - nu
    return dict(a=a, e=e, i=i, raan=raan, argp=argp, nu=nu, h=h, energy=energy)

def elements_to_rv(a, e, i, raan, argp, nu, mu):
    p = a * (1 - e*e) if e < 1 else a * (e*e - 1)  # ellipse / hyperbola
    if e < 1:
        p = a * (1 - e*e)
    r_pf = p / (1 + e*np.cos(nu))
    r_w = np.array([r_pf*np.cos(nu), r_pf*np.sin(nu), 0.0])
    v_w = np.sqrt(mu/p) * np.array([-np.sin(nu), e + np.cos(nu), 0.0])
    # R3(Ω) R1(i) R3(ω)
    cO, sO = np.cos(raan), np.sin(raan)
    ci, si = np.cos(i), np.sin(i)
    cw, sw = np.cos(argp), np.sin(argp)
    R = np.array([
        [cO*cw - sO*sw*ci, -cO*sw - sO*cw*ci,  sO*si],
        [sO*cw + cO*sw*ci, -sO*sw + cO*cw*ci, -cO*si],
        [sw*si,             cw*si,              ci   ],
    ])
    return R @ r_w, R @ v_w

r = [rx, ry, rz]
v = [vx, vy, vz]
rmag = math.sqrt(rx*rx + ry*ry + rz*rz)
vmag = math.sqrt(vx*vx + vy*vy + vz*vz)
hx = ry*vz - rz*vy
hy = rz*vx - rx*vz
hz = rx*vy - ry*vx
h = math.sqrt(hx*hx + hy*hy + hz*hz)
rdv = rx*vx + ry*vy + rz*vz
elements = rv_to_elements(r, v, mu)
a = elements['a']
e = elements['e']
i = elements['i']
raan = elements['raan']
argp = elements['argp']
nu = elements['nu']
energy = elements['energy']`,

    javascript: `// RV → classical elements: ${ASSUMPTIONS}
function rvToElements(r, v, mu) {
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
  const norm = (a) => Math.hypot(a[0],a[1],a[2])
  const rmag = norm(r), vmag = norm(v)
  const hvec = cross(r, v), h = norm(hvec)
  const nvec = cross([0,0,1], hvec), n = norm(nvec)
  const evec = [
    ((vmag*vmag - mu/rmag)*r[0] - dot(r,v)*v[0])/mu,
    ((vmag*vmag - mu/rmag)*r[1] - dot(r,v)*v[1])/mu,
    ((vmag*vmag - mu/rmag)*r[2] - dot(r,v)*v[2])/mu,
  ]
  const e = norm(evec)
  const energy = vmag*vmag/2 - mu/rmag
  const a = Math.abs(e - 1) < 1e-10 ? Infinity : -mu/(2*energy)
  const i = Math.acos(Math.min(1, Math.max(-1, hvec[2]/h)))
  let raan = 0
  if (n > 1e-12) {
    raan = Math.acos(Math.min(1, Math.max(-1, nvec[0]/n)))
    if (nvec[1] < 0) raan = 2*Math.PI - raan
  }
  let argp = 0
  if (n > 1e-12 && e > 1e-12) {
    argp = Math.acos(Math.min(1, Math.max(-1, dot(nvec, evec)/(n*e))))
    if (evec[2] < 0) argp = 2*Math.PI - argp
  } else if (e > 1e-12) {
    // equatorial: longitude of periapsis from e_x, e_y
    argp = Math.atan2(evec[1], evec[0])
    if (argp < 0) argp += 2*Math.PI
  }
  let nu = 0
  if (e > 1e-12) {
    nu = Math.acos(Math.min(1, Math.max(-1, dot(evec, r)/(e*rmag))))
    if (dot(r, v) < 0) nu = 2*Math.PI - nu
  }
  return { a, e, i, raan, argp, nu, h, energy }
}

const r = [rx, ry, rz]
const v = [vx, vy, vz]
const rmag = Math.hypot(rx, ry, rz)
const vmag = Math.hypot(vx, vy, vz)
const hx = ry*vz - rz*vy
const hy = rz*vx - rx*vz
const hz = rx*vy - ry*vx
const h = Math.hypot(hx, hy, hz)
const rdv = rx*vx + ry*vy + rz*vz
const elements = rvToElements(r, v, mu)
const a = elements.a
const e = elements.e
const i = elements.i
const raan = elements.raan
const argp = elements.argp
const nu = elements.nu
const energy = elements.energy

// Elements → RV (ellipse): p=a(1-e²); r_w = p/(1+e cosν) [cosν, sinν, 0]
// v_w = √(μ/p) [-sinν, e+cosν, 0]; r = R3(Ω)R1(i)R3(ω) r_w`,

    typescript: `// RV → classical elements: ${ASSUMPTIONS}
type Vec3 = [number, number, number]
function rvToElements(r: Vec3, v: Vec3, mu: number) {
  const cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0],
  ]
  const dot = (a: Vec3, b: Vec3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
  const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
  const rmag = norm(r), vmag = norm(v)
  const hvec = cross(r, v), h = norm(hvec)
  const nvec = cross([0, 0, 1], hvec), n = norm(nvec)
  const evec: Vec3 = [
    ((vmag*vmag - mu/rmag)*r[0] - dot(r, v)*v[0])/mu,
    ((vmag*vmag - mu/rmag)*r[1] - dot(r, v)*v[1])/mu,
    ((vmag*vmag - mu/rmag)*r[2] - dot(r, v)*v[2])/mu,
  ]
  const e = norm(evec)
  const energy = vmag*vmag/2 - mu/rmag
  const a = Math.abs(e - 1) < 1e-10 ? Infinity : -mu/(2*energy)
  const i = Math.acos(Math.min(1, Math.max(-1, hvec[2]/h)))
  let raan = 0
  if (n > 1e-12) {
    raan = Math.acos(Math.min(1, Math.max(-1, nvec[0]/n)))
    if (nvec[1] < 0) raan = 2*Math.PI - raan
  }
  let argp = 0
  if (n > 1e-12 && e > 1e-12) {
    argp = Math.acos(Math.min(1, Math.max(-1, dot(nvec, evec)/(n*e))))
    if (evec[2] < 0) argp = 2*Math.PI - argp
  } else if (e > 1e-12) {
    // equatorial: longitude of periapsis from e_x, e_y
    argp = Math.atan2(evec[1], evec[0])
    if (argp < 0) argp += 2*Math.PI
  }
  let nu = 0
  if (e > 1e-12) {
    nu = Math.acos(Math.min(1, Math.max(-1, dot(evec, r)/(e*rmag))))
    if (dot(r, v) < 0) nu = 2*Math.PI - nu
  }
  return { a, e, i, raan, argp, nu, h, energy }
}

const r: Vec3 = [rx, ry, rz]
const v: Vec3 = [vx, vy, vz]
const rmag: number = Math.hypot(rx, ry, rz)
const vmag: number = Math.hypot(vx, vy, vz)
const hx: number = ry*vz - rz*vy
const hy: number = rz*vx - rx*vz
const hz: number = rx*vy - ry*vx
const h: number = Math.hypot(hx, hy, hz)
const rdv: number = rx*vx + ry*vy + rz*vz
const elements = rvToElements(r, v, mu)
const a: number = elements.a
const e: number = elements.e
const i: number = elements.i
const raan: number = elements.raan
const argp: number = elements.argp
const nu: number = elements.nu
const energy: number = elements.energy`,

    c: `/* RV → OE: educational core: ${ASSUMPTIONS}
 * Free vars: mu, rx,ry,rz, vx,vy,vz.
 */
const double rmag = sqrt(rx*rx + ry*ry + rz*rz);
const double vmag = sqrt(vx*vx + vy*vy + vz*vz);
const double hx = ry*vz - rz*vy;
const double hy = rz*vx - rx*vz;
const double hz = rx*vy - ry*vx;
const double h = sqrt(hx*hx + hy*hy + hz*hz);
const double rdv = rx*vx + ry*vy + rz*vz;
const double ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
const double ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
const double ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
const double e = sqrt(ex*ex + ey*ey + ez*ez);
const double energy = vmag*vmag/2.0 - mu/rmag;
const double a = -mu / (2.0 * energy);
const double i = acos(fmax(-1.0, fmin(1.0, hz / h)));
const double nx = -hy;
const double ny = hx;
const double nz = 0.0;
const double n = sqrt(nx*nx + ny*ny + nz*nz);
double raan = 0.0;
if (n > 1e-12) {
  raan = acos(fmax(-1.0, fmin(1.0, nx / n)));
  if (ny < 0.0) raan = 2.0 * M_PI - raan;
}
double argp = 0.0;
if (n > 1e-12 && e > 1e-12) {
  argp = acos(fmax(-1.0, fmin(1.0, (nx*ex + ny*ey + nz*ez) / (n * e))));
  if (ez < 0.0) argp = 2.0 * M_PI - argp;
} else if (e > 1e-12) {
  /* equatorial: longitude of periapsis from e_x, e_y */
  argp = atan2(ey, ex);
  if (argp < 0.0) argp += 2.0 * M_PI;
}
double nu = 0.0;
if (e > 1e-12) {
  nu = acos(fmax(-1.0, fmin(1.0, (ex*rx + ey*ry + ez*rz) / (e * rmag))));
  if (rdv < 0.0) nu = 2.0 * M_PI - nu;
}`,

    cpp: `// RV → OE: educational core: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz.
const double rmag = std::sqrt(rx*rx + ry*ry + rz*rz);
const double vmag = std::sqrt(vx*vx + vy*vy + vz*vz);
const double hx = ry*vz - rz*vy;
const double hy = rz*vx - rx*vz;
const double hz = rx*vy - ry*vx;
const double h = std::sqrt(hx*hx + hy*hy + hz*hz);
const double rdv = rx*vx + ry*vy + rz*vz;
const double ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
const double ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
const double ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
const double e = std::sqrt(ex*ex + ey*ey + ez*ez);
const double energy = vmag*vmag/2.0 - mu/rmag;
const double a = -mu / (2.0 * energy);
const double i = std::acos(std::fmax(-1.0, std::fmin(1.0, hz / h)));
const double nx = -hy;
const double ny = hx;
const double nz = 0.0;
const double n = std::sqrt(nx*nx + ny*ny + nz*nz);
double raan = 0.0;
if (n > 1e-12) {
  raan = std::acos(std::fmax(-1.0, std::fmin(1.0, nx / n)));
  if (ny < 0.0) raan = 2.0 * M_PI - raan;
}
double argp = 0.0;
if (n > 1e-12 && e > 1e-12) {
  argp = std::acos(std::fmax(-1.0, std::fmin(1.0, (nx*ex + ny*ey + nz*ez) / (n * e))));
  if (ez < 0.0) argp = 2.0 * M_PI - argp;
} else if (e > 1e-12) {
  // equatorial: longitude of periapsis from e_x, e_y
  argp = std::atan2(ey, ex);
  if (argp < 0.0) argp += 2.0 * M_PI;
}
double nu = 0.0;
if (e > 1e-12) {
  nu = std::acos(std::fmax(-1.0, std::fmin(1.0, (ex*rx + ey*ry + ez*rz) / (e * rmag))));
  if (rdv < 0.0) nu = 2.0 * M_PI - nu;
}`,

    rust: `// RV → OE: educational core: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz.
let rmag = (rx*rx + ry*ry + rz*rz).sqrt();
let vmag = (vx*vx + vy*vy + vz*vz).sqrt();
let hx = ry*vz - rz*vy;
let hy = rz*vx - rx*vz;
let hz = rx*vy - ry*vx;
let h = (hx*hx + hy*hy + hz*hz).sqrt();
let rdv = rx*vx + ry*vy + rz*vz;
let ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
let ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
let ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
let e = (ex*ex + ey*ey + ez*ez).sqrt();
let energy = vmag*vmag/2.0 - mu/rmag;
let a = -mu / (2.0 * energy);
let i = (hz / h).clamp(-1.0, 1.0).acos();
let nx = -hy;
let ny = hx;
let nz = 0.0_f64;
let n = (nx*nx + ny*ny + nz*nz).sqrt();
let mut raan = 0.0_f64;
if n > 1e-12 {
    raan = (nx / n).clamp(-1.0, 1.0).acos();
    if ny < 0.0 { raan = 2.0 * std::f64::consts::PI - raan; }
}
let mut argp = 0.0_f64;
if n > 1e-12 && e > 1e-12 {
    argp = ((nx*ex + ny*ey + nz*ez) / (n * e)).clamp(-1.0, 1.0).acos();
    if ez < 0.0 { argp = 2.0 * std::f64::consts::PI - argp; }
} else if e > 1e-12 {
    // equatorial: longitude of periapsis from e_x, e_y
    argp = ey.atan2(ex);
    if argp < 0.0 { argp += 2.0 * std::f64::consts::PI; }
}
let mut nu = 0.0_f64;
if e > 1e-12 {
    nu = ((ex*rx + ey*ry + ez*rz) / (e * rmag)).clamp(-1.0, 1.0).acos();
    if rdv < 0.0 { nu = 2.0 * std::f64::consts::PI - nu; }
}`,

    zig: `// RV → OE: educational core: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz.
const rmag = std.math.sqrt(rx*rx + ry*ry + rz*rz);
const vmag = std.math.sqrt(vx*vx + vy*vy + vz*vz);
const hx = ry*vz - rz*vy;
const hy = rz*vx - rx*vz;
const hz = rx*vy - ry*vx;
const h = std.math.sqrt(hx*hx + hy*hy + hz*hz);
const rdv = rx*vx + ry*vy + rz*vz;
const ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
const ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
const ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
const e = std.math.sqrt(ex*ex + ey*ey + ez*ez);
const energy = vmag*vmag/2.0 - mu/rmag;
const a = -mu / (2.0 * energy);
const cos_i = @max(-1.0, @min(1.0, hz / h));
const i = std.math.acos(cos_i);
const nx = -hy;
const ny = hx;
const nz: f64 = 0.0;
const n = std.math.sqrt(nx*nx + ny*ny + nz*nz);
var raan: f64 = 0.0;
if (n > 1e-12) {
    const cos_raan = @max(-1.0, @min(1.0, nx / n));
    raan = std.math.acos(cos_raan);
    if (ny < 0.0) raan = 2.0 * std.math.pi - raan;
}
var argp: f64 = 0.0;
if (n > 1e-12 and e > 1e-12) {
    const cos_argp = @max(-1.0, @min(1.0, (nx*ex + ny*ey + nz*ez) / (n * e)));
    argp = std.math.acos(cos_argp);
    if (ez < 0.0) argp = 2.0 * std.math.pi - argp;
} else if (e > 1e-12) {
    // equatorial: longitude of periapsis from e_x, e_y
    argp = std.math.atan2(ey, ex);
    if (argp < 0.0) argp += 2.0 * std.math.pi;
}
var nu: f64 = 0.0;
if (e > 1e-12) {
    const cos_nu = @max(-1.0, @min(1.0, (ex*rx + ey*ry + ez*rz) / (e * rmag)));
    nu = std.math.acos(cos_nu);
    if (rdv < 0.0) nu = 2.0 * std.math.pi - nu;
}`,

    fortran: `! RV → OE: educational core: ${ASSUMPTIONS}
! Free vars: mu, rx,ry,rz, vx,vy,vz.
rmag = sqrt(rx*rx + ry*ry + rz*rz)
vmag = sqrt(vx*vx + vy*vy + vz*vz)
hx = ry*vz - rz*vy
hy = rz*vx - rx*vz
hz = rx*vy - ry*vx
h = sqrt(hx*hx + hy*hy + hz*hz)
rdv = rx*vx + ry*vy + rz*vz
ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu
ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu
ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu
e = sqrt(ex*ex + ey*ey + ez*ez)
energy = vmag*vmag/2.0d0 - mu/rmag
a = -mu / (2.0d0 * energy)
i = acos(max(-1.0d0, min(1.0d0, hz / h)))
nx = -hy
ny = hx
nz = 0.0d0
n = sqrt(nx*nx + ny*ny + nz*nz)
raan = 0.0d0
if (n > 1.0d-12) then
  raan = acos(max(-1.0d0, min(1.0d0, nx / n)))
  if (ny < 0.0d0) raan = 2.0d0 * acos(-1.0d0) - raan
end if
argp = 0.0d0
if (n > 1.0d-12 .and. e > 1.0d-12) then
  argp = acos(max(-1.0d0, min(1.0d0, (nx*ex + ny*ey + nz*ez) / (n * e))))
  if (ez < 0.0d0) argp = 2.0d0 * acos(-1.0d0) - argp
else if (e > 1.0d-12) then
  argp = atan2(ey, ex)
  if (argp < 0.0d0) argp = argp + 2.0d0 * acos(-1.0d0)
end if
nu = 0.0d0
if (e > 1.0d-12) then
  nu = acos(max(-1.0d0, min(1.0d0, (ex*rx + ey*ry + ez*rz) / (e * rmag))))
  if (rdv < 0.0d0) nu = 2.0d0 * acos(-1.0d0) - nu
end if`,

    matlab: `% RV → elements: ${ASSUMPTIONS}
r = [rx ry rz];
v = [vx vy vz];
rmag = norm(r);
vmag = norm(v);
hvec = cross(r,v);
h = norm(hvec);
hx = hvec(1);
hy = hvec(2);
hz = hvec(3);
nvec = cross([0 0 1], hvec);
n = norm(nvec);
rdv = dot(r,v);
evec = ((dot(v,v)-mu/rmag)*r - rdv*v)/mu;
e = norm(evec);
energy = dot(v,v)/2 - mu/rmag;
a = -mu/(2*energy);
i = acos(max(-1, min(1, hz/h)));
if n > 1e-12
  raan = acos(max(-1, min(1, nvec(1)/n)));
  if nvec(2) < 0, raan = 2*pi - raan; end
else
  raan = 0;
end
if n > 1e-12 && e > 1e-12
  argp = acos(max(-1, min(1, dot(nvec,evec)/(n*e))));
  if evec(3) < 0, argp = 2*pi - argp; end
elseif e > 1e-12
  % equatorial: longitude of periapsis from e_x, e_y
  argp = atan2(evec(2), evec(1));
  if argp < 0, argp = argp + 2*pi; end
else
  argp = 0;
end
if e > 1e-12
  nu = acos(max(-1, min(1, dot(evec,r)/(e*rmag))));
  if dot(r,v) < 0, nu = 2*pi - nu; end
else
  nu = 0;
end`,

    julia: `# RV → classical elements: ${ASSUMPTIONS}
using LinearAlgebra

function rv_to_elements(r, v, mu)
    rmag, vmag = hypot(r...), hypot(v...)
    hvec = cross(r, v); h = hypot(hvec...)
    nvec = cross([0.0, 0.0, 1.0], hvec); n = hypot(nvec...)
    evec = ((vmag^2 - mu/rmag) .* r .- dot(r, v) .* v) ./ mu
    e = hypot(evec...)
    energy = vmag^2/2 - mu/rmag
    a = abs(e - 1) < 1e-10 ? Inf : -mu/(2*energy)
    i = acos(clamp(hvec[3]/h, -1, 1))
    raan = 0.0
    if n > 1e-12
        raan = acos(clamp(nvec[1]/n, -1, 1))
        if nvec[2] < 0
            raan = 2π - raan
        end
    end
    argp = 0.0
    if n > 1e-12 && e > 1e-12
        argp = acos(clamp(dot(nvec, evec)/(n*e), -1, 1))
        if evec[3] < 0
            argp = 2π - argp
        end
    elseif e > 1e-12
        # equatorial: longitude of periapsis from e_x, e_y
        argp = atan(evec[2], evec[1])
        if argp < 0
            argp += 2π
        end
    end
    nu = 0.0
    if e > 1e-12
        nu = acos(clamp(dot(evec, r)/(e*rmag), -1, 1))
        if dot(r, v) < 0
            nu = 2π - nu
        end
    end
    return (; a, e, i, raan, argp, nu, h, energy)
end

r = [rx, ry, rz]
v = [vx, vy, vz]
rmag = hypot(rx, ry, rz)
vmag = hypot(vx, vy, vz)
hx = ry*vz - rz*vy
hy = rz*vx - rx*vz
hz = rx*vy - ry*vx
h = hypot(hx, hy, hz)
rdv = rx*vx + ry*vy + rz*vz
elements = rv_to_elements(r, v, mu)
a = elements.a
e = elements.e
i = elements.i
raan = elements.raan
argp = elements.argp
nu = elements.nu
energy = elements.energy`,

    latex: `% Classical elements from state
\\[
\\mathbf h=\\mathbf r\\times\\mathbf v,\\quad
\\mathbf e=\\frac{(v^2-\\mu/r)\\mathbf r-(\\mathbf r\\cdot\\mathbf v)\\mathbf v}{\\mu},\\quad
\\varepsilon=\\frac{v^2}{2}-\\frac{\\mu}{r},\\quad a=-\\frac{\\mu}{2\\varepsilon}
\\]`,
  },
}
