import type { FormulaSnippet } from '../types'

/**
 * Antenna beamwidth: approximate HPBW θ ≈ k λ/D with k in degrees.
 * λ = c/f; θ [rad] = (k π/180) λ/D.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches AntennaBeamwidthTool + lib/physics/ops.ts antennaBeamwidth.
 * Free vars: f, D, k.
 */
const A =
  'Approximate parabolic HPBW θ ≈ k λ/D with k in degrees (→ rad); λ = c/f. SI.'

export const beamwidthSnippets: FormulaSnippet = {
  formulaId: 'antenna-beamwidth',
  assumptions: A,
  code: {
    python: `# Antenna beamwidth: ${A}
import math
c = 299792458  # m/s
lam = c / f
theta = (k * math.pi / 180) * lam / D`,

    javascript: `// Antenna beamwidth: ${A}
const c = 299792458 // m/s
const lam = c / f
const theta = ((k * Math.PI) / 180) * (lam / D)`,

    typescript: `// Antenna beamwidth: ${A}
const c: number = 299792458 // m/s
const lam: number = c / f
const theta: number = ((k * Math.PI) / 180) * (lam / D)`,

    c: `/* Antenna beamwidth: ${A} */
const double c = 299792458.0; /* m/s */
const double lam = c / f;
const double theta = (k * M_PI / 180.0) * lam / D;`,

    cpp: `// Antenna beamwidth: ${A}
const double c = 299792458.0; // m/s
const double lam = c / f;
const double theta = (k * M_PI / 180.0) * lam / D;`,

    rust: `// Antenna beamwidth: ${A}
let c = 299792458.0_f64; // m/s
let lam = c / f;
let theta = (k * std::f64::consts::PI / 180.0) * lam / D;`,

    zig: `// Antenna beamwidth: ${A}
const c: f64 = 299792458.0; // m/s
const lam = c / f;
const theta = (k * std.math.pi / 180.0) * lam / D;`,

    fortran: `! Antenna beamwidth: ${A}
c = 299792458.0d0
lam = c / f
theta = (k * 3.141592653589793d0 / 180.0d0) * lam / D`,

    matlab: `% Antenna beamwidth: ${A}
c = 299792458; % m/s
lam = c / f;
theta = (k * pi / 180) * lam / D;`,

    julia: `# Antenna beamwidth: ${A}
c = 299792458  # m/s
lam = c / f
theta = (k * π / 180) * lam / D`,

    latex: `% Antenna beamwidth: pure SI
\\[
  \\lambda = c/f,\\quad
  \\theta \\approx k\\,\\lambda/D
  \\quad(k\\ \\mathrm{in\\ degrees\\to rad})
\\]`,
  },
}
