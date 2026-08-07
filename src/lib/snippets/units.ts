import type { FormulaSnippet } from './types'

const A =
  'Linear scale: SI = value × toBase (+ offset for temperature). Same category only. Factors match SIDUS UNIT_DEFS.'

/**
 * Unit conversion: real code in every listed language.
 * Helpers kept (multi-function map); wrapAsRunnable injects live free vars.
 * Live inputs: value, fromToBase, fromOffset (and optional peer / to factors).
 */
export const unitsSnippets: FormulaSnippet = {
  formulaId: 'units',
  assumptions: A,
  code: {
    python: `# ${A}
def to_si(value, to_base, offset=0.0):
    """value in chosen unit → SI base (m, kg, K, …)."""
    return value * to_base + offset

def from_si(si, to_base, offset=0.0):
    """SI base → display unit."""
    return (si - offset) / to_base

def convert(value, from_to_base, to_to_base, from_offset=0.0, to_offset=0.0):
    si = to_si(value, from_to_base, from_offset)
    return from_si(si, to_to_base, to_offset)

# Live UI: value, fromToBase, fromOffset → SI, then any peer unit via its toBase
si = to_si(value, fromToBase, fromOffset)
# example peer (same category): out = from_si(si, peerToBase, peerOffset)`,

    javascript: `// ${A}
function toSi(value, toBase, offset = 0) {
  return value * toBase + offset
}
function fromSi(si, toBase, offset = 0) {
  return (si - offset) / toBase
}
function convert(value, fromToBase, toToBase, fromOffset = 0, toOffset = 0) {
  const si = toSi(value, fromToBase, fromOffset)
  return fromSi(si, toToBase, toOffset)
}

const si = toSi(value, fromToBase, fromOffset ?? 0)
// peer: fromSi(si, peerToBase, peerOffset ?? 0)`,

    typescript: `// ${A}
function toSi(value: number, toBase: number, offset = 0): number {
  return value * toBase + offset
}
function fromSi(si: number, toBase: number, offset = 0): number {
  return (si - offset) / toBase
}
function convert(
  value: number,
  fromToBase: number,
  toToBase: number,
  fromOffset = 0,
  toOffset = 0,
): number {
  const si = toSi(value, fromToBase, fromOffset)
  return fromSi(si, toToBase, toOffset)
}

const si = toSi(value, fromToBase, fromOffset ?? 0)`,

    c: `/* ${A}
 * SI = value * toBase + offset  (offset only for °C/°F → K)
 * out = (SI - to_offset) / to_to_base
 */
double to_si(double value, double to_base, double offset) {
  return value * to_base + offset;
}

double from_si(double si, double to_base, double offset) {
  return (si - offset) / to_base;
}

double convert(double value,
               double from_to_base, double to_to_base,
               double from_offset, double to_offset) {
  double si = to_si(value, from_to_base, from_offset);
  return from_si(si, to_to_base, to_offset);
}

/* Live: value, fromToBase, fromOffset from UI preamble */
int main(void) {
  double si = to_si(value, fromToBase, fromOffset);
  return 0;
}`,

    cpp: `// ${A}
double to_si(double value, double to_base, double offset = 0.0) {
  return value * to_base + offset;
}
double from_si(double si, double to_base, double offset = 0.0) {
  return (si - offset) / to_base;
}
double convert(double value, double from_tb, double to_tb,
               double from_off = 0.0, double to_off = 0.0) {
  return from_si(to_si(value, from_tb, from_off), to_tb, to_off);
}

int main() {
  double si = to_si(value, fromToBase, fromOffset);
  return 0;
}`,

    rust: `// ${A}
fn to_si(value: f64, to_base: f64, offset: f64) -> f64 {
    value * to_base + offset
}
fn from_si(si: f64, to_base: f64, offset: f64) -> f64 {
    (si - offset) / to_base
}
fn convert(value: f64, from_tb: f64, to_tb: f64, from_off: f64, to_off: f64) -> f64 {
    from_si(to_si(value, from_tb, from_off), to_tb, to_off)
}

fn main() {
    let si = to_si(value, fromToBase, fromOffset);
}`,

    zig: `// ${A}
fn to_si(value: f64, to_base: f64, offset: f64) f64 {
    return value * to_base + offset;
}
fn from_si(si: f64, to_base: f64, offset: f64) f64 {
    return (si - offset) / to_base;
}
fn convert(value: f64, from_tb: f64, to_tb: f64, from_off: f64, to_off: f64) f64 {
    return from_si(to_si(value, from_tb, from_off), to_tb, to_off);
}

pub fn main() void {
    const si = to_si(value, fromToBase, fromOffset);
}`,

    fortran: `! ${A}
! SI = value * toBase + offset; peer_out = (SI - peerOffset) / peerToBase
si = value * fromToBase + fromOffset`,

    matlab: `% ${A}
% SI = value * toBase + offset
si = value * fromToBase + fromOffset;
% peer_out = (si - peerOffset) / peerToBase`,

    julia: `# ${A}
to_si(value, to_base, offset=0.0) = value * to_base + offset
from_si(si, to_base, offset=0.0) = (si - offset) / to_base
convert(value, from_tb, to_tb, from_off=0.0, to_off=0.0) =
    from_si(to_si(value, from_tb, from_off), to_tb, to_off)

si = to_si(value, fromToBase, fromOffset)`,

    latex: `% Affine unit map (temperature uses offset)
\\[
  q_{\\mathrm{SI}} = q\\,k + b,\\qquad
  q' = (q_{\\mathrm{SI}} - b')/k'
\\]
% Linear units: $b=b'=0$, $k=$ toBase.`,
  },
}
