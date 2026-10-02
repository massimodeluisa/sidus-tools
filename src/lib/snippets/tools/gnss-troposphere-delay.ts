import type { FormulaSnippet } from '../types'

const A =
  'Original Saastamoinen (1972) microwave slant-range correction. elev is elevation in radians; pressurePa and vaporPressurePa are receiver-site surface total and water-vapour partial pressure in pascals; tK is temperature in kelvin; d is a positive range correction in metres to subtract from observed range. The UI displays pressure in hPa and converts to Pa at the boundary. The calculator input limits are elevation 5 to 90 degrees, pressurePa > 0, tK > 0, and 0 <= vaporPressurePa <= pressurePa. The 5-degree floor is an operational cutoff near the horizon, not an accuracy guarantee. Defaults are illustrative, not live weather. This is an educational formula, not a ray-traced or modern high-precision mapping model.'

export const gnssTroposphereDelaySnippets: FormulaSnippet = {
  formulaId: 'gnss-troposphere-delay',
  assumptions: A,
  code: {
    python:
      '# Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\nimport math\nz = math.pi / 2 - elev\nd = 0.00002277 / math.cos(z) * (pressurePa + (1255 / tK + 0.05) * vaporPressurePa - 116 * math.tan(z) ** 2)\nprint(f"d = {d}")',
    javascript:
      '// Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\nconst z = Math.PI / 2 - elev\nconst d = 0.00002277 / Math.cos(z) * (pressurePa + (1255 / tK + 0.05) * vaporPressurePa - 116 * Math.tan(z) ** 2)',
    typescript:
      '// Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\nconst z = Math.PI / 2 - elev\nconst d = 0.00002277 / Math.cos(z) * (pressurePa + (1255 / tK + 0.05) * vaporPressurePa - 116 * Math.tan(z) ** 2)',
    c: '/* Original Saastamoinen (1972), SI form; rad, Pa, K, output m. */\nconst double z = 1.5707963267948966 - elev;\nconst double d = 0.00002277 / cos(z) * (pressurePa + (1255.0 / tK + 0.05) * vaporPressurePa - 116.0 * tan(z) * tan(z));',
    cpp: '// Original Saastamoinen (1972), SI form; rad, Pa, K, output m.\nconst double z = 1.5707963267948966 - elev;\nconst double d = 0.00002277 / cos(z) * (pressurePa + (1255.0 / tK + 0.05) * vaporPressurePa - 116.0 * tan(z) * tan(z));',
    rust:
      '// Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\nlet z = std::f64::consts::FRAC_PI_2 - elev;\nlet d = 0.00002277_f64 / z.cos() * (pressurePa + (1255.0_f64 / tK + 0.05_f64) * vaporPressurePa - 116.0_f64 * z.tan().powi(2));',
    zig: '// Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\nconst z = std.math.pi / @as(f64, 2.0) - elev;\nconst d = @as(f64, 0.00002277) / @cos(z) * (pressurePa + (@as(f64, 1255.0) / tK + @as(f64, 0.05)) * vaporPressurePa - @as(f64, 116.0) * @tan(z) * @tan(z));',
    fortran:
      '! Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\n  z = 1.5707963267948966d0 - elev\n  d = 0.00002277d0 / cos(z) * (pressurePa + (1255.0d0 / tK + 0.05d0) * vaporPressurePa - 116.0d0 * tan(z)**2)',
    matlab:
      '% Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\nz = pi / 2 - elev\nd = 0.00002277 / cos(z) * (pressurePa + (1255 / tK + 0.05) * vaporPressurePa - 116 * tan(z)^2)',
    julia:
      '# Original Saastamoinen (1972), SI form; elev [rad], pressures [Pa], tK [K], d [m].\nz = pi / 2 - elev\nd = 0.00002277 / cos(z) * (pressurePa + (1255 / tK + 0.05) * vaporPressurePa - 116 * tan(z)^2)',
    latex:
      '% Original Saastamoinen (1972), SI form; p and e in Pa, T in K, d in metres.\n\\[z=\\frac{\\pi}{2}-\\varepsilon,\\qquad d=\\frac{2.277\\times10^{-5}}{\\cos z}\\left[p_{\\mathrm{Pa}}+\\left(\\frac{1255}{T}+0.05\\right)e_{\\mathrm{Pa}}-116\\tan^2 z\\right]\\;\\mathrm{m}.\\]',
  },
}
