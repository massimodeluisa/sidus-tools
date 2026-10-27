import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body, inertial equatorial frame, SI. Classical angles are singular for e≈0 or sin(i)≈0 (i≈0 or i≈π). Page mode rv2el is state→elements; el2rv is elements→state.'

export const rvElementsSnippets: FormulaSnippet = {
  formulaId: 'rv-elements',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# State ↔ classical elements: ${ASSUMPTIONS}
import math

def dot(a, b):
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

def cross(a, b):
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]

def norm(a):
    return math.sqrt(dot(a, a))

def rv_to_elements(r, v, mu):
    rmag, vmag = norm(r), norm(v)
    hvec = cross(r, v); h = norm(hvec)
    nvec = cross([0.0, 0.0, 1.0], hvec); n = norm(nvec)
    v2 = vmag*vmag
    rdotv = dot(r, v)
    evec = [((v2 - mu/rmag)*r[k] - rdotv*v[k]) / mu for k in range(3)]
    e = norm(evec)
    energy = v2/2 - mu/rmag
    a_raw = -mu / (2.0 * energy) if energy != 0.0 else math.inf
    a = a_raw if math.isfinite(a_raw) else math.inf
    i = math.acos(max(-1.0, min(1.0, hvec[2]/h)))
    raan = 0.0
    if n > 1e-12:
        raan = math.acos(max(-1.0, min(1.0, nvec[0]/n)))
        if nvec[1] < 0: raan = 2*math.pi - raan
    argp = 0.0
    if n > 1e-12 and e > 1e-12:
        argp = math.acos(max(-1.0, min(1.0, dot(nvec, evec)/(n*e))))
        if evec[2] < 0: argp = 2*math.pi - argp
    elif e > 1e-12:
        # equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
        periapsis_y = -evec[1] if hvec[2] < 0 else evec[1]
        argp = math.atan2(periapsis_y, evec[0])
        if argp < 0: argp += 2*math.pi
    nu = 0.0
    if e > 1e-12:
        nu = math.acos(max(-1.0, min(1.0, dot(evec, r)/(e*rmag))))
        if rdotv < 0: nu = 2*math.pi - nu
    elif n > 1e-12:
        nu = math.acos(max(-1.0, min(1.0, dot(nvec, r)/(n*rmag))))
        if r[2] < 0: nu = 2*math.pi - nu
    else:
        nu = math.atan2(-r[1], r[0]) if hvec[2] < 0 else math.atan2(r[1], r[0])
        if nu < 0: nu += 2*math.pi
    return dict(a=a, e=e, i=i, raan=raan, argp=argp, nu=nu, h=h, energy=energy)

