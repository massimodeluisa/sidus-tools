import type { FormulaSnippet } from '../types'

/**
 * Solar array electrical power: P = S0 η A cosθ / r_AU².
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SolarArrayTool + lib/physics/power.ts solarArrayPower.
 * Free vars: A, eta, ang (deg from normal), r_au.
 */
const A =
  'P = S0 η A cosθ / r_AU²; θ = sun incidence from array normal (deg→rad); S0 = 1361 W/m². SI.'

export const solarArraySnippets: FormulaSnippet = {
  formulaId: 'solar-array',
  assumptions: A,
  code: {
    python: `# Solar array power: ${A}
import math
S0 = 1361  # W/m² at 1 AU
P = S0 * eta * A * math.cos(math.radians(ang)) / r_au**2`,

    javascript: `// Solar array power: ${A}
const S0 = 1361 // W/m² at 1 AU
const P = (S0 * eta * A * Math.cos((ang * Math.PI) / 180)) / (r_au ** 2)`,

    typescript: `// Solar array power: ${A}
const S0: number = 1361 // W/m² at 1 AU
const P: number = (S0 * eta * A * Math.cos((ang * Math.PI) / 180)) / (r_au ** 2)`,

    c: `/* Solar array power: ${A} */
const double S0 = 1361.0; /* W/m² at 1 AU */
const double P = (S0 * eta * A * cos(ang * M_PI / 180.0)) / (r_au * r_au);`,

    cpp: `// Solar array power: ${A}
const double S0 = 1361.0; // W/m² at 1 AU
const double P = (S0 * eta * A * std::cos(ang * M_PI / 180.0)) / (r_au * r_au);`,

    rust: `// Solar array power: ${A}
let s0 = 1361.0_f64; // W/m² at 1 AU
let p = (s0 * eta * A * (ang * std::f64::consts::PI / 180.0).cos()) / (r_au * r_au);`,

    zig: `// Solar array power: ${A}
const S0: f64 = 1361.0; // W/m² at 1 AU
const P = (S0 * eta * A * std.math.cos(ang * std.math.pi / 180.0)) / (r_au * r_au);`,

    fortran: `! Solar array power: ${A}
S0 = 1361.0d0
P = (S0 * eta * A * cos(ang * 3.141592653589793d0 / 180.0d0)) / (r_au * r_au)`,

    matlab: `% Solar array power: ${A}
S0 = 1361; % W/m^2 at 1 AU
P = (S0 * eta * A * cosd(ang)) / r_au^2;`,

    julia: `# Solar array power: ${A}
S0 = 1361  # W/m² at 1 AU
P = (S0 * eta * A * cosd(ang)) / r_au^2`,

    latex: `% Solar array power: pure SI
\\[
  S_{0} = 1361\\,\\mathrm{W/m^{2}},\\quad
  P = S_{0}\\,\\eta\\,A\\,\\cos\\theta\\,/\\,r_{\\mathrm{AU}}^{2}
\\]`,
  },
}
