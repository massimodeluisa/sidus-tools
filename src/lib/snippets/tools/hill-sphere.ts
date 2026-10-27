import type { FormulaSnippet } from '../types'

const A =
  'Hill radius r_H ≈ a (m/(3M))^(1/3) for a circular orbit of a smaller secondary. Requires m < M. That guard is not an exact three-body result, and the approximation assumes m/M << 1. It is a gravitational-influence scale, not a satellite-stability boundary. SI.'

export const hillSphereSnippets: FormulaSnippet = {
  formulaId: 'hill-sphere',
  assumptions: A,
  code: {
    python: `# ${A}
rH = a * (m / (3 * M)) ** (1 / 3) if (a > 0.0 and m > 0.0 and M > 0.0 and m < M) else float("nan")`,
    javascript: `// ${A}
const rH = a > 0 && m > 0 && M > 0 && m < M ? a * (m / (3 * M)) ** (1 / 3) : Number.NaN`,
    typescript: `// ${A}
const rH = a > 0 && m > 0 && M > 0 && m < M ? a * (m / (3 * M)) ** (1 / 3) : Number.NaN`,
    c: `/* ${A} */
const double rH = (a > 0.0 && m > 0.0 && M > 0.0 && m < M) ? a * pow((m / (3 * M)), (1.0 / 3.0)) : NAN;`,
    cpp: `// ${A}
const double rH = (a > 0.0 && m > 0.0 && M > 0.0 && m < M) ? a * pow((m / (3 * M)), (1.0 / 3.0)) : NAN;`,
    rust: `// ${A}
let rH = if a > 0.0 && m > 0.0 && M > 0.0 && m < M {
    a * (m / (3.0_f64 * M)).powf(1.0_f64 / 3.0_f64)
} else {
    f64::NAN
};`,
    zig: `// ${A}
const rH = if (a > 0.0 and m > 0.0 and M > 0.0 and m < M)
    a * std.math.pow(f64, (m / (@as(f64, 3.0) * M)), (@as(f64, 1.0) / @as(f64, 3.0)))
else
    std.math.nan(f64);`,
    fortran: `! ${A}
  if (a > 0.0d0 .and. m > 0.0d0 .and. M > 0.0d0 .and. m < M) then
    rH = a * (m / (3.0d0 * M)) ** (1.0d0 / 3.0d0)
  else
    rH = 0.0d0
    rH = rH / rH
  end if`,
    matlab: `% ${A}
if a > 0 && m > 0 && M > 0 && m < M
  rH = a * (m / (3 * M)) ^ (1 / 3);
else
  rH = NaN;
end`,
    julia: `# ${A}
rH = a > 0 && m > 0 && M > 0 && m < M ? a * (m / (3 * M)) ^ (1 / 3) : NaN`,
    latex: `% ${A}
\\[r_H\\approx a\\left(\\frac{m}{3M}\\right)^{1/3},\\quad m<M\\]`,
  },
}