def elements_to_rv(a, e, i, raan, argp, nu, mu):
    if abs(e - 1.0) < 1e-12:
        return None
    # Hyperbola stores a < 0. p = |a|(e²−1) stays positive on the occupied branch.
    p = a * (1.0 - e*e) if e < 1.0 else abs(a) * (e*e - 1.0)
    if p <= 0.0:
        return None
    denom = 1.0 + e*math.cos(nu)
    if e >= 1.0:
        if denom <= 1e-12:
            return None
    elif abs(denom) <= 1e-12:
        return None
    r_pf = p / denom
    r_w = [r_pf*math.cos(nu), r_pf*math.sin(nu), 0.0]
    speed = math.sqrt(mu / p)
    v_w = [-speed*math.sin(nu), speed*(e + math.cos(nu)), 0.0]
    cO, sO = math.cos(raan), math.sin(raan)
    ci, si = math.cos(i), math.sin(i)
    cw, sw = math.cos(argp), math.sin(argp)
    R = [
        [cO*cw - sO*sw*ci, -cO*sw - sO*cw*ci,  sO*si],
        [sO*cw + cO*sw*ci, -sO*sw + cO*cw*ci, -cO*si],
        [sw*si,             cw*si,              ci   ],
    ]
    def rotate(vec):
        return [R[row][0]*vec[0] + R[row][1]*vec[1] + R[row][2]*vec[2] for row in range(3)]
    return rotate(r_w), rotate(v_w)

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
energy = elements['energy']
rx_out, ry_out, rz_out = r
vx_out, vy_out, vz_out = v
ang_scale = 1.0
state = None
p_conic = float("nan")
el2rv = ('mode' in globals()) and mode == 'el2rv'
if el2rv:
    ang_scale = math.pi / 180.0 if str(ang)[:1] == 'd' else 1.0
    a = a_km * 1000.0
    e = {{e}}
    i = i_deg * ang_scale
    raan = raan_deg * ang_scale
    argp = argp_deg * ang_scale
    nu = nu_deg * ang_scale
    state = elements_to_rv(a, e, i, raan, argp, nu, mu)
    if state is None:
        rx_out = ry_out = rz_out = float('nan')
        vx_out = vy_out = vz_out = float('nan')
    else:
        (rx_out, ry_out, rz_out), (vx_out, vy_out, vz_out) = state
        energy = -mu / (2.0 * a)
        p_conic = a * (1.0 - e*e) if e < 1.0 else abs(a) * (e*e - 1.0)
        h = math.sqrt(mu * p_conic)`,

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
  const aRaw = energy === 0 ? Infinity : -mu/(2*energy)
  const a = Number.isFinite(aRaw) ? aRaw : Infinity
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
    // equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
    const periapsisY = hvec[2] < 0 ? -evec[1] : evec[1]
    argp = Math.atan2(periapsisY, evec[0])
    if (argp < 0) argp += 2*Math.PI
  }
  let nu = 0
  if (e > 1e-12) {
    nu = Math.acos(Math.min(1, Math.max(-1, dot(evec, r)/(e*rmag))))
    if (dot(r, v) < 0) nu = 2*Math.PI - nu
  } else if (n > 1e-12) {
    nu = Math.acos(Math.min(1, Math.max(-1, dot(nvec, r)/(n*rmag))))
    if (r[2] < 0) nu = 2*Math.PI - nu
  } else {
    nu = Math.atan2(hvec[2] < 0 ? -r[1] : r[1], r[0])
    if (nu < 0) nu += 2*Math.PI
  }
  return { a, e, i, raan, argp, nu, h, energy }
}

function elementsToRv(a, e, i, raan, argp, nu, mu) {
  if (Math.abs(e - 1) < 1e-12) return null
  const p = e < 1 ? a * (1 - e*e) : Math.abs(a) * (e*e - 1)
  if (!(p > 0)) return null
  const cnu = Math.cos(nu), snu = Math.sin(nu)
  const denom = 1 + e*cnu
  if (e >= 1 ? !(denom > 1e-12) : Math.abs(denom) <= 1e-12) return null
  const rPf = p / denom
  const xPf = rPf * cnu, yPf = rPf * snu
  const speed = Math.sqrt(mu / p)
  const vxPf = -speed * snu, vyPf = speed * (e + cnu)
  const cO = Math.cos(raan), sO = Math.sin(raan)
  const ci = Math.cos(i), si = Math.sin(i)
  const cw = Math.cos(argp), sw = Math.sin(argp)
  const rxw = (cO*cw - sO*sw*ci)*xPf + (-cO*sw - sO*cw*ci)*yPf
  const ryw = (sO*cw + cO*sw*ci)*xPf + (-sO*sw + cO*cw*ci)*yPf
  const rzw = sw*si*xPf + cw*si*yPf
  const vxw = (cO*cw - sO*sw*ci)*vxPf + (-cO*sw - sO*cw*ci)*vyPf
  const vyw = (sO*cw + cO*sw*ci)*vxPf + (-sO*sw + cO*cw*ci)*vyPf
  const vzw = sw*si*vxPf + cw*si*vyPf
  return { rx: rxw, ry: ryw, rz: rzw, vx: vxw, vy: vyw, vz: vzw }
}

const r = [rx, ry, rz]
const v = [vx, vy, vz]
const rmag = Math.hypot(rx, ry, rz)
const vmag = Math.hypot(vx, vy, vz)
const hx = ry*vz - rz*vy
const hy = rz*vx - rx*vz
const hz = rx*vy - ry*vx
let h = Math.hypot(hx, hy, hz)
const rdv = rx*vx + ry*vy + rz*vz
const elements = rvToElements(r, v, mu)
let a = elements.a
let e = elements.e
let i = elements.i
let raan = elements.raan
let argp = elements.argp
let nu = elements.nu
let energy = elements.energy
let rx_out = rx, ry_out = ry, rz_out = rz
let vx_out = vx, vy_out = vy, vz_out = vz
const el2rv = typeof mode !== 'undefined' && mode === 'el2rv'
if (el2rv) {
  const angScale = typeof ang === 'string' && ang.charAt(0) === 'd' ? Math.PI / 180 : 1
  a = a_km * 1000
  e = {{e}}
  i = i_deg * angScale
  raan = raan_deg * angScale
  argp = argp_deg * angScale
  nu = nu_deg * angScale
  const state = elementsToRv(a, e, i, raan, argp, nu, mu)
  if (state) {
    rx_out = state.rx; ry_out = state.ry; rz_out = state.rz
    vx_out = state.vx; vy_out = state.vy; vz_out = state.vz
    energy = -mu / (2 * a)
    const pConic = e < 1 ? a * (1 - e*e) : Math.abs(a) * (e*e - 1)
    h = Math.sqrt(mu * pConic)
  } else {
    rx_out = ry_out = rz_out = vx_out = vy_out = vz_out = NaN
  }
}`,

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
  const aRaw = energy === 0 ? Infinity : -mu/(2*energy)
  const a = Number.isFinite(aRaw) ? aRaw : Infinity
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
    // equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
    const periapsisY = hvec[2] < 0 ? -evec[1] : evec[1]
    argp = Math.atan2(periapsisY, evec[0])
    if (argp < 0) argp += 2*Math.PI
  }
  let nu = 0
  if (e > 1e-12) {
    nu = Math.acos(Math.min(1, Math.max(-1, dot(evec, r)/(e*rmag))))
    if (dot(r, v) < 0) nu = 2*Math.PI - nu
  } else if (n > 1e-12) {
    nu = Math.acos(Math.min(1, Math.max(-1, dot(nvec, r)/(n*rmag))))
    if (r[2] < 0) nu = 2*Math.PI - nu
  } else {
    nu = Math.atan2(hvec[2] < 0 ? -r[1] : r[1], r[0])
    if (nu < 0) nu += 2*Math.PI
  }
  return { a, e, i, raan, argp, nu, h, energy }
}

