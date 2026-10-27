import type { FormulaSnippet } from '../types'

const A =
  'Supplied-VTEC group delay with the GPS Klobuchar obliquity factor F = 1 + 16*(0.53 - E)^3, E in semicircles. Not the complete GPS broadcast Klobuchar correction. Elevation must be finite and in [0, pi/2]; TECU >= 0; f > 0.'

export const gnssIonosphereKlobucharSnippets: FormulaSnippet = {
  formulaId: 'gnss-ionosphere-klobuchar',
  assumptions: A,
  code: {
    python: `# ${A}
import math
d = float("nan")
if math.isfinite(elev) and math.isfinite(tecu) and math.isfinite(f) and 0 <= elev <= math.pi / 2 and tecu >= 0 and f > 0:
    e_sc = elev / math.pi
    obliq = 1 + 16 * (0.53 - e_sc) ** 3
    d = (40.3 * tecu * 1e16) / (f ** 2) * obliq`,
    javascript: `// ${A}
let d = Number.NaN
if (Number.isFinite(elev) && Number.isFinite(tecu) && Number.isFinite(f) && elev >= 0 && elev <= Math.PI / 2 && tecu >= 0 && f > 0) {
  const eSc = elev / Math.PI
  const obliq = 1 + 16 * (0.53 - eSc) ** 3
  d = (40.3 * tecu * 1e16) / (f ** 2) * obliq
}`,
    typescript: `// ${A}
let d = Number.NaN
if (Number.isFinite(elev) && Number.isFinite(tecu) && Number.isFinite(f) && elev >= 0 && elev <= Math.PI / 2 && tecu >= 0 && f > 0) {
  const eSc = elev / Math.PI
  const obliq = 1 + 16 * (0.53 - eSc) ** 3
  d = (40.3 * tecu * 1e16) / (f ** 2) * obliq
}`,
    c: `/* ${A} */
const double e_sc = elev / M_PI;
const double obliq = 1.0 + 16.0 * pow(0.53 - e_sc, 3.0);
double d = nan("");
if (isfinite(elev) && isfinite(tecu) && isfinite(f) && elev >= 0.0 && elev <= M_PI / 2.0 && tecu >= 0.0 && f > 0.0) {
  d = (40.3 * tecu * 1e16) / pow(f, 2.0) * obliq;
}`,
    cpp: `// ${A}
const double e_sc = elev / M_PI;
const double obliq = 1.0 + 16.0 * pow(0.53 - e_sc, 3.0);
double d = nan("");
if (isfinite(elev) && isfinite(tecu) && isfinite(f) && elev >= 0.0 && elev <= M_PI / 2.0 && tecu >= 0.0 && f > 0.0) {
  d = (40.3 * tecu * 1e16) / pow(f, 2.0) * obliq;
}`,
    rust: `// ${A}
let e_sc = elev / std::f64::consts::PI;
let obliq = 1.0_f64 + 16.0_f64 * (0.53_f64 - e_sc).powi(3);
let mut d = f64::NAN;
if elev.is_finite() && tecu.is_finite() && f.is_finite() && elev >= 0.0_f64 && elev <= std::f64::consts::PI / 2.0_f64 && tecu >= 0.0_f64 && f > 0.0_f64 {
    d = (40.3_f64 * tecu * 1e16_f64) / (f).powi(2) * obliq;
}`,
    zig: `// ${A}
const e_sc = elev / std.math.pi;
const obliq = @as(f64, 1.0) + @as(f64, 16.0) * std.math.pow(f64, @as(f64, 0.53) - e_sc, @as(f64, 3.0));
var d: f64 = std.math.nan(f64);
if (std.math.isFinite(elev) and std.math.isFinite(tecu) and std.math.isFinite(f) and elev >= 0.0 and elev <= std.math.pi / @as(f64, 2.0) and tecu >= 0.0 and f > 0.0) {
    d = (@as(f64, 40.3) * tecu * 1e16) / std.math.pow(f64, f, @as(f64, 2.0)) * obliq;
}`,
    fortran: `! ${A}
  e_sc = elev / 3.141592653589793d0
  obliq = 1.0d0 + 16.0d0 * (0.53d0 - e_sc) ** 3
  d = (elev - elev) / (elev - elev)
  if (elev == elev .and. tecu == tecu .and. f == f .and. elev >= 0.0d0 .and. elev <= 3.141592653589793d0 / 2.0d0 .and. tecu >= 0.0d0 .and. tecu < 1.0d300 .and. f > 0.0d0 .and. f < 1.0d300) then
    d = (40.3d0 * tecu * 1.0d16) / (f ** 2) * obliq
  end if`,
    matlab: `% ${A}
e_sc = elev / pi
obliq = 1 + 16 * (0.53 - e_sc) ^ 3
d = NaN
if isfinite(elev) && isfinite(tecu) && isfinite(f) && elev >= 0 && elev <= pi / 2 && tecu >= 0 && f > 0
  d = (40.3 * tecu * 1e16) / (f ^ 2) * obliq
end`,
    julia: `# ${A}
e_sc = elev / π
obliq = 1 + 16 * (0.53 - e_sc) ^ 3
d = NaN
if isfinite(elev) && isfinite(tecu) && isfinite(f) && elev >= 0 && elev <= π / 2 && tecu >= 0 && f > 0
    d = (40.3 * tecu * 1e16) / (f ^ 2) * obliq
end`,
    latex: `% ${A}
\\[d=\\frac{40.3\\,\\mathrm{TECU}\\times 10^{16}}{f^{2}}F,\\quad F=1+16(0.53-E)^{3},\\quad E\\in[0,1/2]\\]`,
  },
}
