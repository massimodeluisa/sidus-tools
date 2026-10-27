import type { FormulaSnippet } from '../types'

const A =
  'Depth of discharge DoD = E_used / E_capacity, greater than 0 and at most 1. Same energy or charge basis for both inputs. Non-finite capacity is rejected. SI.'

export const batteryDodSnippets: FormulaSnippet = {
  formulaId: 'battery-dod',
  assumptions: A,
  code: {
    python: `# ${A}
import math
DoD = eUsed / eCap if (math.isfinite(eUsed) and math.isfinite(eCap) and eUsed > 0.0 and eCap > 0.0 and eUsed <= eCap) else float("nan")`,
    javascript: `// ${A}
const DoD = Number.isFinite(eUsed) && Number.isFinite(eCap) && eUsed > 0 && eCap > 0 && eUsed <= eCap
  ? eUsed / eCap
  : Number.NaN`,
    typescript: `// ${A}
const DoD = Number.isFinite(eUsed) && Number.isFinite(eCap) && eUsed > 0 && eCap > 0 && eUsed <= eCap
  ? eUsed / eCap
  : Number.NaN`,
    c: `/* ${A} */
const double DoD = (isfinite(eUsed) && isfinite(eCap) && eUsed > 0.0 && eCap > 0.0 && eUsed <= eCap)
  ? eUsed / eCap
  : NAN;`,
    cpp: `// ${A}
const double DoD = (std::isfinite(eUsed) && std::isfinite(eCap) && eUsed > 0.0 && eCap > 0.0 && eUsed <= eCap)
  ? eUsed / eCap
  : NAN;`,
    rust: `// ${A}
let DoD = if eUsed.is_finite() && eCap.is_finite() && eUsed > 0.0 && eCap > 0.0 && eUsed <= eCap {
    eUsed / eCap
} else {
    f64::NAN
};`,
    zig: `// ${A}
const DoD = if (std.math.isFinite(eUsed) and std.math.isFinite(eCap) and eUsed > 0.0 and eCap > 0.0 and eUsed <= eCap)
    eUsed / eCap
else
    std.math.nan(f64);`,
    fortran: `! ${A}
  if (eUsed == eUsed .and. eCap == eCap .and. eUsed > 0.0d0 .and. eCap > 0.0d0 .and. eUsed <= eCap) then
    DoD = eUsed / eCap
  else
    DoD = (eUsed - eUsed) / (eUsed - eUsed)
  end if`,
    matlab: `% ${A}
if isfinite(eUsed) && isfinite(eCap) && eUsed > 0 && eCap > 0 && eUsed <= eCap
  DoD = eUsed / eCap;
else
  DoD = NaN;
end`,
    julia: `# ${A}
DoD = isfinite(eUsed) && isfinite(eCap) && eUsed > 0 && eCap > 0 && eUsed <= eCap ? eUsed / eCap : NaN`,
    latex: `% ${A}
\\[\\mathrm{DoD}=E_{\\mathrm{used}}/E_{\\mathrm{cap}},\\quad 0<\\mathrm{DoD}\\le 1\\]`,
  },
}