function elementsToRv(a: number, e: number, i: number, raan: number, argp: number, nu: number, mu: number) {
  if (Math.abs(e - 1) < 1e-12) return null
  const p = e < 1 ? a * (1 - e*e) : Math.abs(a) * (e*e - 1)
  if (!(p > 0)) return null
  const cnu = Math.cos(nu), snu = Math.sin(nu)
  const denom = 1 + e*cnu
  if (e >= 1 ? !(denom > 1e-12) : Math.abs(denom) <= 1e-12) return null
  const rPf = p / denom
  const xPf = rPf * cnu, yPf = rPf * snu
  const speed = Math.sqrt(mu / p)
  const vxPf = -speed * snu, vyPf = speed * (e + cnu)
  const cO = Math.cos(raan), sO = Math.sin(raan)
  const ci = Math.cos(i), si = Math.sin(i)
  const cw = Math.cos(argp), sw = Math.sin(argp)
  return {
    rx: (cO*cw - sO*sw*ci)*xPf + (-cO*sw - sO*cw*ci)*yPf,
    ry: (sO*cw + cO*sw*ci)*xPf + (-sO*sw + cO*cw*ci)*yPf,
    rz: sw*si*xPf + cw*si*yPf,
    vx: (cO*cw - sO*sw*ci)*vxPf + (-cO*sw - sO*cw*ci)*vyPf,
    vy: (sO*cw + cO*sw*ci)*vxPf + (-sO*sw + cO*cw*ci)*vyPf,
    vz: sw*si*vxPf + cw*si*vyPf,
  }
}

const r: Vec3 = [rx, ry, rz]
const v: Vec3 = [vx, vy, vz]
const rmag: number = Math.hypot(rx, ry, rz)
const vmag: number = Math.hypot(vx, vy, vz)
const hx: number = ry*vz - rz*vy
const hy: number = rz*vx - rx*vz
const hz: number = rx*vy - ry*vx
let h: number = Math.hypot(hx, hy, hz)
const rdv: number = rx*vx + ry*vy + rz*vz
const elements = rvToElements(r, v, mu)
let a: number = elements.a
let e: number = elements.e
let i: number = elements.i
let raan: number = elements.raan
let argp: number = elements.argp
let nu: number = elements.nu
let energy: number = elements.energy
let rx_out: number = rx, ry_out: number = ry, rz_out: number = rz
let vx_out: number = vx, vy_out: number = vy, vz_out: number = vz
const el2rv = typeof mode !== 'undefined' && mode === 'el2rv'
if (el2rv) {
  const angScale = typeof ang === 'string' && ang.charAt(0) === 'd' ? Math.PI / 180 : 1
  a = a_km * 1000
  e = {{e}}
  i = i_deg * angScale
  raan = raan_deg * angScale
  argp = argp_deg * angScale
  nu = nu_deg * angScale
  const state = elementsToRv(a, e, i, raan, argp, nu, mu)
  if (state) {
    rx_out = state.rx; ry_out = state.ry; rz_out = state.rz
    vx_out = state.vx; vy_out = state.vy; vz_out = state.vz
    energy = -mu / (2 * a)
    const pConic = e < 1 ? a * (1 - e*e) : Math.abs(a) * (e*e - 1)
    h = Math.sqrt(mu * pConic)
  } else {
    rx_out = ry_out = rz_out = vx_out = vy_out = vz_out = NaN
  }
}`,

    c: `/* RV → OE: educational core: ${ASSUMPTIONS}
 * Free vars: mu, rx,ry,rz, vx,vy,vz.
 */
