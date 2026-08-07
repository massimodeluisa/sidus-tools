import type { FormulaSnippet } from '../types'

/**
 * Battery energy and endurance: E = C·V·3600 J; t = E/P.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches BatteryTool + lib/physics/power.ts batteryEnergyJ / batteryEndurance.
 * Free vars: C (or C_Ah), V, P.
 */
const A =
  'E = C_Ah · V · 3600 J (Ah → coulombs·V); endurance t = E/P at constant load. SI.'

export const batterySnippets: FormulaSnippet = {
  formulaId: 'battery',
  assumptions: A,
  code: {
    python: `# Battery energy / endurance: ${A}
E = C_Ah * V * 3600
t = E / P`,

    javascript: `// Battery energy / endurance: ${A}
const E = C_Ah * V * 3600
const t = E / P`,

    typescript: `// Battery energy / endurance: ${A}
const E: number = C_Ah * V * 3600
const t: number = E / P`,

    c: `/* Battery energy / endurance: ${A} */
const double E = C_Ah * V * 3600.0;
const double t = E / P;`,

    cpp: `// Battery energy / endurance: ${A}
const double E = C_Ah * V * 3600.0;
const double t = E / P;`,

    rust: `// Battery energy / endurance: ${A}
let e = C_Ah * V * 3600.0;
let t = e / P;`,

    zig: `// Battery energy / endurance: ${A}
const E = C_Ah * V * 3600.0;
const t = E / P;`,

    fortran: `! Battery energy / endurance: ${A}
E = C_Ah * V * 3600.0d0
t = E / P`,

    matlab: `% Battery energy / endurance: ${A}
E = C_Ah * V * 3600;
t = E / P;`,

    julia: `# Battery energy / endurance: ${A}
E = C_Ah * V * 3600
t = E / P`,

    latex: `% Battery energy / endurance: pure SI
\\[
  E = C_{\\mathrm{Ah}} V \\cdot 3600,\\quad
  t = E/P
\\]`,
  },
}
