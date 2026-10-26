import type { FormulaSnippet } from '../types'

const A =
  'GDOP, PDOP, HDOP, and VDOP are square roots of sums of the diagonal of (H^T H)^{-1}. H rows are the normalized line-of-sight vectors in local East, North, Up plus a clock column of 1. Rank-deficient geometry is rejected. SI.'

export const gnssGeometryGdopSnippets: FormulaSnippet = {
  formulaId: 'gnss-geometry-gdop',
  assumptions: A,
  code: {
    python: `# ${A}
import math

dop_touch = ux1 + uy1 + uz1 + ux2 + uy2 + uz2 + ux3 + uy3 + uz3 + ux4 + uy4 + uz4
gdop = float("nan")
pdop = float("nan")
hdop = float("nan")
vdop = float("nan")

def sidus_gdop():
    global gdop, pdop, hdop, vdop
    los = [(ux1, uy1, uz1), (ux2, uy2, uz2), (ux3, uy3, uz3), (ux4, uy4, uz4)]
    H = []
    for ux, uy, uz in los:
        nrm = math.hypot(ux, uy, uz)
        if not nrm > 0.0:
            return
        H.append((ux / nrm, uy / nrm, uz / nrm, 1.0))
    M = [[0.0] * 4 for _ in range(4)]
    B = [[1.0 if r == c else 0.0 for c in range(4)] for r in range(4)]
    for r in range(4):
        for c in range(4):
            M[r][c] = sum(H[k][r] * H[k][c] for k in range(4))
    for col in range(4):
        piv = col
        for r in range(col + 1, 4):
            if abs(M[r][col]) > abs(M[piv][col]):
                piv = r
        if abs(M[piv][col]) < 1e-14:
            return
        if piv != col:
            M[col], M[piv] = M[piv], M[col]
            B[col], B[piv] = B[piv], B[col]
        div = M[col][col]
        for j in range(4):
            M[col][j] /= div
            B[col][j] /= div
        for r in range(4):
            if r == col:
                continue
            f = M[r][col]
            for j in range(4):
                M[r][j] -= f * M[col][j]
                B[r][j] -= f * B[col][j]
    qxx, qyy, qzz, qtt = B[0][0], B[1][1], B[2][2], B[3][3]
    if min(qxx, qyy, qzz, qtt) < 0.0:
        return
    gdop = math.sqrt(qxx + qyy + qzz + qtt)
    pdop = math.sqrt(qxx + qyy + qzz)
    hdop = math.sqrt(qxx + qyy)
    vdop = math.sqrt(qzz)

sidus_gdop()
`,

    javascript: `// ${A}
const dopTouch = ux1 + uy1 + uz1 + ux2 + uy2 + uz2 + ux3 + uy3 + uz3 + ux4 + uy4 + uz4
let gdop = NaN
let pdop = NaN
let hdop = NaN
let vdop = NaN
function sidusGdop() {
  const los = [[ux1, uy1, uz1], [ux2, uy2, uz2], [ux3, uy3, uz3], [ux4, uy4, uz4]]
  const H = []
  for (let k = 0; k < 4; k++) {
    const ux = los[k][0], uy = los[k][1], uz = los[k][2]
    const nrm = Math.hypot(ux, uy, uz)
    if (!(nrm > 0)) return
    H.push([ux / nrm, uy / nrm, uz / nrm, 1])
  }
  const M = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
  const B = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += H[k][r] * H[k][c]
      M[r][c] = s
    }
  }
  for (let col = 0; col < 4; col++) {
    let piv = col
    for (let r = col + 1; r < 4; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
    }
    if (Math.abs(M[piv][col]) < 1e-14) return
    if (piv !== col) {
      const rowM = M[col]; M[col] = M[piv]; M[piv] = rowM
      const rowB = B[col]; B[col] = B[piv]; B[piv] = rowB
    }
    const div = M[col][col]
    for (let j = 0; j < 4; j++) { M[col][j] /= div; B[col][j] /= div }
    for (let r = 0; r < 4; r++) {
      if (r === col) continue
      const f = M[r][col]
      for (let j = 0; j < 4; j++) {
        M[r][j] -= f * M[col][j]
        B[r][j] -= f * B[col][j]
      }
    }
  }
  const qxx = B[0][0], qyy = B[1][1], qzz = B[2][2], qtt = B[3][3]
  if (qxx < 0 || qyy < 0 || qzz < 0 || qtt < 0) return
  gdop = Math.sqrt(qxx + qyy + qzz + qtt)
  pdop = Math.sqrt(qxx + qyy + qzz)
  hdop = Math.sqrt(qxx + qyy)
  vdop = Math.sqrt(qzz)
}
sidusGdop()
`,

    typescript: `// ${A}
const dopTouch: number = ux1 + uy1 + uz1 + ux2 + uy2 + uz2 + ux3 + uy3 + uz3 + ux4 + uy4 + uz4
let gdop: number = NaN
let pdop: number = NaN
let hdop: number = NaN
let vdop: number = NaN
function sidusGdop(): void {
  const los: number[][] = [[ux1, uy1, uz1], [ux2, uy2, uz2], [ux3, uy3, uz3], [ux4, uy4, uz4]]
  const H: number[][] = []
  for (let k = 0; k < 4; k++) {
    const ux = los[k]![0]!, uy = los[k]![1]!, uz = los[k]![2]!
    const nrm = Math.hypot(ux, uy, uz)
    if (!(nrm > 0)) return
    H.push([ux / nrm, uy / nrm, uz / nrm, 1])
  }
  const M: number[][] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
  const B: number[][] = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += H[k]![r]! * H[k]![c]!
      M[r]![c] = s
    }
  }
  for (let col = 0; col < 4; col++) {
    let piv = col
    for (let r = col + 1; r < 4; r++) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[piv]![col]!)) piv = r
    }
    if (Math.abs(M[piv]![col]!) < 1e-14) return
    if (piv !== col) {
      const rowM = M[col]!; M[col] = M[piv]!; M[piv] = rowM
      const rowB = B[col]!; B[col] = B[piv]!; B[piv] = rowB
    }
    const div = M[col]![col]!
    for (let j = 0; j < 4; j++) { M[col]![j]! /= div; B[col]![j]! /= div }
    for (let r = 0; r < 4; r++) {
      if (r === col) continue
      const f = M[r]![col]!
      for (let j = 0; j < 4; j++) {
        M[r]![j]! -= f * M[col]![j]!
        B[r]![j]! -= f * B[col]![j]!
      }
    }
  }
  const qxx = B[0]![0]!, qyy = B[1]![1]!, qzz = B[2]![2]!, qtt = B[3]![3]!
  if (qxx < 0 || qyy < 0 || qzz < 0 || qtt < 0) return
  gdop = Math.sqrt(qxx + qyy + qzz + qtt)
  pdop = Math.sqrt(qxx + qyy + qzz)
  hdop = Math.sqrt(qxx + qyy)
  vdop = Math.sqrt(qzz)
}
sidusGdop()
`,

    c: `/* ${A} */
double gdop = NAN;
double pdop = NAN;
double hdop = NAN;
double vdop = NAN;
{
  double ux[4] = {ux1, ux2, ux3, ux4};
  double uy[4] = {uy1, uy2, uy3, uy4};
  double uz[4] = {uz1, uz2, uz3, uz4};
  double H[4][4], M[4][4], B[4][4];
  int bad = 0, sat, row, col, piv, j, r;
  for (sat = 0; sat < 4; sat++) {
    double nrm = sqrt(ux[sat]*ux[sat] + uy[sat]*uy[sat] + uz[sat]*uz[sat]);
    if (!(nrm > 0.0)) { bad = 1; break; }
    H[sat][0] = ux[sat] / nrm; H[sat][1] = uy[sat] / nrm;
    H[sat][2] = uz[sat] / nrm; H[sat][3] = 1.0;
  }
  if (!bad) {
    for (row = 0; row < 4; row++) for (col = 0; col < 4; col++) {
      double acc = 0.0;
      for (sat = 0; sat < 4; sat++) acc += H[sat][row] * H[sat][col];
      M[row][col] = acc;
      B[row][col] = (row == col) ? 1.0 : 0.0;
    }
    for (col = 0; col < 4 && !bad; col++) {
      piv = col;
      for (r = col + 1; r < 4; r++) if (fabs(M[r][col]) > fabs(M[piv][col])) piv = r;
      if (fabs(M[piv][col]) < 1e-14) { bad = 1; break; }
      if (piv != col) for (j = 0; j < 4; j++) {
        double tmp = M[col][j]; M[col][j] = M[piv][j]; M[piv][j] = tmp;
        tmp = B[col][j]; B[col][j] = B[piv][j]; B[piv][j] = tmp;
      }
      {
        double div = M[col][col];
        for (j = 0; j < 4; j++) { M[col][j] /= div; B[col][j] /= div; }
        for (r = 0; r < 4; r++) if (r != col) {
          double dop_f = M[r][col];
          for (j = 0; j < 4; j++) { M[r][j] -= dop_f * M[col][j]; B[r][j] -= dop_f * B[col][j]; }
        }
      }
    }
  }
  if (!bad) {
    double qxx = B[0][0], qyy = B[1][1], qzz = B[2][2], qtt = B[3][3];
    if (qxx >= 0.0 && qyy >= 0.0 && qzz >= 0.0 && qtt >= 0.0) {
      gdop = sqrt(qxx + qyy + qzz + qtt);
      pdop = sqrt(qxx + qyy + qzz);
      hdop = sqrt(qxx + qyy);
      vdop = sqrt(qzz);
    }
  }
}
`,

    cpp: `// ${A}
double gdop = NAN;
double pdop = NAN;
double hdop = NAN;
double vdop = NAN;
{
  double ux[4] = {ux1, ux2, ux3, ux4};
  double uy[4] = {uy1, uy2, uy3, uy4};
  double uz[4] = {uz1, uz2, uz3, uz4};
  double H[4][4], M[4][4], B[4][4];
  int bad = 0, sat, row, col, piv, j, r;
  for (sat = 0; sat < 4; sat++) {
    double nrm = std::sqrt(ux[sat]*ux[sat] + uy[sat]*uy[sat] + uz[sat]*uz[sat]);
    if (!(nrm > 0.0)) { bad = 1; break; }
    H[sat][0] = ux[sat] / nrm; H[sat][1] = uy[sat] / nrm;
    H[sat][2] = uz[sat] / nrm; H[sat][3] = 1.0;
  }
  if (!bad) {
    for (row = 0; row < 4; row++) for (col = 0; col < 4; col++) {
      double acc = 0.0;
      for (sat = 0; sat < 4; sat++) acc += H[sat][row] * H[sat][col];
      M[row][col] = acc;
      B[row][col] = (row == col) ? 1.0 : 0.0;
    }
    for (col = 0; col < 4 && !bad; col++) {
      piv = col;
      for (r = col + 1; r < 4; r++) if (std::fabs(M[r][col]) > std::fabs(M[piv][col])) piv = r;
      if (std::fabs(M[piv][col]) < 1e-14) { bad = 1; break; }
      if (piv != col) for (j = 0; j < 4; j++) {
        double tmp = M[col][j]; M[col][j] = M[piv][j]; M[piv][j] = tmp;
        tmp = B[col][j]; B[col][j] = B[piv][j]; B[piv][j] = tmp;
      }
      {
        double div = M[col][col];
        for (j = 0; j < 4; j++) { M[col][j] /= div; B[col][j] /= div; }
        for (r = 0; r < 4; r++) if (r != col) {
          double dop_f = M[r][col];
          for (j = 0; j < 4; j++) { M[r][j] -= dop_f * M[col][j]; B[r][j] -= dop_f * B[col][j]; }
        }
      }
    }
  }
  if (!bad) {
    double qxx = B[0][0], qyy = B[1][1], qzz = B[2][2], qtt = B[3][3];
    if (qxx >= 0.0 && qyy >= 0.0 && qzz >= 0.0 && qtt >= 0.0) {
      gdop = std::sqrt(qxx + qyy + qzz + qtt);
      pdop = std::sqrt(qxx + qyy + qzz);
      hdop = std::sqrt(qxx + qyy);
      vdop = std::sqrt(qzz);
    }
  }
}
`,

    rust: `// ${A}
let mut gdop = f64::NAN;
let mut pdop = f64::NAN;
let mut hdop = f64::NAN;
let mut vdop = f64::NAN;
{
    let ux = [ux1, ux2, ux3, ux4];
    let uy = [uy1, uy2, uy3, uy4];
    let uz = [uz1, uz2, uz3, uz4];
    // dop_h / dop_m: bare h and m are physics defaults (altitude, mass) and
    // would be injected over these matrices because the declarations sit in a block.
    let mut dop_h = [[0.0_f64; 4]; 4];
    let mut dop_m = [[0.0_f64; 4]; 4];
    let mut b = [[0.0_f64; 4]; 4];
    let mut bad = false;
    for sat in 0..4 {
        let nrm = (ux[sat] * ux[sat] + uy[sat] * uy[sat] + uz[sat] * uz[sat]).sqrt();
        if !(nrm > 0.0) { bad = true; break; }
        dop_h[sat][0] = ux[sat] / nrm;
        dop_h[sat][1] = uy[sat] / nrm;
        dop_h[sat][2] = uz[sat] / nrm;
        dop_h[sat][3] = 1.0;
    }
    if !bad {
        for row in 0..4 {
            for col in 0..4 {
                let mut acc = 0.0_f64;
                for sat in 0..4 { acc += dop_h[sat][row] * dop_h[sat][col]; }
                dop_m[row][col] = acc;
                b[row][col] = if row == col { 1.0 } else { 0.0 };
            }
        }
        for col in 0..4 {
            if bad { break; }
            let mut piv = col;
            for r in (col + 1)..4 {
                if dop_m[r][col].abs() > dop_m[piv][col].abs() { piv = r; }
            }
            if dop_m[piv][col].abs() < 1e-14 { bad = true; break; }
            if piv != col {
                for j in 0..4 {
                    let tmp = dop_m[col][j]; dop_m[col][j] = dop_m[piv][j]; dop_m[piv][j] = tmp;
                    let tmpb = b[col][j]; b[col][j] = b[piv][j]; b[piv][j] = tmpb;
                }
            }
            let div = dop_m[col][col];
            for j in 0..4 { dop_m[col][j] /= div; b[col][j] /= div; }
            for r in 0..4 {
                if r == col { continue; }
                let dop_f = dop_m[r][col];
                for j in 0..4 { dop_m[r][j] -= dop_f * dop_m[col][j]; b[r][j] -= dop_f * b[col][j]; }
            }
        }
    }
    if !bad {
        let qxx = b[0][0];
        let qyy = b[1][1];
        let qzz = b[2][2];
        let qtt = b[3][3];
        if qxx >= 0.0 && qyy >= 0.0 && qzz >= 0.0 && qtt >= 0.0 {
            gdop = (qxx + qyy + qzz + qtt).sqrt();
            pdop = (qxx + qyy + qzz).sqrt();
            hdop = (qxx + qyy).sqrt();
            vdop = qzz.sqrt();
        }
    }
}
`,

    zig: `// ${A}
var gdop: f64 = std.math.nan(f64);
var pdop: f64 = std.math.nan(f64);
var hdop: f64 = std.math.nan(f64);
var vdop: f64 = std.math.nan(f64);
{
    const dop_ux = [_]f64{ ux1, ux2, ux3, ux4 };
    const dop_uy = [_]f64{ uy1, uy2, uy3, uy4 };
    const dop_uz = [_]f64{ uz1, uz2, uz3, uz4 };
    var dop_h = [_][4]f64{ .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 } };
    var dop_m = [_][4]f64{ .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 } };
    var dop_b = [_][4]f64{ .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 }, .{ 0, 0, 0, 0 } };
    var dop_bad = false;
    var dop_sat: usize = 0;
    while (dop_sat < 4) : (dop_sat += 1) {
        const dop_nrm = std.math.sqrt(dop_ux[dop_sat] * dop_ux[dop_sat] + dop_uy[dop_sat] * dop_uy[dop_sat] + dop_uz[dop_sat] * dop_uz[dop_sat]);
        if (!(dop_nrm > 0.0)) { dop_bad = true; break; }
        dop_h[dop_sat][0] = dop_ux[dop_sat] / dop_nrm;
        dop_h[dop_sat][1] = dop_uy[dop_sat] / dop_nrm;
        dop_h[dop_sat][2] = dop_uz[dop_sat] / dop_nrm;
        dop_h[dop_sat][3] = 1.0;
    }
    if (!dop_bad) {
        var dop_row: usize = 0;
        while (dop_row < 4) : (dop_row += 1) {
            var dop_col: usize = 0;
            while (dop_col < 4) : (dop_col += 1) {
                var dop_acc: f64 = 0.0;
                var dop_k: usize = 0;
                while (dop_k < 4) : (dop_k += 1) dop_acc += dop_h[dop_k][dop_row] * dop_h[dop_k][dop_col];
                dop_m[dop_row][dop_col] = dop_acc;
                dop_b[dop_row][dop_col] = if (dop_row == dop_col) 1.0 else 0.0;
            }
        }
        var dop_col2: usize = 0;
        while (dop_col2 < 4) : (dop_col2 += 1) {
            if (dop_bad) break;
            var dop_piv: usize = dop_col2;
            var dop_rr: usize = dop_col2 + 1;
            while (dop_rr < 4) : (dop_rr += 1) {
                if (@abs(dop_m[dop_rr][dop_col2]) > @abs(dop_m[dop_piv][dop_col2])) dop_piv = dop_rr;
            }
            if (@abs(dop_m[dop_piv][dop_col2]) < 1e-14) { dop_bad = true; break; }
            if (dop_piv != dop_col2) {
                var dop_j: usize = 0;
                while (dop_j < 4) : (dop_j += 1) {
                    const dop_tmp = dop_m[dop_col2][dop_j];
                    dop_m[dop_col2][dop_j] = dop_m[dop_piv][dop_j];
                    dop_m[dop_piv][dop_j] = dop_tmp;
                    const dop_tmpb = dop_b[dop_col2][dop_j];
                    dop_b[dop_col2][dop_j] = dop_b[dop_piv][dop_j];
                    dop_b[dop_piv][dop_j] = dop_tmpb;
                }
            }
            const dop_div = dop_m[dop_col2][dop_col2];
            var dop_j2: usize = 0;
            while (dop_j2 < 4) : (dop_j2 += 1) {
                dop_m[dop_col2][dop_j2] /= dop_div;
                dop_b[dop_col2][dop_j2] /= dop_div;
            }
            var dop_rr2: usize = 0;
            while (dop_rr2 < 4) : (dop_rr2 += 1) {
                if (dop_rr2 == dop_col2) continue;
                const dop_f = dop_m[dop_rr2][dop_col2];
                var dop_jj: usize = 0;
                while (dop_jj < 4) : (dop_jj += 1) {
                    dop_m[dop_rr2][dop_jj] -= dop_f * dop_m[dop_col2][dop_jj];
                    dop_b[dop_rr2][dop_jj] -= dop_f * dop_b[dop_col2][dop_jj];
                }
            }
        }
    }
    if (!dop_bad) {
        const dop_qxx = dop_b[0][0];
        const dop_qyy = dop_b[1][1];
        const dop_qzz = dop_b[2][2];
        const dop_qtt = dop_b[3][3];
        if (dop_qxx >= 0.0 and dop_qyy >= 0.0 and dop_qzz >= 0.0 and dop_qtt >= 0.0) {
            gdop = std.math.sqrt(dop_qxx + dop_qyy + dop_qzz + dop_qtt);
            pdop = std.math.sqrt(dop_qxx + dop_qyy + dop_qzz);
            hdop = std.math.sqrt(dop_qxx + dop_qyy);
            vdop = std.math.sqrt(dop_qzz);
        }
    }
}
`,

    fortran: `! GDOP, PDOP, HDOP, and VDOP are square roots of sums of the
! diagonal of (H^T H)^{-1}. H rows are normalized ENU lines of sight
! plus a clock column of 1. Rank-deficient geometry is rejected. SI.
real(kind=8) :: dop_ux(4), dop_uy(4), dop_uz(4), dop_h(4,4), dop_m(4,4), dop_b(4,4)
! gfortran rejects a compile-time 0/0, so the sentinel is a runtime quotient.
nan_num = 0.0d0
nan_den = 0.0d0
gdop = nan_num / nan_den
pdop = gdop
hdop = gdop
vdop = gdop
dop_ux(1) = ux1
dop_ux(2) = ux2
dop_ux(3) = ux3
dop_ux(4) = ux4
dop_uy(1) = uy1
dop_uy(2) = uy2
dop_uy(3) = uy3
dop_uy(4) = uy4
dop_uz(1) = uz1
dop_uz(2) = uz2
dop_uz(3) = uz3
dop_uz(4) = uz4
dop_bad = 0.0d0
dop_sat = 1.0d0
do while (dop_sat < 4.5d0 .and. dop_bad < 0.5d0)
  dop_nrm = sqrt(dop_ux(int(dop_sat))**2 + dop_uy(int(dop_sat))**2 + dop_uz(int(dop_sat))**2)
  if (dop_nrm <= 0.0d0) then
    dop_bad = 1.0d0
  else
    dop_h(int(dop_sat), 1) = dop_ux(int(dop_sat)) / dop_nrm
    dop_h(int(dop_sat), 2) = dop_uy(int(dop_sat)) / dop_nrm
    dop_h(int(dop_sat), 3) = dop_uz(int(dop_sat)) / dop_nrm
    dop_h(int(dop_sat), 4) = 1.0d0
  end if
  dop_sat = dop_sat + 1.0d0
end do
dop_row = 1.0d0
do while (dop_row < 4.5d0 .and. dop_bad < 0.5d0)
  dop_col = 1.0d0
  do while (dop_col < 4.5d0)
    dop_acc = 0.0d0
    dop_k = 1.0d0
    do while (dop_k < 4.5d0)
      dop_acc = dop_acc + dop_h(int(dop_k), int(dop_row)) * dop_h(int(dop_k), int(dop_col))
      dop_k = dop_k + 1.0d0
    end do
    dop_m(int(dop_row), int(dop_col)) = dop_acc
    if (abs(dop_row - dop_col) < 0.5d0) then
      dop_b(int(dop_row), int(dop_col)) = 1.0d0
    else
      dop_b(int(dop_row), int(dop_col)) = 0.0d0
    end if
    dop_col = dop_col + 1.0d0
  end do
  dop_row = dop_row + 1.0d0
end do
dop_col = 1.0d0
do while (dop_col < 4.5d0 .and. dop_bad < 0.5d0)
  dop_piv = dop_col
  dop_r = dop_col + 1.0d0
  do while (dop_r < 4.5d0)
    if (abs(dop_m(int(dop_r), int(dop_col))) > abs(dop_m(int(dop_piv), int(dop_col)))) dop_piv = dop_r
    dop_r = dop_r + 1.0d0
  end do
  if (abs(dop_m(int(dop_piv), int(dop_col))) < 1.0d-14) then
    dop_bad = 1.0d0
  else
    if (abs(dop_piv - dop_col) > 0.5d0) then
      dop_j = 1.0d0
      do while (dop_j < 4.5d0)
        dop_tmp = dop_m(int(dop_col), int(dop_j))
        dop_m(int(dop_col), int(dop_j)) = dop_m(int(dop_piv), int(dop_j))
        dop_m(int(dop_piv), int(dop_j)) = dop_tmp
        dop_tmp = dop_b(int(dop_col), int(dop_j))
        dop_b(int(dop_col), int(dop_j)) = dop_b(int(dop_piv), int(dop_j))
        dop_b(int(dop_piv), int(dop_j)) = dop_tmp
        dop_j = dop_j + 1.0d0
      end do
    end if
    dop_div = dop_m(int(dop_col), int(dop_col))
    dop_j = 1.0d0
    do while (dop_j < 4.5d0)
      dop_m(int(dop_col), int(dop_j)) = dop_m(int(dop_col), int(dop_j)) / dop_div
      dop_b(int(dop_col), int(dop_j)) = dop_b(int(dop_col), int(dop_j)) / dop_div
      dop_j = dop_j + 1.0d0
    end do
    dop_r = 1.0d0
    do while (dop_r < 4.5d0)
      if (abs(dop_r - dop_col) > 0.5d0) then
        dop_f = dop_m(int(dop_r), int(dop_col))
        dop_j = 1.0d0
        do while (dop_j < 4.5d0)
          dop_m(int(dop_r), int(dop_j)) = dop_m(int(dop_r), int(dop_j)) - dop_f * dop_m(int(dop_col), int(dop_j))
          dop_b(int(dop_r), int(dop_j)) = dop_b(int(dop_r), int(dop_j)) - dop_f * dop_b(int(dop_col), int(dop_j))
          dop_j = dop_j + 1.0d0
        end do
      end if
      dop_r = dop_r + 1.0d0
    end do
  end if
  dop_col = dop_col + 1.0d0
end do
if (dop_bad < 0.5d0) then
  qxx = dop_b(1, 1)
  qyy = dop_b(2, 2)
  qzz = dop_b(3, 3)
  qtt = dop_b(4, 4)
  if (qxx >= 0.0d0 .and. qyy >= 0.0d0 .and. qzz >= 0.0d0 .and. qtt >= 0.0d0) then
    gdop = sqrt(qxx + qyy + qzz + qtt)
    pdop = sqrt(qxx + qyy + qzz)
    hdop = sqrt(qxx + qyy)
    vdop = sqrt(qzz)
  end if
end if
`,

    matlab: `% ${A}
% Top-level script: Octave does not see a local function defined after the call.
gdop = NaN;
pdop = NaN;
hdop = NaN;
vdop = NaN;
n1 = sqrt(ux1*ux1 + uy1*uy1 + uz1*uz1);
n2 = sqrt(ux2*ux2 + uy2*uy2 + uz2*uz2);
n3 = sqrt(ux3*ux3 + uy3*uy3 + uz3*uz3);
n4 = sqrt(ux4*ux4 + uy4*uy4 + uz4*uz4);
if n1 > 0 && n2 > 0 && n3 > 0 && n4 > 0
  H = [ux1/n1, uy1/n1, uz1/n1, 1; ux2/n2, uy2/n2, uz2/n2, 1; ux3/n3, uy3/n3, uz3/n3, 1; ux4/n4, uy4/n4, uz4/n4, 1];
  Ght = H' * H;
  if rank(Ght, 1e-12) >= 4
    Q = inv(Ght);
    qxx = Q(1,1); qyy = Q(2,2); qzz = Q(3,3); qtt = Q(4,4);
    if qxx >= 0 && qyy >= 0 && qzz >= 0 && qtt >= 0
      gdop = sqrt(qxx + qyy + qzz + qtt);
      pdop = sqrt(qxx + qyy + qzz);
      hdop = sqrt(qxx + qyy);
      vdop = sqrt(qzz);
    end
  end
end
fprintf('gdop = %.17g\\n', gdop);
fprintf('pdop = %.17g\\n', pdop);
fprintf('hdop = %.17g\\n', hdop);
fprintf('vdop = %.17g\\n', vdop);
`,

    julia: `# ${A}
function sidus_gdop(ux1, uy1, uz1, ux2, uy2, uz2, ux3, uy3, uz3, ux4, uy4, uz4)
    los = ((ux1, uy1, uz1), (ux2, uy2, uz2), (ux3, uy3, uz3), (ux4, uy4, uz4))
    H = zeros(4, 4)
    for k in 1:4
        ux, uy, uz = los[k]
        nrm = sqrt(ux * ux + uy * uy + uz * uz)
        if !(nrm > 0)
            return (NaN, NaN, NaN, NaN)
        end
        H[k, 1] = ux / nrm
        H[k, 2] = uy / nrm
        H[k, 3] = uz / nrm
        H[k, 4] = 1.0
    end
    M = zeros(4, 4)
    B = [1.0 0.0 0.0 0.0; 0.0 1.0 0.0 0.0; 0.0 0.0 1.0 0.0; 0.0 0.0 0.0 1.0]
    for r in 1:4, c in 1:4
        acc = 0.0
        for k in 1:4
            acc += H[k, r] * H[k, c]
        end
        M[r, c] = acc
    end
    for col in 1:4
        piv = col
        for r in (col + 1):4
            if abs(M[r, col]) > abs(M[piv, col])
                piv = r
            end
        end
        if abs(M[piv, col]) < 1e-14
            return (NaN, NaN, NaN, NaN)
        end
        if piv != col
            for j in 1:4
                tmp = M[col, j]; M[col, j] = M[piv, j]; M[piv, j] = tmp
                tmp = B[col, j]; B[col, j] = B[piv, j]; B[piv, j] = tmp
            end
        end
        div = M[col, col]
        for j in 1:4
            M[col, j] /= div
            B[col, j] /= div
        end
        for r in 1:4
            if r == col
                continue
            end
            f = M[r, col]
            for j in 1:4
                M[r, j] -= f * M[col, j]
                B[r, j] -= f * B[col, j]
            end
        end
    end
    qxx, qyy, qzz, qtt = B[1, 1], B[2, 2], B[3, 3], B[4, 4]
    if qxx < 0 || qyy < 0 || qzz < 0 || qtt < 0
        return (NaN, NaN, NaN, NaN)
    end
    return (
        sqrt(qxx + qyy + qzz + qtt),
        sqrt(qxx + qyy + qzz),
        sqrt(qxx + qyy),
        sqrt(qzz),
    )
end
gdop = NaN
pdop = NaN
hdop = NaN
vdop = NaN
gdop, pdop, hdop, vdop = sidus_gdop(ux1, uy1, uz1, ux2, uy2, uz2, ux3, uy3, uz3, ux4, uy4, uz4)
`,

    latex: `% ${A}
\\[
\\mathrm{GDOP}=\\sqrt{q_{xx}+q_{yy}+q_{zz}+q_{tt}},\\quad
\\mathrm{PDOP}=\\sqrt{q_{xx}+q_{yy}+q_{zz}},\\quad
\\mathrm{HDOP}=\\sqrt{q_{xx}+q_{yy}},\\quad
\\mathrm{VDOP}=\\sqrt{q_{zz}}
\\]
`,
  },
}
