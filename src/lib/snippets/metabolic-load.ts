import type { FormulaSnippet } from './types'

/**
 * Metabolic O₂/CO₂/heat budget: rates × duration × crew.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches MetabolicLoadTool + lib/physics/eclss.ts metabolicBudget (nominal awake).
 * Free vars: tS [s], crew [-].
 */
const A =
  'OCHMO-class metabolic rates in SI. Educational models, not flight-rule medical limits. Nominal awake rates.'

export const metabolicSnippets: FormulaSnippet = {
  formulaId: 'metabolic-load',
  assumptions: A,
  code: {
    python: `# Metabolic budget: ${A}
# rates kg/s per crew (nominal awake); heat W per crew
o2_rate = 5.68e-4 / 60
co2_rate = 7.2e-4 / 60
heat_W = 120
o2 = o2_rate * tS * crew
co2 = co2_rate * tS * crew
heat_J = heat_W * tS * crew
RQ = (co2 / 0.04401) / (o2 / 0.031998)  # mol CO2 / mol O2`,

    javascript: `// Metabolic budget: ${A}
const o2Rate = 5.68e-4 / 60
const co2Rate = 7.2e-4 / 60
const heatW = 120
const o2 = o2Rate * tS * crew
const co2 = co2Rate * tS * crew
const heatJ = heatW * tS * crew
const RQ = (co2 / 0.04401) / (o2 / 0.031998)`,

    typescript: `// Metabolic budget: ${A}
const o2Rate: number = 5.68e-4 / 60
const co2Rate: number = 7.2e-4 / 60
const heatW: number = 120
const o2: number = o2Rate * tS * crew
const co2: number = co2Rate * tS * crew
const heatJ: number = heatW * tS * crew
const RQ: number = (co2 / 0.04401) / (o2 / 0.031998)`,

    c: `/* Metabolic budget: ${A} */
const double o2_rate = 5.68e-4 / 60.0;
const double co2_rate = 7.2e-4 / 60.0;
const double heat_W = 120.0;
const double o2 = o2_rate * tS * crew;
const double co2 = co2_rate * tS * crew;
const double heat_J = heat_W * tS * crew;
const double RQ = (co2 / 0.04401) / (o2 / 0.031998);`,

    cpp: `// Metabolic budget: ${A}
const double o2_rate = 5.68e-4 / 60.0;
const double co2_rate = 7.2e-4 / 60.0;
const double heat_W = 120.0;
const double o2 = o2_rate * tS * crew;
const double co2 = co2_rate * tS * crew;
const double heat_J = heat_W * tS * crew;
const double RQ = (co2 / 0.04401) / (o2 / 0.031998);`,

    rust: `// Metabolic budget: ${A}
let o2_rate = 5.68e-4 / 60.0;
let co2_rate = 7.2e-4 / 60.0;
let heat_w = 120.0_f64;
let o2 = o2_rate * tS * crew;
let co2 = co2_rate * tS * crew;
let heat_j = heat_w * tS * crew;
let rq = (co2 / 0.04401) / (o2 / 0.031998);`,

    zig: `// Metabolic budget: ${A}
const o2_rate = 5.68e-4 / 60.0;
const co2_rate = 7.2e-4 / 60.0;
const heat_W: f64 = 120.0;
const o2 = o2_rate * tS * crew;
const co2 = co2_rate * tS * crew;
const heat_J = heat_W * tS * crew;
const RQ = (co2 / 0.04401) / (o2 / 0.031998);`,

    fortran: `! Metabolic budget: ${A}
o2_rate = 5.68d-4 / 60.0d0
co2_rate = 7.2d-4 / 60.0d0
heat_W = 120.0d0
o2 = o2_rate * tS * crew
co2 = co2_rate * tS * crew
heat_J = heat_W * tS * crew
RQ = (co2 / 0.04401d0) / (o2 / 0.031998d0)`,

    matlab: `% Metabolic budget: ${A}
o2_rate = 5.68e-4 / 60;
co2_rate = 7.2e-4 / 60;
heat_W = 120;
o2 = o2_rate * tS * crew;
co2 = co2_rate * tS * crew;
heat_J = heat_W * tS * crew;
RQ = (co2 / 0.04401) / (o2 / 0.031998);`,

    julia: `# Metabolic budget: ${A}
o2_rate = 5.68e-4 / 60
co2_rate = 7.2e-4 / 60
heat_W = 120
o2 = o2_rate * tS * crew
co2 = co2_rate * tS * crew
heat_J = heat_W * tS * crew
RQ = (co2 / 0.04401) / (o2 / 0.031998)`,

    latex: `% Metabolic budget: pure SI
\\[
  m_{\\mathrm{O_2}}=\\dot m_{\\mathrm{O_2}}\\,t\\,N_{\\mathrm{crew}},\\quad
  RQ = \\frac{n_{\\mathrm{CO_2}}}{n_{\\mathrm{O_2}}}
\\]`,
  },
}
