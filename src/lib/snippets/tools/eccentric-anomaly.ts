import type { FormulaSnippet } from '../types'

/**
 * Kepler mean anomaly from eccentric anomaly: M = E − e sin E.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches EccentricAnomalyTool. Free vars: e, Ea [rad] (E aliased as Ea).
 */
const A = 'Kepler M(E); E = eccentric anomaly [rad]. Pure SI angle units (rad).'

export const eccAnomSnippets: FormulaSnippet = {
  formulaId: 'eccentric-anomaly',
  assumptions: A,
  code: {
    python: `# Eccentric anomaly (Kepler): ${A}
import math
M = Ea - e * math.sin(Ea)`,

    javascript: `// Eccentric anomaly (Kepler): ${A}
const M = Ea - e * Math.sin(Ea)`,

    typescript: `// Eccentric anomaly (Kepler): ${A}
const M: number = Ea - e * Math.sin(Ea)`,

    c: `/* Eccentric anomaly (Kepler): ${A} */
const double M = Ea - e * sin(Ea);`,

    cpp: `// Eccentric anomaly (Kepler): ${A}
const double M = Ea - e * std::sin(Ea);`,

    rust: `// Eccentric anomaly (Kepler): ${A}
let m = Ea - e * Ea.sin();`,

    zig: `// Eccentric anomaly (Kepler): ${A}
const M = Ea - e * std.math.sin(Ea);`,

    fortran: `! Eccentric anomaly (Kepler): ${A}
M = Ea - e * sin(Ea)`,

    matlab: `% Eccentric anomaly (Kepler): ${A}
M = Ea - e * sin(Ea);`,

    julia: `# Eccentric anomaly (Kepler): ${A}
M = Ea - e * sin(Ea)`,

    latex: `% Eccentric anomaly: pure SI
\\[
  M = E - e\\sin E
\\]`,
  },
}
