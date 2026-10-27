import type { FormulaSnippet } from '../types'

const A = 'Edelbaum low-thrust combined transfer; 0 <= di < 2 rad; SI.'

export const edelbaumDvSnippets: FormulaSnippet = {
  formulaId: 'edelbaum-dv',
  assumptions: A,
  code: {
    python: `# ${A}
import math
dv = math.sqrt(v1**2 + v2**2 - 2 * v1 * v2 * math.cos(math.pi * di / 2)) if 0.0 <= di < 2.0 else float("nan")`,
    javascript: `// ${A}
const dv = di >= 0 && di < 2 ? Math.sqrt(v1**2 + v2**2 - 2 * v1 * v2 * Math.cos(Math.PI * di / 2)) : Number.NaN`,
    typescript: `// ${A}
const dv = di >= 0 && di < 2 ? Math.sqrt(v1**2 + v2**2 - 2 * v1 * v2 * Math.cos(Math.PI * di / 2)) : Number.NaN`,
    c: `/* ${A} */
const double dv = (di >= 0.0 && di < 2.0)
  ? sqrt(pow(v1, 2) + pow(v2, 2) - 2 * v1 * v2 * cos(M_PI * di / 2))
  : NAN;`,
    cpp: `// ${A}
const double dv = (di >= 0.0 && di < 2.0)
  ? sqrt(pow(v1, 2) + pow(v2, 2) - 2 * v1 * v2 * cos(M_PI * di / 2))
  : NAN;`,
    rust: `// ${A}
let dv = if di >= 0.0 && di < 2.0 {
    ((v1).powi(2) + (v2).powi(2) - 2.0_f64 * v1 * v2 * (std::f64::consts::PI * di / 2.0_f64).cos()).sqrt()
} else {
    f64::NAN
};`,
    zig: `// ${A}
const dv = if (di >= 0.0 and di < 2.0)
    std.math.sqrt(std.math.pow(f64, v1, @as(f64, 2.0)) + std.math.pow(f64, v2, @as(f64, 2.0)) - @as(f64, 2.0) * v1 * v2 * std.math.cos(std.math.pi * di / @as(f64, 2.0)))
else
    std.math.nan(f64);`,
    fortran: `! ${A}
  if (di >= 0.0d0 .and. di < 2.0d0) then
    dv = sqrt(v1**2.0d0 + v2**2.0d0 - 2.0d0 * v1 * v2 * cos(3.141592653589793d0 * di / 2.0d0))
  else
    dv = (di - di) / (di - di)
  end if`,
    matlab: `% ${A}
if di >= 0 && di < 2
  dv = sqrt(v1^2 + v2^2 - 2 * v1 * v2 * cos(pi * di / 2));
else
  dv = NaN;
end`,
    julia: `# ${A}
dv = 0.0 <= di < 2.0 ? sqrt(v1^2 + v2^2 - 2 * v1 * v2 * cos(π * di / 2)) : NaN`,
    latex: `% ${A}
\\[\\Delta v=\\sqrt{v_1^2+v_2^2-2v_1v_2\\cos(\\pi\\Delta i/2)},\\quad 0\\le\\Delta i<2\\]`,
  },
}