const double rmag = sqrt(rx*rx + ry*ry + rz*rz);
const double vmag = sqrt(vx*vx + vy*vy + vz*vz);
const double hx = ry*vz - rz*vy;
const double hy = rz*vx - rx*vz;
const double hz = rx*vy - ry*vx;
double h = sqrt(hx*hx + hy*hy + hz*hz);
const double rdv = rx*vx + ry*vy + rz*vz;
const double ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
const double ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
const double ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
double e = sqrt(ex*ex + ey*ey + ez*ez);
double energy = vmag*vmag/2.0 - mu/rmag;
double a = -mu / (2.0 * energy);
if (!isfinite(a)) a = INFINITY;
double i = acos(fmax(-1.0, fmin(1.0, hz / h)));
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
  /* equatorial: retrograde (h_z < 0) reflects the perifocal y-axis */
  const double periapsis_y = hz < 0.0 ? -ey : ey;
  argp = atan2(periapsis_y, ex);
  if (argp < 0.0) argp += 2.0 * M_PI;
}
double nu = 0.0;
if (e > 1e-12) {
  nu = acos(fmax(-1.0, fmin(1.0, (ex*rx + ey*ry + ez*rz) / (e * rmag))));
  if (rdv < 0.0) nu = 2.0 * M_PI - nu;
} else if (n > 1e-12) {
  nu = acos(fmax(-1.0, fmin(1.0, (nx*rx + ny*ry + nz*rz) / (n * rmag))));
  if (rz < 0.0) nu = 2.0 * M_PI - nu;
} else {
  nu = atan2(hz < 0.0 ? -ry : ry, rx);
  if (nu < 0.0) nu += 2.0 * M_PI;
}
double rx_out = rx, ry_out = ry, rz_out = rz;
double vx_out = vx, vy_out = vy, vz_out = vz;
if (mode[0] == 'e') {
  const double ang_scale = ang[0] == 'd' ? 0.017453292519943295 : 1.0;
  a = a_km * 1000.0;
  e = {{e}};
  i = i_deg * ang_scale;
  raan = raan_deg * ang_scale;
  argp = argp_deg * ang_scale;
  nu = nu_deg * ang_scale;
  const int parabola = fabs(e - 1.0) < 1e-12;
  const double p = e < 1.0 ? a * (1.0 - e*e) : fabs(a) * (e*e - 1.0);
  const double cnu = cos(nu), snu = sin(nu);
  const double denom = 1.0 + e*cnu;
  const int physical = !parabola && p > 0.0 && (e >= 1.0 ? denom > 1e-12 : fabs(denom) > 1e-12);
  if (physical) {
    const double r_pf = p / denom;
    const double x_pf = r_pf * cnu, y_pf = r_pf * snu;
    const double speed = sqrt(mu / p);
    const double vx_pf = -speed * snu, vy_pf = speed * (e + cnu);
    const double cO = cos(raan), sO = sin(raan);
    const double ci = cos(i), si = sin(i);
    const double cw = cos(argp), sw = sin(argp);
    rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
    ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
    rz_out = sw*si*x_pf + cw*si*y_pf;
    vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
    vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
    vz_out = sw*si*vx_pf + cw*si*vy_pf;
    energy = -mu / (2.0 * a);
    h = sqrt(mu * p);
  } else {
    rx_out = ry_out = rz_out = vx_out = vy_out = vz_out = NAN;
  }
}`,

    cpp: `// RV → OE: educational core: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz.
