import type { FormulaSnippet } from '../types'

const A = "Constant-g free fall; SI."

export const freeFallTimeSnippets: FormulaSnippet = {
  formulaId: 'free-fall-time',
  assumptions: A,
  code: {
    python: "# Constant-g free fall; SI.\nimport math\nt = math.sqrt(2 * h / g)\nv = math.sqrt(2 * g * h)",
    javascript: "// Constant-g free fall; SI.\nconst t = Math.sqrt(2 * h / g)\nconst v = Math.sqrt(2 * g * h)",
    typescript: "// Constant-g free fall; SI.\nconst t = Math.sqrt(2 * h / g)\nconst v = Math.sqrt(2 * g * h)",
    c: "/* Constant-g free fall; SI. */\nconst double t = sqrt(2 * h / g);\nconst double v = sqrt(2 * g * h);",
    cpp: "// Constant-g free fall; SI.\nconst double t = sqrt(2 * h / g);\nconst double v = sqrt(2 * g * h);",
    rust: "// Constant-g free fall; SI.\nlet t = (2.0_f64 * h / g).sqrt();\nlet v = (2.0_f64 * g * h).sqrt();",
    zig: "// Constant-g free fall; SI.\nconst t = std.math.sqrt(@as(f64, 2.0) * h / g);\nconst v = std.math.sqrt(@as(f64, 2.0) * g * h);",
    fortran: "! Constant-g free fall; SI.\n  t = sqrt(2.0d0 * h / g)\n  v = sqrt(2.0d0 * g * h)",
    matlab: "% Constant-g free fall; SI.\nt = sqrt(2 * h / g)\nv = sqrt(2 * g * h)",
    julia: "# Constant-g free fall; SI.\nt = sqrt(2 * h / g)\nv = sqrt(2 * g * h)",
    latex: "% Constant-g free fall; SI.\n\\[t=\\sqrt{2h/g},\\quad v=\\sqrt{2gh}\\]",
  },
}
