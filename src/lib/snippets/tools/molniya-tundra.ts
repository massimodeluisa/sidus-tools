import type { FormulaSnippet } from '../types'

const A = "Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI."

export const molniyaTundraSnippets: FormulaSnippet = {
  formulaId: 'molniya-tundra',
  assumptions: A,
  code: {
    python:
      "# Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nimport math\nTsid = 86164.0905\nT = Tsid if kind > 0.5 else Tsid / 2.0\na = (mu * T**2 / (4.0 * math.pi**2)) ** (1.0 / 3.0)\nrp = R + h\nra = 2.0 * a - rp\ne = (ra - rp) / (ra + rp)\ni = math.acos(math.sqrt(0.2))",
    javascript:
      "// Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nconst Tsid = 86164.0905\nconst T = kind > 0.5 ? Tsid : Tsid / 2.0\nconst a = (mu * T**2 / (4.0 * Math.PI**2)) ** (1.0 / 3.0)\nconst rp = R + h\nconst ra = 2.0 * a - rp\nconst e = (ra - rp) / (ra + rp)\nconst i = Math.acos(Math.sqrt(0.2))",
    typescript:
      "// Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nconst Tsid = 86164.0905\nconst T = kind > 0.5 ? Tsid : Tsid / 2.0\nconst a = (mu * T**2 / (4.0 * Math.PI**2)) ** (1.0 / 3.0)\nconst rp = R + h\nconst ra = 2.0 * a - rp\nconst e = (ra - rp) / (ra + rp)\nconst i = Math.acos(Math.sqrt(0.2))",
    c: "/* Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI. */\nconst double Tsid = 86164.0905;\nconst double T = kind > 0.5 ? Tsid : Tsid / 2.0;\nconst double a = pow((mu * T * T / (4.0 * M_PI * M_PI)), (1.0 / 3.0));\nconst double rp = R + h;\nconst double ra = 2.0 * a - rp;\nconst double e = (ra - rp) / (ra + rp);\nconst double i = acos(sqrt(0.2));",
    cpp: "// Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nconst double Tsid = 86164.0905;\nconst double T = kind > 0.5 ? Tsid : Tsid / 2.0;\nconst double a = pow((mu * T * T / (4.0 * M_PI * M_PI)), (1.0 / 3.0));\nconst double rp = R + h;\nconst double ra = 2.0 * a - rp;\nconst double e = (ra - rp) / (ra + rp);\nconst double i = acos(sqrt(0.2));",
    rust: "// Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nlet Tsid = 86164.0905_f64;\nlet T = if kind > 0.5_f64 { Tsid } else { Tsid / 2.0_f64 };\nlet a = (mu * T.powi(2) / (4.0_f64 * std::f64::consts::PI.powi(2))).powf(1.0_f64 / 3.0_f64);\nlet rp = R + h;\nlet ra = 2.0_f64 * a - rp;\nlet e = (ra - rp) / (ra + rp);\nlet i = (0.2_f64).sqrt().acos();",
    zig: "// Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nconst Tsid = @as(f64, 86164.0905);\nconst T = if (kind > @as(f64, 0.5)) Tsid else Tsid / @as(f64, 2.0);\nconst a = std.math.pow(f64, (mu * T * T / (@as(f64, 4.0) * std.math.pi * std.math.pi)), (@as(f64, 1.0) / @as(f64, 3.0)));\nconst rp = R + h;\nconst ra = @as(f64, 2.0) * a - rp;\nconst e = (ra - rp) / (ra + rp);\nconst i = std.math.acos(std.math.sqrt(@as(f64, 0.2)));",
    fortran:
      "! Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\n  Tsid = 86164.0905d0\n  if (kind > 0.5d0) then\n    T = Tsid\n  else\n    T = Tsid / 2.0d0\n  end if\n  a = (mu * T**2.0d0 / (4.0d0 * 3.141592653589793d0**2.0d0)) ** (1.0d0 / 3.0d0)\n  rp = R + h\n  ra = 2.0d0 * a - rp\n  e = (ra - rp) / (ra + rp)\n  i = acos(sqrt(0.2d0))",
    matlab:
      "% Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nTsid = 86164.0905\nif kind > 0.5\n  T = Tsid\nelse\n  T = Tsid / 2.0\nend\na = (mu * T^2 / (4.0 * pi^2)) ^ (1.0 / 3.0)\nrp = R + h\nra = 2.0 * a - rp\ne = (ra - rp) / (ra + rp)\ni = acos(sqrt(0.2))",
    julia:
      "# Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\nTsid = 86164.0905\nT = kind > 0.5 ? Tsid : Tsid / 2.0\na = (mu * T^2 / (4.0 * pi^2))^(1.0 / 3.0)\nrp = R + h\nra = 2.0 * a - rp\ne = (ra - rp) / (ra + rp)\ni = acos(sqrt(0.2))",
    latex:
      "% Molniya T=0.5 sidereal day, Tundra T=1; i=arccos(sqrt(1/5)); r=R+h; SI.\n\\[T=T_{\\mathrm{sid}}/2\\quad\\text{or}\\quad T_{\\mathrm{sid}},\\quad a=\\left(\\mu T^{2}/4\\pi^{2}\\right)^{1/3},\\quad r=R+h,\\quad e=(r_a-r_p)/(r_a+r_p),\\quad i=\\arccos\\sqrt{1/5}\\]",
  },
}
