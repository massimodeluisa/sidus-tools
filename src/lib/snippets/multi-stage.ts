import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Ideal rocket per stage; constant ve within each burn; no gravity/drag losses; stages independent (no automatic payload stacking).'

export const multiStageSnippets: FormulaSnippet = {
  formulaId: 'multi-stage',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# Multi-stage Δv: ${ASSUMPTIONS}
import math

G0 = 9.80665  # m/s²

def _log_mass_ratio(m0, mf):
    relative_difference = (m0 - mf) / mf
    if relative_difference <= 0.5:
        return math.log1p(relative_difference)
    return math.log(m0) - math.log(mf)

def multi_stage_dv(stages):
    """Accept {isp_s,m0_kg,mf_kg}, {ve,m0,mf}, or legacy {isp,m0,mf}; SI units."""
    dvs = []
    for s in stages:
        if "ve" in s:
            ve, m0, mf = s["ve"], s["m0"], s["mf"]
        elif "isp_s" in s:
            ve, m0, mf = s["isp_s"] * G0, s["m0_kg"], s["mf_kg"]
        else:
            # Preserve the short-key form used by the JavaScript helper.
            ve, m0, mf = s["isp"] * G0, s["m0"], s["mf"]
        if not (ve > 0 and m0 > mf > 0):
            raise ValueError("need ve>0 and m0>mf>0")
        dvs.append(ve * _log_mass_ratio(m0, mf))
    return dvs, sum(dvs)

dv1 = isp1 * G0 * _log_mass_ratio(m01, mf1)
dv2 = isp2 * G0 * _log_mass_ratio(m02, mf2) if stages >= 2 else 0.0
dv3 = isp3 * G0 * _log_mass_ratio(m03, mf3) if stages >= 3 else 0.0
dv_total = dv1 + dv2 + dv3`,

    javascript: `// Multi-stage Δv: ${ASSUMPTIONS}
const G0 = 9.80665
function logMassRatio(m0, mf) {
  const relativeDifference = (m0 - mf) / mf
  if (relativeDifference <= 0.5) return Math.log1p(relativeDifference)
  return Math.log(m0) - Math.log(mf)
}

function multiStageDv(stages) {
  // stages: [{ isp_s, m0_kg, mf_kg }], [{ isp, m0, mf }], or [{ ve, m0, mf }]
  const dvs = stages.map((s) => {
    const ve = s.ve ?? (s.isp_s ?? s.isp) * G0
    const m0 = s.m0_kg ?? s.m0
    const mf = s.mf_kg ?? s.mf
    if (!(ve > 0) || !(m0 > mf) || !(mf > 0)) throw new Error('bad stage')
    return ve * logMassRatio(m0, mf)
  })
  return { dv: dvs, dvTotal: dvs.reduce((a, b) => a + b, 0) }
}

const dv1 = isp1 * G0 * logMassRatio(m01, mf1)
const dv2 = stages >= 2 ? isp2 * G0 * logMassRatio(m02, mf2) : 0
const dv3 = stages >= 3 ? isp3 * G0 * logMassRatio(m03, mf3) : 0
const dv_total = dv1 + dv2 + dv3`,

    typescript: `// Multi-stage Δv: ${ASSUMPTIONS}
const G0 = 9.80665
function logMassRatio(m0: number, mf: number): number {
  const relativeDifference = (m0 - mf) / mf
  if (relativeDifference <= 0.5) return Math.log1p(relativeDifference)
  return Math.log(m0) - Math.log(mf)
}

type Stage = { isp?: number; ve?: number; m0: number; mf: number }
function multiStageDv(stages: Stage[]) {
  const dv = stages.map((s) => {
    const ve = s.ve ?? (s.isp as number) * G0
    return ve * logMassRatio(s.m0, s.mf)
  })
  return { dv, dvTotal: dv.reduce((a, b) => a + b, 0) }
}

const dv1: number = isp1 * G0 * logMassRatio(m01, mf1)
const dv2: number = stages >= 2 ? isp2 * G0 * logMassRatio(m02, mf2) : 0
const dv3: number = stages >= 3 ? isp3 * G0 * logMassRatio(m03, mf3) : 0
const dv_total: number = dv1 + dv2 + dv3`,

    c: `/* Multi-stage ideal rocket: ${ASSUMPTIONS} */
const double g0 = 9.80665;
const double dv1 = isp1 * g0 * (((m01 - mf1) / mf1 <= 0.5) ? log1p((m01 - mf1) / mf1) : log(m01) - log(mf1));
const double dv2 = stages >= 2.0 ? isp2 * g0 * (((m02 - mf2) / mf2 <= 0.5) ? log1p((m02 - mf2) / mf2) : log(m02) - log(mf2)) : 0.0;
const double dv3 = stages >= 3.0 ? isp3 * g0 * (((m03 - mf3) / mf3 <= 0.5) ? log1p((m03 - mf3) / mf3) : log(m03) - log(mf3)) : 0.0;
const double dv_total = dv1 + dv2 + dv3;`,

    cpp: `// Multi-stage ideal rocket: ${ASSUMPTIONS}
const double g0 = 9.80665;
const double dv1 = isp1 * g0 * (((m01 - mf1) / mf1 <= 0.5) ? std::log1p((m01 - mf1) / mf1) : std::log(m01) - std::log(mf1));
const double dv2 = stages >= 2.0 ? isp2 * g0 * (((m02 - mf2) / mf2 <= 0.5) ? std::log1p((m02 - mf2) / mf2) : std::log(m02) - std::log(mf2)) : 0.0;
const double dv3 = stages >= 3.0 ? isp3 * g0 * (((m03 - mf3) / mf3 <= 0.5) ? std::log1p((m03 - mf3) / mf3) : std::log(m03) - std::log(mf3)) : 0.0;
const double dv_total = dv1 + dv2 + dv3;`,

    rust: `// Multi-stage ideal rocket: ${ASSUMPTIONS}
let g0 = 9.80665_f64;
let dv1 = isp1 * g0 * (if (m01 - mf1) / mf1 <= 0.5 {
    ((m01 - mf1) / mf1).ln_1p()
} else {
    m01.ln() - mf1.ln()
});
let dv2 = if stages >= 2.0 { isp2 * g0 * (if (m02 - mf2) / mf2 <= 0.5 {
    ((m02 - mf2) / mf2).ln_1p()
} else {
    m02.ln() - mf2.ln()
}) } else { 0.0 };
let dv3 = if stages >= 3.0 { isp3 * g0 * (if (m03 - mf3) / mf3 <= 0.5 {
    ((m03 - mf3) / mf3).ln_1p()
} else {
    m03.ln() - mf3.ln()
}) } else { 0.0 };
let dv_total = dv1 + dv2 + dv3;`,

    zig: `// Multi-stage ideal rocket: ${ASSUMPTIONS}
const g0: f64 = 9.80665;
const dv1 = isp1 * g0 * (if ((m01 - mf1) / mf1 <= 0.5)
    @log(1.0 + (m01 - mf1) / mf1) - (((1.0 + (m01 - mf1) / mf1) - 1.0) - (m01 - mf1) / mf1) / (1.0 + (m01 - mf1) / mf1)
else
    @log(m01) - @log(mf1));
const dv2 = if (stages >= 2.0) isp2 * g0 * (if ((m02 - mf2) / mf2 <= 0.5)
    @log(1.0 + (m02 - mf2) / mf2) - (((1.0 + (m02 - mf2) / mf2) - 1.0) - (m02 - mf2) / mf2) / (1.0 + (m02 - mf2) / mf2)
else
    @log(m02) - @log(mf2)) else 0.0;
const dv3 = if (stages >= 3.0) isp3 * g0 * (if ((m03 - mf3) / mf3 <= 0.5)
    @log(1.0 + (m03 - mf3) / mf3) - (((1.0 + (m03 - mf3) / mf3) - 1.0) - (m03 - mf3) / mf3) / (1.0 + (m03 - mf3) / mf3)
else
    @log(m03) - @log(mf3)) else 0.0;
const dv_total = dv1 + dv2 + dv3;`,

    fortran: `! Multi-stage ideal rocket: ${ASSUMPTIONS}
g0 = 9.80665d0
if ((m01 - mf1) / mf1 <= 0.5d0) then
  dv1 = isp1 * g0 * (log(1.0d0 + (m01 - mf1) / mf1) &
    - (((1.0d0 + (m01 - mf1) / mf1) - 1.0d0) - (m01 - mf1) / mf1) / (1.0d0 + (m01 - mf1) / mf1))
else
  dv1 = isp1 * g0 * (log(m01) - log(mf1))
end if
dv2 = 0.0d0
if (stages >= 2.0d0) then
  if ((m02 - mf2) / mf2 <= 0.5d0) then
    dv2 = isp2 * g0 * (log(1.0d0 + (m02 - mf2) / mf2) &
      - (((1.0d0 + (m02 - mf2) / mf2) - 1.0d0) - (m02 - mf2) / mf2) / (1.0d0 + (m02 - mf2) / mf2))
  else
    dv2 = isp2 * g0 * (log(m02) - log(mf2))
  end if
end if
dv3 = 0.0d0
if (stages >= 3.0d0) then
  if ((m03 - mf3) / mf3 <= 0.5d0) then
    dv3 = isp3 * g0 * (log(1.0d0 + (m03 - mf3) / mf3) &
      - (((1.0d0 + (m03 - mf3) / mf3) - 1.0d0) - (m03 - mf3) / mf3) / (1.0d0 + (m03 - mf3) / mf3))
  else
    dv3 = isp3 * g0 * (log(m03) - log(mf3))
  end if
end if
dv_total = dv1 + dv2 + dv3`,

    matlab: `% Multi-stage: ${ASSUMPTIONS}
g0 = 9.80665;
if (m01 - mf1) / mf1 <= 0.5
  dv1 = isp1 * g0 * log1p((m01 - mf1) / mf1);
else
  dv1 = isp1 * g0 * (log(m01) - log(mf1));
end
if stages >= 2
  if (m02 - mf2) / mf2 <= 0.5
    dv2 = isp2 * g0 * log1p((m02 - mf2) / mf2);
  else
    dv2 = isp2 * g0 * (log(m02) - log(mf2));
  end
else
  dv2 = 0;
end
if stages >= 3
  if (m03 - mf3) / mf3 <= 0.5
    dv3 = isp3 * g0 * log1p((m03 - mf3) / mf3);
  else
    dv3 = isp3 * g0 * (log(m03) - log(mf3));
  end
else
  dv3 = 0;
end
dv_total = dv1 + dv2 + dv3;`,

    julia: `# Multi-stage: ${ASSUMPTIONS}
g0 = 9.80665
dv1 = isp1 * g0 * ((m01 - mf1) / mf1 <= 0.5 ? log1p((m01 - mf1) / mf1) : log(m01) - log(mf1))
dv2 = stages >= 2 ? isp2 * g0 * ((m02 - mf2) / mf2 <= 0.5 ? log1p((m02 - mf2) / mf2) : log(m02) - log(mf2)) : 0.0
dv3 = stages >= 3 ? isp3 * g0 * ((m03 - mf3) / mf3 <= 0.5 ? log1p((m03 - mf3) / mf3) : log(m03) - log(mf3)) : 0.0
dv_total = dv1 + dv2 + dv3`,

    latex: `% Multi-stage ideal rocket
\\[
\\Delta v = \\sum_{i=1}^{N} g_0 I_{\\mathrm{sp},i}\\ln\\frac{m_{0,i}}{m_{f,i}}
= \\sum_{i=1}^{N} v_{e,i}\\ln\\frac{m_{0,i}}{m_{f,i}}
\\]`,
  },
}
