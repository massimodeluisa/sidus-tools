import type { FormulaSnippet } from '../types'

const A = "Angle between body axis and sun; SI."

export const sunSensorConeSnippets: FormulaSnippet = {
  formulaId: 'sun-sensor-cone',
  assumptions: A,
  code: {
    python: "# Angle between body axis and sun; SI.\nimport math\nc = (bx*sx + by*sy + bz*sz) / (math.sqrt(bx*bx+by*by+bz*bz) * math.sqrt(sx*sx+sy*sy+sz*sz))\ntheta = math.acos(max(-1.0, min(1.0, c)))",
    javascript: "// Angle between body axis and sun; SI.\nconst c = (bx*sx + by*sy + bz*sz) / (Math.sqrt(bx*bx+by*by+bz*bz) * Math.sqrt(sx*sx+sy*sy+sz*sz))\nconst theta = Math.acos(Math.max(-1.0, Math.min(1.0, c)))",
    typescript: "// Angle between body axis and sun; SI.\nconst c = (bx*sx + by*sy + bz*sz) / (Math.sqrt(bx*bx+by*by+bz*bz) * Math.sqrt(sx*sx+sy*sy+sz*sz))\nconst theta = Math.acos(Math.max(-1.0, Math.min(1.0, c)))",
    c: "/* Angle between body axis and sun; SI. */\nconst double c = (bx*sx + by*sy + bz*sz) / (sqrt(bx*bx+by*by+bz*bz) * sqrt(sx*sx+sy*sy+sz*sz));\nconst double theta = acos(fmax(-1.0, fmin(1.0, c)));",
    cpp: "// Angle between body axis and sun; SI.\nconst double c = (bx*sx + by*sy + bz*sz) / (sqrt(bx*bx+by*by+bz*bz) * sqrt(sx*sx+sy*sy+sz*sz));\nconst double theta = acos(fmax(-1.0, fmin(1.0, c)));",
    rust: "// Angle between body axis and sun; SI.\nlet c = (bx*sx + by*sy + bz*sz) / ((bx*bx+by*by+bz*bz).sqrt() * (sx*sx+sy*sy+sz*sz).sqrt());\nlet theta = ((-1.0_f64).max((1.0_f64).min(c))).acos();",
    zig: "// Angle between body axis and sun; SI.\nconst c = (bx*sx + by*sy + bz*sz) / (std.math.sqrt(bx*bx+by*by+bz*bz) * std.math.sqrt(sx*sx+sy*sy+sz*sz));\nconst theta = std.math.acos(@max(-@as(f64, 1.0), @min(@as(f64, 1.0), c)));",
    fortran: "! Angle between body axis and sun; SI.\n  c = (bx*sx + by*sy + bz*sz) / (sqrt(bx*bx+by*by+bz*bz) * sqrt(sx*sx+sy*sy+sz*sz))\n  theta = acos(max(-1.0d0, min(1.0d0, c)))",
    matlab: "% Angle between body axis and sun; SI.\nc = (bx*sx + by*sy + bz*sz) / (sqrt(bx*bx+by*by+bz*bz) * sqrt(sx*sx+sy*sy+sz*sz))\ntheta = acos(max(-1.0, min(1.0, c)))",
    julia: "# Angle between body axis and sun; SI.\nc = (bx*sx + by*sy + bz*sz) / (sqrt(bx*bx+by*by+bz*bz) * sqrt(sx*sx+sy*sy+sz*sz))\ntheta = acos(max(-1.0, min(1.0, c)))",
    latex: "% Angle between body axis and sun; SI.\n\\[\\theta=\\arccos(\\hat n\\cdot\\hat s)\\]",
  },
}