const double rmag = std::sqrt(rx*rx + ry*ry + rz*rz);
const double vmag = std::sqrt(vx*vx + vy*vy + vz*vz);
const double hx = ry*vz - rz*vy;
const double hy = rz*vx - rx*vz;
const double hz = rx*vy - ry*vx;
double h = std::sqrt(hx*hx + hy*hy + hz*hz);
const double rdv = rx*vx + ry*vy + rz*vz;
const double ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
const double ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
const double ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
double e = std::sqrt(ex*ex + ey*ey + ez*ez);
double energy = vmag*vmag/2.0 - mu/rmag;
double a = -mu / (2.0 * energy);
if (!std::isfinite(a)) a = INFINITY;
double i = std::acos(std::fmax(-1.0, std::fmin(1.0, hz / h)));
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
  // equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
  const double periapsis_y = hz < 0.0 ? -ey : ey;
  argp = std::atan2(periapsis_y, ex);
  if (argp < 0.0) argp += 2.0 * M_PI;
}
double nu = 0.0;
if (e > 1e-12) {
  nu = std::acos(std::fmax(-1.0, std::fmin(1.0, (ex*rx + ey*ry + ez*rz) / (e * rmag))));
  if (rdv < 0.0) nu = 2.0 * M_PI - nu;
} else if (n > 1e-12) {
  nu = std::acos(std::fmax(-1.0, std::fmin(1.0, (nx*rx + ny*ry + nz*rz) / (n * rmag))));
  if (rz < 0.0) nu = 2.0 * M_PI - nu;
} else {
  nu = std::atan2(hz < 0.0 ? -ry : ry, rx);
  if (nu < 0.0) nu += 2.0 * M_PI;
}
double rx_out = rx, ry_out = ry, rz_out = rz;
double vx_out = vx, vy_out = vy, vz_out = vz;
if (mode[0] == 'e') {
  const double ang_scale = ang[0] == 'd' ? 0.017453292519943295 : 1.0;
  a = a_km * 1000.0;
  e = {{e}};
  i = i_deg * ang_scale;
  raan = raan_deg * ang_scale;
  argp = argp_deg * ang_scale;
  nu = nu_deg * ang_scale;
  const int parabola = std::fabs(e - 1.0) < 1e-12;
  const double p = e < 1.0 ? a * (1.0 - e*e) : std::fabs(a) * (e*e - 1.0);
  const double cnu = std::cos(nu), snu = std::sin(nu);
  const double denom = 1.0 + e*cnu;
  const int physical = !parabola && p > 0.0 && (e >= 1.0 ? denom > 1e-12 : std::fabs(denom) > 1e-12);
  if (physical) {
    const double r_pf = p / denom;
    const double x_pf = r_pf * cnu, y_pf = r_pf * snu;
    const double speed = std::sqrt(mu / p);
    const double vx_pf = -speed * snu, vy_pf = speed * (e + cnu);
    const double cO = std::cos(raan), sO = std::sin(raan);
    const double ci = std::cos(i), si = std::sin(i);
    const double cw = std::cos(argp), sw = std::sin(argp);
    rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
    ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
    rz_out = sw*si*x_pf + cw*si*y_pf;
    vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
    vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
    vz_out = sw*si*vx_pf + cw*si*vy_pf;
    energy = -mu / (2.0 * a);
    h = std::sqrt(mu * p);
  } else {
    rx_out = ry_out = rz_out = vx_out = vy_out = vz_out = NAN;
  }
}`,

    rust: `// RV → OE: educational core: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz.
let rmag = (rx*rx + ry*ry + rz*rz).sqrt();
let vmag = (vx*vx + vy*vy + vz*vz).sqrt();
let hx = ry*vz - rz*vy;
let hy = rz*vx - rx*vz;
let hz = rx*vy - ry*vx;
let mut h = (hx*hx + hy*hy + hz*hz).sqrt();
let rdv = rx*vx + ry*vy + rz*vz;
let ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
let ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
let ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
let mut e = (ex*ex + ey*ey + ez*ez).sqrt();
let mut energy = vmag*vmag/2.0 - mu/rmag;
let mut a = -mu / (2.0 * energy);
if !a.is_finite() { a = f64::INFINITY; }
let mut i = (hz / h).clamp(-1.0, 1.0).acos();
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
    // equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
    let periapsis_y = if hz < 0.0 { -ey } else { ey };
    argp = periapsis_y.atan2(ex);
    if argp < 0.0 { argp += 2.0 * std::f64::consts::PI; }
}
let mut nu = 0.0_f64;
if e > 1e-12 {
    nu = ((ex*rx + ey*ry + ez*rz) / (e * rmag)).clamp(-1.0, 1.0).acos();
    if rdv < 0.0 { nu = 2.0 * std::f64::consts::PI - nu; }
} else if n > 1e-12 {
    nu = ((nx*rx + ny*ry + nz*rz) / (n * rmag)).clamp(-1.0, 1.0).acos();
    if rz < 0.0 { nu = 2.0 * std::f64::consts::PI - nu; }
} else {
    nu = if hz < 0.0 { (-ry).atan2(rx) } else { ry.atan2(rx) };
    if nu < 0.0 { nu += 2.0 * std::f64::consts::PI; }
}
let mut rx_out = rx;
let mut ry_out = ry;
let mut rz_out = rz;
let mut vx_out = vx;
let mut vy_out = vy;
let mut vz_out = vz;
if mode.as_bytes()[0] == b'e' {
    let ang_scale = if ang.as_bytes()[0] == b'd' { 0.017453292519943295 } else { 1.0 };
    a = a_km * 1000.0;
    e = {{e}};
    i = i_deg * ang_scale;
    raan = raan_deg * ang_scale;
    argp = argp_deg * ang_scale;
    nu = nu_deg * ang_scale;
    let parabola = (e - 1.0).abs() < 1e-12;
    let p = if e < 1.0 { a * (1.0 - e*e) } else { a.abs() * (e*e - 1.0) };
    let cnu = nu.cos();
    let snu = nu.sin();
    let denom = 1.0 + e*cnu;
    let physical = !parabola && p > 0.0 && if e >= 1.0 { denom > 1e-12 } else { denom.abs() > 1e-12 };
    if physical {
        let r_pf = p / denom;
        let x_pf = r_pf * cnu;
        let y_pf = r_pf * snu;
        let speed = (mu / p).sqrt();
        let vx_pf = -speed * snu;
        let vy_pf = speed * (e + cnu);
        let cO = raan.cos(); let sO = raan.sin();
        let ci = i.cos(); let si = i.sin();
        let cw = argp.cos(); let sw = argp.sin();
        rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
        ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
        rz_out = sw*si*x_pf + cw*si*y_pf;
        vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
        vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
        vz_out = sw*si*vx_pf + cw*si*vy_pf;
        energy = -mu / (2.0 * a);
        h = (mu * p).sqrt();
    } else {
        rx_out = f64::NAN; ry_out = f64::NAN; rz_out = f64::NAN;
        vx_out = f64::NAN; vy_out = f64::NAN; vz_out = f64::NAN;
    }
}`,

    zig: `// RV → OE: educational core: ${ASSUMPTIONS}
