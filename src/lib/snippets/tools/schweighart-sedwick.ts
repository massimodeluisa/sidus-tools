import type { FormulaSnippet } from '../types'

const A = "s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI."

export const schweighartSedwickSnippets: FormulaSnippet = {
  formulaId: 'schweighart-sedwick',
  assumptions: A,
  code: {
    python:
      "# s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nimport math\nn = math.sqrt(mu / a**3)\ns = 0.375 * j2 * (Rb / a)**2 * (1.0 + 3.0 * math.cos(2.0 * inc))\nnBar = n * math.sqrt(1.0 + s)\nnZ = n * math.sqrt(1.0 + 3.0 * s)",
    javascript:
      "// s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nconst n = Math.sqrt(mu / a**3)\nconst s = 0.375 * j2 * (Rb / a)**2 * (1.0 + 3.0 * Math.cos(2.0 * inc))\nconst nBar = n * Math.sqrt(1.0 + s)\nconst nZ = n * Math.sqrt(1.0 + 3.0 * s)",
    typescript:
      "// s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nconst n = Math.sqrt(mu / a**3)\nconst s = 0.375 * j2 * (Rb / a)**2 * (1.0 + 3.0 * Math.cos(2.0 * inc))\nconst nBar = n * Math.sqrt(1.0 + s)\nconst nZ = n * Math.sqrt(1.0 + 3.0 * s)",
    c: "/* s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI. */\nconst double n = sqrt(mu / pow(a, 3));\nconst double s = 0.375 * j2 * pow(Rb / a, 2) * (1.0 + 3.0 * cos(2.0 * inc));\nconst double nBar = n * sqrt(1.0 + s);\nconst double nZ = n * sqrt(1.0 + 3.0 * s);",
    cpp: "// s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nconst double n = sqrt(mu / pow(a, 3));\nconst double s = 0.375 * j2 * pow(Rb / a, 2) * (1.0 + 3.0 * cos(2.0 * inc));\nconst double nBar = n * sqrt(1.0 + s);\nconst double nZ = n * sqrt(1.0 + 3.0 * s);",
    rust: "// s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nlet n = (mu / a.powi(3)).sqrt();\nlet s = 0.375_f64 * j2 * (Rb / a).powi(2) * (1.0_f64 + 3.0_f64 * (2.0_f64 * inc).cos());\nlet nBar = n * (1.0_f64 + s).sqrt();\nlet nZ = n * (1.0_f64 + 3.0_f64 * s).sqrt();",
    zig: "// s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nconst n = @sqrt(mu / (a * a * a));\nconst s = @as(f64, 0.375) * j2 * (Rb / a) * (Rb / a) * (@as(f64, 1.0) + @as(f64, 3.0) * @cos(@as(f64, 2.0) * inc));\nconst nBar = n * @sqrt(@as(f64, 1.0) + s);\nconst nZ = n * @sqrt(@as(f64, 1.0) + @as(f64, 3.0) * s);",
    fortran:
      "! s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\n  n = sqrt(mu / a**3.0d0)\n  s = 0.375d0 * j2 * (Rb / a)**2.0d0 * (1.0d0 + 3.0d0 * cos(2.0d0 * inc))\n  nBar = n * sqrt(1.0d0 + s)\n  nZ = n * sqrt(1.0d0 + 3.0d0 * s)",
    matlab:
      "% s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nn = sqrt(mu / a^3)\ns = 0.375 * j2 * (Rb / a)^2 * (1.0 + 3.0 * cos(2.0 * inc))\nnBar = n * sqrt(1.0 + s)\nnZ = n * sqrt(1.0 + 3.0 * s)",
    julia:
      "# s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\nn = sqrt(mu / a^3)\ns = 0.375 * j2 * (Rb / a)^2 * (1.0 + 3.0 * cos(2.0 * inc))\nnBar = n * sqrt(1.0 + s)\nnZ = n * sqrt(1.0 + 3.0 * s)",
    latex:
      "% s=(3/8) J2 (R/a)² (1+3 cos 2i); ωz=n√(1+3s); SS 2002; SI.\n\\[s=\\tfrac38 J_2(R/a)^2(1+3\\cos 2i),\\quad \\omega_z=n\\sqrt{1+3s}\\]",
  },
}
