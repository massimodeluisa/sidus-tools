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

def ln_mass_ratio(m0, mf):
    ratio = m0 / mf
    if ratio < 1.000001 and ratio > 0.999999:
        return math.log1p((m0 - mf) / mf)
    return math.log(ratio)

def multi_stage_dv(stages):
    """stages: list of dicts, each one of:
    {isp_s, m0_kg, mf_kg}, {isp, m0, mf}, or {ve, m0, mf}.
    ve is used as-is when present; otherwise ve = Isp * g0.
    """
    dvs = []
    for s in stages:
        m0 = s["m0_kg"] if "m0_kg" in s else s["m0"]
        mf = s["mf_kg"] if "mf_kg" in s else s["mf"]
        if "ve" in s:
            ve = s["ve"]
        else:
            isp = s["isp_s"] if "isp_s" in s else s["isp"]
            ve = isp * G0
        if not (ve > 0 and m0 > mf > 0):
            raise ValueError("need ve>0 and m0>mf>0")
        dvs.append(ve * ln_mass_ratio(m0, mf))
    return dvs, sum(dvs)

# Only the first n stages are active; inactive stages are never evaluated.
n = min(3, max(1, int(math.floor(stages))))
dv1 = isp1 * G0 * ln_mass_ratio(m01, mf1)
dv2 = isp2 * G0 * ln_mass_ratio(m02, mf2) if n >= 2 else 0.0
dv3 = isp3 * G0 * ln_mass_ratio(m03, mf3) if n >= 3 else 0.0
dv_total = dv1 + dv2 + dv3`,

    javascript: `// Multi-stage Δv: ${ASSUMPTIONS}
const G0 = 9.80665
function lnMassRatio(m0, mf) {
  const ratio = m0 / mf
  if (ratio < 1.000001 && ratio > 0.999999) return Math.log1p((m0 - mf) / mf)
  return Math.log(ratio)
}
function multiStageDv(stages) {
  // Each stage is one of:
  //   { isp_s, m0_kg, mf_kg }
  //   { isp, m0, mf }
  //   { ve, m0, mf }  (ve wins; isp is never read)
  const dvs = stages.map((s) => {
    const m0 = s.m0_kg ?? s.m0
    const mf = s.mf_kg ?? s.mf
    const ve = s.ve ?? (s.isp_s ?? s.isp) * G0
    if (!(ve > 0) || !(m0 > mf) || !(mf > 0)) throw new Error('bad stage')
    return ve * lnMassRatio(m0, mf)
  })
  return { dv: dvs, dvTotal: dvs.reduce((a, b) => a + b, 0) }
}

// Only the first n stages are active; inactive stages are never evaluated.
const n = Math.min(3, Math.max(1, Math.floor(stages)))
const dv1 = isp1 * G0 * lnMassRatio(m01, mf1)
const dv2 = n >= 2 ? isp2 * G0 * lnMassRatio(m02, mf2) : 0
const dv3 = n >= 3 ? isp3 * G0 * lnMassRatio(m03, mf3) : 0
const dv_total = dv1 + dv2 + dv3`,

    typescript: `// Multi-stage Δv: ${ASSUMPTIONS}
const G0 = 9.80665
function lnMassRatio(m0: number, mf: number): number {
  const ratio = m0 / mf
  if (ratio < 1.000001 && ratio > 0.999999) return Math.log1p((m0 - mf) / mf)
  return Math.log(ratio)
}
type Stage = {
  isp_s?: number
  isp?: number
  ve?: number
  m0_kg?: number
  m0?: number
  mf_kg?: number
  mf?: number
}
function multiStageDv(stages: Stage[]) {
  // Each stage is one of:
  //   { isp_s, m0_kg, mf_kg }
  //   { isp, m0, mf }
  //   { ve, m0, mf }  (ve wins; isp is never read)
  const dv = stages.map((s) => {
    const m0 = (s.m0_kg ?? s.m0) as number
    const mf = (s.mf_kg ?? s.mf) as number
    const ve = s.ve ?? (s.isp_s ?? (s.isp as number)) * G0
    return ve * lnMassRatio(m0, mf)
  })
  return { dv, dvTotal: dv.reduce((a, b) => a + b, 0) }
}

