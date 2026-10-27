import type { FormulaSnippet } from '../types'

const A =
  'Linear GEO drift rate only for |a - a_GEO| / a_GEO < 0.1: rate = -1.5 * n_GEO * (a - a_GEO) / a_GEO. Outside that neighborhood the first-order expansion is not used. SI.'

export const geoDriftRateSnippets: FormulaSnippet = {
  formulaId: 'geo-drift-rate',
  assumptions: A,
  code: {
    python: `# ${A}
rate = -1.5 * nGeo * (a - aGeo) / aGeo if (a > 0.0 and aGeo > 0.0 and nGeo > 0.0 and abs(a - aGeo) / aGeo < 0.1) else float("nan")`,
    javascript: `// ${A}
const rate = a > 0 && aGeo > 0 && nGeo > 0 && Math.abs(a - aGeo) / aGeo < 0.1
  ? -1.5 * nGeo * (a - aGeo) / aGeo
  : Number.NaN`,
    typescript: `// ${A}
const rate = a > 0 && aGeo > 0 && nGeo > 0 && Math.abs(a - aGeo) / aGeo < 0.1
  ? -1.5 * nGeo * (a - aGeo) / aGeo
  : Number.NaN`,
    c: `/* ${A} */
const double rate = (a > 0.0 && aGeo > 0.0 && nGeo > 0.0 && fabs(a - aGeo) / aGeo < 0.1)
  ? -1.5 * nGeo * (a - aGeo) / aGeo
  : NAN;`,
    cpp: `// ${A}
const double rate = (a > 0.0 && aGeo > 0.0 && nGeo > 0.0 && std::fabs(a - aGeo) / aGeo < 0.1)
  ? -1.5 * nGeo * (a - aGeo) / aGeo
  : NAN;`,
    rust: `// ${A}
let rate = if a > 0.0 && aGeo > 0.0 && nGeo > 0.0 && (a - aGeo).abs() / aGeo < 0.1 {
    -1.5_f64 * nGeo * (a - aGeo) / aGeo
} else {
    f64::NAN
};`,
    zig: `// ${A}
const rate = if (a > 0.0 and aGeo > 0.0 and nGeo > 0.0 and @abs(a - aGeo) / aGeo < 0.1)
    -@as(f64, 1.5) * nGeo * (a - aGeo) / aGeo
else
    std.math.nan(f64);`,
    fortran: `! ${A}
  if (a > 0.0d0 .and. aGeo > 0.0d0 .and. nGeo > 0.0d0 .and. abs(a - aGeo) / aGeo < 0.1d0) then
    rate = -1.5d0 * nGeo * (a - aGeo) / aGeo
  else
    rate = (a - a) / (a - a)
  end if`,
    matlab: `% ${A}
if a > 0 && aGeo > 0 && nGeo > 0 && abs(a - aGeo) / aGeo < 0.1
  rate = -1.5 * nGeo * (a - aGeo) / aGeo;
else
  rate = NaN;
end`,
    julia: `# ${A}
rate = a > 0 && aGeo > 0 && nGeo > 0 && abs(a - aGeo) / aGeo < 0.1 ? -1.5 * nGeo * (a - aGeo) / aGeo : NaN`,
    latex: `% ${A}
\\[\\dot\\lambda=-\\tfrac32 n_{\\mathrm{GEO}}\\frac{a-a_{\\mathrm{GEO}}}{a_{\\mathrm{GEO}}},\\quad \\frac{|a-a_{\\mathrm{GEO}}|}{a_{\\mathrm{GEO}}}<0.1\\]`,
  },
}
