import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'SGP4/SDP4 mean elements (NORAD TLE); TEME-like ECI; WGS-72/84 via satellite.js / sgp4 (MIT). Positions km → convert to m for SI apps.'

/**
 * Library-backed for Python / JS / TS (satellite.js, python-sgp4).
 * Systems languages (C, C++, Rust, Zig, Fortran) are intentionally omitted
 * for this tool: a Kepler mean-motion proxy is not full SGP4 and must not
 * ship under an SGP4 label.
 */
export const sgp4Snippets: FormulaSnippet = {
  formulaId: 'sgp4',
  assumptions: ASSUMPTIONS,
  deps: [
    {
      name: 'satellite.js',
      ecosystem: 'npm',
      url: 'https://www.npmjs.com/package/satellite.js',
      install: 'npm i satellite.js',
      note: 'SGP4/SDP4 TLE propagator (MIT). SIDUS uses the same library in src/lib/physics/sgp4.ts.',
      langs: ['javascript', 'typescript'],
    },
    {
      name: 'satellite.js (GitHub)',
      ecosystem: 'github',
      url: 'https://github.com/shashwatak/satellite-js',
      note: 'Upstream source & API docs',
      langs: ['javascript', 'typescript'],
    },
    {
      name: 'sgp4',
      ecosystem: 'pypi',
      url: 'https://pypi.org/project/sgp4/',
      install: 'pip install sgp4',
      note: 'Official Brandon Rhodes SGP4 Python port (if using Python TLE path).',
      langs: ['python'],
    },
  ],
  code: {
    javascript: `// SGP4 via satellite.js: ${ASSUMPTIONS}
import { twoline2satrec, propagate, gstime, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js'

const tle1 = '1 25544U 98067A   24100.50000000  .00016717  00000-0  10270-3 0  9995'
const tle2 = '2 25544  51.6416 120.4627 0006703 130.5360 325.0288 15.49507895600000'
const satrec = twoline2satrec(tle1, tle2)

const date = new Date() // or fixed UTC
const pv = propagate(satrec, date)
if (!pv?.position || !pv?.velocity || typeof pv.position === 'boolean') {
  throw new Error('propagation failed')
}
// library units: km, km/s → SI
const r_m = [pv.position.x * 1e3, pv.position.y * 1e3, pv.position.z * 1e3]
const v_ms = [pv.velocity.x * 1e3, pv.velocity.y * 1e3, pv.velocity.z * 1e3]

const gmst = gstime(date)
const geo = eciToGeodetic(
  { x: pv.position.x, y: pv.position.y, z: pv.position.z },
  gmst,
)
const latDeg = degreesLat(geo.latitude)
const lonDeg = degreesLong(geo.longitude)
const alt_m = geo.height * 1e3`,

    typescript: `// SGP4 via satellite.js: ${ASSUMPTIONS}
import {
  twoline2satrec, propagate, gstime, eciToGeodetic, degreesLat, degreesLong,
} from 'satellite.js'

const satrec = twoline2satrec(tleLine1, tleLine2)
const date = new Date()
const pv = propagate(satrec, date)
if (!pv?.position || !pv?.velocity || typeof pv.position === 'boolean') {
  throw new Error('propagation failed')
}
const r_m: [number, number, number] = [
  pv.position.x * 1e3, pv.position.y * 1e3, pv.position.z * 1e3,
]
const v_ms: [number, number, number] = [
  pv.velocity.x * 1e3, pv.velocity.y * 1e3, pv.velocity.z * 1e3,
]
const gmst = gstime(date)
const geo = eciToGeodetic(pv.position, gmst)
const latDeg = degreesLat(geo.latitude)
const lonDeg = degreesLong(geo.longitude)
const alt_m = geo.height * 1000`,

    python: `# SGP4 via python-sgp4: ${ASSUMPTIONS}
from sgp4.api import Satrec, jday
from datetime import datetime, timezone

tle1 = "1 25544U 98067A   24100.50000000  .00016717  00000-0  10270-3 0  9995"
tle2 = "2 25544  51.6416 120.4627 0006703 130.5360 325.0288 15.49507895600000"
sat = Satrec.twoline2rv(tle1, tle2)

t = datetime.now(timezone.utc)
jd, fr = jday(t.year, t.month, t.day, t.hour, t.minute, t.second + t.microsecond*1e-6)
err, r_km, v_kms = sat.sgp4(jd, fr)  # TEME km, km/s
if err != 0:
    raise RuntimeError(f"sgp4 error {err}")
r_m = [x * 1000 for x in r_km]
v_ms = [x * 1000 for x in v_kms]`,

    matlab: `% SGP4: use Aerospace Toolbox or validated SGP4 mex
% [r,v] = sgp4(satrec, tsince);  % km, km/s in TEME
% Convert: r_m = r*1e3;
% Educational Kepler proxy from TLE mean motion n_rev_day:
n = n_rev_day * 2*pi / 86400;  % rad/s
a = (mu / n^2)^(1/3);          % circular SMA [m]
v_c = sqrt(mu / a);
T = 2*pi / n;`,

    julia: `# Kepler mean-element proxy from TLE n: not full SGP4 series
# free: n_rev_day [rev/day], mu [m³/s²]
n = n_rev_day * 2π / 86400  # rad/s
a = cbrt(mu / n^2)          # circular SMA [m]
v_c = sqrt(mu / a)
T = 2π / n`,

    latex: `% SGP4 is an analytical mean-element propagator (not closed form).
% Inputs: TLE mean elements; output TEME position/velocity.
% Educational Kepler proxy from TLE mean motion $n$ [rev/day]:
\\[
  n_{\\mathrm{rad/s}} = n\\frac{2\\pi}{86400},\\quad
  a = \\Big(\\frac{\\mu}{n_{\\mathrm{rad/s}}^{2}}\\Big)^{1/3}
\\]`,
  },
}
