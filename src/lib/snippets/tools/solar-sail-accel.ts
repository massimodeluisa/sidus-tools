import type { FormulaSnippet } from '../types'

const A = 'Ideal reflector a = 2 η P A / (c m) for 0 < η ≤ 1. SI.'

export const solarSailAccelSnippets: FormulaSnippet = {
  formulaId: 'solar-sail-accel',
  assumptions: A,
  code: {
    python: `# ${A}
import math
c = 299792458.0
a = 2 * eta * flux * A / (c * m) if (math.isfinite(eta) and 0.0 < eta <= 1.0 and flux > 0.0 and A > 0.0 and m > 0.0) else float("nan")`,
    javascript: `// ${A}
const c = 299792458.0
const a = Number.isFinite(eta) && eta > 0 && eta <= 1 && flux > 0 && A > 0 && m > 0
  ? 2 * eta * flux * A / (c * m)
  : Number.NaN`,
    typescript: `// ${A}
const c = 299792458.0
const a = Number.isFinite(eta) && eta > 0 && eta <= 1 && flux > 0 && A > 0 && m > 0
  ? 2 * eta * flux * A / (c * m)
  : Number.NaN`,
    c: `/* ${A} */
const double c = 299792458.0;
const double a = (isfinite(eta) && eta > 0.0 && eta <= 1.0 && flux > 0.0 && A > 0.0 && m > 0.0)
  ? 2 * eta * flux * A / (c * m)
  : NAN;`,
    cpp: `// ${A}
const double c = 299792458.0;
const double a = (std::isfinite(eta) && eta > 0.0 && eta <= 1.0 && flux > 0.0 && A > 0.0 && m > 0.0)
  ? 2 * eta * flux * A / (c * m)
  : NAN;`,
    rust: `// ${A}
let c = 299792458.0_f64;
let a = if eta.is_finite() && eta > 0.0 && eta <= 1.0 && flux > 0.0 && A > 0.0 && m > 0.0 {
    2.0_f64 * eta * flux * A / (c * m)
} else {
    f64::NAN
};`,
    zig: `// ${A}
const c = @as(f64, 299792458.0);
const a = if (std.math.isFinite(eta) and eta > 0.0 and eta <= 1.0 and flux > 0.0 and A > 0.0 and m > 0.0)
    @as(f64, 2.0) * eta * flux * A / (c * m)
else
    std.math.nan(f64);`,
    fortran: `! ${A}
  c = 299792458.0d0
  if (eta == eta .and. eta > 0.0d0 .and. eta <= 1.0d0 .and. flux > 0.0d0 .and. A > 0.0d0 .and. m > 0.0d0) then
    a = 2.0d0 * eta * flux * A / (c * m)
  else
    a = 0.0d0
    a = a / a
  end if`,
    matlab: `% ${A}
c = 299792458.0;
if isfinite(eta) && eta > 0 && eta <= 1 && flux > 0 && A > 0 && m > 0
  a = 2 * eta * flux * A / (c * m);
else
  a = NaN;
end`,
    julia: `# ${A}
c = 299792458.0
a = isfinite(eta) && 0 < eta <= 1 && flux > 0 && A > 0 && m > 0 ? 2 * eta * flux * A / (c * m) : NaN`,
    latex: `% ${A}
\\[a=\\frac{2\\eta P A}{c m},\\quad 0<\\eta\\le 1\\]`,
  },
}
