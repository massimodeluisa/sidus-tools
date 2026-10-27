import type { FormulaSnippet } from '../types'

const A =
  'Umbra cone length for a finite spherical source and a spherical opaque occulter. d is center-to-center separation. Touching spheres are allowed; overlapping spheres (d < Rs + Rb) are not. L = Rb * d / (Rs - Rb). SI.'

export const umbraLengthSnippets: FormulaSnippet = {
  formulaId: 'umbra-length',
  assumptions: A,
  code: {
    python: `# ${A}
L = Rb * d / (Rs - Rb) if (d > 0.0 and Rb > 0.0 and Rs > Rb and d >= Rs + Rb) else float("nan")`,
    javascript: `// ${A}
const L = d > 0 && Rb > 0 && Rs > Rb && d >= Rs + Rb ? Rb * d / (Rs - Rb) : Number.NaN`,
    typescript: `// ${A}
const L = d > 0 && Rb > 0 && Rs > Rb && d >= Rs + Rb ? Rb * d / (Rs - Rb) : Number.NaN`,
    c: `/* ${A} */
const double L = (d > 0.0 && Rb > 0.0 && Rs > Rb && d >= Rs + Rb) ? Rb * d / (Rs - Rb) : NAN;`,
    cpp: `// ${A}
const double L = (d > 0.0 && Rb > 0.0 && Rs > Rb && d >= Rs + Rb) ? Rb * d / (Rs - Rb) : NAN;`,
    rust: `// ${A}
let L = if d > 0.0 && Rb > 0.0 && Rs > Rb && d >= Rs + Rb { Rb * d / (Rs - Rb) } else { f64::NAN };`,
    zig: `// ${A}
const L = if (d > 0.0 and Rb > 0.0 and Rs > Rb and d >= Rs + Rb) Rb * d / (Rs - Rb) else std.math.nan(f64);`,
    fortran: `! ${A}
  if (d > 0.0d0 .and. Rb > 0.0d0 .and. Rs > Rb .and. d >= Rs + Rb) then
    L = Rb * d / (Rs - Rb)
  else
    L = 0.0d0
    L = L / L
  end if`,
    matlab: `% ${A}
if d > 0 && Rb > 0 && Rs > Rb && d >= Rs + Rb
  L = Rb * d / (Rs - Rb);
else
  L = NaN;
end`,
    julia: `# ${A}
L = d > 0 && Rb > 0 && Rs > Rb && d >= Rs + Rb ? Rb * d / (Rs - Rb) : NaN`,
    latex: `% ${A}
\\[L=\\frac{R_b d}{R_s-R_b},\\quad d\\ge R_s+R_b\\]`,
  },
}
