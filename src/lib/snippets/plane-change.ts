import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Pure impulsive plane change at fixed orbital speed; spherical two-body; Δi in radians in the formula; SI units.'

export const planeChangeSnippets: FormulaSnippet = {
  formulaId: 'plane-change',
  assumptions: ASSUMPTIONS,
  code: {
    c: `/* Plane change: ${ASSUMPTIONS} */
const double di = di_deg * M_PI / 180.0;
const double dv = 2.0 * v * sin(fabs(di) / 2.0);`,

    cpp: `// Plane change: ${ASSUMPTIONS}
const double di = di_deg * M_PI / 180.0;
const double dv = 2.0 * v * std::sin(std::fabs(di) / 2.0);`,

    rust: `// Plane change: ${ASSUMPTIONS}
let di = di_deg.to_radians();
let dv = 2.0 * v * (di.abs() / 2.0).sin();`,

    zig: `// Plane change: ${ASSUMPTIONS}
const di = di_deg * std.math.pi / 180.0;
const dv = 2.0 * v * std.math.sin(@abs(di) / 2.0);`,

    python: `# Plane change: ${ASSUMPTIONS}
import math
di = math.radians(di_deg)
dv = 2 * v * math.sin(abs(di) / 2)`,

    javascript: `// Plane change: ${ASSUMPTIONS}
const di = (diDeg * Math.PI) / 180
const dv = 2 * v * Math.sin(Math.abs(di) / 2)`,

    typescript: `// Plane change: ${ASSUMPTIONS}
const di: number = (diDeg * Math.PI) / 180
const dv: number = 2 * v * Math.sin(Math.abs(di) / 2)`,

    matlab: `% Plane change: ${ASSUMPTIONS}
di = di_deg * pi / 180;
dv = 2 * v * sin(abs(di) / 2);`,

    julia: `# Plane change: ${ASSUMPTIONS}
di = deg2rad(di_deg)
dv = 2 * v * sin(abs(di) / 2)`,

    fortran: `! Plane change: ${ASSUMPTIONS}
di = di_deg * acos(-1.0d0) / 180.0d0
dv = 2.0d0 * v * sin(abs(di) / 2.0d0)`,

    latex: `% Pure plane change
\\[
\\Delta v = 2 v \\sin\\!\\left(\\frac{|\\Delta i|}{2}\\right)
\\]`,
  },
}
