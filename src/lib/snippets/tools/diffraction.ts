import type { FormulaSnippet } from '../types'

/**
 * Diffraction-limited resolution: θ ≈ 1.22 λ/D; GSD ≈ θ · range.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches DiffractionTool + lib/physics/power.ts diffractionResolution.
 * Free vars: f (Hz, alias fHz), D, range_m (alias from range; avoid builtin name).
 */
const A =
  'Airy diffraction: θ ≈ 1.22 λ/D with λ = c/f; GSD ≈ θ·range_m. c = 299792458 m/s. SI.'

export const diffSnippets: FormulaSnippet = {
  formulaId: 'diffraction',
  assumptions: A,
  code: {
    python: `# Diffraction resolution / GSD: ${A}
c = 299792458  # m/s
lam = c / f
theta = 1.22 * lam / D
gsd = theta * range_m`,

    javascript: `// Diffraction resolution / GSD: ${A}
const c = 299792458 // m/s
const lam = c / f
const theta = (1.22 * lam) / D
const gsd = theta * range_m`,

    typescript: `// Diffraction resolution / GSD: ${A}
const c: number = 299792458 // m/s
const lam: number = c / f
const theta: number = (1.22 * lam) / D
const gsd: number = theta * range_m`,

    c: `/* Diffraction resolution / GSD: ${A} */
const double c = 299792458.0; /* m/s */
const double lam = c / f;
const double theta = 1.22 * lam / D;
const double gsd = theta * range_m;`,

    cpp: `// Diffraction resolution / GSD: ${A}
const double c = 299792458.0; // m/s
const double lam = c / f;
const double theta = 1.22 * lam / D;
const double gsd = theta * range_m;`,

    rust: `// Diffraction resolution / GSD: ${A}
let c = 299792458.0_f64; // m/s
let lam = c / f;
let theta = 1.22 * lam / D;
let gsd = theta * range_m;`,

    zig: `// Diffraction resolution / GSD: ${A}
const c: f64 = 299792458.0; // m/s
const lam = c / f;
const theta = 1.22 * lam / D;
const gsd = theta * range_m;`,

    fortran: `! Diffraction resolution / GSD: ${A}
c = 299792458.0d0
lam = c / f
theta = 1.22d0 * lam / D
gsd = theta * range_m`,

    matlab: `% Diffraction resolution / GSD: ${A}
c = 299792458; % m/s
lam = c / f;
theta = 1.22 * lam / D;
gsd = theta * range_m;`,

    julia: `# Diffraction resolution / GSD: ${A}
c = 299792458  # m/s
lam = c / f
theta = 1.22 * lam / D
gsd = theta * range_m`,

    latex: `% Diffraction resolution / GSD: pure SI
\\[
  \\lambda = c/f,\\quad
  \\theta \\approx 1.22\\,\\lambda/D,\\quad
  \\mathrm{GSD} \\approx \\theta\\,\\mathrm{range}
\\]`,
  },
}
