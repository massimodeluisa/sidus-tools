import type { FormulaSnippet } from '../types'

const A =
  'Saastamoinen 1972 microwave range correction. p and e are pascals (divided by 100 into the mbar equation); T is kelvin; elev is radians. d is metres to subtract from observed range. Finite inputs only: elevation in [5 deg, 90 deg], p > 0, T > 0, 0 <= e <= p. Not a modern mapping function.'

export const gnssTroposphereDelaySnippets: FormulaSnippet = {
  formulaId: 'gnss-troposphere-delay',
  assumptions: A,
  code: {
    python: `# ${A}
import math
d = float("nan")
elev_min = 5 * math.pi / 180
if (
    math.isfinite(elev) and math.isfinite(p) and math.isfinite(T) and math.isfinite(e)
    and elev_min <= elev <= math.pi / 2 and p > 0 and T > 0 and 0 <= e <= p
):
    z = math.pi / 2 - elev
    d = 0.002277 / math.cos(z) * (p / 100 + (1255 / T + 0.05) * (e / 100) - 1.16 * math.tan(z) ** 2)`,
    javascript: `// ${A}
let d = Number.NaN
const elevMin = 5 * Math.PI / 180
if (
  Number.isFinite(elev) && Number.isFinite(p) && Number.isFinite(T) && Number.isFinite(e) &&
  elev >= elevMin && elev <= Math.PI / 2 && p > 0 && T > 0 && e >= 0 && e <= p
) {
  const z = Math.PI / 2 - elev
  d = 0.002277 / Math.cos(z) * (p / 100 + (1255 / T + 0.05) * (e / 100) - 1.16 * Math.tan(z) ** 2)
}`,
    typescript: `// ${A}
let d = Number.NaN
const elevMin = 5 * Math.PI / 180
if (
  Number.isFinite(elev) && Number.isFinite(p) && Number.isFinite(T) && Number.isFinite(e) &&
  elev >= elevMin && elev <= Math.PI / 2 && p > 0 && T > 0 && e >= 0 && e <= p
) {
  const z = Math.PI / 2 - elev
  d = 0.002277 / Math.cos(z) * (p / 100 + (1255 / T + 0.05) * (e / 100) - 1.16 * Math.tan(z) ** 2)
}`,
    c: `/* ${A} */
const double elev_min = 5.0 * M_PI / 180.0;
double d = nan("");
if (isfinite(elev) && isfinite(p) && isfinite(T) && isfinite(e) && elev >= elev_min && elev <= M_PI / 2.0 && p > 0.0 && T > 0.0 && e >= 0.0 && e <= p) {
  const double z = M_PI / 2.0 - elev;
  d = 0.002277 / cos(z) * (p / 100.0 + (1255.0 / T + 0.05) * (e / 100.0) - 1.16 * pow(tan(z), 2.0));
}`,
    cpp: `// ${A}
const double elev_min = 5.0 * M_PI / 180.0;
double d = nan("");
if (isfinite(elev) && isfinite(p) && isfinite(T) && isfinite(e) && elev >= elev_min && elev <= M_PI / 2.0 && p > 0.0 && T > 0.0 && e >= 0.0 && e <= p) {
  const double z = M_PI / 2.0 - elev;
  d = 0.002277 / cos(z) * (p / 100.0 + (1255.0 / T + 0.05) * (e / 100.0) - 1.16 * pow(tan(z), 2.0));
}`,
    rust: `// ${A}
let elev_min = 5.0_f64 * std::f64::consts::PI / 180.0_f64;
let mut d = f64::NAN;
if elev.is_finite() && p.is_finite() && T.is_finite() && e.is_finite() && elev >= elev_min && elev <= std::f64::consts::PI / 2.0_f64 && p > 0.0_f64 && T > 0.0_f64 && e >= 0.0_f64 && e <= p {
    let z = std::f64::consts::PI / 2.0_f64 - elev;
    d = 0.002277_f64 / (z).cos() * (p / 100.0_f64 + (1255.0_f64 / T + 0.05_f64) * (e / 100.0_f64) - 1.16_f64 * (z).tan().powi(2));
}`,
    zig: `// ${A}
const elev_min = @as(f64, 5.0) * std.math.pi / @as(f64, 180.0);
var d: f64 = std.math.nan(f64);
if (std.math.isFinite(elev) and std.math.isFinite(p) and std.math.isFinite(T) and std.math.isFinite(e) and elev >= elev_min and elev <= std.math.pi / @as(f64, 2.0) and p > 0.0 and T > 0.0 and e >= 0.0 and e <= p) {
    const z = std.math.pi / @as(f64, 2.0) - elev;
    d = @as(f64, 0.002277) / std.math.cos(z) * (p / @as(f64, 100.0) + (@as(f64, 1255.0) / T + @as(f64, 0.05)) * (e / @as(f64, 100.0)) - @as(f64, 1.16) * std.math.pow(f64, std.math.tan(z), @as(f64, 2.0)));
}`,
    fortran: `! ${A}
  elev_min = 5.0d0 * 3.141592653589793d0 / 180.0d0
  d = (elev - elev) / (elev - elev)
  if (elev == elev .and. p == p .and. T == T .and. e == e .and. elev >= elev_min .and. elev <= 3.141592653589793d0 / 2.0d0 .and. p > 0.0d0 .and. p < 1.0d300 .and. T > 0.0d0 .and. T < 1.0d300 .and. e >= 0.0d0 .and. e <= p) then
    z = 3.141592653589793d0 / 2.0d0 - elev
    d = 0.002277d0 / cos(z) * (p / 100.0d0 + (1255.0d0 / T + 0.05d0) * (e / 100.0d0) - 1.16d0 * tan(z) ** 2)
  end if`,
    matlab: `% ${A}
elev_min = 5 * pi / 180
d = NaN
if isfinite(elev) && isfinite(p) && isfinite(T) && isfinite(e) && elev >= elev_min && elev <= pi / 2 && p > 0 && T > 0 && e >= 0 && e <= p
  z = pi / 2 - elev
  d = 0.002277 / cos(z) * (p / 100 + (1255 / T + 0.05) * (e / 100) - 1.16 * tan(z) ^ 2)
end`,
    julia: `# ${A}
elev_min = 5 * π / 180
d = NaN
if isfinite(elev) && isfinite(p) && isfinite(T) && isfinite(e) && elev >= elev_min && elev <= π / 2 && p > 0 && T > 0 && e >= 0 && e <= p
    z = π / 2 - elev
    d = 0.002277 / cos(z) * (p / 100 + (1255 / T + 0.05) * (e / 100) - 1.16 * tan(z) ^ 2)
end`,
    latex: `% ${A}
\\[d=\\frac{0.002277}{\\cos z}\\left[\\frac{p}{100}+\\left(\\frac{1255}{T}+0.05\\right)\\frac{e}{100}-1.16\\tan^{2}z\\right],\\quad z=\\pi/2-\\mathrm{elev}\\]`,
  },
}
