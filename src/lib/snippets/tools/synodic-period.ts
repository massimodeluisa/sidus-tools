import type { FormulaSnippet } from '../types'

/**
 * Synodic period of two circular coplanar orbits:
 * T_syn = 2π / |n2 − n1|, n = √(μ/r³).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches SynodicPeriodTool + lib/physics/mission.ts synodicPeriod.
 * Free vars: mu, r1, r2.
 */
const A =
  'Circular coplanar mean motions; T_syn = 2π/|n2−n1|, n=√(μ/r³). Pure SI.'

export const synodicSnippets: FormulaSnippet = {
  formulaId: 'synodic-period',
  assumptions: A,
  code: {
    python: `# Synodic period: ${A}
import math
n1 = math.sqrt(mu / r1**3)
n2 = math.sqrt(mu / r2**3)
T_syn = 2 * math.pi / abs(n2 - n1)`,

    javascript: `// Synodic period: ${A}
const n1 = Math.sqrt(mu / r1 ** 3)
const n2 = Math.sqrt(mu / r2 ** 3)
const tSyn = (2 * Math.PI) / Math.abs(n2 - n1)`,

    typescript: `// Synodic period: ${A}
const n1: number = Math.sqrt(mu / r1 ** 3)
const n2: number = Math.sqrt(mu / r2 ** 3)
const tSyn: number = (2 * Math.PI) / Math.abs(n2 - n1)`,

    c: `/* Synodic period: ${A} */
const double n1 = sqrt(mu / (r1 * r1 * r1));
const double n2 = sqrt(mu / (r2 * r2 * r2));
const double t_syn = 2.0 * M_PI / fabs(n2 - n1);`,

    cpp: `// Synodic period: ${A}
const double n1 = std::sqrt(mu / (r1 * r1 * r1));
const double n2 = std::sqrt(mu / (r2 * r2 * r2));
const double t_syn = 2.0 * M_PI / std::fabs(n2 - n1);`,

    rust: `// Synodic period: ${A}
let n1 = (mu / (r1 * r1 * r1)).sqrt();
let n2 = (mu / (r2 * r2 * r2)).sqrt();
let t_syn = 2.0 * std::f64::consts::PI / (n2 - n1).abs();`,

    zig: `// Synodic period: ${A}
const n1 = std.math.sqrt(mu / (r1 * r1 * r1));
const n2 = std.math.sqrt(mu / (r2 * r2 * r2));
const t_syn = 2.0 * std.math.pi / @abs(n2 - n1);`,

    fortran: `! Synodic period: ${A}
n1 = sqrt(mu / (r1 * r1 * r1))
n2 = sqrt(mu / (r2 * r2 * r2))
t_syn = 2.0d0 * 3.141592653589793d0 / abs(n2 - n1)`,

    matlab: `% Synodic period: ${A}
n1 = sqrt(mu / r1^3);
n2 = sqrt(mu / r2^3);
T_syn = 2 * pi / abs(n2 - n1);`,

    julia: `# Synodic period: ${A}
n1 = sqrt(mu / r1^3)
n2 = sqrt(mu / r2^3)
T_syn = 2 * π / abs(n2 - n1)`,

    latex: `% Synodic period: pure SI
\\[
  n_{i} = \\sqrt{\\frac{\\mu}{r_{i}^{3}}},\\quad
  T_{\\mathrm{syn}} = \\frac{2\\pi}{|n_{2}-n_{1}|}
\\]`,
  },
}
