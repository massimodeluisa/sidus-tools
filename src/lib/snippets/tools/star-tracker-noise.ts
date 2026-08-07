import type { FormulaSnippet } from '../types'

const A = "sigma ≈ pixel/sqrt(N); SI rad."

export const starTrackerNoiseSnippets: FormulaSnippet = {
  formulaId: 'star-tracker-noise',
  assumptions: A,
  code: {
    python: "# sigma ≈ pixel/sqrt(N); SI rad.\nimport math\nsigma = pix / math.sqrt(n)",
    javascript: "// sigma ≈ pixel/sqrt(N); SI rad.\nconst sigma = pix / Math.sqrt(n)",
    typescript: "// sigma ≈ pixel/sqrt(N); SI rad.\nconst sigma = pix / Math.sqrt(n)",
    c: "/* sigma ≈ pixel/sqrt(N); SI rad. */\nconst double sigma = pix / sqrt(n);",
    cpp: "// sigma ≈ pixel/sqrt(N); SI rad.\nconst double sigma = pix / sqrt(n);",
    rust: "// sigma ≈ pixel/sqrt(N); SI rad.\nlet sigma = pix / (n).sqrt();",
    zig: "// sigma ≈ pixel/sqrt(N); SI rad.\nconst sigma = pix / std.math.sqrt(n);",
    fortran: "! sigma ≈ pixel/sqrt(N); SI rad.\n  sigma = pix / sqrt(n)",
    matlab: "% sigma ≈ pixel/sqrt(N); SI rad.\nsigma = pix / sqrt(n)",
    julia: "# sigma ≈ pixel/sqrt(N); SI rad.\nsigma = pix / sqrt(n)",
    latex: "% sigma ≈ pixel/sqrt(N); SI rad.\n\\[\\sigma\\approx\\mathrm{pix}/\\sqrt{n}\\]",
  },
}