// Only the first n stages are active; inactive stages are never evaluated.
const n: number = Math.min(3, Math.max(1, Math.floor(stages)))
const dv1: number = isp1 * G0 * lnMassRatio(m01, mf1)
const dv2: number = n >= 2 ? isp2 * G0 * lnMassRatio(m02, mf2) : 0
const dv3: number = n >= 3 ? isp3 * G0 * lnMassRatio(m03, mf3) : 0
const dv_total: number = dv1 + dv2 + dv3`,

    c: `/* Multi-stage (up to 3 active stages): ${ASSUMPTIONS} */
const double g0 = 9.80665;
const int n_raw = (int)floor(stages);
const int n = n_raw < 1 ? 1 : (n_raw > 3 ? 3 : n_raw);
const double r1 = m01 / mf1;
const double ln1 = (r1 < 1.000001 && r1 > 0.999999) ? log1p((m01 - mf1) / mf1) : log(r1);
const double dv1 = isp1 * g0 * ln1;
const double dv2 = n >= 2 ? isp2 * g0 * (((m02 / mf2) < 1.000001 && (m02 / mf2) > 0.999999) ? log1p((m02 - mf2) / mf2) : log(m02 / mf2)) : 0.0;
const double dv3 = n >= 3 ? isp3 * g0 * (((m03 / mf3) < 1.000001 && (m03 / mf3) > 0.999999) ? log1p((m03 - mf3) / mf3) : log(m03 / mf3)) : 0.0;
const double dv_total = dv1 + dv2 + dv3;`,

    cpp: `// Multi-stage (up to 3 active stages): ${ASSUMPTIONS}
const double g0 = 9.80665;
const int n_raw = static_cast<int>(std::floor(stages));
const int n = n_raw < 1 ? 1 : (n_raw > 3 ? 3 : n_raw);
const double r1 = m01 / mf1;
const double ln1 = (r1 < 1.000001 && r1 > 0.999999) ? std::log1p((m01 - mf1) / mf1) : std::log(r1);
const double dv1 = isp1 * g0 * ln1;
const double dv2 = n >= 2 ? isp2 * g0 * (((m02 / mf2) < 1.000001 && (m02 / mf2) > 0.999999) ? std::log1p((m02 - mf2) / mf2) : std::log(m02 / mf2)) : 0.0;
const double dv3 = n >= 3 ? isp3 * g0 * (((m03 / mf3) < 1.000001 && (m03 / mf3) > 0.999999) ? std::log1p((m03 - mf3) / mf3) : std::log(m03 / mf3)) : 0.0;
const double dv_total = dv1 + dv2 + dv3;`,

    rust: `// Multi-stage (up to 3 active stages): ${ASSUMPTIONS}
let g0 = 9.80665_f64;
let n_raw = stages.floor() as i64;
let n = n_raw.clamp(1, 3);
let ratio1 = m01 / mf1;
let ln1 = if ratio1 < 1.000001 && ratio1 > 0.999999 { ((m01 - mf1) / mf1).ln_1p() } else { ratio1.ln() };
let dv1 = isp1 * g0 * ln1;
let dv2 = if n >= 2 {
    let ratio2 = m02 / mf2;
    let ln2 = if ratio2 < 1.000001 && ratio2 > 0.999999 { ((m02 - mf2) / mf2).ln_1p() } else { ratio2.ln() };
    isp2 * g0 * ln2
} else { 0.0 };
let dv3 = if n >= 3 {
    let ratio3 = m03 / mf3;
    let ln3 = if ratio3 < 1.000001 && ratio3 > 0.999999 { ((m03 - mf3) / mf3).ln_1p() } else { ratio3.ln() };
    isp3 * g0 * ln3
} else { 0.0 };
let dv_total = dv1 + dv2 + dv3;`,

    zig: `// Multi-stage (up to 3 active stages): ${ASSUMPTIONS}
const g0: f64 = 9.80665;
const n_raw = @floor(stages);
const n = @min(@as(f64, 3), @max(@as(f64, 1), n_raw));
const ratio1 = m01 / mf1;
const ln1 = if (ratio1 < 1.000001 and ratio1 > 0.999999) std.math.log1p((m01 - mf1) / mf1) else @log(ratio1);
const dv1 = isp1 * g0 * ln1;
const dv2 = if (n >= 2) isp2 * g0 * (if ((m02 / mf2) < 1.000001 and (m02 / mf2) > 0.999999) std.math.log1p((m02 - mf2) / mf2) else @log(m02 / mf2)) else 0.0;
const dv3 = if (n >= 3) isp3 * g0 * (if ((m03 / mf3) < 1.000001 and (m03 / mf3) > 0.999999) std.math.log1p((m03 - mf3) / mf3) else @log(m03 / mf3)) else 0.0;
const dv_total = dv1 + dv2 + dv3;`,

    fortran: `! Multi-stage (up to 3 active stages): ${ASSUMPTIONS}
