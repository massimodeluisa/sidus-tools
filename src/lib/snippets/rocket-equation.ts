import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Ideal Tsiolkovsky rocket: constant ve (or isp·g0), no gravity/drag losses, instantaneous exhaust model; SI units. Solve mode dv reports Δv from m0 and mf; mode m0 reports m0 = mf·exp(Δv/(isp·g0)) from the SI target Δv. Near-unity mass ratios use log1p((m0-mf)/mf). Propellant from a target Δv is mf·expm1(Δv/(isp·g0)).'

export const rocketSnippets: FormulaSnippet = {
  formulaId: 'rocket-equation',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# Rocket equation: ${ASSUMPTIONS}
import math
g0 = 9.80665
ve = isp * g0
inverse = isinstance(mode, str) and mode[:1] == 'm'
ratio = m0 / mf
ln_ratio = math.log1p((m0 - mf) / mf) if 0.999999 < ratio < 1.000001 else math.log(ratio)
x = dv_si / ve
dv = dv_si if inverse else ve * ln_ratio
prop = mf * math.expm1(x) if inverse else m0 - mf
m0_solved = mf * math.exp(x) if inverse else m0`,

    javascript: `// Rocket equation: ${ASSUMPTIONS}
const g0 = 9.80665
const ve = isp * g0
const inverse = typeof mode === 'string' && mode.charAt(0) === 'm'
const ratio = m0 / mf
const lnRatio = ratio < 1.000001 && ratio > 0.999999 ? Math.log1p((m0 - mf) / mf) : Math.log(ratio)
const x = dv_si / ve
const dv = inverse ? dv_si : ve * lnRatio
const prop = inverse ? mf * Math.expm1(x) : m0 - mf
const m0_solved = inverse ? mf * Math.exp(x) : m0`,

    typescript: `// Rocket equation: ${ASSUMPTIONS}
const g0: number = 9.80665
const ve: number = isp * g0
const inverse: boolean = typeof mode === 'string' && mode.charAt(0) === 'm'
const ratio: number = m0 / mf
const lnRatio: number = ratio < 1.000001 && ratio > 0.999999 ? Math.log1p((m0 - mf) / mf) : Math.log(ratio)
const x: number = dv_si / ve
const dv: number = inverse ? dv_si : ve * lnRatio
const prop: number = inverse ? mf * Math.expm1(x) : m0 - mf
const m0_solved: number = inverse ? mf * Math.exp(x) : m0`,

    c: `/* Rocket equation: ${ASSUMPTIONS} */
const double g0 = 9.80665;
const double ve = isp * g0;
const int inverse = mode[0] == 'm';
const double ratio = m0 / mf;
const double ln_ratio = (ratio < 1.000001 && ratio > 0.999999) ? log1p((m0 - mf) / mf) : log(ratio);
const double x = dv_si / ve;
const double dv = inverse ? dv_si : ve * ln_ratio;
const double prop = inverse ? mf * expm1(x) : m0 - mf;
const double m0_solved = inverse ? mf * exp(x) : m0;`,

    cpp: `// Rocket equation: ${ASSUMPTIONS}
const double g0 = 9.80665;
const double ve = isp * g0;
const bool inverse = mode[0] == 'm';
const double ratio = m0 / mf;
const double ln_ratio = (ratio < 1.000001 && ratio > 0.999999) ? std::log1p((m0 - mf) / mf) : std::log(ratio);
const double x = dv_si / ve;
const double dv = inverse ? dv_si : ve * ln_ratio;
const double prop = inverse ? mf * std::expm1(x) : m0 - mf;
const double m0_solved = inverse ? mf * std::exp(x) : m0;`,

    rust: `// Rocket equation: ${ASSUMPTIONS}
let g0 = 9.80665_f64;
let ve = isp * g0;
let inverse = mode.as_bytes()[0] == b'm';
let ratio = m0 / mf;
let ln_ratio = if ratio < 1.000001 && ratio > 0.999999 {
    ((m0 - mf) / mf).ln_1p()
} else {
    ratio.ln()
};
let x = dv_si / ve;
let dv = if inverse { dv_si } else { ve * ln_ratio };
let prop = if inverse { mf * x.exp_m1() } else { m0 - mf };
let m0_solved = if inverse { mf * x.exp() } else { m0 };`,

    zig: `// Rocket equation: ${ASSUMPTIONS}
const g0: f64 = 9.80665;
const ve = isp * g0;
const inverse = mode[0] == 'm';
const ratio = m0 / mf;
const ln_ratio = if (ratio < 1.000001 and ratio > 0.999999) std.math.log1p((m0 - mf) / mf) else @log(ratio);
const x = dv_si / ve;
const dv = if (inverse) dv_si else ve * ln_ratio;
const prop = if (inverse) mf * std.math.expm1(x) else m0 - mf;
const m0_solved = if (inverse) mf * @exp(x) else m0;`,

    fortran: `! Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665d0
ve = isp * g0
x = dv_si / ve
ratio = m0 / mf
if (ratio < 1.000001d0 .and. ratio > 0.999999d0) then
  ln_ratio = log1p((m0 - mf) / mf)
else
  ln_ratio = log(ratio)
endif
if (mode(1:1) == 'm') then
  dv = dv_si
  prop = mf * expm1(x)
  m0_solved = mf * exp(x)
else
  dv = ve * ln_ratio
  prop = m0 - mf
  m0_solved = m0
endif`,

    matlab: `% Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665;
ve = isp * g0;
x = dv_si / ve;
ratio = m0 / mf;
if ratio < 1.000001 && ratio > 0.999999
  ln_ratio = log1p((m0 - mf) / mf);
else
  ln_ratio = log(ratio);
end
if mode(1) == 'm'
  dv = dv_si;
  prop = mf * expm1(x);
  m0_solved = mf * exp(x);
else
  dv = ve * ln_ratio;
  prop = m0 - mf;
  m0_solved = m0;
end`,

    julia: `# Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665
ve = isp * g0
x = dv_si / ve
ratio = m0 / mf
ln_ratio = 0.999999 < ratio < 1.000001 ? log1p((m0 - mf) / mf) : log(ratio)
if mode[1] == 'm'
  dv = dv_si
  prop = mf * expm1(x)
  m0_solved = mf * exp(x)
else
  dv = ve * ln_ratio
  prop = m0 - mf
  m0_solved = m0
end`,

    latex: `% Tsiolkovsky. Mode dv uses the mass ratio; mode m0 inverts the target \\Delta v.
% Near unit mass ratio, \\ln(m_0/m_f)=\\log\\bigl(1+(m_0-m_f)/m_f\\bigr).
\\[
\\Delta v = I_{sp} g_0 \\ln\\frac{m_0}{m_f}
\\]
\\[
m_0 = m_f \\exp\\!\\left(\\frac{\\Delta v}{I_{sp} g_0}\\right),\\quad
m_{\\mathrm{prop}} = m_f\\,\\mathrm{expm1}\\!\\left(\\frac{\\Delta v}{I_{sp} g_0}\\right)
\\]`,
  },
}
