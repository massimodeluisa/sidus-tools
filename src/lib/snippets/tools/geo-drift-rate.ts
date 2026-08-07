import type { FormulaSnippet } from '../types'

const A = "Longitude drift from a vs a_GEO; SI."

export const geoDriftRateSnippets: FormulaSnippet = {
  formulaId: 'geo-drift-rate',
  assumptions: A,
  code: {
    python: "# Longitude drift from a vs a_GEO; SI.\nrate = -1.5 * nGeo * (a - aGeo) / aGeo",
    javascript: "// Longitude drift from a vs a_GEO; SI.\nconst rate = -1.5 * nGeo * (a - aGeo) / aGeo",
    typescript: "// Longitude drift from a vs a_GEO; SI.\nconst rate = -1.5 * nGeo * (a - aGeo) / aGeo",
    c: "/* Longitude drift from a vs a_GEO; SI. */\nconst double rate = -1.5 * nGeo * (a - aGeo) / aGeo;",
    cpp: "// Longitude drift from a vs a_GEO; SI.\nconst double rate = -1.5 * nGeo * (a - aGeo) / aGeo;",
    rust: "// Longitude drift from a vs a_GEO; SI.\nlet rate = -1.5_f64 * nGeo * (a - aGeo) / aGeo;",
    zig: "// Longitude drift from a vs a_GEO; SI.\nconst rate = -@as(f64, 1.5) * nGeo * (a - aGeo) / aGeo;",
    fortran: "! Longitude drift from a vs a_GEO; SI.\n  rate = -1.5 * nGeo * (a - aGeo) / aGeo",
    matlab: "% Longitude drift from a vs a_GEO; SI.\nrate = -1.5 * nGeo * (a - aGeo) / aGeo",
    julia: "# Longitude drift from a vs a_GEO; SI.\nrate = -1.5 * nGeo * (a - aGeo) / aGeo",
    latex: "% Longitude drift from a vs a_GEO; SI.\n\\[\\dot\\lambda\\propto -(a-a_{\\mathrm{GEO}})/a_{\\mathrm{GEO}}\\]",
  },
}
