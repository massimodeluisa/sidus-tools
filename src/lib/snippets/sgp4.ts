import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'SGP4/SDP4 mean elements (NORAD TLE). Position and velocity are TEME, not a generic ECI. gstime uses the UTC date as UT1 (ΔUT1 is not applied). WGS-72/84 via satellite.js / sgp4 (MIT). Positions km, convert to m for SI apps.'

/**
 * Library-backed for Python / JS / TS (satellite.js, python-sgp4).
 * Systems languages (C, C++, Rust, Zig, Fortran) and the MATLAB / Julia / LaTeX
 * Kepler mean-motion proxies are omitted: a circular-orbit proxy is not SGP4
 * and must not inherit a TEME claim.
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

const satrec = twoline2satrec(tleLine1, tleLine2)

const date = new Date(at) // selected propagation time (UTC)
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
const date = new Date(at) // selected propagation time (UTC)
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
from datetime import datetime

sat = Satrec.twoline2rv(tleLine1, tleLine2)

t = datetime.fromisoformat(at.replace("Z", "+00:00"))
jd, fr = jday(t.year, t.month, t.day, t.hour, t.minute, t.second + t.microsecond*1e-6)
err, r_km, v_kms = sat.sgp4(jd, fr)  # TEME km, km/s
if err != 0:
    raise RuntimeError(f"sgp4 error {err}")
r_m = [x * 1000 for x in r_km]
v_ms = [x * 1000 for x in v_kms]`,
  },
}
