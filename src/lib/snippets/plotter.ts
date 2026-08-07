import type { FormulaSnippet } from './types'

/**
 * Offline f(x) sampling: educational core (sin example).
 * Matches PlotterTool restricted math sandbox sampling loop.
 * Free vars: xmin, xmax, n. Expression is educational sin(x).
 */
const A =
  'Offline f(x) sampling; expression compiled in a restricted math sandbox (educational).'

export const plotterSnippets: FormulaSnippet = {
  formulaId: 'plotter',
  assumptions: A,
  deps: [
    {
      name: 'numpy',
      ecosystem: 'pypi',
      url: 'https://pypi.org/project/numpy/',
      install: 'pip install numpy',
      note: 'Educational kernel uses ndarray helpers; not available on Compiler Explorer.',
      langs: ['python'],
    },
  ],
  code: {
    python: `# Sample f(x) = sin(x) on [xmin, xmax]: ${A}
import math
import numpy as np
x = np.linspace(xmin, xmax, int(n))
y = np.sin(x)
pts = [(float(xi), float(yi)) for xi, yi in zip(x, y) if math.isfinite(yi)]
# mid-point check
x_mid = 0.5 * (xmin + xmax)
y_mid = math.sin(x_mid)`,

    javascript: `// Sample f(x) = sin(x) on [xmin, xmax]: ${A}
function sample(fn, xmin, xmax, n = 200) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const x = xmin + (xmax - xmin) * i / (n - 1)
    const y = fn(x)
    if (Number.isFinite(y)) pts.push({ x, y })
  }
  return pts
}
const pts = sample((x) => Math.sin(x), xmin, xmax, n)
const xMid = 0.5 * (xmin + xmax)
const yMid = Math.sin(xMid)`,

    typescript: `// Sample f(x) = sin(x) on [xmin, xmax]: ${A}
function sample(fn: (x: number) => number, xmin: number, xmax: number, n = 200) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const x = xmin + (xmax - xmin) * i / (n - 1)
    const y = fn(x)
    if (Number.isFinite(y)) pts.push({ x, y })
  }
  return pts
}
const pts = sample((x) => Math.sin(x), xmin, xmax, n)
const xMid: number = 0.5 * (xmin + xmax)
const yMid: number = Math.sin(xMid)`,

    c: `/* Sample f(x)=sin(x) educational core: ${A} */
const double dx = (xmax - xmin) / (n - 1.0);
const double x_mid = 0.5 * (xmin + xmax);
const double y_mid = sin(x_mid);
const double x0 = xmin;
const double y0 = sin(x0);
const double x1 = xmin + dx;
const double y1 = sin(x1);`,

    cpp: `// Sample f(x)=sin(x) educational core: ${A}
const double dx = (xmax - xmin) / (n - 1.0);
const double x_mid = 0.5 * (xmin + xmax);
const double y_mid = std::sin(x_mid);
const double x0 = xmin;
const double y0 = std::sin(x0);
const double x1 = xmin + dx;
const double y1 = std::sin(x1);`,

    rust: `// Sample f(x)=sin(x) educational core: ${A}
let dx = (xmax - xmin) / (n - 1.0);
let x_mid = 0.5 * (xmin + xmax);
let y_mid = x_mid.sin();
let x0 = xmin;
let y0 = x0.sin();
let x1 = xmin + dx;
let y1 = x1.sin();`,

    zig: `// Sample f(x)=sin(x) educational core: ${A}
const dx = (xmax - xmin) / (n - 1.0);
const x_mid = 0.5 * (xmin + xmax);
const y_mid = std.math.sin(x_mid);
const x0 = xmin;
const y0 = std.math.sin(x0);
const x1 = xmin + dx;
const y1 = std.math.sin(x1);`,

    fortran: `! Sample f(x)=sin(x) educational core: ${A}
dx = (xmax - xmin) / (n - 1.0d0)
x_mid = 0.5d0 * (xmin + xmax)
y_mid = sin(x_mid)
x0 = xmin
y0 = sin(x0)
x1 = xmin + dx
y1 = sin(x1)`,

    matlab: `% Sample f(x)=sin(x) on [xmin, xmax]: ${A}
x = linspace(xmin, xmax, n);
y = sin(x);
x_mid = 0.5 * (xmin + xmax);
y_mid = sin(x_mid);`,

    julia: `# Sample f(x)=sin(x) on [xmin, xmax]: ${A}
x = range(xmin, xmax; length=Int(n))
y = sin.(x)
x_mid = 0.5 * (xmin + xmax)
y_mid = sin(x_mid)`,

    latex: `% Offline sampling
\\[
  y = f(x),\\quad
  x\\in[x_{\\min},x_{\\max}],\\quad
  x_{i} = x_{\\min} + i\\,\\frac{x_{\\max}-x_{\\min}}{n-1}
\\]`,
  },
}
