import type { FormulaSnippet } from '../types'

const A =
  'e ≈ -(J3/(2 J2)) (R/a) sin i. Undefined when periapsis a(1-e) is not strictly outside the body radius. SI.'

export const frozenOrbitSnippets: FormulaSnippet = {
  formulaId: 'frozen-orbit',
  assumptions: A,
  code: {
    python: `# ${A}
import math
e = -(j3 / (2.0 * j2)) * (Rb / a) * math.sin(inc)
if not (e > 0.0) or not (e < 1.0) or not (a * (1.0 - e) > Rb):
    e = float("nan")`,
    javascript: `// ${A}
let e = -(j3 / (2.0 * j2)) * (Rb / a) * Math.sin(inc)
if (!(e > 0) || !(e < 1) || !(a * (1 - e) > Rb)) e = Number.NaN`,
    typescript: `// ${A}
let e = -(j3 / (2.0 * j2)) * (Rb / a) * Math.sin(inc)
if (!(e > 0) || !(e < 1) || !(a * (1 - e) > Rb)) e = Number.NaN`,
    c: `/* ${A} */
double e = -(j3 / (2.0 * j2)) * (Rb / a) * sin(inc);
if (!(e > 0.0) || !(e < 1.0) || !(a * (1.0 - e) > Rb)) e = nan("");`,
    cpp: `// ${A}
double e = -(j3 / (2.0 * j2)) * (Rb / a) * std::sin(inc);
if (!(e > 0.0) || !(e < 1.0) || !(a * (1.0 - e) > Rb)) e = std::nan("");`,
    rust: `// ${A}
let mut e = -(j3 / (2.0_f64 * j2)) * (Rb / a) * (inc).sin();
if !(e > 0.0 && e < 1.0 && a * (1.0 - e) > Rb) {
    e = f64::NAN;
}`,
    zig: `// ${A}
var e = -(j3 / (@as(f64, 2.0) * j2)) * (Rb / a) * @sin(inc);
if (!((e > 0.0) and (e < 1.0) and (a * (1.0 - e) > Rb))) e = std.math.nan(f64);`,
    fortran: `! ${A}
e = -(j3 / (2.0d0 * j2)) * (Rb / a) * sin(inc)
if (.not. (e > 0.0d0) .or. .not. (e < 1.0d0) .or. .not. (a * (1.0d0 - e) > Rb)) then
  e = (e - e) / (e - e)
end if`,
    matlab: `% ${A}
e = -(j3 / (2.0 * j2)) * (Rb / a) * sin(inc);
if ~(e > 0) || ~(e < 1) || ~(a * (1 - e) > Rb)
  e = NaN;
end`,
    julia: `# ${A}
e = -(j3 / (2.0 * j2)) * (Rb / a) * sin(inc)
if !(e > 0) || !(e < 1) || !(a * (1 - e) > Rb)
    e = NaN
end`,
    latex: `% ${A}
\\[ e \\approx -\\frac{J_3}{2 J_2}\\frac{R}{a}\\sin i, \\quad a(1-e) > R \\]`,
  },
}