g0 = 9.80665d0
n = min(3, max(1, floor(stages)))
dv1_ratio = m01 / mf1
if (dv1_ratio < 1.000001d0 .and. dv1_ratio > 0.999999d0) then
  xrel = (m01 - mf1) / mf1
  dv1 = isp1 * g0 * (xrel - 0.5d0 * xrel * xrel + xrel * xrel * xrel / 3.0d0)
else
  dv1 = isp1 * g0 * log(dv1_ratio)
endif
! mf2/mf3 are parameters and are 0 when that stage is inactive. A parameter
! divisor of 0 is a compile error even inside the untaken branch, so divide
! the variable copy. log(1+xrel) is log(m0/mf) without another parameter division.
den2 = mf2
if (n >= 2) then
  xrel = (m02 - den2) / den2
  dv2 = isp2 * g0 * (xrel - 0.5d0 * xrel * xrel + xrel * xrel * xrel / 3.0d0)
  if (xrel >= 0.000001d0 .or. xrel <= -0.000001d0) dv2 = isp2 * g0 * log(1.0d0 + xrel)
else
  dv2 = 0.0d0
endif
den3 = mf3
if (n >= 3) then
  xrel = (m03 - den3) / den3
  dv3 = isp3 * g0 * (xrel - 0.5d0 * xrel * xrel + xrel * xrel * xrel / 3.0d0)
  if (xrel >= 0.000001d0 .or. xrel <= -0.000001d0) dv3 = isp3 * g0 * log(1.0d0 + xrel)
else
  dv3 = 0.0d0
endif
dv_total = dv1 + dv2 + dv3`,

    matlab: `% Multi-stage (up to 3 active stages): ${ASSUMPTIONS}
g0 = 9.80665;
n = min(3, max(1, floor(stages)));
dv1_ratio = m01 / mf1;
if dv1_ratio < 1.000001 && dv1_ratio > 0.999999
  dv1 = isp1 * g0 * log1p((m01 - mf1) / mf1);
else
  dv1 = isp1 * g0 * log(dv1_ratio);
end
if n >= 2
  if (m02 / mf2) < 1.000001 && (m02 / mf2) > 0.999999
    dv2 = isp2 * g0 * log1p((m02 - mf2) / mf2);
  else
    dv2 = isp2 * g0 * log(m02 / mf2);
  end
else
  dv2 = 0;
end
if n >= 3
  if (m03 / mf3) < 1.000001 && (m03 / mf3) > 0.999999
    dv3 = isp3 * g0 * log1p((m03 - mf3) / mf3);
  else
    dv3 = isp3 * g0 * log(m03 / mf3);
  end
else
  dv3 = 0;
end
dv_total = dv1 + dv2 + dv3;`,

    julia: `# Multi-stage (up to 3 active stages): ${ASSUMPTIONS}
g0 = 9.80665
n = min(3, max(1, floor(Int, stages)))
dv1_ratio = m01 / mf1
dv1 = isp1 * g0 * (dv1_ratio < 1.000001 && dv1_ratio > 0.999999 ? log1p((m01 - mf1) / mf1) : log(dv1_ratio))
dv2 = n >= 2 ? isp2 * g0 * (m02 / mf2 < 1.000001 && m02 / mf2 > 0.999999 ? log1p((m02 - mf2) / mf2) : log(m02 / mf2)) : 0.0
dv3 = n >= 3 ? isp3 * g0 * (m03 / mf3 < 1.000001 && m03 / mf3 > 0.999999 ? log1p((m03 - mf3) / mf3) : log(m03 / mf3)) : 0.0
dv_total = dv1 + dv2 + dv3`,

    latex: `% Multi-stage ideal rocket. Near unit mass ratio use \\log(1+(m_{0}-m_{f})/m_{f}).
\\[
\\Delta v = \\sum_{i=1}^{N} g_0 I_{\\mathrm{sp},i}\\ln\\frac{m_{0,i}}{m_{f,i}}
= \\sum_{i=1}^{N} v_{e,i}\\ln\\frac{m_{0,i}}{m_{f,i}}
\\]`,
  },
}
