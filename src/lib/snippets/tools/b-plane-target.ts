import type { FormulaSnippet } from '../types'

const A = "b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI."

export const bPlaneTargetSnippets: FormulaSnippet = {
  formulaId: 'b-plane-target',
  assumptions: A,
  code: {
    python:
      "# b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nimport math\nv = math.sqrt(vx*vx + vy*vy + vz*vz)\ne = 1.0 + rp * v*v / mu\nb = (mu / (v*v)) * math.sqrt(e*e - 1.0)\ndelta = 2.0 * math.asin(1.0 / e)\nbT = b * math.cos(theta)\nbR = b * math.sin(theta)",
    javascript:
      "// b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nconst v = Math.hypot(vx, vy, vz)\nconst e = 1.0 + rp * v*v / mu\nconst b = (mu / (v*v)) * Math.sqrt(e*e - 1.0)\nconst delta = 2.0 * Math.asin(1.0 / e)\nconst bT = b * Math.cos(theta)\nconst bR = b * Math.sin(theta)",
    typescript:
      "// b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nconst v = Math.hypot(vx, vy, vz)\nconst e = 1.0 + rp * v*v / mu\nconst b = (mu / (v*v)) * Math.sqrt(e*e - 1.0)\nconst delta = 2.0 * Math.asin(1.0 / e)\nconst bT = b * Math.cos(theta)\nconst bR = b * Math.sin(theta)",
    c: "/* b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI. */\nconst double v = sqrt(vx*vx + vy*vy + vz*vz);\nconst double e = 1.0 + rp * v*v / mu;\nconst double b = (mu / (v*v)) * sqrt(e*e - 1.0);\nconst double delta = 2.0 * asin(1.0 / e);\nconst double bT = b * cos(theta);\nconst double bR = b * sin(theta);",
    cpp: "// b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nconst double v = sqrt(vx*vx + vy*vy + vz*vz);\nconst double e = 1.0 + rp * v*v / mu;\nconst double b = (mu / (v*v)) * sqrt(e*e - 1.0);\nconst double delta = 2.0 * asin(1.0 / e);\nconst double bT = b * cos(theta);\nconst double bR = b * sin(theta);",
    rust: "// b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nlet v = (vx*vx + vy*vy + vz*vz).sqrt();\nlet e = 1.0_f64 + rp * v*v / mu;\nlet b = (mu / (v*v)) * (e*e - 1.0_f64).sqrt();\nlet delta = 2.0_f64 * (1.0_f64 / e).asin();\nlet bT = b * (theta).cos();\nlet bR = b * (theta).sin();",
    zig: "// b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nconst v = @sqrt(vx*vx + vy*vy + vz*vz);\nconst e = @as(f64, 1.0) + rp * v*v / mu;\nconst b = (mu / (v*v)) * @sqrt(e*e - @as(f64, 1.0));\nconst delta = @as(f64, 2.0) * std.math.asin(@as(f64, 1.0) / e);\nconst bT = b * @cos(theta);\nconst bR = b * @sin(theta);",
    fortran:
      "! b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\n  v = sqrt(vx*vx + vy*vy + vz*vz)\n  e = 1.0d0 + rp * v*v / mu\n  b = (mu / (v*v)) * sqrt(e*e - 1.0d0)\n  delta = 2.0d0 * asin(1.0d0 / e)\n  bT = b * cos(theta)\n  bR = b * sin(theta)",
    matlab:
      "% b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nv = sqrt(vx*vx + vy*vy + vz*vz)\ne = 1.0 + rp * v*v / mu\nb = (mu / (v*v)) * sqrt(e*e - 1.0)\ndelta = 2.0 * asin(1.0 / e)\nbT = b * cos(theta)\nbR = b * sin(theta)",
    julia:
      "# b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\nv = sqrt(vx*vx + vy*vy + vz*vz)\ne = 1.0 + rp * v*v / mu\nb = (mu / (v*v)) * sqrt(e*e - 1.0)\ndelta = 2.0 * asin(1.0 / e)\nbT = b * cos(theta)\nbR = b * sin(theta)",
    latex:
      "% b = (μ/v∞²) sqrt(e²-1); e=1+rp v∞²/μ; S,T,R triad; SI.\n\\[e=1+r_p v_\\infty^2/\\mu,\\quad b=(\\mu/v_\\infty^2)\\sqrt{e^2-1},\\quad \\mathbf{\\hat S}=\\mathbf{v}_\\infty/v_\\infty\\]",
  },
}
