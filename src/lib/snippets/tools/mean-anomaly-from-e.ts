import type { FormulaSnippet } from '../types'

const A = "Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians. A small-E series avoids cancellation near periapsis."

export const meanAnomalyFromESnippets: FormulaSnippet = {
  formulaId: 'mean-anomaly-from-e',
  assumptions: A,
  code: {
    python: "# Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nimport math\nif abs(E) <= 0.5:\n  M = (1 - e) * E + e * (E**3 * (1/6 - E**2/120 + E**4/5040 - E**6/362880 + E**8/39916800 - E**10/6227020800))\nelse:\n  M = E - e * math.sin(E)",
    javascript: "// Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nconst M = Math.abs(E) <= 0.5 ? (1 - e) * E + e * (E**3 * (1/6 - E**2/120 + E**4/5040 - E**6/362880 + E**8/39916800 - E**10/6227020800)) : E - e * Math.sin(E)",
    typescript: "// Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nconst M = Math.abs(E) <= 0.5 ? (1 - e) * E + e * (E**3 * (1/6 - E**2/120 + E**4/5040 - E**6/362880 + E**8/39916800 - E**10/6227020800)) : E - e * Math.sin(E)",
    c: "/* Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians. */\nconst double M = fabs(E) <= 0.5 ? (1.0 - e) * E + e * (E*E*E * (1.0/6.0 - E*E/120.0 + E*E*E*E/5040.0 - E*E*E*E*E*E/362880.0 + E*E*E*E*E*E*E*E/39916800.0 - E*E*E*E*E*E*E*E*E*E/6227020800.0)) : E - e * sin(E);",
    cpp: "// Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nconst double M = std::abs(E) <= 0.5 ? (1.0 - e) * E + e * (E*E*E * (1.0/6.0 - E*E/120.0 + E*E*E*E/5040.0 - E*E*E*E*E*E/362880.0 + E*E*E*E*E*E*E*E/39916800.0 - E*E*E*E*E*E*E*E*E*E/6227020800.0)) : E - e * std::sin(E);",
    rust: "// Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nlet M = if E.abs() <= 0.5 { (1.0 - e) * E + e * (E*E*E * (1.0/6.0 - E*E/120.0 + E*E*E*E/5040.0 - E*E*E*E*E*E/362880.0 + E*E*E*E*E*E*E*E/39916800.0 - E*E*E*E*E*E*E*E*E*E/6227020800.0)) } else { E - e * (E).sin() };",
    zig: "// Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nconst M = if (@abs(E) <= 0.5) (1.0 - e) * E + e * (E*E*E * (1.0/6.0 - E*E/120.0 + E*E*E*E/5040.0 - E*E*E*E*E*E/362880.0 + E*E*E*E*E*E*E*E/39916800.0 - E*E*E*E*E*E*E*E*E*E/6227020800.0)) else E - e * std.math.sin(E);",
    fortran: "! Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\n  if (abs(E) <= 0.5) then\n    M = (1 - e) * E + e * (E**3 * (1.0/6.0 - E**2/120.0 + E**4/5040.0 - E**6/362880.0 + E**8/39916800.0 - E**10/6227020800.0))\n  else\n    M = E - e * sin(E)\n  end if",
    matlab: "% Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nif abs(E) <= 0.5\n  M = (1 - e) * E + e * (E^3 * (1/6 - E^2/120 + E^4/5040 - E^6/362880 + E^8/39916800 - E^10/6227020800))\nelse\n  M = E - e * sin(E)\nend",
    julia: "# Elliptic Kepler orbit only: 0 <= e < 1; E and M in radians.\nM = abs(E) <= 0.5 ? (1 - e) * E + e * (E^3 * (1/6 - E^2/120 + E^4/5040 - E^6/362880 + E^8/39916800 - E^10/6227020800)) : E - e * sin(E)",
    latex: "\\[M=E-e\\sin E=(1-e)E+e(E-\\sin E),\\quad 0\\le e<1\\]\n\\[E-\\sin E=E^3/6-E^5/120+E^7/5040-E^9/362880+E^{11}/39916800-E^{13}/6227020800+O(E^{15})\\quad(|E|\\le0.5)\\]",
  },
}
