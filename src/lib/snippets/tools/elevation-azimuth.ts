import type { FormulaSnippet } from '../types'

/**
 * Elevation / azimuth: ENU topocentric from LOS vector components.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Educational core of ElevationAzimuthTool + topocentricElAz (geometry.ts):
 * free vars east, north, up are ENU components of (r_tgt − r_site).
 */
const A =
  'Spherical ECEF → ENU teaching form; no refraction. ρ = |d|; sin el = u/ρ; az = atan2(e,n). SI.'

export const elevationAzimuthSnippets: FormulaSnippet = {
  formulaId: 'elevation-azimuth',
  assumptions: A,
  code: {
    python: `# Elevation / azimuth: ${A}
import math
# r_site, r_tgt in ECEF; d = r_tgt - r_site
# east, north, up = ENU components of d
rho = math.hypot(east, north, up)
el = math.asin(up / rho)
az = math.atan2(east, north)`,

    javascript: `// Elevation / azimuth: ${A}
// r_site, r_tgt in ECEF; d = r_tgt - r_site
// east, north, up = ENU components of d
const rho = Math.hypot(east, north, up)
const el = Math.asin(up / rho)
const az = Math.atan2(east, north)`,

    typescript: `// Elevation / azimuth: ${A}
// r_site, r_tgt in ECEF; d = r_tgt - r_site
// east, north, up = ENU components of d
const rho: number = Math.hypot(east, north, up)
const el: number = Math.asin(up / rho)
const az: number = Math.atan2(east, north)`,

    c: `/* Elevation / azimuth: ${A} */
const double rho = sqrt(east * east + north * north + up * up);
const double el = asin(up / rho);
const double az = atan2(east, north);`,

    cpp: `// Elevation / azimuth: ${A}
const double rho = std::sqrt(east * east + north * north + up * up);
const double el = std::asin(up / rho);
const double az = std::atan2(east, north);`,

    rust: `// Elevation / azimuth: ${A}
let rho = east.hypot(north).hypot(up);
let el = (up / rho).asin();
let az = east.atan2(north);`,

    zig: `// Elevation / azimuth: ${A}
const rho = std.math.sqrt(east * east + north * north + up * up);
const el = std.math.asin(up / rho);
const az = std.math.atan2(east, north);`,

    fortran: `! Elevation / azimuth: ${A}
rho = sqrt(east * east + north * north + up * up)
el = asin(up / rho)
az = atan2(east, north)`,

    matlab: `% Elevation / azimuth: ${A}
rho = sqrt(east^2 + north^2 + up^2);
el = asin(up / rho);
az = atan2(east, north);`,

    julia: `# Elevation / azimuth: ${A}
rho = hypot(east, north, up)
el = asin(up / rho)
az = atan(east, north)`,

    latex: `% Elevation / azimuth: pure SI
\\[
  \\rho = |\\mathbf d|,\\quad
  \\sin el = u/\\rho,\\quad
  az = \\mathrm{atan2}(e,n)
\\]`,
  },
}
