import type { CodeLang, FormulaSnippet } from './types'

/**
 * Legacy multi-language pure-SI ports from a Python math body + LaTeX.
 *
 * Prefer hand-written modules under `tools/` (see QUALITY.md). This helper remains
 * for residual tests and rare one-off ports.
 *
 * Systems langs: C/Zig/Fortran keep free-function style. Rust emits **idiomatic
 * f64 methods** (no abs_f / free-function wrappers).
 * Non-portable Python (defs, loops, …) → only py/js/ts/matlab/julia/latex.
 */

function stripPyNoise(body: string): string {
  return body
    .replace(/^import math\s*\n?/gm, '')
    .replace(/^from math import[^\n]*\n?/gm, '')
    .trim()
}

/**
 * Expand `a = 1; b = 2` educational one-liners into separate assignment lines
 * so C/Rust emitters don't glue the second assignment into the first RHS.
 */
function expandMultiAssign(body: string): string {
  const lines = body.split('\n')
  const out: string[] = []
  for (const line of lines) {
    const indent = line.match(/^\s*/)?.[0] ?? ''
    const t = line.trim()
    if (
      !t ||
      t.startsWith('#') ||
      t.startsWith('import ') ||
      t.startsWith('from ') ||
      !t.includes(';')
    ) {
      out.push(line)
      continue
    }
    // Split top-level `;` (ignore those inside strings: educational snippets rarely have them)
    const parts = t
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length <= 1) {
      out.push(line)
      continue
    }
    // Only expand when each part looks like an assignment
    if (parts.every((p) => /^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(p))) {
      for (const p of parts) out.push(indent + p)
    } else {
      out.push(line)
    }
  }
  return out.join('\n')
}

function preparePyBody(body: string): string {
  return expandMultiAssign(stripPyNoise(body))
}

/**
 * Promote bare integer literals to f64 (Rust/Zig type strictness).
 * Leaves alone: identifier tails (P0), floats (1.0), scientific (1e-3 / 2E4).
 * Critical: never turn `4.56e-6` into `4.56e-6.0`.
 */
