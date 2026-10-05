import type { FormulaSnippet } from './types'

/**
 * Crew water loop: demand vs recovered water, makeup (resupply) mass.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches WaterLoopTool + lib/physics/eclss.ts waterLoopBudget.
 * Free vars (kg per crew-day unless noted): potable, hygiene, flush, o2, urine,
 * condensate; eta_u, eta_c, eta_h [0..1]; crew [-]; tS [s]; reserve [-].
 */
const A =
  'Steady-state water balance; rates per crew-day (BVAD Rev2 ISS-class defaults); electrolysis 2 H2O -> 2 H2 + O2. Educational, SI.'

export const waterLoopSnippets: FormulaSnippet = {
  formulaId: 'water-loop',
  assumptions: A,
  code: {
    python: `# Crew water loop: ${A}
elec = o2 * (2 * 0.018015 / 0.031998)  # kg water per kg O2 electrolyzed
demand = potable + hygiene + flush + elec
recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene
makeup = max(0.0, demand - recovered)
crew_days = crew * tS / 86400 * (1 + reserve)
mission = makeup * crew_days
openloop = demand * crew_days
saved = openloop - mission`,

    javascript: `// Crew water loop: ${A}
const elec = o2 * (2 * 0.018015 / 0.031998)
const demand = potable + hygiene + flush + elec
const recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene
const makeup = Math.max(0, demand - recovered)
const crewDays = crew * tS / 86400 * (1 + reserve)
const mission = makeup * crewDays
const openloop = demand * crewDays
const saved = openloop - mission`,

    typescript: `// Crew water loop: ${A}
const elec: number = o2 * (2 * 0.018015 / 0.031998)
const demand: number = potable + hygiene + flush + elec
const recovered: number = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene
const makeup: number = Math.max(0, demand - recovered)
const crewDays: number = crew * tS / 86400 * (1 + reserve)
const mission: number = makeup * crewDays
const openloop: number = demand * crewDays
const saved: number = openloop - mission`,

    c: `/* Crew water loop: ${A} */
const double elec = o2 * (2.0 * 0.018015 / 0.031998);
const double demand = potable + hygiene + flush + elec;
const double recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene;
const double makeup = fmax(0.0, demand - recovered);
const double crew_days = crew * tS / 86400.0 * (1.0 + reserve);
const double mission = makeup * crew_days;
const double openloop = demand * crew_days;
const double saved = openloop - mission;`,

    cpp: `// Crew water loop: ${A}
const double elec = o2 * (2.0 * 0.018015 / 0.031998);
const double demand = potable + hygiene + flush + elec;
const double recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene;
const double makeup = std::fmax(0.0, demand - recovered);
const double crew_days = crew * tS / 86400.0 * (1.0 + reserve);
const double mission = makeup * crew_days;
const double openloop = demand * crew_days;
const double saved = openloop - mission;`,

    rust: `// Crew water loop: ${A}
let elec = o2 * (2.0 * 0.018015 / 0.031998);
let demand = potable + hygiene + flush + elec;
let recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene;
let makeup = (demand - recovered).max(0.0);
let crew_days = crew * tS / 86400.0 * (1.0 + reserve);
let mission = makeup * crew_days;
let openloop = demand * crew_days;
let saved = openloop - mission;`,

    zig: `// Crew water loop: ${A}
const elec = o2 * (2.0 * 0.018015 / 0.031998);
const demand = potable + hygiene + flush + elec;
const recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene;
const makeup = @max(@as(f64, 0.0), demand - recovered);
const crew_days = crew * tS / 86400.0 * (1.0 + reserve);
const mission = makeup * crew_days;
const openloop = demand * crew_days;
const saved = openloop - mission;`,

    fortran: `! Crew water loop: ${A}
elec = o2 * (2.0d0 * 0.018015d0 / 0.031998d0)
demand = potable + hygiene + flush + elec
recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene
makeup = max(0.0d0, demand - recovered)
crew_days = crew * tS / 86400.0d0 * (1.0d0 + reserve)
mission = makeup * crew_days
openloop = demand * crew_days
saved = openloop - mission`,

    matlab: `% Crew water loop: ${A}
elec = o2 * (2 * 0.018015 / 0.031998);
demand = potable + hygiene + flush + elec;
recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene;
makeup = max(0, demand - recovered);
crew_days = crew * tS / 86400 * (1 + reserve);
mission = makeup * crew_days;
openloop = demand * crew_days;
saved = openloop - mission;`,

    julia: `# Crew water loop: ${A}
elec = o2 * (2 * 0.018015 / 0.031998)
demand = potable + hygiene + flush + elec
recovered = eta_u * (urine + flush) + eta_c * condensate + eta_h * hygiene
makeup = max(0.0, demand - recovered)
crew_days = crew * tS / 86400 * (1 + reserve)
mission = makeup * crew_days
openloop = demand * crew_days
saved = openloop - mission`,

    latex: `% Crew water loop: pure SI, rates per crew-day
\[
  \dot m_{\mathrm{dem}} = \dot m_{\mathrm{pot}} + \dot m_{\mathrm{hyg}} + \dot m_{\mathrm{fl}}
  + \frac{2M_{\mathrm{H_2O}}}{M_{\mathrm{O_2}}}\,\dot m_{\mathrm{O_2}}
\]
\[
  \dot m_{\mathrm{rec}} = \eta_u(\dot m_u + \dot m_{\mathrm{fl}}) + \eta_c \dot m_c + \eta_h \dot m_{\mathrm{hyg}}
\]
\[
  m_{\mathrm{mission}} = \max(0,\ \dot m_{\mathrm{dem}} - \dot m_{\mathrm{rec}})\; N_{\mathrm{crew}}\, \frac{t}{86400}\,(1+r)
\]`,
  },
}
