import type { FormulaSnippet } from '../types'

const A = "Planar CR3BP Jacobi constant; dimensionless educational."

export const cr3bpJacobiSnippets: FormulaSnippet = {
  formulaId: 'cr3bp-jacobi',
  assumptions: A,
  code: {
    python: "# Planar CR3BP Jacobi constant; dimensionless educational.\nimport math\nr1 = math.hypot(x + mu, y)\nr2 = math.hypot(x - (1 - mu), y)\nC = x**2 + y**2 + 2*(1-mu)/r1 + 2*mu/r2 - (vx**2 + vy**2)",
    javascript: "// Planar CR3BP Jacobi constant; dimensionless educational.\nconst r1 = Math.hypot(x + mu, y)\nconst r2 = Math.hypot(x - (1 - mu), y)\nconst C = x**2 + y**2 + 2*(1-mu)/r1 + 2*mu/r2 - (vx**2 + vy**2)",
    typescript: "// Planar CR3BP Jacobi constant; dimensionless educational.\nconst r1 = Math.hypot(x + mu, y)\nconst r2 = Math.hypot(x - (1 - mu), y)\nconst C = x**2 + y**2 + 2*(1-mu)/r1 + 2*mu/r2 - (vx**2 + vy**2)",
    c: "/* Planar CR3BP Jacobi constant; dimensionless educational. */\nconst double r1 = hypot(x + mu, y);\nconst double r2 = hypot(x - (1 - mu), y);\nconst double C = pow(x, 2) + pow(y, 2) + 2*(1-mu)/r1 + 2*mu/r2 - (pow(vx, 2) + pow(vy, 2));",
    cpp: "// Planar CR3BP Jacobi constant; dimensionless educational.\nconst double r1 = hypot(x + mu, y);\nconst double r2 = hypot(x - (1 - mu), y);\nconst double C = pow(x, 2) + pow(y, 2) + 2*(1-mu)/r1 + 2*mu/r2 - (pow(vx, 2) + pow(vy, 2));",
    rust: "// Planar CR3BP Jacobi constant; dimensionless educational.\nlet r1 = (x + mu).hypot(y);\nlet r2 = (x - (1.0_f64 - mu)).hypot(y);\nlet C = (x).powi(2) + (y).powi(2) + 2.0_f64*(1.0_f64-mu)/r1 + 2.0_f64*mu/r2 - ((vx).powi(2) + (vy).powi(2));",
    zig: "// Planar CR3BP Jacobi constant; dimensionless educational.\nconst r1 = std.math.sqrt((x + mu)*(x + mu)+(y)*(y));\nconst r2 = std.math.sqrt((x - (@as(f64, 1.0) - mu))*(x - (@as(f64, 1.0) - mu))+(y)*(y));\nconst C = std.math.pow(f64, x, @as(f64, 2.0)) + std.math.pow(f64, y, @as(f64, 2.0)) + @as(f64, 2.0)*(@as(f64, 1.0)-mu)/r1 + @as(f64, 2.0)*mu/r2 - (std.math.pow(f64, vx, @as(f64, 2.0)) + std.math.pow(f64, vy, @as(f64, 2.0)));",
    // Integer **2 avoids gfortran "negative REAL ** REAL" when vy < 0
    fortran: "! Planar CR3BP Jacobi constant; dimensionless educational.\n  r1 = hypot(x + mu, y)\n  r2 = hypot(x - (1.0d0 - mu), y)\n  C = x**2 + y**2 + 2.0d0*(1.0d0-mu)/r1 + 2.0d0*mu/r2 - (vx**2 + vy**2)",
    matlab: "% Planar CR3BP Jacobi constant; dimensionless educational.\nr1 = hypot(x + mu, y)\nr2 = hypot(x - (1 - mu), y)\nC = x^2 + y^2 + 2*(1-mu)/r1 + 2*mu/r2 - (vx^2 + vy^2)",
    julia: "# Planar CR3BP Jacobi constant; dimensionless educational.\nr1 = hypot(x + mu, y)\nr2 = hypot(x - (1 - mu), y)\nC = x**2 + y**2 + 2*(1-mu)/r1 + 2*mu/r2 - (vx**2 + vy**2)",
    latex: "% Planar CR3BP Jacobi constant; dimensionless educational.\n\\[C=x^2+y^2+2U-\\dot x^2-\\dot y^2\\]",
  },
}