function promoteBareIntsToF64(s: string): string {
  return s.replace(
    /(?<![A-Za-z0-9_.])(\d+)(?![0-9.eE])/g,
    (match, digits: string, offset: number, full: string) => {
      const pre = full.slice(Math.max(0, offset - 2), offset)
      // Exponent of scientific notation: 1e3, 1E-6, 4.56e-6
      if (/[eE]$/.test(pre) || /[eE][+-]$/.test(pre)) return match
      // Keep i32 exponents for f64::powi (rustc E0308 if powi(2.0))
      const before = full.slice(Math.max(0, offset - 12), offset)
      if (/\.powi\(\s*$/.test(before)) return match
      return `${digits}.0`
    },
  )
}

function isPortable(body: string): boolean {
  // Strip comments first: educational notes must not trip keyword bans
  // (e.g. "… with mu = …" was matching `\bwith ` and killing C/Rust ports).
  const core = preparePyBody(body)
    .split('\n')
    .map((l) => {
      const t = l.trim()
      if (t.startsWith('#')) return ''
      const hash = l.indexOf(' #')
      return hash >= 0 ? l.slice(0, hash) : l
    })
    .join('\n')
  if (/\b(def|class|async|await|yield|with |for |while )\b/.test(core)) return false
  if (/\bif\b/.test(core)) return false
  if (/f["']/.test(core) || /:=/.test(core) || /\[.*\bfor\b/.test(core)) return false
  // Pseudo-code helpers not available in pure math ports
  if (/\b(sum|norm|dot|ssoInclination|stumpff)\s*\(/.test(core)) return false
  const lines = core.split('\n').map((l) => l.trim()).filter(Boolean)
  for (const l of lines) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(l)) {
      if (!/^[A-Za-z_(]/.test(l)) return false
    }
  }
  return true
}

/** Find matching ')' starting at openIdx which points at '('. */
function matchParen(s: string, openIdx: number): number {
  let depth = 0
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i]
    if (c === '(') depth++
    else if (c === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/** Split top-level comma-separated args (paren-aware). */
function splitArgs(args: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < args.length; i++) {
    const c = args[i]
    if (c === '(') depth++
    else if (c === ')') depth--
    else if (c === ',' && depth === 0) {
      parts.push(args.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(args.slice(start).trim())
  return parts.filter(Boolean)
}

/** Python math.hypot(*xs) → nested 2-arg form or sum-of-squares for 3+. */
function expandHypot(
  args: string,
  mode: 'c' | 'rust' | 'zig' | 'fortran',
): string {
  const parts = splitArgs(args)
  if (parts.length === 0) {
    if (mode === 'zig') return 'std.math.sqrt(0.0)'
    return '0.0d0'
  }
  if (parts.length === 1) {
    if (mode === 'rust') return `(${parts[0]}).abs()`
    if (mode === 'zig') return `@abs(${parts[0]})`
    if (mode === 'fortran') return `abs(${parts[0]})`
    return `fabs(${parts[0]})`
  }
  if (parts.length === 2) {
    if (mode === 'rust') return `(${parts[0]}).hypot(${parts[1]})`
    // Prefer free product form: avoids std.math re-scan issues
    if (mode === 'zig')
      return `std.math.sqrt((${parts[0]})*(${parts[0]})+(${parts[1]})*(${parts[1]}))`
    if (mode === 'fortran') return `hypot(${parts[0]}, ${parts[1]})`
    return `hypot(${parts[0]}, ${parts[1]})`
  }
  // n>=3: sqrt(x0*x0+x1*x1+…): Fortran hypot is 2-arg only
  // Rust: chain .hypot for 3-arg educational form
  if (mode === 'rust') {
    let acc = `(${parts[0]}).hypot(${parts[1]})`
    for (let i = 2; i < parts.length; i++) acc = `${acc}.hypot(${parts[i]})`
    return acc
  }
  const squares = parts.map((p) => `((${p})*(${p}))`)
  const sum = squares.join('+')
  if (mode === 'zig') return `std.math.sqrt(${sum})`
  return `sqrt(${sum})`
}

/**
 * Replace math.NAME(…balanced…) repeatedly (innermost-first by scanning left→right
 * and re-scanning after each replace until no math.NAME( remains).
 */
function mapMathCalls(
  src: string,
  mapFn: (name: string, args: string) => string,
): string {
  let s = src
  // Never rematch inside std.math.* / foo.math.* (negative lookbehind)
  const re = /(?<![A-Za-z0-9_.])math\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/g
  for (let guard = 0; guard < 200; guard++) {
    re.lastIndex = 0
    const m = re.exec(s)
    if (!m) break
    const name = m[1]
    const openIdx = m.index + m[0].length - 1
    const closeIdx = matchParen(s, openIdx)
    if (closeIdx < 0) break
    const args = s.slice(openIdx + 1, closeIdx)
    // Recursively map nested math in args first
    const mappedArgs = mapMathCalls(args, mapFn)
    const rep = mapFn(name, mappedArgs)
    s = s.slice(0, m.index) + rep + s.slice(closeIdx + 1)
  }
  return s
}

/**
 * Walk left from a trailing `)` to include a full call / method chain:
 * `(i).cos()`, `foo(x)`, `a.b(c).d()`.
 */
function leftOperandStartIncludingCalls(out: string, closeParenIdx: number): number {
  let j = closeParenIdx
  // Match this `)` back to its `(`
  let depth = 0
  for (; j >= 0; j--) {
    if (out[j] === ')') depth++
    else if (out[j] === '(') {
      depth--
      if (depth === 0) break
    }
  }
  if (j < 0) return 0
  // Include function/method name before `(`
  let k = j - 1
  while (k >= 0 && /\s/.test(out[k])) k--
  if (k >= 0 && /[A-Za-z0-9_]/.test(out[k])) {
    while (k >= 0 && /[A-Za-z0-9_]/.test(out[k])) k--
    // Optional receiver: .recv or .recv(...)
    while (k >= 0 && out[k] === '.') {
      k--
      while (k >= 0 && /\s/.test(out[k])) k--
      if (k >= 0 && out[k] === ')') {
        k = leftOperandStartIncludingCalls(out, k) - 1
      } else {
        while (k >= 0 && /[A-Za-z0-9_]/.test(out[k])) k--
      }
    }
    return k + 1
  }
  return j
}

/** Replace a**b with pow(a,b) using balanced left operands (incl. method calls). */
function replacePow(s: string, powCall: (a: string, b: string) => string): string {
  let out = s
  const tryOnce = (): boolean => {
    const i = out.indexOf('**')
    if (i < 0) return false
    let L = i - 1
    while (L >= 0 && /\s/.test(out[L])) L--
    let leftStart: number
    if (L >= 0 && out[L] === ')') {
      leftStart = leftOperandStartIncludingCalls(out, L)
    } else {
      while (L >= 0 && /[A-Za-z0-9_./]/.test(out[L])) L--
      leftStart = L + 1
    }
    let R = i + 2
    while (R < out.length && /\s/.test(out[R])) R++
    let rightEnd: number
    if (out[R] === '(') {
      const c = matchParen(out, R)
      rightEnd = c < 0 ? R + 1 : c + 1
    } else {
      let j = R
      while (j < out.length && /[A-Za-z0-9_.]/.test(out[j])) j++
      rightEnd = j
    }
    const a = out.slice(leftStart, i).trim()
    const b = out.slice(i + 2, rightEnd).trim()
    if (!a || !b || a === '()') return false
    const rep = powCall(a, b)
    out = out.slice(0, leftStart) + rep + out.slice(rightEnd)
    return true
  }
  for (let g = 0; g < 50 && tryOnce(); g++) {
    /* replace all ** */
  }
  return out
}

/**
 * Paren-balanced free-function → f64 method rewrite for Rust.
 * Handles nested args: abs((a-b)/(c+d)), min(1.0, x*sin(y)), log10(G).
 * Skips already-method calls (preceded by `.`) and paths (`std::`).
 */
function rewriteRustFreeCallsToMethods(src: string): string {
  const unary: Record<string, string> = {
    abs: 'abs',
    fabs: 'abs',
    sqrt: 'sqrt',
    sin: 'sin',
    cos: 'cos',
    tan: 'tan',
    asin: 'asin',
    acos: 'acos',
    atan: 'atan',
    exp: 'exp',
    ln: 'ln',
    log: 'ln',
    log10: 'log10',
  }
  const binary: Record<string, string> = {
    min: 'min',
    max: 'max',
    hypot: 'hypot',
    atan2: 'atan2', // (y).atan2(x) — args order y,x
  }
  const names = [...Object.keys(unary), ...Object.keys(binary)].sort(
    (a, b) => b.length - a.length,
  )
  let s = src
  for (let guard = 0; guard < 400; guard++) {
    let found: { start: number; open: number; close: number; name: string } | null =
      null
    for (const name of names) {
      const re = new RegExp(`(?<![A-Za-z0-9_.])\\b${name}\\s*\\(`, 'g')
      let m: RegExpExecArray | null
      while ((m = re.exec(s)) !== null) {
        // Skip std:: / path-qualified (lookbehind only blocks .word)
        const pre = s.slice(Math.max(0, m.index - 2), m.index)
        if (pre.endsWith('::')) continue
        const open = m.index + m[0].length - 1
        const close = matchParen(s, open)
        if (close < 0) continue
        found = { start: m.index, open, close, name }
        break
      }
      if (found) break
    }
    if (!found) break
    const args = s.slice(found.open + 1, found.close)
    let rep: string
    if (unary[found.name]) {
      rep = `(${args}).${unary[found.name]}()`
    } else if (found.name === 'atan2') {
      const parts = splitArgs(args)
      rep =
        parts.length >= 2
          ? `(${parts[0]}).atan2(${parts[1]})`
          : `(${args}).atan2(0.0)`
    } else if (binary[found.name]) {
      const parts = splitArgs(args)
      if (parts.length >= 2) {
        rep = `(${parts[0]}).${binary[found.name]}(${parts[1]})`
      } else {
        rep = `(${args}).${binary[found.name]}()`
      }
    } else {
      break
    }
    s = s.slice(0, found.start) + rep + s.slice(found.close + 1)
  }
  return s
}

function pyToJs(body: string): string {
  let s = preparePyBody(body)
    .replace(/\bmath\./g, 'Math.')
    .replace(/\bmax\s*\(/g, 'Math.max(')
    .replace(/\bmin\s*\(/g, 'Math.min(')
    .replace(/^#/gm, '//')
  // Math.radians is not standard JS
  s = s.replace(/\bMath\.radians\s*\(/g, '((__deg)=>__deg*Math.PI/180)(')
  // Bare pi (when not Math.PI already)
  s = s.replace(/(?<![A-Za-z0-9_.])\bpi\b(?![A-Za-z0-9_])/g, 'Math.PI')
  return s
}

function pyToMatlab(body: string): string {
  let s = preparePyBody(body)
    .replace(/\bmath\.radians\s*\(/g, 'deg2rad(')
    .replace(/\bmath\./g, '')
    .replace(/\*\*/g, '^')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/^#/gm, '%')
  s = s.replace(/(?<![A-Za-z0-9_.])\bpi\b(?![A-Za-z0-9_])/g, 'pi')
  return s
}

function pyToJulia(body: string): string {
  let s = preparePyBody(body)
    .replace(/\bmath\.radians\s*\(/g, 'deg2rad(')
    .replace(/\bmath\./g, '')
  // Julia: atan(y, x): no atan2 builtin
  s = s.replace(/(?<![A-Za-z0-9_.])\batan2\s*\(/g, 'atan(')
  s = s.replace(/(?<![A-Za-z0-9_.])\bpi\b(?![A-Za-z0-9_])/g, 'π')
  return s
}

const C_MATH: Record<string, string> = {
  sqrt: 'sqrt',
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  asin: 'asin',
  acos: 'acos',
  atan: 'atan',
  atan2: 'atan2',
  exp: 'exp',
  log: 'log',
  fabs: 'fabs',
  abs: 'fabs',
  hypot: 'hypot',
  floor: 'floor',
  ceil: 'ceil',
}

function pyToC(body: string, cpp: boolean): string {
  let s = preparePyBody(body).replace(/^#/gm, '//')
  // Strip trailing Python comments on code lines
  s = s
    .split('\n')
    .map((line) => {
      if (line.trimStart().startsWith('//')) return line
      const hash = line.indexOf(' #')
      if (hash >= 0) return line.slice(0, hash).trimEnd()
      return line
    })
    .join('\n')
  s = s.replace(/\bmath\.pi\b/g, 'M_PI').replace(/\bmath\.e\b/g, 'M_E')
  s = mapMathCalls(s, (name, args) => {
    if (name === 'hypot') return expandHypot(args, 'c')
    if (name === 'radians') return `((${args})*M_PI/180.0)`
    if (name === 'degrees') return `((${args})*180.0/M_PI)`
    const fn = C_MATH[name] ?? name
    return `${fn}(${args})`
  })
  s = s.replace(/\bmax\s*\(/g, 'fmax(').replace(/\bmin\s*\(/g, 'fmin(')
  // Python abs() is float abs: C abs() is int-only
  s = s.replace(/(?<![A-Za-z0-9_])\babs\s*\(/g, 'fabs(')
  s = replacePow(s, (a, b) => {
    const bt = b.trim()
    // C: 1/3 is integer division → 0; use float exponents
    if (bt === '1/3' || bt === '(1/3)') return `cbrt(${a})`
    if (bt === '2/3' || bt === '(2/3)') return `pow(${a}, 2.0/3.0)`
    if (/^\d+\/\d+$/.test(bt)) {
      const [n, d] = bt.split('/')
      return `pow(${a}, ${n}.0/${d}.0)`
    }
    if (/^\(\d+\/\d+\)$/.test(bt)) {
      const m = bt.match(/(\d+)\/(\d+)/)!
      return `pow(${a}, ${m[1]}.0/${m[2]}.0)`
    }
    return `pow(${a}, ${b})`
  })
  // Bare pi (educational); avoid identifiers like pitch
  s = s.replace(/(?<![A-Za-z0-9_.])\bpi\b(?![A-Za-z0-9_])/g, 'M_PI')

  const lines = s.split('\n')
  const out: string[] = [
    cpp ? '// pure SI: educational' : '/* pure SI: educational */',
    cpp ? '#include <cmath>' : '#include <math.h>',
    '',
  ]
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('//') || t.startsWith('/*')) {
      out.push(line)
      continue
    }
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (m) out.push(`const double ${m[1]} = ${m[2].replace(/;?\s*$/, '')};`)
    else out.push(`/* ${t} */`)
  }
  return out.join('\n')
}

function pyToRust(body: string): string {
  let s = preparePyBody(body).replace(/^#/gm, '//')
  // Do NOT import bare `E`: it pattern-matches `let E = energy` (E0005)
  s = s
    .replace(/\bmath\.pi\b/g, 'std::f64::consts::PI')
    .replace(/\bmath\.e\b/g, 'std::f64::consts::E')
  // Idiomatic f64 methods: no free-function wrappers
  s = mapMathCalls(s, (name, args) => {
    if (name === 'hypot') return expandHypot(args, 'rust')
    if (name === 'radians') return `((${args})*std::f64::consts::PI/180.0)`
    if (name === 'degrees') return `((${args})*180.0/std::f64::consts::PI)`
    if (name === 'atan2') {
      const parts = splitArgs(args)
      if (parts.length >= 2) return `(${parts[0]}).atan2(${parts[1]})`
      return `(${args}).atan2(0.0)`
    }
    if (name === 'min' || name === 'max') {
      const parts = splitArgs(args)
      if (parts.length >= 2) return `(${parts[0]}).${name}(${parts[1]})`
    }
    const methods: Record<string, string> = {
      sqrt: 'sqrt',
      sin: 'sin',
      cos: 'cos',
      tan: 'tan',
      asin: 'asin',
      acos: 'acos',
      atan: 'atan',
      exp: 'exp',
      log: 'ln',
      log10: 'log10',
      fabs: 'abs',
      abs: 'abs',
    }
    const m = methods[name]
    if (m) return `(${args}).${m}()`
    // Leave unknown math.* as free call; rewriteRustFreeCallsToMethods cleans later
    return `${name}(${args})`
  })
  // ** before free-call cleanup so cos(i)**2 becomes ((i).cos()).powi(2)
  s = replacePow(s, (a, b) => {
    if (b === '2') return `(${a}).powi(2)`
    if (b === '3') return `(${a}).powi(3)`
    return `(${a}).powf(${b})`
  })
  s = s.replace(/(?<![A-Za-z0-9_:])\bpi\b(?![A-Za-z0-9_])/g, 'std::f64::consts::PI')
  // Bare abs/min/max/log10/… with nested parens (not only math.*)
  s = rewriteRustFreeCallsToMethods(s)
  // Bare integer → f64 (never touch P0 / 1e3 / already-float 1.0 / .powi(N))
  s = promoteBareIntsToF64(s)
  // Concrete f64 type on float literals so method calls typecheck (rustc E0689)
  // 10.0.powf / let c = 3e8; (c).powi — literals and inferred {float} bindings.
  s = s.replace(
    /(?<![A-Za-z0-9_])(-?(?:\d+\.\d+|\d+)(?:[eE][+-]?\d+)?)(?!_f64)\b/g,
    (lit) => {
      // Keep pure integer tokens that are powi exponents (already excluded by promote)
      // promoteBareInts already made arithmetic ints into N.0
      if (/^-?\d+$/.test(lit)) return lit
      return `${lit}_f64`
    },
  )

  // Formula fragment style (wrapAsRunnable adds fn main + live inputs)
  const lines = s.split('\n')
  const out: string[] = ['// pure SI: educational']
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('//')) {
      if (t) out.push(t)
      continue
    }
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (m) out.push(`let ${m[1]} = ${m[2].replace(/;?\s*$/, '')};`)
    else out.push(`// ${t}`)
  }
  return out.join('\n')
}

function pyToZig(body: string): string {
  let s = preparePyBody(body).replace(/^#/gm, '//')
  s = s.replace(/\bmath\.pi\b/g, 'std.math.pi').replace(/\bmath\.e\b/g, 'std.math.e')
  s = mapMathCalls(s, (name, args) => {
    if (name === 'hypot') return expandHypot(args, 'zig')
    if (name === 'radians') return `((${args})*std.math.pi/180.0)`
    if (name === 'degrees') return `((${args})*180.0/std.math.pi)`
    // Zig 0.14 CE: many @sin/@acos builtins removed: use std.math.*
    // Absolute value: @abs (std.math.fabs removed; @fabs invalid)
    const builtins: Record<string, string> = {
      sqrt: 'std.math.sqrt',
      sin: 'std.math.sin',
      cos: 'std.math.cos',
      tan: 'std.math.tan',
      asin: 'std.math.asin',
      acos: 'std.math.acos',
      atan: 'std.math.atan',
      exp: 'std.math.exp',
      // natural log: Zig 0.14 has @log, not std.math.ln
      log: '@log',
      log10: 'std.math.log10',
      fabs: '@abs',
      abs: '@abs',
    }
    if (name === 'atan2') return `std.math.atan2(${args})`
    const fn = builtins[name]
    if (fn) return `${fn}(${args})`
    return `${name}(${args})`
  })
  s = replacePow(s, (a, b) => `std.math.pow(f64, ${a}, ${b})`)
  // max/min
  s = s.replace(/\bmax\s*\(/g, '@max(').replace(/\bmin\s*\(/g, '@min(')
  s = s.replace(/(?<![A-Za-z0-9_.])\bpi\b(?![A-Za-z0-9_])/g, 'std.math.pi')
  s = s.replace(/(?<![A-Za-z0-9_@.])\babs\s*\(/g, '@abs(')
  // Bare integer → f64 (never touch P0 / 1e3 / already-float 1.0)
  s = promoteBareIntsToF64(s)
  // Zig 0.14 std.math.* is not comptime for comptime_float: cast numeric lits
  s = s.replace(
    /(?<!@as\(f64,\s*)(?<![A-Za-z0-9_@.])(\d+\.\d+(?:[eE][+-]?\d+)?|\d+\.0)(?![0-9.eEfF])/g,
    '@as(f64, $1)',
  )

  const lines = s.split('\n')
  const out: string[] = [
    '// pure SI: educational',
    'const std = @import("std");',
    'pub fn main() void {',
  ]
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('//')) {
      if (t) out.push(`    ${t}`)
      continue
    }
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (m) out.push(`    const ${m[1]} = ${m[2].replace(/;?\s*$/, '')};`)
    else out.push(`    // ${t}`)
  }
  out.push('}')
  return out.join('\n')
}

function pyToFortran(body: string): string {
  let s = preparePyBody(body).replace(/^#/gm, '!')
  s = s.replace(/\bmath\.pi\b/g, '3.141592653589793d0')
  s = mapMathCalls(s, (name, args) => {
    if (name === 'hypot') return expandHypot(args, 'fortran')
    if (name === 'radians') return `((${args})*3.141592653589793d0/180.0d0)`
    if (name === 'degrees') return `((${args})*180.0d0/3.141592653589793d0)`
    const map: Record<string, string> = {
      sqrt: 'sqrt',
      sin: 'sin',
      cos: 'cos',
      tan: 'tan',
      asin: 'asin',
      acos: 'acos',
      atan: 'atan',
      atan2: 'atan2',
      exp: 'exp',
      log: 'log',
      fabs: 'abs',
      abs: 'abs',
    }
    return `${map[name] ?? name}(${args})`
  })
  s = s.replace(/(?<![A-Za-z0-9_.])\bpi\b(?![A-Za-z0-9_])/g, '3.141592653589793d0')
  // max/min clamp bounds and bare ints → double (max(-1,min(1,…)) needs REAL)
  s = promoteBareIntsToF64(s)
  s = s.replace(/(\d+)\.0\b/g, '$1.0d0')
  // Fortran uses ** natively: leave ** after math map
  // Disambiguate case-colliding free identifiers (m/M, r/R, h/H) in body
  // by leaving them as-is here; wrapFortran renames injects + body.
  const lines = s.split('\n')
  const out: string[] = ['! pure SI: educational', 'program sidus_snippet', '  implicit none']
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('!')) {
      if (t) out.push(`  ${t}`)
      continue
    }
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (m) {
      out.push(`  real(kind=8) : ${m[1]}`)
      out.push(`  ${m[1]} = ${m[2]}`)
    } else out.push(`  ! ${t}`)
  }
  out.push('end program sidus_snippet')
  return out.join('\n')
}

/** Reject systems emission if residual Python math. or mangled method chains remain */
function systemsPortClean(code: string): boolean {
  // Python-style "math.sin" . Not "#include <math.h>" or "std.math.pow"
  if (/(?:^|[^A-Za-z0-9_.])math\.(?!h\b)[A-Za-z_]/.test(code)) return false
  // Broken method-chain ports from older translator
  if (/\.acos\(\)\.|\.sqrt\(\(\)\)|\.sin\(\)\.|\)\.acos\(\)\.sin/.test(code)) return false
  // Zig explosion: std.std…math.atan2 from rematching std.math
  if (/\bstd\.std\b/.test(code)) return false
  // Bare std.pow (invalid Zig) from mangled expandHypot rewrite
  if (/\bstd\.pow\s*\(/.test(code)) return false
  return true
}

export function makeSnippet(
  formulaId: string,
  assumptions: string,
  pythonBody: string,
  latexBody: string,
): FormulaSnippet {
  const pyHeader = `# ${assumptions}`
  const jsHeader = `// ${assumptions}`
  const matHeader = `% ${assumptions}`

  // Normalize multi-assign one-liners in the Python source users copy
  const pyNorm = expandMultiAssign(pythonBody)
  const jsBody = pyToJs(pyNorm)
  const portable = isPortable(pyNorm)

  const code: FormulaSnippet['code'] = {
    python: `${pyHeader}\n${pyNorm}`,
    javascript: `${jsHeader}\n${jsBody}`,
    typescript: `${jsHeader}\n${jsBody}`,
    matlab: `${matHeader}\n${pyToMatlab(pyNorm)}`,
    julia: `# ${assumptions}\n${pyToJulia(pyNorm)}`,
    latex: `% ${assumptions}\n${latexBody}`,
  }

  if (portable) {
    const c = pyToC(pythonBody, false)
    const cpp = pyToC(pythonBody, true)
    const rust = pyToRust(pythonBody)
    const zig = pyToZig(pythonBody)
    const fortran = pyToFortran(pythonBody)
    if (systemsPortClean(c)) code.c = `/* ${assumptions} */\n${c}`
    if (systemsPortClean(cpp)) code.cpp = `// ${assumptions}\n${cpp}`
    if (systemsPortClean(rust)) code.rust = `// ${assumptions}\n${rust}`
    if (systemsPortClean(zig)) code.zig = `// ${assumptions}\n${zig}`
    if (systemsPortClean(fortran)) code.fortran = `! ${assumptions}\n${fortran}`
  }

  return { formulaId, assumptions, code }
}

export function willEmitSystemsLangs(pythonBody: string): boolean {
  if (!isPortable(pythonBody)) return false
  const rust = pyToRust(pythonBody)
  return systemsPortClean(rust)
}

/** Exposed for parity tests */
export function portPythonToRust(pythonBody: string): string {
  return pyToRust(pythonBody)
}

export function portPythonToZig(pythonBody: string): string {
  return pyToZig(pythonBody)
}

export type { CodeLang }
