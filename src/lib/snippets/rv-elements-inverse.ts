import type { FormulaSnippet } from './types'

const ASSUMPTIONS =
  'Two-body, inertial equatorial frame, SI; elliptic (e<1) or hyperbolic (e>1) conic on its physical branch; parabolic elements are not supported.'

export const rvElementsInverseSnippets: FormulaSnippet = {
  formulaId: 'rv-elements-inverse',
  assumptions: ASSUMPTIONS,
  code: {
    python: `# Classical elements → Cartesian state: ${ASSUMPTIONS}
import math

p = a * (1 - e*e) if e < 1 else abs(a) * (e*e - 1)
r_pf = p / (1 + e*math.cos(nu))
x_pf = r_pf * math.cos(nu)
y_pf = r_pf * math.sin(nu)
vx_pf = -math.sqrt(mu/p) * math.sin(nu)
vy_pf = math.sqrt(mu/p) * (e + math.cos(nu))
cO, sO = math.cos(raan), math.sin(raan)
ci, si = math.cos(i), math.sin(i)
cw, sw = math.cos(argp), math.sin(argp)
rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf
ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf
rz_out = sw*si*x_pf + cw*si*y_pf
vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf
vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf
vz_out = sw*si*vx_pf + cw*si*vy_pf`,

    javascript: `// Classical elements → Cartesian state: ${ASSUMPTIONS}
const p = e < 1 ? a * (1 - e*e) : Math.abs(a) * (e*e - 1)
const r_pf = p / (1 + e*Math.cos(nu))
const x_pf = r_pf * Math.cos(nu)
const y_pf = r_pf * Math.sin(nu)
const vx_pf = -Math.sqrt(mu/p) * Math.sin(nu)
const vy_pf = Math.sqrt(mu/p) * (e + Math.cos(nu))
const cO = Math.cos(raan), sO = Math.sin(raan)
const ci = Math.cos(i), si = Math.sin(i)
const cw = Math.cos(argp), sw = Math.sin(argp)
const rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf
const ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf
const rz_out = sw*si*x_pf + cw*si*y_pf
const vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf
const vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf
const vz_out = sw*si*vx_pf + cw*si*vy_pf`,

    typescript: `// Classical elements → Cartesian state: ${ASSUMPTIONS}
const p: number = e < 1 ? a * (1 - e*e) : Math.abs(a) * (e*e - 1)
const r_pf: number = p / (1 + e*Math.cos(nu))
const x_pf: number = r_pf * Math.cos(nu)
const y_pf: number = r_pf * Math.sin(nu)
const vx_pf: number = -Math.sqrt(mu/p) * Math.sin(nu)
const vy_pf: number = Math.sqrt(mu/p) * (e + Math.cos(nu))
const cO: number = Math.cos(raan), sO: number = Math.sin(raan)
const ci: number = Math.cos(i), si: number = Math.sin(i)
const cw: number = Math.cos(argp), sw: number = Math.sin(argp)
const rx_out: number = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf
const ry_out: number = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf
const rz_out: number = sw*si*x_pf + cw*si*y_pf
const vx_out: number = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf
const vy_out: number = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf
const vz_out: number = sw*si*vx_pf + cw*si*vy_pf`,

    c: `/* Classical elements → Cartesian state: ${ASSUMPTIONS} */
const double p = e < 1.0 ? a * (1.0 - e*e) : fabs(a) * (e*e - 1.0);
const double r_pf = p / (1.0 + e*cos(nu));
const double x_pf = r_pf * cos(nu);
const double y_pf = r_pf * sin(nu);
const double vx_pf = -sqrt(mu/p) * sin(nu);
const double vy_pf = sqrt(mu/p) * (e + cos(nu));
const double cO = cos(raan), sO = sin(raan);
const double ci = cos(i), si = sin(i);
const double cw = cos(argp), sw = sin(argp);
const double rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
const double ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
const double rz_out = sw*si*x_pf + cw*si*y_pf;
const double vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
const double vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
const double vz_out = sw*si*vx_pf + cw*si*vy_pf;`,

    cpp: `// Classical elements → Cartesian state: ${ASSUMPTIONS}
const double p = e < 1.0 ? a * (1.0 - e*e) : std::fabs(a) * (e*e - 1.0);
const double r_pf = p / (1.0 + e*std::cos(nu));
const double x_pf = r_pf * std::cos(nu);
const double y_pf = r_pf * std::sin(nu);
const double vx_pf = -std::sqrt(mu/p) * std::sin(nu);
const double vy_pf = std::sqrt(mu/p) * (e + std::cos(nu));
const double cO = std::cos(raan), sO = std::sin(raan);
const double ci = std::cos(i), si = std::sin(i);
const double cw = std::cos(argp), sw = std::sin(argp);
const double rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
const double ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
const double rz_out = sw*si*x_pf + cw*si*y_pf;
const double vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
const double vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
const double vz_out = sw*si*vx_pf + cw*si*vy_pf;`,

    rust: `// Classical elements → Cartesian state: ${ASSUMPTIONS}
let p = if e < 1.0 { a * (1.0 - e*e) } else { a.abs() * (e*e - 1.0) };
let r_pf = p / (1.0 + e * nu.cos());
let x_pf = r_pf * nu.cos();
let y_pf = r_pf * nu.sin();
let vx_pf = -(mu/p).sqrt() * nu.sin();
let vy_pf = (mu/p).sqrt() * (e + nu.cos());
let cO = raan.cos(); let sO = raan.sin();
let ci = i.cos(); let si = i.sin();
let cw = argp.cos(); let sw = argp.sin();
let rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
let ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
let rz_out = sw*si*x_pf + cw*si*y_pf;
let vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
let vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
let vz_out = sw*si*vx_pf + cw*si*vy_pf;`,

    zig: `// Classical elements → Cartesian state: ${ASSUMPTIONS}
const p = if (e < 1.0) a * (1.0 - e*e) else @abs(a) * (e*e - 1.0);
const r_pf = p / (1.0 + e * @cos(nu));
const x_pf = r_pf * @cos(nu);
const y_pf = r_pf * @sin(nu);
const vx_pf = -@sqrt(mu/p) * @sin(nu);
const vy_pf = @sqrt(mu/p) * (e + @cos(nu));
const cO = @cos(raan); const sO = @sin(raan);
const ci = @cos(i); const si = @sin(i);
const cw = @cos(argp); const sw = @sin(argp);
const rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
const ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
const rz_out = sw*si*x_pf + cw*si*y_pf;
const vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
const vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
const vz_out = sw*si*vx_pf + cw*si*vy_pf;`,

    fortran: `! Classical elements -> Cartesian state: ${ASSUMPTIONS}
p = a * (1.0d0 - e**2)
if (e > 1.0d0) p = abs(a) * (e**2 - 1.0d0)
r_pf = p / (1.0d0 + e*cos(nu))
x_pf = r_pf * cos(nu)
y_pf = r_pf * sin(nu)
vx_pf = -sqrt(mu/p) * sin(nu)
vy_pf = sqrt(mu/p) * (e + cos(nu))
cO = cos(raan)
sO = sin(raan)
ci = cos(i)
si = sin(i)
cw = cos(argp)
sw = sin(argp)
rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf
ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf
rz_out = sw*si*x_pf + cw*si*y_pf
vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf
vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf
vz_out = sw*si*vx_pf + cw*si*vy_pf`,

    matlab: `% Classical elements -> Cartesian state: ${ASSUMPTIONS}
if e < 1
  p = a * (1 - e^2);
else
  p = abs(a) * (e^2 - 1);
end
r_pf = p / (1 + e*cos(nu));
x_pf = r_pf*cos(nu);
y_pf = r_pf*sin(nu);
vx_pf = -sqrt(mu/p)*sin(nu);
vy_pf = sqrt(mu/p)*(e + cos(nu));
cO = cos(raan); sO = sin(raan);
ci = cos(i); si = sin(i);
cw = cos(argp); sw = sin(argp);
rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf;
ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf;
rz_out = sw*si*x_pf + cw*si*y_pf;
vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf;
vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf;
vz_out = sw*si*vx_pf + cw*si*vy_pf;`,

    julia: `# Classical elements -> Cartesian state: ${ASSUMPTIONS}
p = e < 1 ? a * (1 - e^2) : abs(a) * (e^2 - 1)
r_pf = p / (1 + e*cos(nu))
x_pf = r_pf*cos(nu)
y_pf = r_pf*sin(nu)
vx_pf = -sqrt(mu/p)*sin(nu)
vy_pf = sqrt(mu/p)*(e + cos(nu))
cO, sO = cos(raan), sin(raan)
ci, si = cos(i), sin(i)
cw, sw = cos(argp), sin(argp)
rx_out = (cO*cw - sO*sw*ci)*x_pf + (-cO*sw - sO*cw*ci)*y_pf
ry_out = (sO*cw + cO*sw*ci)*x_pf + (-sO*sw + cO*cw*ci)*y_pf
rz_out = sw*si*x_pf + cw*si*y_pf
vx_out = (cO*cw - sO*sw*ci)*vx_pf + (-cO*sw - sO*cw*ci)*vy_pf
vy_out = (sO*cw + cO*sw*ci)*vx_pf + (-sO*sw + cO*cw*ci)*vy_pf
vz_out = sw*si*vx_pf + cw*si*vy_pf`,

    latex: `% Classical elements to inertial state
\\[
p = a(1-e^2)\\quad(e<1),\\qquad p=|a|(e^2-1)\\quad(e>1),\\qquad
\\mathbf r_{PQW}=\\frac{p}{1+e\\cos\\nu}\\begin{bmatrix}\\cos\\nu\\\\\\sin\\nu\\\\0\\end{bmatrix},\\quad
\\mathbf v_{PQW}=\\sqrt{\\frac{\\mu}{p}}\\begin{bmatrix}-\\sin\\nu\\\\e+\\cos\\nu\\\\0\\end{bmatrix}
\\]
\\[
\\mathbf r_{IJK}=R_3(\\Omega)R_1(i)R_3(\\omega)\\mathbf r_{PQW},\\qquad
\\mathbf v_{IJK}=R_3(\\Omega)R_1(i)R_3(\\omega)\\mathbf v_{PQW}
\\]`,
  },
}
