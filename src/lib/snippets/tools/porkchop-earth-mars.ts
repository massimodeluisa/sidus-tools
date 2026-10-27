import type { FormulaSnippet } from '../types'

const A = "Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates."

export const porkchopEarthMarsSnippets: FormulaSnippet = {
  formulaId: 'porkchop-earth-mars',
  assumptions: A,
  code: {
    python:
      "# Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nimport math\nnE = math.sqrt(mu / aE**3)\nLE = LE0 + nE * (tDep - t0)\nvEx = -nE * aE * math.sin(LE)\nvEy = nE * aE * math.cos(LE)\nc3 = (v1x - vEx)**2 + (v1y - vEy)**2 + v1z**2",
    javascript:
      "// Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nconst nE = Math.sqrt(mu / aE**3)\nconst LE = LE0 + nE * (tDep - t0)\nconst vEx = -nE * aE * Math.sin(LE)\nconst vEy = nE * aE * Math.cos(LE)\nconst c3 = (v1x - vEx)**2 + (v1y - vEy)**2 + v1z**2",
    typescript:
      "// Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nconst nE = Math.sqrt(mu / aE**3)\nconst LE = LE0 + nE * (tDep - t0)\nconst vEx = -nE * aE * Math.sin(LE)\nconst vEy = nE * aE * Math.cos(LE)\nconst c3 = (v1x - vEx)**2 + (v1y - vEy)**2 + v1z**2",
    c: "/* Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates. */\nconst double nE = sqrt(mu / pow(aE, 3));\nconst double LE = LE0 + nE * (tDep - t0);\nconst double vEx = -nE * aE * sin(LE);\nconst double vEy = nE * aE * cos(LE);\nconst double c3 = (v1x - vEx) * (v1x - vEx) + (v1y - vEy) * (v1y - vEy) + v1z * v1z;",
    cpp: "// Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nconst double nE = sqrt(mu / pow(aE, 3));\nconst double LE = LE0 + nE * (tDep - t0);\nconst double vEx = -nE * aE * sin(LE);\nconst double vEy = nE * aE * cos(LE);\nconst double c3 = (v1x - vEx) * (v1x - vEx) + (v1y - vEy) * (v1y - vEy) + v1z * v1z;",
    rust: "// Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nlet nE = (mu / aE.powi(3)).sqrt();\nlet LE = LE0 + nE * (tDep - t0);\nlet vEx = -nE * aE * LE.sin();\nlet vEy = nE * aE * LE.cos();\nlet c3 = (v1x - vEx).powi(2) + (v1y - vEy).powi(2) + v1z.powi(2);",
    zig: "// Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nconst nE = @sqrt(mu / std.math.pow(f64, aE, @as(f64, 3.0)));\nconst LE = LE0 + nE * (tDep - t0);\nconst vEx = -nE * aE * @sin(LE);\nconst vEy = nE * aE * @cos(LE);\nconst c3 = (v1x - vEx) * (v1x - vEx) + (v1y - vEy) * (v1y - vEy) + v1z * v1z;",
    fortran:
      "! Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\n  nE = sqrt(mu / aE**3.0d0)\n  LE = LE0 + nE * (tDep - t0)\n  vEx = -nE * aE * sin(LE)\n  vEy = nE * aE * cos(LE)\n  c3 = (v1x - vEx)**2.0d0 + (v1y - vEy)**2.0d0 + v1z**2.0d0",
    matlab:
      "% Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nnE = sqrt(mu / aE^3)\nLE = LE0 + nE * (tDep - t0)\nvEx = -nE * aE * sin(LE)\nvEy = nE * aE * cos(LE)\nc3 = (v1x - vEx)^2 + (v1y - vEy)^2 + v1z^2",
    julia:
      "# Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\nnE = sqrt(mu / aE^3)\nLE = LE0 + nE * (tDep - t0)\nvEx = -nE * aE * sin(LE)\nvEy = nE * aE * cos(LE)\nc3 = (v1x - vEx)^2 + (v1y - vEy)^2 + v1z^2",
    latex:
      "% Circular heliocentric Lambert cell; C3 = |v1-vE|^2 from a supplied v1; SI. Does not loop dates.\n\\[C_3=\\|\\mathbf{v}_1-\\mathbf{v}_E\\|^2\\]",
  },
}
