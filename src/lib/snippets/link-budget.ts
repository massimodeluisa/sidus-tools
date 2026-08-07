import type { FormulaSnippet } from './types'

/**
 * One-way free-space Friis link budget (dB) + optional C/N₀.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches LinkBudgetTool + lib/physics/link.ts linkBudget.
 * Free vars (snake_case for Python / systems): pt_w, gt_dbi, gr_dbi, f_hz,
 * range_km, other_loss_db, t_sys_k, required_cn0_dbhz.
 */
const A = 'One-way free-space Friis; isotropic gains dBi; optional k T_sys for C/N₀. SI/dB.'

export const linkBudgetSnippets: FormulaSnippet = {
  formulaId: 'link-budget',
  assumptions: A,
  code: {
    python: `# RF link budget: ${A}
import math
lfs_db = 20 * math.log10(range_km) + 20 * math.log10(f_hz / 1e6) + 32.44
pt_dbw = 10 * math.log10(pt_w)
eirp = pt_dbw + gt_dbi
pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db
pr_w = 10 ** (pr_dbw / 10)
k = 1.380649e-23
cn0_dbhz = 10 * math.log10(pr_w / (k * t_sys_k))
margin = cn0_dbhz - required_cn0_dbhz
lam = 299792458 / f_hz`,

    javascript: `// RF link budget: ${A}
const lfsDb = 20 * Math.log10(range_km) + 20 * Math.log10(f_hz / 1e6) + 32.44
const ptDbw = 10 * Math.log10(pt_w)
const eirp = ptDbw + gt_dbi
const prDbw = eirp + gr_dbi - lfsDb - other_loss_db
const prW = 10 ** (prDbw / 10)
const k = 1.380649e-23
const cn0DbHz = 10 * Math.log10(prW / (k * t_sys_k))
const margin = cn0DbHz - required_cn0_dbhz
const lam = 299792458 / f_hz`,

    typescript: `// RF link budget: ${A}
const lfsDb: number = 20 * Math.log10(range_km) + 20 * Math.log10(f_hz / 1e6) + 32.44
const ptDbw: number = 10 * Math.log10(pt_w)
const eirp: number = ptDbw + gt_dbi
const prDbw: number = eirp + gr_dbi - lfsDb - other_loss_db
const prW: number = 10 ** (prDbw / 10)
const k: number = 1.380649e-23
const cn0DbHz: number = 10 * Math.log10(prW / (k * t_sys_k))
const margin: number = cn0DbHz - required_cn0_dbhz
const lam: number = 299792458 / f_hz`,

    c: `/* RF link budget: ${A} */
const double lfs_db = 20.0 * log10(range_km) + 20.0 * log10(f_hz / 1e6) + 32.44;
const double pt_dbw = 10.0 * log10(pt_w);
const double eirp = pt_dbw + gt_dbi;
const double pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db;
const double pr_w = pow(10.0, pr_dbw / 10.0);
const double k = 1.380649e-23;
const double cn0_dbhz = 10.0 * log10(pr_w / (k * t_sys_k));
const double margin = cn0_dbhz - required_cn0_dbhz;
const double lam = 299792458.0 / f_hz;`,

    cpp: `// RF link budget: ${A}
const double lfs_db = 20.0 * std::log10(range_km) + 20.0 * std::log10(f_hz / 1e6) + 32.44;
const double pt_dbw = 10.0 * std::log10(pt_w);
const double eirp = pt_dbw + gt_dbi;
const double pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db;
const double pr_w = std::pow(10.0, pr_dbw / 10.0);
const double k = 1.380649e-23;
const double cn0_dbhz = 10.0 * std::log10(pr_w / (k * t_sys_k));
const double margin = cn0_dbhz - required_cn0_dbhz;
const double lam = 299792458.0 / f_hz;`,

    rust: `// RF link budget: ${A}
let lfs_db = 20.0 * range_km.log10() + 20.0 * (f_hz / 1e6).log10() + 32.44;
let pt_dbw = 10.0 * pt_w.log10();
let eirp = pt_dbw + gt_dbi;
let pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db;
let pr_w = 10.0_f64.powf(pr_dbw / 10.0);
let k = 1.380649e-23_f64;
let cn0_dbhz = 10.0 * (pr_w / (k * t_sys_k)).log10();
let margin = cn0_dbhz - required_cn0_dbhz;
let lam = 299792458.0 / f_hz;`,

    zig: `// RF link budget: ${A}
const lfs_db = 20.0 * std.math.log10(range_km) + 20.0 * std.math.log10(f_hz / 1e6) + 32.44;
const pt_dbw = 10.0 * std.math.log10(pt_w);
const eirp = pt_dbw + gt_dbi;
const pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db;
const pr_w = std.math.pow(f64, 10.0, pr_dbw / 10.0);
const k: f64 = 1.380649e-23;
const cn0_dbhz = 10.0 * std.math.log10(pr_w / (k * t_sys_k));
const margin = cn0_dbhz - required_cn0_dbhz;
const lam = 299792458.0 / f_hz;`,

    fortran: `! RF link budget: ${A}
lfs_db = 20.0d0 * log10(range_km) + 20.0d0 * log10(f_hz / 1.0d6) + 32.44d0
pt_dbw = 10.0d0 * log10(pt_w)
eirp = pt_dbw + gt_dbi
pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db
pr_w = 10.0d0**(pr_dbw / 10.0d0)
k = 1.380649d-23
cn0_dbhz = 10.0d0 * log10(pr_w / (k * t_sys_k))
margin = cn0_dbhz - required_cn0_dbhz
lam = 299792458.0d0 / f_hz`,

    matlab: `% RF link budget: ${A}
lfs_db = 20*log10(range_km) + 20*log10(f_hz/1e6) + 32.44;
pt_dbw = 10*log10(pt_w);
eirp = pt_dbw + gt_dbi;
pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db;
pr_w = 10.^(pr_dbw/10);
k = 1.380649e-23;
cn0_dbhz = 10*log10(pr_w / (k * t_sys_k));
margin = cn0_dbhz - required_cn0_dbhz;
lam = 299792458 / f_hz;`,

    julia: `# RF link budget: ${A}
lfs_db = 20 * log10(range_km) + 20 * log10(f_hz / 1e6) + 32.44
pt_dbw = 10 * log10(pt_w)
eirp = pt_dbw + gt_dbi
pr_dbw = eirp + gr_dbi - lfs_db - other_loss_db
pr_w = 10^(pr_dbw / 10)
k = 1.380649e-23
cn0_dbhz = 10 * log10(pr_w / (k * t_sys_k))
margin = cn0_dbhz - required_cn0_dbhz
lam = 299792458 / f_hz`,

    latex: `% RF link budget: pure SI / dB
\\[
  L_{\\mathrm{fs}}=20\\log_{10}d_{\\mathrm{km}}+20\\log_{10}f_{\\mathrm{MHz}}+32.44
\\]
\\[
  P_r^{\\mathrm{dBW}}=\\mathrm{EIRP}+G_r-L_{\\mathrm{fs}}-L_{\\mathrm{other}},\\quad
  C/N_0 = P_r/(k T_{\\mathrm{sys}})
\\]`,
  },
}
