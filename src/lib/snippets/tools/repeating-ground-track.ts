import type { FormulaSnippet } from '../types'

const A = 'T = days*86400/round(k) for a positive integer orbit count k. SI.'

export const repeatingGroundTrackSnippets: FormulaSnippet = {
  formulaId: 'repeating-ground-track',
  assumptions: A,
  code: {
    python: `# ${A}
k_int = int(k + 0.5)
T = days * 86400 / k_int if k_int >= 1 else float("nan")`,
    javascript: `// ${A}
const kInt = Math.round(k)
const T = kInt >= 1 ? days * 86400 / kInt : Number.NaN`,
    typescript: `// ${A}
const kInt = Math.round(k)
const T = kInt >= 1 ? days * 86400 / kInt : Number.NaN`,
    c: `/* ${A} */
const double k_int = round(k);
const double T = k_int >= 1.0 ? days * 86400.0 / k_int : NAN;`,
    cpp: `// ${A}
const double k_int = std::round(k);
const double T = k_int >= 1.0 ? days * 86400.0 / k_int : NAN;`,
    rust: `// ${A}
let k_int = k.round();
let T = if k_int >= 1.0 { days * 86400.0_f64 / k_int } else { f64::NAN };`,
    zig: `// ${A}
const k_int = std.math.round(k);
const T = if (k_int >= 1.0) days * @as(f64, 86400.0) / k_int else std.math.nan(f64);`,
    fortran: `! ${A}
  k_int = anint(k)
  if (k_int >= 1.0d0) then
    T = days * 86400.0d0 / k_int
  else
    T = 0.0d0
    T = T / T
  end if`,
    matlab: `% ${A}
k_int = round(k);
if k_int >= 1
  T = days * 86400 / k_int;
else
  T = NaN;
end`,
    julia: `# ${A}
k_int = round(k, RoundNearestTiesAway)
T = k_int >= 1 ? days * 86400 / k_int : NaN`,
    latex: `% ${A}
\\[T=\\frac{n_{\\mathrm{days}}\\cdot 86400}{\\mathrm{round}(k)}\\]`,
  },
}
