import type { FormulaSnippet } from '../types'

const A =
  'Conic flight-path angle. Ellipse: any finite nu. Parabola: |nu| < pi. Hyperbola: |nu| inside acos(-1/e), excluding a 4-ulp neighborhood of each asymptote. Reject e < 0. SI rad.'

export const flightPathAngleSnippets: FormulaSnippet = {
  formulaId: 'flight-path-angle',
  assumptions: A,
  code: {
    python: `# ${A}
import math
phi = float("nan")
if math.isfinite(e) and e >= 0.0 and math.isfinite(nu):
    den = 1.0 + e * math.cos(nu)
    if e < 1.0:
        if abs(den) >= 1e-15:
            phi = math.atan2(e * math.sin(nu), den)
    else:
        limit = math.pi if e == 1.0 else math.acos(-1.0 / e)
        ulp = 2.0 ** (math.floor(math.log2(limit)) - 52)
        if limit - abs(nu) > 4.0 * ulp and den > 0.0:
            phi = math.atan2(e * math.sin(nu), den)`,
    javascript: `// ${A}
let phi = Number.NaN
if (Number.isFinite(e) && e >= 0 && Number.isFinite(nu)) {
  const den = 1 + e * Math.cos(nu)
  if (e < 1) {
    if (Math.abs(den) >= 1e-15) phi = Math.atan2(e * Math.sin(nu), den)
  } else {
    const limit = e === 1 ? Math.PI : Math.acos(-1 / e)
    const ulp = 2 ** (Math.floor(Math.log2(limit)) - 52)
    if (limit - Math.abs(nu) > 4 * ulp && den > 0) phi = Math.atan2(e * Math.sin(nu), den)
  }
}`,
    typescript: `// ${A}
let phi = Number.NaN
if (Number.isFinite(e) && e >= 0 && Number.isFinite(nu)) {
  const den = 1 + e * Math.cos(nu)
  if (e < 1) {
    if (Math.abs(den) >= 1e-15) phi = Math.atan2(e * Math.sin(nu), den)
  } else {
    const limit = e === 1 ? Math.PI : Math.acos(-1 / e)
    const ulp = 2 ** (Math.floor(Math.log2(limit)) - 52)
    if (limit - Math.abs(nu) > 4 * ulp && den > 0) phi = Math.atan2(e * Math.sin(nu), den)
  }
}`,
    c: `/* ${A} */
double phi = NAN;
if (isfinite(e) && e >= 0.0 && isfinite(nu)) {
  double den = 1.0 + e * cos(nu);
  if (e < 1.0) {
    if (fabs(den) >= 1e-15) phi = atan2(e * sin(nu), den);
  } else {
    double limit = (e == 1.0) ? M_PI : acos(-1.0 / e);
    double ulp = pow(2.0, floor(log2(limit)) - 52.0);
    if (limit - fabs(nu) > 4.0 * ulp && den > 0.0) phi = atan2(e * sin(nu), den);
  }
}`,
    cpp: `// ${A}
double phi = NAN;
if (std::isfinite(e) && e >= 0.0 && std::isfinite(nu)) {
  double den = 1.0 + e * std::cos(nu);
  if (e < 1.0) {
    if (std::fabs(den) >= 1e-15) phi = std::atan2(e * std::sin(nu), den);
  } else {
    double limit = (e == 1.0) ? M_PI : std::acos(-1.0 / e);
    double ulp = std::pow(2.0, std::floor(std::log2(limit)) - 52.0);
    if (limit - std::fabs(nu) > 4.0 * ulp && den > 0.0) phi = std::atan2(e * std::sin(nu), den);
  }
}`,
    rust: `// ${A}
let phi = if e.is_finite() && e >= 0.0 && nu.is_finite() {
    let den = 1.0_f64 + e * nu.cos();
    if e < 1.0 {
        if den.abs() >= 1e-15 { (e * nu.sin()).atan2(den) } else { f64::NAN }
    } else {
        let limit = if e == 1.0 { std::f64::consts::PI } else { (-1.0_f64 / e).acos() };
        let ulp = 2.0_f64.powf(limit.log2().floor() - 52.0);
        if limit - nu.abs() > 4.0 * ulp && den > 0.0 { (e * nu.sin()).atan2(den) } else { f64::NAN }
    }
} else {
    f64::NAN
};`,
    zig: `// ${A}
var phi: f64 = std.math.nan(f64);
if (std.math.isFinite(e) and e >= 0.0 and std.math.isFinite(nu)) {
    const den = @as(f64, 1.0) + e * std.math.cos(nu);
    if (e < 1.0) {
        if (@abs(den) >= 1e-15) phi = std.math.atan2(e * std.math.sin(nu), den);
    } else {
        const limit = if (e == 1.0) std.math.pi else std.math.acos(-1.0 / e);
        const ulp = std.math.pow(f64, 2.0, @floor(std.math.log2(limit)) - 52.0);
        if (limit - @abs(nu) > 4.0 * ulp and den > 0.0) phi = std.math.atan2(e * std.math.sin(nu), den);
    }
}`,
    fortran: `! ${A}
  phi = (nu - nu) / (nu - nu)
  if (e == e .and. nu == nu .and. e >= 0.0d0) then
    den = 1.0d0 + e * cos(nu)
    if (e < 1.0d0) then
      if (abs(den) >= 1.0d-15) phi = atan2(e * sin(nu), den)
    else
      if (e == 1.0d0) then
        limit = 3.141592653589793d0
      else
        limit = acos(-1.0d0 / e)
      end if
      ulp = 2.0d0 ** (floor(log(limit) / log(2.0d0)) - 52.0d0)
      if (limit - abs(nu) > 4.0d0 * ulp .and. den > 0.0d0) phi = atan2(e * sin(nu), den)
    end if
  end if`,
    matlab: `% ${A}
phi = NaN;
if isfinite(e) && e >= 0 && isfinite(nu)
  den = 1 + e * cos(nu);
  if e < 1
    if abs(den) >= 1e-15, phi = atan2(e * sin(nu), den); end
  else
    if e == 1, limit = pi; else, limit = acos(-1 / e); end
    ulp = 2 ^ (floor(log2(limit)) - 52);
    if limit - abs(nu) > 4 * ulp && den > 0, phi = atan2(e * sin(nu), den); end
  end
end`,
    julia: `# ${A}
phi = NaN
if isfinite(e) && e >= 0 && isfinite(nu)
    den = 1 + e * cos(nu)
    if e < 1
        if abs(den) >= 1e-15
            phi = atan(e * sin(nu), den)
        end
    else
        limit = e == 1 ? π : acos(-1 / e)
        ulp = 2.0 ^ (floor(log2(limit)) - 52)
        if limit - abs(nu) > 4 * ulp && den > 0
            phi = atan(e * sin(nu), den)
        end
    end
end`,
    latex: `% ${A}
\\[\\tan\\phi=\\frac{e\\sin\\nu}{1+e\\cos\\nu}\\]
\\[
0\\le e,\\quad
\\begin{cases}
|\\nu|<\\pi & e=1\\\\
|\\nu|<\\arccos(-1/e) & e>1
\\end{cases}
\\]`,
  },
}
