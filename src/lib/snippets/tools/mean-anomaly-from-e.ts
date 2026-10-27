import type { FormulaSnippet } from '../types'

const A = 'Elliptic only (0 <= e < 1): M = (1-e)*E + e*(E-sin E); series for |E| < 1e-2. SI rad.'

export const meanAnomalyFromESnippets: FormulaSnippet = {
  formulaId: 'mean-anomaly-from-e',
  assumptions: A,
  code: {
    python: `# ${A}
import math
x2 = E * E
e_minus_sin = (
    E * x2 * (1/6 - x2 * (1/120 - x2 * (1/5040 - x2 * (1/362880 - x2 * (1/39916800 - x2 / 6227020800)))))
    if abs(E) < 1e-2 else E - math.sin(E)
)
M = (1 - e) * E + e * e_minus_sin if 0.0 <= e < 1.0 else float("nan")`,
    javascript: `// ${A}
const x2 = E * E
const eMinusSin = Math.abs(E) < 1e-2
  ? E * x2 * (1/6 - x2 * (1/120 - x2 * (1/5040 - x2 * (1/362880 - x2 * (1/39916800 - x2 / 6227020800)))))
  : E - Math.sin(E)
const M = e >= 0 && e < 1 ? (1 - e) * E + e * eMinusSin : Number.NaN`,
    typescript: `// ${A}
const x2 = E * E
const eMinusSin = Math.abs(E) < 1e-2
  ? E * x2 * (1/6 - x2 * (1/120 - x2 * (1/5040 - x2 * (1/362880 - x2 * (1/39916800 - x2 / 6227020800)))))
  : E - Math.sin(E)
const M = e >= 0 && e < 1 ? (1 - e) * E + e * eMinusSin : Number.NaN`,
    c: `/* ${A} */
const double x2 = E * E;
const double e_minus_sin = fabs(E) < 1e-2
  ? E * x2 * (1.0/6.0 - x2 * (1.0/120.0 - x2 * (1.0/5040.0 - x2 * (1.0/362880.0 - x2 * (1.0/39916800.0 - x2 / 6227020800.0)))))
  : E - sin(E);
const double M = (e >= 0.0 && e < 1.0) ? (1.0 - e) * E + e * e_minus_sin : NAN;`,
    cpp: `// ${A}
const double x2 = E * E;
const double e_minus_sin = std::fabs(E) < 1e-2
  ? E * x2 * (1.0/6.0 - x2 * (1.0/120.0 - x2 * (1.0/5040.0 - x2 * (1.0/362880.0 - x2 * (1.0/39916800.0 - x2 / 6227020800.0)))))
  : E - std::sin(E);
const double M = (e >= 0.0 && e < 1.0) ? (1.0 - e) * E + e * e_minus_sin : std::nan("");`,
    rust: `// ${A}
let x2 = E * E;
let e_minus_sin = if E.abs() < 1e-2 {
    E * x2 * (1.0/6.0 - x2 * (1.0/120.0 - x2 * (1.0/5040.0 - x2 * (1.0/362880.0 - x2 * (1.0/39916800.0 - x2 / 6227020800.0)))))
} else {
    E - (E).sin()
};
let M = if e >= 0.0 && e < 1.0 { (1.0 - e) * E + e * e_minus_sin } else { f64::NAN };`,
    zig: `// ${A}
const x2 = E * E;
const e_minus_sin = if (@abs(E) < 1e-2)
    E * x2 * (1.0/6.0 - x2 * (1.0/120.0 - x2 * (1.0/5040.0 - x2 * (1.0/362880.0 - x2 * (1.0/39916800.0 - x2 / 6227020800.0)))))
else
    E - std.math.sin(E);
const M = if ((e >= 0.0) and (e < 1.0)) (1.0 - e) * E + e * e_minus_sin else std.math.nan(f64);`,
    fortran: `! ${A}
  x2 = E * E
  if (abs(E) < 1.0d-2) then
    e_minus_sin = E * x2 * (1.0d0/6.0d0 - x2 * (1.0d0/120.0d0 - x2 * (1.0d0/5040.0d0 - x2 * (1.0d0/362880.0d0 - x2 * (1.0d0/39916800.0d0 - x2 / 6227020800.0d0)))))
  else
    e_minus_sin = E - sin(E)
  end if
  if (e >= 0.0d0 .and. e < 1.0d0) then
    M = (1.0d0 - e) * E + e * e_minus_sin
  else
    M = 0.0d0
    M = M / M
  end if`,
    matlab: `% ${A}
x2 = E * E;
if abs(E) < 1e-2
  e_minus_sin = E * x2 * (1/6 - x2 * (1/120 - x2 * (1/5040 - x2 * (1/362880 - x2 * (1/39916800 - x2 / 6227020800)))));
else
  e_minus_sin = E - sin(E);
end
if e >= 0 && e < 1
  M = (1 - e) * E + e * e_minus_sin;
else
  M = NaN;
end`,
    julia: `# ${A}
x2 = E * E
e_minus_sin = abs(E) < 1e-2 ? E * x2 * (1/6 - x2 * (1/120 - x2 * (1/5040 - x2 * (1/362880 - x2 * (1/39916800 - x2 / 6227020800))))) : E - sin(E)
M = 0.0 <= e < 1.0 ? (1 - e) * E + e * e_minus_sin : NaN`,
    latex: `% ${A}
\\[M=(1-e)E+e(E-\\sin E),\\quad 0 \\le e < 1\\]`,
  },
}
