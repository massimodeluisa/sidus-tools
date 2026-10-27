import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Pure impulsive plane change at fixed orbital speed; spherical two-body; the included angle is the principal angle in [0, π]; speed is a nonnegative magnitude; SI units.'

export const planeChangeSnippets: FormulaSnippet = {
  formulaId: 'plane-change',
  assumptions: ASSUMPTIONS,
  code: {
    c: `/* Plane change: ${ASSUMPTIONS} */
const double di = di_deg * M_PI / 180.0;
const double two_pi = 2.0 * M_PI;
double theta = fmod(fabs(di), two_pi);
if (theta > M_PI) theta = two_pi - theta;
const double dv = v < 0.0 ? NAN : 2.0 * v * sin(theta / 2.0);`,

    cpp: `// Plane change: ${ASSUMPTIONS}
const double di = di_deg * M_PI / 180.0;
const double two_pi = 2.0 * M_PI;
double theta = std::fmod(std::fabs(di), two_pi);
if (theta > M_PI) theta = two_pi - theta;
const double dv = v < 0.0 ? NAN : 2.0 * v * std::sin(theta / 2.0);`,

    rust: `// Plane change: ${ASSUMPTIONS}
let di = di_deg.to_radians();
let two_pi = 2.0 * std::f64::consts::PI;
let mut theta = di.abs() % two_pi;
if theta > std::f64::consts::PI {
    theta = two_pi - theta;
}
let dv = if v < 0.0 { f64::NAN } else { 2.0 * v * (theta / 2.0).sin() };`,

    zig: `// Plane change: ${ASSUMPTIONS}
const di = di_deg * std.math.pi / 180.0;
const two_pi = 2.0 * std.math.pi;
var theta = @mod(@abs(di), two_pi);
if (theta > std.math.pi) theta = two_pi - theta;
const dv = if (v < 0.0) std.math.nan(f64) else 2.0 * v * std.math.sin(theta / 2.0);`,

    python: `# Plane change: ${ASSUMPTIONS}
import math
di = math.radians(di_deg)
two_pi = 2 * math.pi
theta = abs(di) % two_pi
if theta > math.pi:
    theta = two_pi - theta
dv = float('nan') if v < 0 else 2 * v * math.sin(theta / 2)`,

    javascript: `// Plane change: ${ASSUMPTIONS}
const di = (di_deg * Math.PI) / 180
const twoPi = 2 * Math.PI
let theta = Math.abs(di) % twoPi
if (theta > Math.PI) theta = twoPi - theta
const dv = v < 0 ? NaN : 2 * v * Math.sin(theta / 2)`,

    typescript: `// Plane change: ${ASSUMPTIONS}
const di: number = (di_deg * Math.PI) / 180
const twoPi: number = 2 * Math.PI
let theta: number = Math.abs(di) % twoPi
if (theta > Math.PI) theta = twoPi - theta
const dv: number = v < 0 ? NaN : 2 * v * Math.sin(theta / 2)`,

    matlab: `% Plane change: ${ASSUMPTIONS}
di = di_deg * pi / 180;
two_pi = 2 * pi;
theta = mod(abs(di), two_pi);
if theta > pi
  theta = two_pi - theta;
end
if v < 0
  dv = NaN;
else
  dv = 2 * v * sin(theta / 2);
end`,

    julia: `# Plane change: ${ASSUMPTIONS}
di = deg2rad(di_deg)
two_pi = 2 * pi
theta = mod(abs(di), two_pi)
if theta > pi
  theta = two_pi - theta
end
dv = v < 0 ? NaN : 2 * v * sin(theta / 2)`,

    fortran: `! Plane change: ${ASSUMPTIONS}
di = di_deg * acos(-1.0d0) / 180.0d0
two_pi = 2.0d0 * acos(-1.0d0)
theta = mod(abs(di), two_pi)
if (theta > acos(-1.0d0)) then
  theta = two_pi - theta
endif
if (v < 0.0d0) then
  dv = 0.0d0
  dv = dv / dv
else
  dv = 2.0d0 * v * sin(theta / 2.0d0)
endif`,

    latex: `% Pure plane change. \\theta is the principal included angle in [0, \\pi]; v is a speed.
\\[
\\theta = \\mathrm{principal}(|\\Delta i|) \\in [0, \\pi],\\quad
\\Delta v = 2 v \\sin\\!\\left(\\frac{\\theta}{2}\\right)
\\]`,
  },
}
