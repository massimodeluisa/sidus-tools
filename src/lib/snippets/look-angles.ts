import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Topocentric SEZ from observer geodetic + satellite ECF; azimuth from north, elevation from local horizon. SI/km consistent with library.'

/**
 * JS/TS: satellite.js. Other langs: pure topocentric SEZ educational core
 * (WGS-84 ellipsoid → ECEF, ρ → SEZ, el/az).
 */
export const lookAnglesSnippets: FormulaSnippet = {
  formulaId: 'look-angles',
  assumptions: ASSUMPTIONS,
  deps: [
    {
      name: 'satellite.js',
      ecosystem: 'npm',
      url: 'https://www.npmjs.com/package/satellite.js',
      install: 'npm i satellite.js',
      note: 'TLE → ECI/ECF + topocentric look angles',
      langs: ['javascript', 'typescript'],
    },
    {
      name: 'satellite.js (GitHub)',
      ecosystem: 'github',
      url: 'https://github.com/shashwatak/satellite-js',
      langs: ['javascript', 'typescript'],
    },
  ],
  code: {
    javascript: `// Look angles via satellite.js: ${ASSUMPTIONS}
import {
  twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, degreesToRadians,
} from 'satellite.js'

const satrec = twoline2satrec(tle1, tle2)
const date = new Date()
const pv = propagate(satrec, date)
const gmst = gstime(date)
const satEcf = eciToEcf(pv.position, gmst) // km

// Observer: lat/lon degrees, height km
const observer = {
  longitude: degreesToRadians(lonDeg),
  latitude: degreesToRadians(latDeg),
  height: height_m / 1000,
}
const look = ecfToLookAngles(observer, satEcf)
// look.azimuth, look.elevation [rad]; look.rangeSat [km]
const azDeg = (look.azimuth * 180) / Math.PI
const elDeg = (look.elevation * 180) / Math.PI
const range_m = look.rangeSat * 1000`,

    typescript: `// Look angles via satellite.js: ${ASSUMPTIONS}
import {
  twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, degreesToRadians,
} from 'satellite.js'

const satrec = twoline2satrec(tle1, tle2)
const date = new Date()
const pv = propagate(satrec, date)
const gmst = gstime(date)
const satEcf = eciToEcf(pv.position, gmst) // km
const observer = {
  longitude: degreesToRadians(lonDeg),
  latitude: degreesToRadians(latDeg),
  height: height_m / 1000,
}
const look = ecfToLookAngles(observer, satEcf)
const azDeg = (look.azimuth * 180) / Math.PI
const elDeg = (look.elevation * 180) / Math.PI
const range_m = look.rangeSat * 1000`,

    python: `# Look angles (topocentric SEZ): ${ASSUMPTIONS}
import math

# Pure SEZ core: free vars sat_x, sat_y, sat_z (ECEF m), lat, lon [rad], h_m
# WGS-84 ellipsoid
f = 1 / 298.257223563
e2 = f * (2 - f)
R_eq = 6378137.0
N = R_eq / math.sqrt(1 - e2 * math.sin(lat) ** 2)
obs_x = (N + h_m) * math.cos(lat) * math.cos(lon)
obs_y = (N + h_m) * math.cos(lat) * math.sin(lon)
obs_z = (N * (1 - e2) + h_m) * math.sin(lat)
rho_x = sat_x - obs_x
rho_y = sat_y - obs_y
rho_z = sat_z - obs_z
sL, cL = math.sin(lat), math.cos(lat)
sO, cO = math.sin(lon), math.cos(lon)
# SEZ: south, east, zenith
south = sL * cO * rho_x + sL * sO * rho_y - cL * rho_z
east = -sO * rho_x + cO * rho_y
zenith = cL * cO * rho_x + cL * sO * rho_y + sL * rho_z
range_m = math.sqrt(south ** 2 + east ** 2 + zenith ** 2)
el = math.asin(zenith / range_m)
az = math.atan2(east, -south)  # from north, clockwise`,

    c: `/* Look angles (topocentric SEZ): pure SI educational */
/* free: sat_x,sat_y,sat_z [m ECEF], lat,lon [rad], h_m */
const double f = 1.0 / 298.257223563;
const double e2 = f * (2.0 - f);
const double R_eq = 6378137.0;
const double N = R_eq / sqrt(1.0 - e2 * sin(lat) * sin(lat));
const double obs_x = (N + h_m) * cos(lat) * cos(lon);
const double obs_y = (N + h_m) * cos(lat) * sin(lon);
const double obs_z = (N * (1.0 - e2) + h_m) * sin(lat);
const double rho_x = sat_x - obs_x;
const double rho_y = sat_y - obs_y;
const double rho_z = sat_z - obs_z;
const double sL = sin(lat);
const double cL = cos(lat);
const double sO = sin(lon);
const double cO = cos(lon);
const double south = sL * cO * rho_x + sL * sO * rho_y - cL * rho_z;
const double east = -sO * rho_x + cO * rho_y;
const double zenith = cL * cO * rho_x + cL * sO * rho_y + sL * rho_z;
const double range_m = sqrt(south * south + east * east + zenith * zenith);
const double el = asin(zenith / range_m);
const double az = atan2(east, -south);`,

    cpp: `// Look angles (topocentric SEZ): pure SI educational
// free: sat_x,sat_y,sat_z [m ECEF], lat,lon [rad], h_m
const double f = 1.0 / 298.257223563;
const double e2 = f * (2.0 - f);
const double R_eq = 6378137.0;
const double N = R_eq / std::sqrt(1.0 - e2 * std::sin(lat) * std::sin(lat));
const double obs_x = (N + h_m) * std::cos(lat) * std::cos(lon);
const double obs_y = (N + h_m) * std::cos(lat) * std::sin(lon);
const double obs_z = (N * (1.0 - e2) + h_m) * std::sin(lat);
const double rho_x = sat_x - obs_x;
const double rho_y = sat_y - obs_y;
const double rho_z = sat_z - obs_z;
const double sL = std::sin(lat);
const double cL = std::cos(lat);
const double sO = std::sin(lon);
const double cO = std::cos(lon);
const double south = sL * cO * rho_x + sL * sO * rho_y - cL * rho_z;
const double east = -sO * rho_x + cO * rho_y;
const double zenith = cL * cO * rho_x + cL * sO * rho_y + sL * rho_z;
const double range_m = std::sqrt(south * south + east * east + zenith * zenith);
const double el = std::asin(zenith / range_m);
const double az = std::atan2(east, -south);`,

    rust: `// Look angles (topocentric SEZ): pure SI educational
// free: sat_x,sat_y,sat_z [m ECEF], lat,lon [rad], h_m
let f = 1.0 / 298.257223563;
let e2 = f * (2.0 - f);
let r_eq = 6378137.0_f64;
let n = r_eq / (1.0 - e2 * lat.sin().powi(2)).sqrt();
let obs_x = (n + h_m) * lat.cos() * lon.cos();
let obs_y = (n + h_m) * lat.cos() * lon.sin();
let obs_z = (n * (1.0 - e2) + h_m) * lat.sin();
let rho_x = sat_x - obs_x;
let rho_y = sat_y - obs_y;
let rho_z = sat_z - obs_z;
let s_l = lat.sin();
let c_l = lat.cos();
let s_o = lon.sin();
let c_o = lon.cos();
let south = s_l * c_o * rho_x + s_l * s_o * rho_y - c_l * rho_z;
let east = -s_o * rho_x + c_o * rho_y;
let zenith = c_l * c_o * rho_x + c_l * s_o * rho_y + s_l * rho_z;
let range_m = south.hypot(east).hypot(zenith);
let el = (zenith / range_m).asin();
let az = east.atan2(-south);`,

    zig: `// Look angles (topocentric SEZ): pure SI educational
// free: sat_x,sat_y,sat_z [m ECEF], lat,lon [rad], h_m
const f: f64 = 1.0 / 298.257223563;
const e2 = f * (2.0 - f);
const R_eq: f64 = 6378137.0;
const N = R_eq / std.math.sqrt(1.0 - e2 * std.math.sin(lat) * std.math.sin(lat));
const obs_x = (N + h_m) * std.math.cos(lat) * std.math.cos(lon);
const obs_y = (N + h_m) * std.math.cos(lat) * std.math.sin(lon);
const obs_z = (N * (1.0 - e2) + h_m) * std.math.sin(lat);
const rho_x = sat_x - obs_x;
const rho_y = sat_y - obs_y;
const rho_z = sat_z - obs_z;
const sL = std.math.sin(lat);
const cL = std.math.cos(lat);
const sO = std.math.sin(lon);
const cO = std.math.cos(lon);
const south = sL * cO * rho_x + sL * sO * rho_y - cL * rho_z;
const east = -sO * rho_x + cO * rho_y;
const zenith = cL * cO * rho_x + cL * sO * rho_y + sL * rho_z;
const range_m = std.math.sqrt(south * south + east * east + zenith * zenith);
const el = std.math.asin(zenith / range_m);
const az = std.math.atan2(east, -south);`,

    fortran: `! Look angles (topocentric SEZ): pure SI educational
! free: sat_x,sat_y,sat_z [m ECEF], lat,lon [rad], h_m
f = 1.0d0 / 298.257223563d0
e2 = f * (2.0d0 - f)
R_eq = 6378137.0d0
N = R_eq / sqrt(1.0d0 - e2 * sin(lat)**2)
obs_x = (N + h_m) * cos(lat) * cos(lon)
obs_y = (N + h_m) * cos(lat) * sin(lon)
obs_z = (N * (1.0d0 - e2) + h_m) * sin(lat)
rho_x = sat_x - obs_x
rho_y = sat_y - obs_y
rho_z = sat_z - obs_z
sL = sin(lat)
cL = cos(lat)
sO = sin(lon)
cO = cos(lon)
south = sL * cO * rho_x + sL * sO * rho_y - cL * rho_z
east = -sO * rho_x + cO * rho_y
zenith = cL * cO * rho_x + cL * sO * rho_y + sL * rho_z
range_m = sqrt(south**2 + east**2 + zenith**2)
el = asin(zenith / range_m)
az = atan2(east, -south)`,

    matlab: `% Look angles (topocentric SEZ): pure SI educational
% free: sat_x,sat_y,sat_z [m ECEF], lat,lon [rad], h_m
f = 1/298.257223563; e2 = f*(2-f); R_eq = 6378137;
N = R_eq / sqrt(1 - e2*sin(lat)^2);
obs_x = (N + h_m) * cos(lat) * cos(lon);
obs_y = (N + h_m) * cos(lat) * sin(lon);
obs_z = (N*(1-e2) + h_m) * sin(lat);
rho_x = sat_x - obs_x; rho_y = sat_y - obs_y; rho_z = sat_z - obs_z;
south = sin(lat)*cos(lon)*rho_x + sin(lat)*sin(lon)*rho_y - cos(lat)*rho_z;
east  = -sin(lon)*rho_x + cos(lon)*rho_y;
zenith = cos(lat)*cos(lon)*rho_x + cos(lat)*sin(lon)*rho_y + sin(lat)*rho_z;
range_m = sqrt(south^2 + east^2 + zenith^2);
el = asin(zenith / range_m);
az = atan2(east, -south);`,

    julia: `# Look angles (topocentric SEZ): pure SI educational
# free: sat_x,sat_y,sat_z [m ECEF], lat,lon [rad], h_m
f = 1 / 298.257223563
e2 = f * (2 - f)
R_eq = 6378137.0
N = R_eq / sqrt(1 - e2 * sin(lat)^2)
obs_x = (N + h_m) * cos(lat) * cos(lon)
obs_y = (N + h_m) * cos(lat) * sin(lon)
obs_z = (N * (1 - e2) + h_m) * sin(lat)
rho_x = sat_x - obs_x
rho_y = sat_y - obs_y
rho_z = sat_z - obs_z
south = sin(lat) * cos(lon) * rho_x + sin(lat) * sin(lon) * rho_y - cos(lat) * rho_z
east = -sin(lon) * rho_x + cos(lon) * rho_y
zenith = cos(lat) * cos(lon) * rho_x + cos(lat) * sin(lon) * rho_y + sin(lat) * rho_z
range_m = hypot(south, east, zenith)
el = asin(zenith / range_m)
az = atan(east, -south)`,

    latex: `% Topocentric elevation / azimuth (SEZ)
\\[
  \\boldsymbol\\rho = \\mathbf r_{\\mathrm{sat}}-\\mathbf r_{\\mathrm{obs}},\\quad
  \\sin el = \\hat\\rho\\cdot\\hat z_{\\mathrm{SEZ}},\\quad
  \\mathrm{az}=\\mathrm{atan2}(\\rho_E,-\\rho_S)
\\]`,
  },
}
