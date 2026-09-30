import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Ideal Tsiolkovsky rocket: constant ve (or isp·g0), no gravity/drag losses; solve for delta-v from masses or initial mass from target delta-v; SI units.'

export const rocketSnippets: FormulaSnippet = {
  formulaId: 'rocket-equation',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# Rocket equation: ${ASSUMPTIONS}
import math
g0 = 9.80665
ve = isp * g0
mass_excess_ratio = 0.0
log_mass_ratio = 0.0
if solve_for_m0 >= 0.5:
    dv_result = dv_target
    m0_result = mf * math.exp(dv_target / ve)
    propellant_result = mf * math.expm1(dv_target / ve)
else:
    mass_excess_ratio = (m0 - mf) / mf
    log_mass_ratio = math.log1p(mass_excess_ratio) if mass_excess_ratio <= 0.5 else math.log(m0) - math.log(mf)
    dv_result = ve * log_mass_ratio
    m0_result = m0
    propellant_result = m0 - mf
mass_ratio = m0_result / mf`,

    javascript: `// Rocket equation: ${ASSUMPTIONS}
const g0 = 9.80665
const ve = isp * g0
const exponent = dv_target / ve
let dv_result = dv_target
if (solve_for_m0 < 0.5) {
  const mass_excess_ratio = (m0 - mf) / mf
  const log_mass_ratio = mass_excess_ratio <= 0.5 ? Math.log1p(mass_excess_ratio) : Math.log(m0) - Math.log(mf)
  dv_result = ve * log_mass_ratio
}
const m0_result = solve_for_m0 >= 0.5 ? mf * Math.exp(exponent) : m0
const propellant_result = solve_for_m0 >= 0.5 ? mf * Math.expm1(exponent) : m0 - mf
const mass_ratio = m0_result / mf`,

    typescript: `// Rocket equation: ${ASSUMPTIONS}
const g0: number = 9.80665
const ve: number = isp * g0
const exponent: number = dv_target / ve
let dv_result: number = dv_target
if (solve_for_m0 < 0.5) {
  const mass_excess_ratio: number = (m0 - mf) / mf
  const log_mass_ratio: number = mass_excess_ratio <= 0.5 ? Math.log1p(mass_excess_ratio) : Math.log(m0) - Math.log(mf)
  dv_result = ve * log_mass_ratio
}
const m0_result: number = solve_for_m0 >= 0.5 ? mf * Math.exp(exponent) : m0
const propellant_result: number = solve_for_m0 >= 0.5 ? mf * Math.expm1(exponent) : m0 - mf
const mass_ratio: number = m0_result / mf`,

    c: `/* Rocket equation: ${ASSUMPTIONS} */
const double g0 = 9.80665;
const double ve = isp * g0;
const double exponent = dv_target / ve;
double dv_result = dv_target;
if (solve_for_m0 < 0.5) {
    const double mass_excess_ratio = (m0 - mf) / mf;
    const double log_mass_ratio = mass_excess_ratio <= 0.5 ? log1p(mass_excess_ratio) : log(m0) - log(mf);
    dv_result = ve * log_mass_ratio;
}
const double m0_result = solve_for_m0 >= 0.5 ? mf * exp(exponent) : m0;
const double propellant_result = solve_for_m0 >= 0.5 ? mf * expm1(exponent) : m0 - mf;
const double mass_ratio = m0_result / mf;`,

    cpp: `// Rocket equation: ${ASSUMPTIONS}
const double g0 = 9.80665;
const double ve = isp * g0;
const double exponent = dv_target / ve;
double dv_result = dv_target;
if (solve_for_m0 < 0.5) {
    const double mass_excess_ratio = (m0 - mf) / mf;
    const double log_mass_ratio = mass_excess_ratio <= 0.5 ? std::log1p(mass_excess_ratio) : std::log(m0) - std::log(mf);
    dv_result = ve * log_mass_ratio;
}
const double m0_result = solve_for_m0 >= 0.5 ? mf * std::exp(exponent) : m0;
const double propellant_result = solve_for_m0 >= 0.5 ? mf * std::expm1(exponent) : m0 - mf;
const double mass_ratio = m0_result / mf;`,

    rust: `// Rocket equation: ${ASSUMPTIONS}
let g0 = 9.80665_f64;
let ve = isp * g0;
let exponent = dv_target / ve;
let dv_result = if solve_for_m0 >= 0.5 {
    dv_target
} else {
    let mass_excess_ratio = (m0 - mf) / mf;
    let log_mass_ratio = if mass_excess_ratio <= 0.5 { mass_excess_ratio.ln_1p() } else { m0.ln() - mf.ln() };
    ve * log_mass_ratio
};
let m0_result = if solve_for_m0 >= 0.5 { mf * exponent.exp() } else { m0 };
let propellant_result = if solve_for_m0 >= 0.5 { mf * exponent.exp_m1() } else { m0 - mf };
let mass_ratio = m0_result / mf;`,

    zig: `// Rocket equation: ${ASSUMPTIONS}
const g0: f64 = 9.80665;
const ve = isp * g0;
const exponent = dv_target / ve;
const dv_result = if (solve_for_m0 >= 0.5) dv_target else blk: {
    const mass_excess_ratio = (m0 - mf) / mf;
    var log_mass_ratio: f64 = undefined;
    if (mass_excess_ratio <= 0.5) {
        // log(1+x) = 2 atanh(x/(2+x)); 10 terms stay near double precision here.
        const transformed = mass_excess_ratio / (2.0 + mass_excess_ratio);
        const transformed_squared = transformed * transformed;
        const log_series = 1.0 / 3.0 + transformed_squared * (1.0 / 5.0 + transformed_squared * (1.0 / 7.0 + transformed_squared * (1.0 / 9.0 + transformed_squared * (1.0 / 11.0 + transformed_squared * (1.0 / 13.0 + transformed_squared * (1.0 / 15.0 + transformed_squared * (1.0 / 17.0 + transformed_squared * (1.0 / 19.0 + transformed_squared / 21.0))))))));
        log_mass_ratio = 2.0 * transformed * (1.0 + transformed_squared * log_series);
    } else {
        log_mass_ratio = @log(m0) - @log(mf);
    }
    break :blk ve * log_mass_ratio;
};
const m0_result = if (solve_for_m0 >= 0.5) mf * @exp(exponent) else m0;
// Use a Taylor branch near zero to avoid cancellation in exp(x) - 1.
const propellant_result = if (solve_for_m0 >= 0.5)
    mf * (if (exponent < 1e-3) exponent * (1.0 + exponent * (0.5 + exponent * (1.0 / 6.0 + exponent * (1.0 / 24.0 + exponent / 120.0)))) else @exp(exponent) - 1.0)
else m0 - mf;
const mass_ratio = m0_result / mf;`,

    fortran: `! Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665d0
ve = isp * g0
exponent = dv_target / ve
mass_excess_ratio = 0.0d0
transformed = 0.0d0
transformed_squared = 0.0d0
log_series = 0.0d0
log_mass_ratio = 0.0d0
if (solve_for_m0 >= 0.5d0) then
    dv_result = dv_target
    m0_result = mf * exp(exponent)
    if (exponent < 1.0d-3) then
        propellant_result = mf * exponent * (1.0d0 + exponent * (0.5d0 + exponent * (1.0d0 / 6.0d0 + exponent * (1.0d0 / 24.0d0 + exponent / 120.0d0))))
    else
        propellant_result = mf * (exp(exponent) - 1.0d0)
    end if
else
    mass_excess_ratio = (m0 - mf) / mf
    if (mass_excess_ratio <= 0.5d0) then
        ! log(1+x) = 2 atanh(x/(2+x)); 10 terms stay near double precision here.
        transformed = mass_excess_ratio / (2.0d0 + mass_excess_ratio)
        transformed_squared = transformed * transformed
        log_series = 1.0d0 / 19.0d0 + transformed_squared / 21.0d0
        log_series = 1.0d0 / 17.0d0 + transformed_squared * log_series
        log_series = 1.0d0 / 15.0d0 + transformed_squared * log_series
        log_series = 1.0d0 / 13.0d0 + transformed_squared * log_series
        log_series = 1.0d0 / 11.0d0 + transformed_squared * log_series
        log_series = 1.0d0 / 9.0d0 + transformed_squared * log_series
        log_series = 1.0d0 / 7.0d0 + transformed_squared * log_series
        log_series = 1.0d0 / 5.0d0 + transformed_squared * log_series
        log_series = 1.0d0 / 3.0d0 + transformed_squared * log_series
        log_mass_ratio = 2.0d0 * transformed * (1.0d0 + transformed_squared * log_series)
    else
        log_mass_ratio = log(m0) - log(mf)
    end if
    dv_result = ve * log_mass_ratio
    m0_result = m0
    propellant_result = m0 - mf
end if
mass_ratio = m0_result / mf`,

    matlab: `% Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665;
ve = isp * g0;
exponent = dv_target / ve;
mass_excess_ratio = 0;
log_mass_ratio = 0;
if solve_for_m0 >= 0.5
  dv_result = dv_target;
  m0_result = mf * exp(exponent);
  if exponent < 1e-3
    propellant_result = mf * exponent * (1 + exponent * (0.5 + exponent * (1/6 + exponent * (1/24 + exponent/120))));
  else
    propellant_result = mf * (exp(exponent) - 1);
  end
else
  mass_excess_ratio = (m0 - mf) / mf;
  if mass_excess_ratio < 1e-3
    log_mass_ratio = mass_excess_ratio * (1 + mass_excess_ratio * (-1/2 + mass_excess_ratio * (1/3 + mass_excess_ratio * (-1/4 + mass_excess_ratio * (1/5 + mass_excess_ratio * (-1/6 + mass_excess_ratio * (1/7 + mass_excess_ratio * (-1/8 + mass_excess_ratio * (1/9 - mass_excess_ratio/10))))))));
  elseif mass_excess_ratio <= 0.5
    log_mass_ratio = log1p(mass_excess_ratio);
  else
    log_mass_ratio = log(m0) - log(mf);
  end
  dv_result = ve * log_mass_ratio;
  m0_result = m0;
  propellant_result = m0 - mf;
end
mass_ratio = m0_result / mf;`,

    julia: `# Rocket equation: ${ASSUMPTIONS}
g0 = 9.80665
ve = isp * g0
exponent = dv_target / ve
mass_excess_ratio = 0
log_mass_ratio = 0
if solve_for_m0 >= 0.5
    dv_result = dv_target
    m0_result = mf * exp(exponent)
    propellant_result = mf * expm1(exponent)
else
    mass_excess_ratio = (m0 - mf) / mf
    if mass_excess_ratio <= 0.5
        log_mass_ratio = log1p(mass_excess_ratio)
    else
        log_mass_ratio = log(m0) - log(mf)
    end
    dv_result = ve * log_mass_ratio
    m0_result = m0
    propellant_result = m0 - mf
end
mass_ratio = m0_result / mf`,

    latex: `% Tsiolkovsky
\\[
\\Delta v = I_{sp} g_0 \\ln\\frac{m_0}{m_f} = v_e \\ln\\frac{m_0}{m_f}, \\qquad
m_0 = m_f \\exp\\left(\\frac{\\Delta v}{I_{sp} g_0}\\right) = m_f \\exp\\left(\\frac{\\Delta v}{v_e}\\right), \\qquad
m_{prop} = m_f \\operatorname{expm1}\\left(\\frac{\\Delta v}{v_e}\\right)
\\]`,
  },
}
