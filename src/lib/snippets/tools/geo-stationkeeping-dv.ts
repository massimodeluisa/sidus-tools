import type { FormulaSnippet } from '../types'

const A = "Yearly GEO SK sum; SI."

export const geoStationkeepingDvSnippets: FormulaSnippet = {
  formulaId: 'geo-stationkeeping-dv',
  assumptions: A,
  code: {
    python: "# Yearly GEO SK sum; SI.\ndv_year = ns + ew",
    javascript: "// Yearly GEO SK sum; SI.\nconst dv_year = ns + ew",
    typescript: "// Yearly GEO SK sum; SI.\nconst dv_year = ns + ew",
    c: "/* Yearly GEO SK sum; SI. */\nconst double dv_year = ns + ew;",
    cpp: "// Yearly GEO SK sum; SI.\nconst double dv_year = ns + ew;",
    rust: "// Yearly GEO SK sum; SI.\nlet dv_year = ns + ew;",
    zig: "// Yearly GEO SK sum; SI.\nconst dv_year = ns + ew;",
    fortran: "! Yearly GEO SK sum; SI.\n  dv_year = ns + ew",
    matlab: "% Yearly GEO SK sum; SI.\ndv_year = ns + ew",
    julia: "# Yearly GEO SK sum; SI.\ndv_year = ns + ew",
    latex: "% Yearly GEO SK sum; SI.\n\\[\\Delta v_{\\mathrm{year}}=\\Delta v_{NS}+\\Delta v_{EW}\\]",
  },
}
