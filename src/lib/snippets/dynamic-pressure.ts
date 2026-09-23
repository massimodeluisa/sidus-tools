import type { FormulaSnippet } from './types'

/**
 * Dynamic pressure + U.S. Standard Atmosphere 1976 (geometric altitude 0–32 km).
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * The layer equations use geopotential altitude converted from geometric h.
 * Assumptions: dry perfect-gas air, constant gamma=1.4; free vars h [m], v [m/s].
 */
const A = 'USSA 1976 through geometric h=0–32 km; H=h R_E/(R_E+h); dry perfect-gas air; q=½ρv². SI.'

export const dynamicPressureSnippets: FormulaSnippet = {
  formulaId: 'dynamic-pressure',
  assumptions: A,
  code: {
    python: `# Dynamic pressure + piecewise USSA 1976: ${A}
import math
T0 = 288.15
P0 = 101325.0
L = 0.0065
g0 = 9.80665
R = 287.05287
RE = 6356660.0
if h < 0.0 or h > 32000.0:
    raise ValueError("geometric altitude h must be in [0, 32000] m")
H = h * RE / (RE + h)
T11 = T0 - L * 11000.0
p11 = P0 * (T11 / T0) ** (g0 / (L * R))
p20 = p11 * math.exp(-g0 * (20000.0 - 11000.0) / (R * T11))
if H <= 11000.0:
    isa_temperature_k = T0 - L * H
    isa_pressure_pa = P0 * (isa_temperature_k / T0) ** (g0 / (L * R))
elif H <= 20000.0:
    isa_temperature_k = T11
    isa_pressure_pa = p11 * math.exp(-g0 * (H - 11000.0) / (R * T11))
else:
    isa_temperature_k = 216.65 + 0.001 * (H - 20000.0)
    isa_pressure_pa = p20 * (isa_temperature_k / 216.65) ** (-g0 / (0.001 * R))
air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k)
speed_of_sound_m_s = math.sqrt(1.4 * R * isa_temperature_k)
dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v**2
mach_number = v / speed_of_sound_m_s`,

    javascript: `// Dynamic pressure + piecewise USSA 1976: ${A}
const T0 = 288.15, P0 = 101325, L = 0.0065, g0 = 9.80665, R = 287.05287
const RE = 6356660
if (h < 0 || h > 32000) throw new RangeError("geometric altitude h must be in [0, 32000] m")
const H = h * RE / (RE + h)
const T11 = T0 - L * 11000
const p11 = P0 * (T11 / T0) ** (g0 / (L * R))
const p20 = p11 * Math.exp(-g0 * (20000 - 11000) / (R * T11))
let isa_temperature_k, isa_pressure_pa
if (H <= 11000) {
  isa_temperature_k = T0 - L * H
  isa_pressure_pa = P0 * (isa_temperature_k / T0) ** (g0 / (L * R))
} else if (H <= 20000) {
  isa_temperature_k = T11
  isa_pressure_pa = p11 * Math.exp(-g0 * (H - 11000) / (R * T11))
} else {
  isa_temperature_k = 216.65 + 0.001 * (H - 20000)
  isa_pressure_pa = p20 * (isa_temperature_k / 216.65) ** (-g0 / (0.001 * R))
}
const air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k)
const speed_of_sound_m_s = Math.sqrt(1.4 * R * isa_temperature_k)
const dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v * v
const mach_number = v / speed_of_sound_m_s`,

    typescript: `// Dynamic pressure + piecewise USSA 1976: ${A}
const T0: number = 288.15
const P0: number = 101325
const L: number = 0.0065
const g0: number = 9.80665
const R: number = 287.05287
const RE: number = 6356660
if (h < 0 || h > 32000) throw new RangeError("geometric altitude h must be in [0, 32000] m")
const H: number = h * RE / (RE + h)
const T11: number = T0 - L * 11000
const p11: number = P0 * (T11 / T0) ** (g0 / (L * R))
const p20: number = p11 * Math.exp(-g0 * (20000 - 11000) / (R * T11))
let isa_temperature_k: number = 0
let isa_pressure_pa: number = 0
if (H <= 11000) {
  isa_temperature_k = T0 - L * H
  isa_pressure_pa = P0 * (isa_temperature_k / T0) ** (g0 / (L * R))
} else if (H <= 20000) {
  isa_temperature_k = T11
  isa_pressure_pa = p11 * Math.exp(-g0 * (H - 11000) / (R * T11))
} else {
  isa_temperature_k = 216.65 + 0.001 * (H - 20000)
  isa_pressure_pa = p20 * (isa_temperature_k / 216.65) ** (-g0 / (0.001 * R))
}
const air_density_kg_m3: number = isa_pressure_pa / (R * isa_temperature_k)
const speed_of_sound_m_s: number = Math.sqrt(1.4 * R * isa_temperature_k)
const dynamic_pressure_pa: number = 0.5 * air_density_kg_m3 * v * v
const mach_number: number = v / speed_of_sound_m_s`,

    c: `/* Dynamic pressure + piecewise USSA 1976: ${A} */
const double T0 = 288.15;
const double P0 = 101325.0;
const double L = 0.0065;
const double g0 = 9.80665;
const double R = 287.05287;
const double RE = 6356660.0;
if (h < 0.0 || h > 32000.0) return 1;
const double H = h * RE / (RE + h);
const double T11 = T0 - L * 11000.0;
const double p11 = P0 * pow(T11 / T0, g0 / (L * R));
const double p20 = p11 * exp(-g0 * (20000.0 - 11000.0) / (R * T11));
double isa_temperature_k;
double isa_pressure_pa;
if (H <= 11000.0) {
  isa_temperature_k = T0 - L * H;
  isa_pressure_pa = P0 * pow(isa_temperature_k / T0, g0 / (L * R));
} else if (H <= 20000.0) {
  isa_temperature_k = T11;
  isa_pressure_pa = p11 * exp(-g0 * (H - 11000.0) / (R * T11));
} else {
  isa_temperature_k = 216.65 + 0.001 * (H - 20000.0);
  isa_pressure_pa = p20 * pow(isa_temperature_k / 216.65, -g0 / (0.001 * R));
}
const double air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k);
const double speed_of_sound_m_s = sqrt(1.4 * R * isa_temperature_k);
const double dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v * v;
const double mach_number = v / speed_of_sound_m_s;`,

    cpp: `// Dynamic pressure + piecewise USSA 1976: ${A}
const double T0 = 288.15;
const double P0 = 101325.0;
const double L = 0.0065;
const double g0 = 9.80665;
const double R = 287.05287;
const double RE = 6356660.0;
if (h < 0.0 || h > 32000.0) return 1;
const double H = h * RE / (RE + h);
const double T11 = T0 - L * 11000.0;
const double p11 = P0 * std::pow(T11 / T0, g0 / (L * R));
const double p20 = p11 * std::exp(-g0 * (20000.0 - 11000.0) / (R * T11));
double isa_temperature_k;
double isa_pressure_pa;
if (H <= 11000.0) {
  isa_temperature_k = T0 - L * H;
  isa_pressure_pa = P0 * std::pow(isa_temperature_k / T0, g0 / (L * R));
} else if (H <= 20000.0) {
  isa_temperature_k = T11;
  isa_pressure_pa = p11 * std::exp(-g0 * (H - 11000.0) / (R * T11));
} else {
  isa_temperature_k = 216.65 + 0.001 * (H - 20000.0);
  isa_pressure_pa = p20 * std::pow(isa_temperature_k / 216.65, -g0 / (0.001 * R));
}
const double air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k);
const double speed_of_sound_m_s = std::sqrt(1.4 * R * isa_temperature_k);
const double dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v * v;
const double mach_number = v / speed_of_sound_m_s;`,

    rust: `// Dynamic pressure + piecewise USSA 1976: ${A}
let t0 = 288.15_f64;
let p0 = 101325.0_f64;
let lapse = 0.0065_f64;
let g0 = 9.80665_f64;
let r_air = 287.05287_f64;
let r_e = 6_356_660.0_f64;
assert!(h >= 0.0 && h <= 32_000.0, "geometric altitude h must be in [0, 32000] m");
let h_geo = h * r_e / (r_e + h);
let t11 = t0 - lapse * 11_000.0;
let p11 = p0 * (t11 / t0).powf(g0 / (lapse * r_air));
let p20 = p11 * (-g0 * (20_000.0 - 11_000.0) / (r_air * t11)).exp();
let mut isa_temperature_k = 0.0_f64;
let mut isa_pressure_pa = 0.0_f64;
if h_geo <= 11_000.0 {
    let layer_temperature_k = t0 - lapse * h_geo;
    isa_temperature_k = layer_temperature_k;
    isa_pressure_pa = p0 * (layer_temperature_k / t0).powf(g0 / (lapse * r_air));
} else if h_geo <= 20_000.0 {
    isa_temperature_k = t11;
    isa_pressure_pa = p11 * (-g0 * (h_geo - 11_000.0) / (r_air * t11)).exp();
} else {
    let layer_temperature_k = 216.65 + 0.001 * (h_geo - 20_000.0);
    isa_temperature_k = layer_temperature_k;
    isa_pressure_pa = p20 * (layer_temperature_k / 216.65).powf(-g0 / (0.001 * r_air));
}
let air_density_kg_m3 = isa_pressure_pa / (r_air * isa_temperature_k);
let speed_of_sound_m_s = (1.4 * r_air * isa_temperature_k).sqrt();
let dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v * v;
let mach_number = v / speed_of_sound_m_s;`,

    zig: `// Dynamic pressure + piecewise USSA 1976: ${A}
const T0: f64 = 288.15;
const P0: f64 = 101325.0;
const L: f64 = 0.0065;
const g0: f64 = 9.80665;
const R: f64 = 287.05287;
const RE: f64 = 6356660.0;
if (h < 0.0 or h > 32000.0) @panic("geometric altitude h must be in [0, 32000] m");
const H = h * RE / (RE + h);
const T11 = T0 - L * 11000.0;
const p11 = P0 * std.math.pow(f64, T11 / T0, g0 / (L * R));
const p20 = p11 * @exp(-g0 * (20000.0 - 11000.0) / (R * T11));
var isa_temperature_k: f64 = undefined;
var isa_pressure_pa: f64 = undefined;
if (H <= 11000.0) {
    isa_temperature_k = T0 - L * H;
    isa_pressure_pa = P0 * std.math.pow(f64, isa_temperature_k / T0, g0 / (L * R));
} else if (H <= 20000.0) {
    isa_temperature_k = T11;
    isa_pressure_pa = p11 * @exp(-g0 * (H - 11000.0) / (R * T11));
} else {
    isa_temperature_k = 216.65 + 0.001 * (H - 20000.0);
    isa_pressure_pa = p20 * std.math.pow(f64, isa_temperature_k / 216.65, -g0 / (0.001 * R));
}
const air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k);
const speed_of_sound_m_s = std.math.sqrt(1.4 * R * isa_temperature_k);
const dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v * v;
const mach_number = v / speed_of_sound_m_s;`,

    fortran: `! Dynamic pressure + piecewise USSA 1976: ${A}
if (h < 0.0d0 .or. h > 32000.0d0) error stop "geometric altitude h must be in [0, 32000] m"
T0 = 288.15d0
P0 = 101325.0d0
L = 0.0065d0
g0 = 9.80665d0
R = 287.05287d0
RE = 6356660.0d0
H = h * RE / (RE + h)
T11 = T0 - L * 11000.0d0
p11 = P0 * (T11 / T0)**(g0 / (L * R))
p20 = p11 * exp(-g0 * (20000.0d0 - 11000.0d0) / (R * T11))
if (H <= 11000.0d0) then
  isa_temperature_k = T0 - L * H
  isa_pressure_pa = P0 * (isa_temperature_k / T0)**(g0 / (L * R))
else if (H <= 20000.0d0) then
  isa_temperature_k = T11
  isa_pressure_pa = p11 * exp(-g0 * (H - 11000.0d0) / (R * T11))
else
  isa_temperature_k = 216.65d0 + 0.001d0 * (H - 20000.0d0)
  isa_pressure_pa = p20 * (isa_temperature_k / 216.65d0)**(-g0 / (0.001d0 * R))
end if
air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k)
speed_of_sound_m_s = sqrt(1.4d0 * R * isa_temperature_k)
dynamic_pressure_pa = 0.5d0 * air_density_kg_m3 * v * v
mach_number = v / speed_of_sound_m_s`,

    matlab: `% Dynamic pressure + piecewise USSA 1976: ${A}
if h < 0 || h > 32000
    error('geometric altitude h must be in [0, 32000] m')
end
T0 = 288.15;
P0 = 101325;
L = 0.0065;
g0 = 9.80665;
R = 287.05287;
RE = 6356660;
H = h * RE / (RE + h);
T11 = T0 - L * 11000;
p11 = P0 * (T11 / T0)^(g0 / (L * R));
p20 = p11 * exp(-g0 * (20000 - 11000) / (R * T11));
if H <= 11000
    isa_temperature_k = T0 - L * H;
    isa_pressure_pa = P0 * (isa_temperature_k / T0)^(g0 / (L * R));
elseif H <= 20000
    isa_temperature_k = T11;
    isa_pressure_pa = p11 * exp(-g0 * (H - 11000) / (R * T11));
else
    isa_temperature_k = 216.65 + 0.001 * (H - 20000);
    isa_pressure_pa = p20 * (isa_temperature_k / 216.65)^(-g0 / (0.001 * R));
end
air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k);
speed_of_sound_m_s = sqrt(1.4 * R * isa_temperature_k);
dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v^2;
mach_number = v / speed_of_sound_m_s;`,

    julia: `# Dynamic pressure + piecewise USSA 1976: ${A}
T0 = 288.15
P0 = 101325.0
L = 0.0065
g0 = 9.80665
R = 287.05287
RE = 6356660.0
0.0 <= h <= 32000.0 || throw(DomainError(h, "geometric altitude h must be in [0, 32000] m"))
H = h * RE / (RE + h)
T11 = T0 - L * 11000.0
p11 = P0 * (T11 / T0)^(g0 / (L * R))
p20 = p11 * exp(-g0 * (20000.0 - 11000.0) / (R * T11))
if H <= 11000.0
    isa_temperature_k = T0 - L * H
    isa_pressure_pa = P0 * (isa_temperature_k / T0)^(g0 / (L * R))
elseif H <= 20000.0
    isa_temperature_k = T11
    isa_pressure_pa = p11 * exp(-g0 * (H - 11000.0) / (R * T11))
else
    isa_temperature_k = 216.65 + 0.001 * (H - 20000.0)
    isa_pressure_pa = p20 * (isa_temperature_k / 216.65)^(-g0 / (0.001 * R))
end
air_density_kg_m3 = isa_pressure_pa / (R * isa_temperature_k)
speed_of_sound_m_s = sqrt(1.4 * R * isa_temperature_k)
dynamic_pressure_pa = 0.5 * air_density_kg_m3 * v^2
mach_number = v / speed_of_sound_m_s`,

    latex: `% Dynamic pressure + U.S. Standard Atmosphere 1976: pure SI
\\[
\\begin{aligned}
H&=\\frac{hR_E}{R_E+h},\\qquad R_E=6\\,356\\,660\\;\\mathrm{m},\\qquad 0\\le h\\le32\\,000\\;\\mathrm{m},\\\\
T_0&=288.15\\;\\mathrm{K},\\qquad P_0=101325\\;\\mathrm{Pa},\\\\
L&=0.0065\\;\\mathrm{K/m},\\qquad g_0=9.80665\\;\\mathrm{m/s^2},\\\\
R&=287.05287\\;\\mathrm{J/(kg\\,K)},\\qquad \\gamma=1.4,\\\\
q&=\\tfrac12\\rho v^2,\\qquad M=\\frac{v}{a},\\qquad a=\\sqrt{\\gamma RT},\\qquad \\rho=\\frac{p}{RT}.
\\end{aligned}
\\]
\\[
\\begin{aligned}
T_{11}&=T_0-L(11\\,000\\;\\mathrm{m})=216.65\\;\\mathrm{K},\\\\
p_{11}&=P_0(T_{11}/T_0)^{g_0/(LR)},\\\\
p_{20}&=p_{11}\\exp[-g_0(20\\,000-11\\,000)/(RT_{11})].
\\end{aligned}
\\]
\\[
T(H)=\\begin{cases}
T_0-LH,&0\\le H\\le11\\,000\\;\\mathrm{m},\\\\
216.65\\;\\mathrm{K},&11\\,000<H\\le20\\,000\\;\\mathrm{m},\\\\
216.65+0.001(H-20\\,000),&20\\,000<H\\le32\\,000\\;\\mathrm{m}.
\\end{cases}
\\]
\\[
p(H)=\\begin{cases}
P_0(T/T_0)^{g_0/(LR)},&H\\le11\\,000\\;\\mathrm{m},\\\\
p_{11}\\exp[-g_0(H-11\\,000)/(R T_{11})],&11\\,000<H\\le20\\,000\\;\\mathrm{m},\\\\
p_{20}(T/216.65)^{-g_0/(0.001R)},&20\\,000<H\\le32\\,000\\;\\mathrm{m}.
\\end{cases}
\\]`,
  },
}
