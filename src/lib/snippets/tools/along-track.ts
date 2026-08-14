import type { FormulaSnippet } from '../types'

/**
 * Along-track separation from mean-anomaly offset (circular coelliptic).
 * Δy ≈ a · ΔM  (ΔM in rad); inverse ΔM = Δy / a.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches AlongTrackTool + lib/physics/power.ts alongTrackFromDeltaM / deltaMFromAlongTrack.
 * Free vars: a, dM, dy (SI; dM rad).
 */
const A =
  'Circular coelliptic: Δy ≈ a·ΔM (ΔM rad); inverse ΔM = Δy/a. First-order. SI.'

export const atSnippets: FormulaSnippet = {
  formulaId: 'along-track',
  assumptions: A,
  code: {
    python: `# Along-track from ΔM: ${A}
a = R + h
dy_from_dM = a * dM
dM_from_dy = dy / a`,

    javascript: `// Along-track from ΔM: ${A}
const a = R + h
const dy_from_dM = a * dM
const dM_from_dy = dy / a`,

    typescript: `// Along-track from ΔM: ${A}
const a: number = R + h
const dy_from_dM: number = a * dM
const dM_from_dy: number = dy / a`,

    c: `/* Along-track from ΔM: ${A} */
const double a = R + h;
const double dy_from_dM = a * dM;
const double dM_from_dy = dy / a;`,

    cpp: `// Along-track from ΔM: ${A}
const double a = R + h;
const double dy_from_dM = a * dM;
const double dM_from_dy = dy / a;`,

    rust: `// Along-track from ΔM: ${A}
let a = R + h;
let dy_from_d_m = a * dM;
let d_m_from_dy = dy / a;`,

    zig: `// Along-track from ΔM: ${A}
const a = R + h;
const dy_from_dM = a * dM;
const dM_from_dy = dy / a;`,

    fortran: `! Along-track from ΔM: ${A}
a = R + h
dy_from_dM = a * dM
dM_from_dy = dy / a`,

    matlab: `% Along-track from ΔM: ${A}
a = R + h;
dy_from_dM = a * dM;
dM_from_dy = dy / a;`,

    julia: `# Along-track from ΔM: ${A}
a = R + h
dy_from_dM = a * dM
dM_from_dy = dy / a`,

    latex: `% Along-track from ΔM: pure SI
\\[
  \\Delta y \\approx a\\,\\Delta M,\\quad
  \\Delta M = \\Delta y / a
\\]`,
  },
}
