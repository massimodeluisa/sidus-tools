import type { FormulaSnippet } from '../types'

const A = "Spot radius R*theta; SI rad."

export const laserPointingJitterSnippets: FormulaSnippet = {
  formulaId: 'laser-pointing-jitter',
  assumptions: A,
  code: {
    python: "# Spot radius R*theta; SI rad.\nr_spot = R * theta",
    javascript: "// Spot radius R*theta; SI rad.\nconst r_spot = R * theta",
    typescript: "// Spot radius R*theta; SI rad.\nconst r_spot = R * theta",
    c: "/* Spot radius R*theta; SI rad. */\nconst double r_spot = R * theta;",
    cpp: "// Spot radius R*theta; SI rad.\nconst double r_spot = R * theta;",
    rust: "// Spot radius R*theta; SI rad.\nlet r_spot = R * theta;",
    zig: "// Spot radius R*theta; SI rad.\nconst r_spot = R * theta;",
    fortran: "! Spot radius R*theta; SI rad.\n  r_spot = R * theta",
    matlab: "% Spot radius R*theta; SI rad.\nr_spot = R * theta",
    julia: "# Spot radius R*theta; SI rad.\nr_spot = R * theta",
    latex: "% Spot radius R*theta; SI rad.\n\\[r_{\\mathrm{spot}}=R\\,\\theta\\]",
  },
}
