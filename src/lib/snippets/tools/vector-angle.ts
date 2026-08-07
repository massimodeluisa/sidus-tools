import type { FormulaSnippet } from '../types'

/**
 * Vector angle: Euclidean 3D angle between a and b.
 * Formula fragments only (wrapAsRunnable adds main / includes / live inputs).
 * Matches VectorAngleTool + angleBetween (geometry.ts).
 * Free vars: ax, ay, az, bx, by, bz.
 */
const A =
  'Euclidean 3D angle; cos θ = (a·b)/(|a||b|); clamp cos to [−1,1]. Pure SI (rad).'

export const vectorAngleSnippets: FormulaSnippet = {
  formulaId: 'vector-angle',
  assumptions: A,
  code: {
    python: `# Vector angle: ${A}
import math
dot = ax * bx + ay * by + az * bz
na = math.hypot(ax, ay, az)
nb = math.hypot(bx, by, bz)
theta = math.acos(max(-1.0, min(1.0, dot / (na * nb))))`,

    javascript: `// Vector angle: ${A}
const dot = ax * bx + ay * by + az * bz
const na = Math.hypot(ax, ay, az)
const nb = Math.hypot(bx, by, bz)
const theta = Math.acos(Math.max(-1, Math.min(1, dot / (na * nb))))`,

    typescript: `// Vector angle: ${A}
const dot: number = ax * bx + ay * by + az * bz
const na: number = Math.hypot(ax, ay, az)
const nb: number = Math.hypot(bx, by, bz)
const theta: number = Math.acos(Math.max(-1, Math.min(1, dot / (na * nb))))`,

    c: `/* Vector angle: ${A} */
const double dot = ax * bx + ay * by + az * bz;
const double na = sqrt(ax * ax + ay * ay + az * az);
const double nb = sqrt(bx * bx + by * by + bz * bz);
const double theta = acos(fmax(-1.0, fmin(1.0, dot / (na * nb))));`,

    cpp: `// Vector angle: ${A}
const double dot = ax * bx + ay * by + az * bz;
const double na = std::sqrt(ax * ax + ay * ay + az * az);
const double nb = std::sqrt(bx * bx + by * by + bz * bz);
const double theta = std::acos(std::fmax(-1.0, std::fmin(1.0, dot / (na * nb))));`,

    rust: `// Vector angle: ${A}
let dot = ax * bx + ay * by + az * bz;
let na = ax.hypot(ay).hypot(az);
let nb = bx.hypot(by).hypot(bz);
let theta = (dot / (na * nb)).clamp(-1.0, 1.0).acos();`,

    zig: `// Vector angle: ${A}
const dot = ax * bx + ay * by + az * bz;
const na = std.math.sqrt(ax * ax + ay * ay + az * az);
const nb = std.math.sqrt(bx * bx + by * by + bz * bz);
const cos_t = @max(-1.0, @min(1.0, dot / (na * nb)));
const theta = std.math.acos(cos_t);`,

    fortran: `! Vector angle: ${A}
dot = ax * bx + ay * by + az * bz
na = sqrt(ax * ax + ay * ay + az * az)
nb = sqrt(bx * bx + by * by + bz * bz)
theta = acos(max(-1.0d0, min(1.0d0, dot / (na * nb))))`,

    matlab: `% Vector angle: ${A}
dot = ax * bx + ay * by + az * bz;
na = sqrt(ax^2 + ay^2 + az^2);
nb = sqrt(bx^2 + by^2 + bz^2);
theta = acos(max(-1, min(1, dot / (na * nb))));`,

    julia: `# Vector angle: ${A}
dot = ax * bx + ay * by + az * bz
na = hypot(ax, ay, az)
nb = hypot(bx, by, bz)
theta = acos(clamp(dot / (na * nb), -1.0, 1.0))`,

    latex: `% Vector angle: pure SI
\\[
  \\cos\\theta = \\frac{\\mathbf a\\cdot\\mathbf b}{|\\mathbf a|\\,|\\mathbf b|}
\\]`,
  },
}
