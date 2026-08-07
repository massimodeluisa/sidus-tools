import type { FormulaSnippet } from './types'

/**
 * LiOH CO₂ scrubber lifetime: capacity × mass / rate.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches LiohScrubberTool + lib/physics/eclss.ts liohDuration.
 * Free vars: m [kg LiOH], co2RateManual [kg/s], capacity [kg CO2 / kg LiOH].
 */
const A =
  '2 LiOH + CO₂ → Li₂CO₃ + H₂O; practical capacity ~0.85 kg/kg (not regenerative CDRA). SI.'

export const liohSnippets: FormulaSnippet = {
  formulaId: 'lioh-scrubber',
  assumptions: A,
  code: {
    python: `# LiOH duration: ${A}
# capacity [kg CO2 / kg LiOH]; stoich theoretical ≈ 0.919
co2_cap = m * capacity
t_s = co2_cap / co2RateManual`,

    javascript: `// LiOH duration: ${A}
const co2Cap = m * capacity
const tS = co2Cap / co2RateManual`,

    typescript: `// LiOH duration: ${A}
const co2Cap: number = m * capacity
const tS: number = co2Cap / co2RateManual`,

    c: `/* LiOH duration: ${A} */
const double co2_cap = m * capacity;
const double t_s = co2_cap / co2RateManual;`,

    cpp: `// LiOH duration: ${A}
const double co2_cap = m * capacity;
const double t_s = co2_cap / co2RateManual;`,

    rust: `// LiOH duration: ${A}
let co2_cap = m * capacity;
let t_s = co2_cap / co2RateManual;`,

    zig: `// LiOH duration: ${A}
const co2_cap = m * capacity;
const t_s = co2_cap / co2RateManual;`,

    fortran: `! LiOH duration: ${A}
co2_cap = m * capacity
t_s = co2_cap / co2RateManual`,

    matlab: `% LiOH duration: ${A}
co2_cap = m * capacity;
t_s = co2_cap / co2RateManual;`,

    julia: `# LiOH duration: ${A}
co2_cap = m * capacity
t_s = co2_cap / co2RateManual`,

    latex: `% LiOH scrubber: pure SI
\\[
  2\\,\\mathrm{LiOH}+\\mathrm{CO_2}\\to\\mathrm{Li_2CO_3}+\\mathrm{H_2O}
\\]
\\[
  t = m_{\\mathrm{LiOH}}\\,\\eta / \\dot m_{\\mathrm{CO_2}}
\\]`,
  },
}
