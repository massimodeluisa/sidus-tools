import type { FormulaSnippet } from '../types'

/**
 * Spherical distance: great-circle arc on sphere of radius R (law of cosines).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SphericalDistanceTool + greatCircleDistance / initialBearing (geometry.ts).
 * Free vars: lat1, lon1, lat2, lon2, R (angles in rad, SI).
 */
const A =
  'Spherical body; law of cosines central angle c; s = R c; initial bearing atan2. SI (lat/lon rad).'

export const sphericalDistanceSnippets: FormulaSnippet = {
  formulaId: 'spherical-distance',
  assumptions: A,
  code: {
    python: `# Spherical distance: ${A}
import math
c = math.acos(
    math.sin(lat1) * math.sin(lat2)
    + math.cos(lat1) * math.cos(lat2) * math.cos(lon2 - lon1)
)
s = R * c
y = math.sin(lon2 - lon1) * math.cos(lat2)
x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(lon2 - lon1)
bearing = math.atan2(y, x)`,

    javascript: `// Spherical distance: ${A}
const c = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1))
const s = R * c
const y = Math.sin(lon2 - lon1) * Math.cos(lat2)
const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
const bearing = Math.atan2(y, x)`,

    typescript: `// Spherical distance: ${A}
const c: number = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1))
const s: number = R * c
const y: number = Math.sin(lon2 - lon1) * Math.cos(lat2)
const x: number = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
const bearing: number = Math.atan2(y, x)`,

    c: `/* Spherical distance: ${A} */
const double c = acos(
    sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1));
const double s = R * c;
const double y = sin(lon2 - lon1) * cos(lat2);
const double x =
    cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lon2 - lon1);
const double bearing = atan2(y, x);`,

    cpp: `// Spherical distance: ${A}
const double c = std::acos(
    std::sin(lat1) * std::sin(lat2) +
    std::cos(lat1) * std::cos(lat2) * std::cos(lon2 - lon1));
const double s = R * c;
const double y = std::sin(lon2 - lon1) * std::cos(lat2);
const double x =
    std::cos(lat1) * std::sin(lat2) -
    std::sin(lat1) * std::cos(lat2) * std::cos(lon2 - lon1);
const double bearing = std::atan2(y, x);`,

    rust: `// Spherical distance: ${A}
let c = (lat1.sin() * lat2.sin()
    + lat1.cos() * lat2.cos() * (lon2 - lon1).cos())
    .acos();
let s = R * c;
let y = (lon2 - lon1).sin() * lat2.cos();
let x = lat1.cos() * lat2.sin()
    - lat1.sin() * lat2.cos() * (lon2 - lon1).cos();
let bearing = y.atan2(x);`,

    zig: `// Spherical distance: ${A}
const c = std.math.acos(
    std.math.sin(lat1) * std.math.sin(lat2)
        + std.math.cos(lat1) * std.math.cos(lat2) * std.math.cos(lon2 - lon1));
const s = R * c;
const y = std.math.sin(lon2 - lon1) * std.math.cos(lat2);
const x = std.math.cos(lat1) * std.math.sin(lat2)
    - std.math.sin(lat1) * std.math.cos(lat2) * std.math.cos(lon2 - lon1);
const bearing = std.math.atan2(y, x);`,

    fortran: `! Spherical distance: ${A}
c = acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1))
s = R * c
y = sin(lon2 - lon1) * cos(lat2)
x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lon2 - lon1)
bearing = atan2(y, x)`,

    matlab: `% Spherical distance: ${A}
c = acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1));
s = R * c;
y = sin(lon2 - lon1) * cos(lat2);
x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lon2 - lon1);
bearing = atan2(y, x);`,

    julia: `# Spherical distance: ${A}
c = acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1))
s = R * c
y = sin(lon2 - lon1) * cos(lat2)
x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lon2 - lon1)
bearing = atan(y, x)`,

    latex: `% Spherical distance: pure SI
\\[
  \\cos c = \\sin\\varphi_1\\sin\\varphi_2
    + \\cos\\varphi_1\\cos\\varphi_2\\cos\\Delta\\lambda,\\quad
  s = R\\,c
\\]
\\[
  \\mathrm{bearing} = \\mathrm{atan2}(y,x)
\\]`,
  },
}
