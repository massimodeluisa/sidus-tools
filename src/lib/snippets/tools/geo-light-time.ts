import type { FormulaSnippet } from '../types'

/**
 * GEO light-time: one-way RF / light travel time over GEO altitude.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches CommDelayGeoTool educational GEO one-way delay t = h_GEO / c.
 */
const A =
  'One-way light time to GEO altitude above surface; t = h/c; c = 299792458 m/s; h_GEO ≈ 35786000 m. SI.'

export const geoLtSnippets: FormulaSnippet = {
  formulaId: 'geo-light-time',
  assumptions: A,
  code: {
    python: `# GEO light-time: ${A}
c = 299792458  # m/s
h = 35786000  # m, GEO altitude above surface
t = h / c`,

    javascript: `// GEO light-time: ${A}
const c = 299792458 // m/s
const h = 35786000 // m, GEO altitude above surface
const t = h / c`,

    typescript: `// GEO light-time: ${A}
const c: number = 299792458 // m/s
const h: number = 35786000 // m, GEO altitude above surface
const t: number = h / c`,

    c: `/* GEO light-time: ${A} */
const double c = 299792458.0; /* m/s */
const double h = 35786000.0; /* m, GEO altitude above surface */
const double t = h / c;`,

    cpp: `// GEO light-time: ${A}
const double c = 299792458.0; // m/s
const double h = 35786000.0; // m, GEO altitude above surface
const double t = h / c;`,

    rust: `// GEO light-time: ${A}
let c = 299792458.0_f64; // m/s
let h = 35786000.0_f64; // m, GEO altitude above surface
let t = h / c;`,

    zig: `// GEO light-time: ${A}
const c: f64 = 299792458.0; // m/s
const h: f64 = 35786000.0; // m, GEO altitude above surface
const t = h / c;`,

    fortran: `! GEO light-time: ${A}
c = 299792458.0d0
h = 35786000.0d0
t = h / c`,

    matlab: `% GEO light-time: ${A}
c = 299792458; % m/s
h = 35786000; % m, GEO altitude above surface
t = h / c;`,

    julia: `# GEO light-time: ${A}
c = 299792458  # m/s
h = 35786000  # m, GEO altitude above surface
t = h / c`,

    latex: `% GEO light-time: pure SI
\\[
  t = \\frac{h_{\\mathrm{GEO}}}{c},\\quad
  c = 299\\,792\\,458\\,\\mathrm{m/s},\\quad
  h_{\\mathrm{GEO}} \\approx 35\\,786\\,\\mathrm{km}
\\]`,
  },
}