// Free vars: mu, rx,ry,rz, vx,vy,vz.
const rmag = std.math.sqrt(rx*rx + ry*ry + rz*rz);
const vmag = std.math.sqrt(vx*vx + vy*vy + vz*vz);
const hx = ry*vz - rz*vy;
const hy = rz*vx - rx*vz;
const hz = rx*vy - ry*vx;
var h = std.math.sqrt(hx*hx + hy*hy + hz*hz);
const rdv = rx*vx + ry*vy + rz*vz;
const ex = ((vmag*vmag - mu/rmag)*rx - rdv*vx) / mu;
const ey = ((vmag*vmag - mu/rmag)*ry - rdv*vy) / mu;
const ez = ((vmag*vmag - mu/rmag)*rz - rdv*vz) / mu;
var e = std.math.sqrt(ex*ex + ey*ey + ez*ez);
var energy = vmag*vmag/2.0 - mu/rmag;
var a = -mu / (2.0 * energy);
if (!std.math.isFinite(a)) a = std.math.inf(f64);
var i = std.math.acos(@max(-1.0, @min(1.0, hz / h)));
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
    // equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
    const periapsis_y = if (hz < 0.0) -ey else ey;
    argp = std.math.atan2(periapsis_y, ex);
    if (argp < 0.0) argp += 2.0 * std.math.pi;
}
var nu: f64 = 0.0;
if (e > 1e-12) {
    const cos_nu = @max(-1.0, @min(1.0, (ex*rx + ey*ry + ez*rz) / (e * rmag)));
    nu = std.math.acos(cos_nu);
    if (rdv < 0.0) nu = 2.0 * std.math.pi - nu;
} else if (n > 1e-12) {
    const cos_u = @max(-1.0, @min(1.0, (nx*rx + ny*ry + nz*rz) / (n * rmag)));
    nu = std.math.acos(cos_u);
    if (rz < 0.0) nu = 2.0 * std.math.pi - nu;
} else {
    nu = std.math.atan2(if (hz < 0.0) -ry else ry, rx);
    if (nu < 0.0) nu += 2.0 * std.math.pi;
}
var rx_out = rx;
var ry_out = ry;
var rz_out = rz;
var vx_out = vx;
var vy_out = vy;
var vz_out = vz;
if (mode[0] == 'e') {
    const ang_scale: f64 = if (ang[0] == 'd') 0.017453292519943295 else 1.0;
    a = a_km * 1000.0;
    e = {{e}};
    i = i_deg * ang_scale;
    raan = raan_deg * ang_scale;
    argp = argp_deg * ang_scale;
    nu = nu_deg * ang_scale;
    const parabola = @abs(e - 1.0) < 1e-12;
    const p = if (e < 1.0) a * (1.0 - e*e) else @abs(a) * (e*e - 1.0);
    const cnu = @cos(nu);
    const snu = @sin(nu);
    const denom = 1.0 + e*cnu;
    const physical = !parabola and p > 0.0 and (if (e >= 1.0) denom > 1e-12 else @abs(denom) > 1e-12);
    if (physical) {
        const r_pf = p / denom;
        const x_pf = r_pf * cnu;
        const y_pf = r_pf * snu;
        const speed = @sqrt(mu / p);
        const vx_pf = -speed * snu;
        const vy_pf = speed * (e + cnu);
        const cO = @cos(raan);
        const sO = @sin(raan);
        const ci = @cos(i);
        const si = @sin(i);
        const cw = @cos(argp);
        const sw = @sin(argp);
        rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
        ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
        rz_out = sw*si*x_pf + cw*si*y_pf;
        vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
        vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
        vz_out = sw*si*vx_pf + cw*si*vy_pf;
        energy = -mu / (2.0 * a);
        h = @sqrt(mu * p);
    } else {
        rx_out = std.math.nan(f64);
        ry_out = std.math.nan(f64);
        rz_out = std.math.nan(f64);
        vx_out = std.math.nan(f64);
        vy_out = std.math.nan(f64);
        vz_out = std.math.nan(f64);
    }
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
  if (hz < 0.0d0) then
    argp = atan2(-ey, ex)
  else
    argp = atan2(ey, ex)
  end if
  if (argp < 0.0d0) argp = argp + 2.0d0 * acos(-1.0d0)
end if
nu = 0.0d0
if (e > 1.0d-12) then
  nu = acos(max(-1.0d0, min(1.0d0, (ex*rx + ey*ry + ez*rz) / (e * rmag))))
  if (rdv < 0.0d0) nu = 2.0d0 * acos(-1.0d0) - nu
else if (n > 1.0d-12) then
  nu = acos(max(-1.0d0, min(1.0d0, (nx*rx + ny*ry + nz*rz) / (n * rmag))))
  if (rz < 0.0d0) nu = 2.0d0 * acos(-1.0d0) - nu
else
  if (hz < 0.0d0) then
    nu = atan2(-ry, rx)
  else
    nu = atan2(ry, rx)
  end if
  if (nu < 0.0d0) nu = nu + 2.0d0 * acos(-1.0d0)
end if
rx_out = rx
ry_out = ry
rz_out = rz
vx_out = vx
vy_out = vy
vz_out = vz
ang_scale = 1.0d0
if (mode(1:1) == 'e') then
  if (ang(1:1) == 'd') then
    ang_scale = 0.017453292519943295d0
  else
    ang_scale = 1.0d0
  end if
  a = a_km * 1000.0d0
  e = {{e}}
  i = i_deg * ang_scale
  raan = raan_deg * ang_scale
  argp = argp_deg * ang_scale
  nu = nu_deg * ang_scale
  p = a * (1.0d0 - e*e)
  if (e > 1.0d0) p = abs(a) * (e*e - 1.0d0)
  cnu = cos(nu)
  snu = sin(nu)
  denom = 1.0d0 + e*cnu
  if (abs(e - 1.0d0) < 1.0d-12 .or. p <= 0.0d0) then
    physical = 0
  else if (e >= 1.0d0 .and. denom <= 1.0d-12) then
    physical = 0
  else
    physical = 1
  end if
  if (physical == 1) then
    r_pf = p / denom
    x_pf = r_pf * cnu
    y_pf = r_pf * snu
    speed = sqrt(mu / p)
    vx_pf = -speed * snu
    vy_pf = speed * (e + cnu)
    cO = cos(raan)
    sO = sin(raan)
    ci = cos(i)
    si = sin(i)
    cw = cos(argp)
    sw = sin(argp)
    rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf
    ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf
    rz_out = sw*si*x_pf + cw*si*y_pf
    vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf
    vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf
    vz_out = sw*si*vx_pf + cw*si*vy_pf
    energy = -mu / (2.0d0 * a)
    h = sqrt(mu * p)
  else
    rx_out = 0.0d0
    rx_out = rx_out / rx_out
    ry_out = rx_out
    rz_out = rx_out
    vx_out = rx_out
    vy_out = rx_out
    vz_out = rx_out
  end if
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
  % equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
  if hz < 0, argp = atan2(-evec(2), evec(1)); else, argp = atan2(evec(2), evec(1)); end
  if argp < 0, argp = argp + 2*pi; end
else
  argp = 0;
end
if e > 1e-12
  nu = acos(max(-1, min(1, dot(evec,r)/(e*rmag))));
  if dot(r,v) < 0, nu = 2*pi - nu; end
elseif n > 1e-12
  nu = acos(max(-1, min(1, dot(nvec,r)/(n*rmag))));
  if r(3) < 0, nu = 2*pi - nu; end
else
  if hz < 0, nu = atan2(-r(2), r(1)); else, nu = atan2(r(2), r(1)); end
  if nu < 0, nu = nu + 2*pi; end
end
rx_out = rx; ry_out = ry; rz_out = rz;
vx_out = vx; vy_out = vy; vz_out = vz;
ang_scale = 1;
p = NaN; cnu = NaN; snu = NaN; denom = NaN; physical = NaN;
r_pf = NaN; x_pf = NaN; y_pf = NaN; speed = NaN;
vx_pf = NaN; vy_pf = NaN;
cO = NaN; sO = NaN; ci = NaN; si = NaN; cw = NaN; sw = NaN;
if mode(1) == 'e'
  if ang(1) == 'd', ang_scale = pi/180; else, ang_scale = 1; end
  a = a_km * 1000;
  e = {{e}};
  i = i_deg * ang_scale;
  raan = raan_deg * ang_scale;
  argp = argp_deg * ang_scale;
  nu = nu_deg * ang_scale;
  if e < 1, p = a * (1 - e^2); else, p = abs(a) * (e^2 - 1); end
  cnu = cos(nu); snu = sin(nu);
  denom = 1 + e*cnu;
  physical = abs(e - 1) >= 1e-12 && p > 0 && (e < 1 || denom > 1e-12);
  if physical
    r_pf = p / denom;
    x_pf = r_pf * cnu; y_pf = r_pf * snu;
    speed = sqrt(mu / p);
    vx_pf = -speed * snu; vy_pf = speed * (e + cnu);
    cO = cos(raan); sO = sin(raan);
    ci = cos(i); si = sin(i);
    cw = cos(argp); sw = sin(argp);
    rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
    ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
    rz_out = sw*si*x_pf + cw*si*y_pf;
    vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
    vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
    vz_out = sw*si*vx_pf + cw*si*vy_pf;
    energy = -mu / (2 * a);
    h = sqrt(mu * p);
  else
    rx_out = NaN; ry_out = NaN; rz_out = NaN;
    vx_out = NaN; vy_out = NaN; vz_out = NaN;
  end
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
    a_raw = energy == 0 ? Inf : -mu/(2*energy)
    a = isfinite(a_raw) ? a_raw : Inf
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
        # equatorial: retrograde (h_z < 0) reflects the perifocal y-axis
        periapsis_y = hvec[3] < 0 ? -evec[2] : evec[2]
        argp = atan(periapsis_y, evec[1])
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
    elseif n > 1e-12
        nu = acos(clamp(dot(nvec, r)/(n*rmag), -1, 1))
        if r[3] < 0
            nu = 2π - nu
        end
    else
        nu = atan(hvec[3] < 0 ? -r[2] : r[2], r[1])
        if nu < 0
            nu += 2π
        end
    end
    return (; a, e, i, raan, argp, nu, h, energy)
end

function elements_to_rv(a, e, i, raan, argp, nu, mu)
    if abs(e - 1) < 1e-12
        return nothing
    end
    p = e < 1 ? a * (1 - e^2) : abs(a) * (e^2 - 1)
    if !(p > 0)
        return nothing
    end
    cnu, snu = cos(nu), sin(nu)
    denom = 1 + e*cnu
    if e >= 1 ? !(denom > 1e-12) : abs(denom) <= 1e-12
        return nothing
    end
    r_pf = p / denom
    x_pf, y_pf = r_pf * cnu, r_pf * snu
    speed = sqrt(mu / p)
    vx_pf, vy_pf = -speed * snu, speed * (e + cnu)
    cO, sO = cos(raan), sin(raan)
    ci, si = cos(i), sin(i)
    cw, sw = cos(argp), sin(argp)
    return (
        (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf,
        (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf,
        sw*si*x_pf + cw*si*y_pf,
        (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf,
        (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf,
        sw*si*vx_pf + cw*si*vy_pf,
    )
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
energy = elements.energy
rx_out, ry_out, rz_out = rx, ry, rz
vx_out, vy_out, vz_out = vx, vy, vz
ang_scale = 1.0
state = nothing
p_conic = NaN
el2rv = @isdefined(mode) && mode == "el2rv"
if el2rv
    ang_scale = (ang isa AbstractString && startswith(string(ang), "d")) ? π/180 : 1.0
    a = a_km * 1000
    e = {{e}}
    i = i_deg * ang_scale
    raan = raan_deg * ang_scale
    argp = argp_deg * ang_scale
    nu = nu_deg * ang_scale
    state = elements_to_rv(a, e, i, raan, argp, nu, mu)
    if state === nothing
        rx_out = ry_out = rz_out = vx_out = vy_out = vz_out = NaN
    else
        rx_out, ry_out, rz_out, vx_out, vy_out, vz_out = state
        energy = -mu / (2 * a)
        p_conic = e < 1 ? a * (1 - e^2) : abs(a) * (e^2 - 1)
        h = sqrt(mu * p_conic)
    end
end`,

    latex: `% Classical elements from state
\\[
\\mathbf h=\\mathbf r\\times\\mathbf v,\\quad
\\mathbf e=\\frac{(v^2-\\mu/r)\\mathbf r-(\\mathbf r\\cdot\\mathbf v)\\mathbf v}{\\mu},\\quad
\\varepsilon=\\frac{v^2}{2}-\\frac{\\mu}{r},\\quad a=-\\frac{\\mu}{2\\varepsilon}
\\]`,
  },
}
