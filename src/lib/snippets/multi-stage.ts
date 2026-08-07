import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Ideal rocket per stage; constant ve; no gravity/drag losses; stages independent (no automatic payload stacking).'

export const multiStageSnippets: FormulaSnippet = {
  formulaId: 'multi-stage',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# Multi-stage Δv: ${ASSUMPTIONS}
import math

G0 = 9.80665  # m/s²

def multi_stage_dv(stages):
    """stages: list of dicts {isp_s, m0_kg, mf_kg} or {ve, m0, mf}"""
    dvs = []
    for s in stages:
        ve = s.get("ve", s["isp"] * G0)
        m0, mf = s["m0"], s["mf"]
        if not (ve > 0 and m0 > mf > 0):
            raise ValueError("need ve>0 and m0>mf>0")
        dvs.append(ve * math.log(m0 / mf))
    return dvs, sum(dvs)

# Educational 3-stage free-var form (matches UI isp_i, m0_i, mf_i):
# g0 = 9.80665
# dv1 = isp1 * g0 * math.log(m01 / mf1)
# dv2 = isp2 * g0 * math.log(m02 / mf2)
# dv3 = isp3 * g0 * math.log(m03 / mf3)
# dv_total = dv1 + dv2 + dv3`,

    javascript: `// Multi-stage Δv: ${ASSUMPTIONS}
const G0 = 9.80665
function multiStageDv(stages) {
  // stages: [{ isp, m0, mf }] or [{ ve, m0, mf }]
  const dvs = stages.map((s) => {
    const ve = s.ve ?? s.isp * G0
    if (!(ve > 0) || !(s.m0 > s.mf) || !(s.mf > 0)) throw new Error('bad stage')
    return ve * Math.log(s.m0 / s.mf)
  })
  return { dv: dvs, dvTotal: dvs.reduce((a, b) => a + b, 0) }
}
// Free-var form: dv_i = isp_i * g0 * ln(m0_i / mf_i); sum stages`,

    typescript: `// Multi-stage Δv: ${ASSUMPTIONS}
const G0 = 9.80665
type Stage = { isp?: number; ve?: number; m0: number; mf: number }
function multiStageDv(stages: Stage[]) {
  const dv = stages.map((s) => {
    const ve = s.ve ?? (s.isp as number) * G0
    return ve * Math.log(s.m0 / s.mf)
  })
  return { dv, dvTotal: dv.reduce((a, b) => a + b, 0) }
}
// Free-var form: dv1+dv2+dv3 with isp1..isp3, m01..m03, mf1..mf3`,

    c: `/* Multi-stage (3-stage educational): ${ASSUMPTIONS} */
const double g0 = 9.80665;
const double dv1 = isp1 * g0 * log(m01 / mf1);
const double dv2 = isp2 * g0 * log(m02 / mf2);
const double dv3 = isp3 * g0 * log(m03 / mf3);
const double dv_total = dv1 + dv2 + dv3;`,

    cpp: `// Multi-stage (3-stage educational): ${ASSUMPTIONS}
const double g0 = 9.80665;
const double dv1 = isp1 * g0 * std::log(m01 / mf1);
const double dv2 = isp2 * g0 * std::log(m02 / mf2);
const double dv3 = isp3 * g0 * std::log(m03 / mf3);
const double dv_total = dv1 + dv2 + dv3;`,

    rust: `// Multi-stage (3-stage educational): ${ASSUMPTIONS}
let g0 = 9.80665_f64;
let dv1 = isp1 * g0 * (m01 / mf1).ln();
let dv2 = isp2 * g0 * (m02 / mf2).ln();
let dv3 = isp3 * g0 * (m03 / mf3).ln();
let dv_total = dv1 + dv2 + dv3;`,

    zig: `// Multi-stage (3-stage educational): ${ASSUMPTIONS}
const g0: f64 = 9.80665;
const dv1 = isp1 * g0 * @log(m01 / mf1);
const dv2 = isp2 * g0 * @log(m02 / mf2);
const dv3 = isp3 * g0 * @log(m03 / mf3);
const dv_total = dv1 + dv2 + dv3;`,

    fortran: `! Multi-stage (3-stage educational): ${ASSUMPTIONS}
g0 = 9.80665d0
dv1 = isp1 * g0 * log(m01 / mf1)
dv2 = isp2 * g0 * log(m02 / mf2)
dv3 = isp3 * g0 * log(m03 / mf3)
dv_total = dv1 + dv2 + dv3`,

    matlab: `% Multi-stage: ${ASSUMPTIONS}
g0 = 9.80665;
dv1 = isp1 * g0 * log(m01 / mf1);
dv2 = isp2 * g0 * log(m02 / mf2);
dv3 = isp3 * g0 * log(m03 / mf3);
dv_total = dv1 + dv2 + dv3;`,

    julia: `# Multi-stage: ${ASSUMPTIONS}
g0 = 9.80665
dv1 = isp1 * g0 * log(m01 / mf1)
dv2 = isp2 * g0 * log(m02 / mf2)
dv3 = isp3 * g0 * log(m03 / mf3)
dv_total = dv1 + dv2 + dv3`,

    latex: `% Multi-stage ideal rocket
\\[
\\Delta v = \\sum_{i=1}^{N} g_0 I_{\\mathrm{sp},i}\\ln\\frac{m_{0,i}}{m_{f,i}}
= \\sum_{i=1}^{N} v_{e,i}\\ln\\frac{m_{0,i}}{m_{f,i}}
\\]`,
  },
}
