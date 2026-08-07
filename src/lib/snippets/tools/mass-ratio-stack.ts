import type { FormulaSnippet } from '../types'

/**
 * Equal-stage stack mass: gross/payload ≈ R^N.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches MassRatioStagesTool ideal branch. Free vars: payload, R, N.
 */
const A = 'Equal-stage stack mass ratio gross/payload ≈ R^N. SI (kg).'

export const massStackSnippets: FormulaSnippet = {
  formulaId: 'mass-ratio-stack',
  assumptions: A,
  code: {
    python: `# Mass-ratio stack: ${A}
gross = payload * R**N`,

    javascript: `// Mass-ratio stack: ${A}
const gross = payload * R ** N`,

    typescript: `// Mass-ratio stack: ${A}
const gross: number = payload * R ** N`,

    c: `/* Mass-ratio stack: ${A} */
const double gross = payload * pow(R, N);`,

    cpp: `// Mass-ratio stack: ${A}
const double gross = payload * std::pow(R, N);`,

    rust: `// Mass-ratio stack: ${A}
let gross = payload * R.powf(N);`,

    zig: `// Mass-ratio stack: ${A}
const gross = payload * std.math.pow(f64, R, N);`,

    fortran: `! Mass-ratio stack: ${A}
gross = payload * R**N`,

    matlab: `% Mass-ratio stack: ${A}
gross = payload * R^N;`,

    julia: `# Mass-ratio stack: ${A}
gross = payload * R^N`,

    latex: `% Mass-ratio stack: pure SI
\\[
  m_{\\mathrm{gross}}/m_{\\mathrm{pl}} \\approx R^{N}
\\]`,
  },
}
