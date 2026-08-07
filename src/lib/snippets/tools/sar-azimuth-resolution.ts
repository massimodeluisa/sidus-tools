import type { FormulaSnippet } from '../types'

const A = "delta_az ≈ lambda/(2 theta); SI."

export const sarAzimuthResolutionSnippets: FormulaSnippet = {
  formulaId: 'sar-azimuth-resolution',
  assumptions: A,
  code: {
    python: "# delta_az ≈ lambda/(2 theta); SI.\ndaz = lam / (2 * theta)",
    javascript: "// delta_az ≈ lambda/(2 theta); SI.\nconst daz = lam / (2 * theta)",
    typescript: "// delta_az ≈ lambda/(2 theta); SI.\nconst daz = lam / (2 * theta)",
    c: "/* delta_az ≈ lambda/(2 theta); SI. */\nconst double daz = lam / (2 * theta);",
    cpp: "// delta_az ≈ lambda/(2 theta); SI.\nconst double daz = lam / (2 * theta);",
    rust: "// delta_az ≈ lambda/(2 theta); SI.\nlet daz = lam / (2.0_f64 * theta);",
    zig: "// delta_az ≈ lambda/(2 theta); SI.\nconst daz = lam / (@as(f64, 2.0) * theta);",
    fortran: "! delta_az ≈ lambda/(2 theta); SI.\n  daz = lam / (2.0d0 * theta)",
    matlab: "% delta_az ≈ lambda/(2 theta); SI.\ndaz = lam / (2 * theta)",
    julia: "# delta_az ≈ lambda/(2 theta); SI.\ndaz = lam / (2 * theta)",
    latex: "% delta_az ≈ lambda/(2 theta); SI.\n\\[\\delta_{az}\\approx\\lambda/(2\\theta)\\]",
  },
}
