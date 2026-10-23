import type { FormulaSnippet } from '../types'

/**
 * Eclipse duration vs β-angle (circular, cylindrical shadow).
 * a = R+h; T = 2π √(a³/μ);
 * x = √(1−(R/a)²) / cos β; f = 0 for x ≥ 1, otherwise acos(x)/π; t_ecl = f · T.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches EclipseBetaTool + lib/physics/power.ts eclipseWithBeta.
 * Free vars: h, betaRad, mu, R (SI; betaRad rad).
 */
const A =
  'Circular cylindrical shadow with betaRad in [-pi/2, pi/2]: x=√(1−(R/a)²)/cos β; f=0 when x≥1 (no eclipse), otherwise f=(1/π) acos(x); t_ecl=f T; a=R+h. SI.'

export const ebSnippets: FormulaSnippet = {
  formulaId: 'eclipse-beta',
  assumptions: A,
  code: {
    python: `# Eclipse vs β-angle: ${A}
import math
if not (-math.pi / 2 <= betaRad <= math.pi / 2):
    raise ValueError("betaRad must be within [-pi/2, pi/2]")
a = R + h
T = 2 * math.pi * math.sqrt(a**3 / mu)
arg = math.sqrt(1 - (R / a) ** 2) / math.cos(betaRad)
if arg >= 1.0:
    frac = 0.0
else:
    frac = math.acos(arg) / math.pi
t_ecl = frac * T`,

    javascript: `// Eclipse vs β-angle: ${A}
if (!(betaRad >= -Math.PI / 2 && betaRad <= Math.PI / 2)) {
  throw new RangeError("betaRad must be within [-pi/2, pi/2]")
}
const a = R + h
const T = 2 * Math.PI * Math.sqrt((a ** 3) / mu)
const arg = Math.sqrt(1 - (R / a) ** 2) / Math.cos(betaRad)
const frac = arg >= 1.0 ? 0 : Math.acos(arg) / Math.PI
const t_ecl = frac * T`,

    typescript: `// Eclipse vs β-angle: ${A}
if (!(betaRad >= -Math.PI / 2 && betaRad <= Math.PI / 2)) {
  throw new RangeError("betaRad must be within [-pi/2, pi/2]")
}
const a: number = R + h
const T: number = 2 * Math.PI * Math.sqrt((a ** 3) / mu)
const arg: number = Math.sqrt(1 - (R / a) ** 2) / Math.cos(betaRad)
const frac: number = arg >= 1.0 ? 0 : Math.acos(arg) / Math.PI
const t_ecl: number = frac * T`,

    c: `/* Eclipse vs β-angle: ${A} */
if (!(betaRad >= -M_PI / 2.0 && betaRad <= M_PI / 2.0)) return 1;
const double a = R + h;
const double T = 2.0 * M_PI * sqrt((a * a * a) / mu);
const double arg = sqrt(1.0 - (R / a) * (R / a)) / cos(betaRad);
double frac;
if (arg >= 1.0) frac = 0.0;
else frac = acos(arg) / M_PI;
const double t_ecl = frac * T;`,

    cpp: `// Eclipse vs β-angle: ${A}
if (!(betaRad >= -M_PI / 2.0 && betaRad <= M_PI / 2.0)) return 1;
const double a = R + h;
const double T = 2.0 * M_PI * std::sqrt((a * a * a) / mu);
const double arg = std::sqrt(1.0 - (R / a) * (R / a)) / std::cos(betaRad);
double frac;
if (arg >= 1.0) frac = 0.0;
else frac = std::acos(arg) / M_PI;
const double t_ecl = frac * T;`,

    rust: `// Eclipse vs β-angle: ${A}
if !(betaRad >= -std::f64::consts::FRAC_PI_2 && betaRad <= std::f64::consts::FRAC_PI_2) {
    panic!("betaRad must be within [-pi/2, pi/2]");
}
let a = R + h;
let t = 2.0 * std::f64::consts::PI * ((a * a * a) / mu).sqrt();
let arg = (1.0 - (R / a).powi(2)).sqrt() / betaRad.cos();
let frac = if arg >= 1.0 { 0.0 } else { arg.acos() / std::f64::consts::PI };
let t_ecl = frac * t;`,

    zig: `// Eclipse vs β-angle: ${A}
if (!(betaRad >= -std.math.pi / 2.0 and betaRad <= std.math.pi / 2.0)) {
    @panic("betaRad must be within [-pi/2, pi/2]");
}
const a = R + h;
const T = 2.0 * std.math.pi * std.math.sqrt((a * a * a) / mu);
const arg = std.math.sqrt(1.0 - (R / a) * (R / a)) / std.math.cos(betaRad);
const frac = if (arg >= 1.0) 0.0 else std.math.acos(arg) / std.math.pi;
const t_ecl = frac * T;`,

    fortran: `! Eclipse vs β-angle: ${A}
if (.not. (betaRad >= -1.57079632679489661923d0 .and. betaRad <= 1.57079632679489661923d0)) error stop 'betaRad must be within [-pi/2, pi/2]'
a = R + h
T = 2.0d0 * 3.141592653589793d0 * sqrt((a * a * a) / mu)
arg = sqrt(1.0d0 - (R / a)**2) / cos(betaRad)
if (arg >= 1.0d0) then
  frac = 0.0d0
else
  frac = acos(arg) / 3.141592653589793d0
end if
t_ecl = frac * T`,

    matlab: `% Eclipse vs β-angle: ${A}
if ~(betaRad >= -pi/2 && betaRad <= pi/2), error('betaRad must be within [-pi/2, pi/2]'); end
a = R + h;
T = 2 * pi * sqrt(a^3 / mu);
arg = sqrt(1 - (R / a)^2) / cos(betaRad);
if arg >= 1
    frac = 0;
else
    frac = acos(arg) / pi;
end
t_ecl = frac * T;`,

    julia: `# Eclipse vs β-angle: ${A}
if !( -pi / 2 <= betaRad <= pi / 2)
    throw(DomainError(betaRad, "betaRad must be within [-pi/2, pi/2]"))
end
a = R + h
T = 2 * π * sqrt(a^3 / mu)
arg = sqrt(1 - (R / a)^2) / cos(betaRad)
if arg >= 1.0
    frac = 0.0
else
    frac = acos(arg) / π
end
t_ecl = frac * T`,

    latex: `% Eclipse vs β-angle: pure SI
\\[
  a = R + h,\\quad
  |\\beta| \\le \\pi/2,\\quad
  T = 2\\pi\\sqrt{a^{3}/\\mu}
\\]
\\[
  x = \\frac{\\sqrt{1-(R/a)^{2}}}{\\cos\\beta},\\quad
  f = 0\\ (x\\ge 1),\\qquad f = \\frac{1}{\\pi}\\arccos(x)\\ (0\\le x<1),\\quad
  t_{\\mathrm{ecl}} = f\\,T
\\]`,
  },
}
