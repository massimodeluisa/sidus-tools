import type { FormulaSnippet } from '../types'

const A = "Real z0, zL reflection; SI ohms."

export const impedanceMatchingSnippets: FormulaSnippet = {
  formulaId: 'impedance-matching',
  assumptions: A,
  code: {
    python: "# Real z0, zL reflection; SI ohms.\nimport math\nG = abs((zL - z0) / (zL + z0))\nVSWR = (1 + G) / (1 - G)\nRL = -20 * math.log10(G)",
    javascript: "// Real z0, zL reflection; SI ohms.\nconst G = abs((zL - z0) / (zL + z0))\nconst VSWR = (1 + G) / (1 - G)\nconst RL = -20 * Math.log10(G)",
    typescript: "// Real z0, zL reflection; SI ohms.\nconst G = abs((zL - z0) / (zL + z0))\nconst VSWR = (1 + G) / (1 - G)\nconst RL = -20 * Math.log10(G)",
    c: "/* Real z0, zL reflection; SI ohms. */\nconst double G = fabs((zL - z0) / (zL + z0));\nconst double VSWR = (1 + G) / (1 - G);\nconst double RL = -20 * log10(G);",
    cpp: "// Real z0, zL reflection; SI ohms.\nconst double G = fabs((zL - z0) / (zL + z0));\nconst double VSWR = (1 + G) / (1 - G);\nconst double RL = -20 * log10(G);",
    rust: "// Real z0, zL reflection; SI ohms.\nlet G = ((zL - z0) / (zL + z0)).abs();\nlet VSWR = (1.0_f64 + G) / (1.0_f64 - G);\nlet RL = -20.0_f64 * (G).log10();",
    zig: "// Real z0, zL reflection; SI ohms.\nconst G = @abs((zL - z0) / (zL + z0));\nconst VSWR = (@as(f64, 1.0) + G) / (@as(f64, 1.0) - G);\nconst RL = -@as(f64, 20.0) * std.math.log10(G);",
    fortran: "! Real z0, zL reflection; SI ohms.\n  G = abs((zL - z0) / (zL + z0))\n  VSWR = (1.0d0 + G) / (1.0d0 - G)\n  RL = -20.0d0 * log10(G)",
    matlab: "% Real z0, zL reflection; SI ohms.\nG = abs((zL - z0) / (zL + z0))\nVSWR = (1 + G) / (1 - G)\nRL = -20 * log10(G)",
    julia: "# Real z0, zL reflection; SI ohms.\nG = abs((zL - z0) / (zL + z0))\nVSWR = (1 + G) / (1 - G)\nRL = -20 * log10(G)",
    latex: "% Real z0, zL reflection; SI ohms.\n\\[\\Gamma=\\frac{Z_L-Z_0}{Z_L+Z_0},\\quad\\mathrm{VSWR}=\\frac{1+|\\Gamma|}{1-|\\Gamma|}\\]",
  },
}
