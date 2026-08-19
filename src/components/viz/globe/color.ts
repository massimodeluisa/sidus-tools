/**
 * CSS color to GL color. The globe's WebGL altitude layer needs the same
 * color the 2D style layers get from the caller, as normalized floats.
 */

export type Rgba = [number, number, number, number]

const WHITE: Rgba = [1, 1, 1, 1]

function hexPart(hex: string, from: number, len: number): number {
  const raw = len === 1 ? hex.slice(from, from + 1).repeat(2) : hex.slice(from, from + len)
  return parseInt(raw, 16) / 255
}

/**
 * Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()`.
 * Anything else falls back to opaque white rather than throwing: a wrong
 * color is a cosmetic defect, a thrown error inside render() is not.
 */
export function parseCssRgba(color: string): Rgba {
  const value = color.trim().toLowerCase()

  if (value.startsWith('#')) {
    const hex = value.slice(1)
    if (hex.length === 3 || hex.length === 4) {
      return [
        hexPart(hex, 0, 1),
        hexPart(hex, 1, 1),
        hexPart(hex, 2, 1),
        hex.length === 4 ? hexPart(hex, 3, 1) : 1,
      ]
    }
    if (hex.length === 6 || hex.length === 8) {
      return [
        hexPart(hex, 0, 2),
        hexPart(hex, 2, 2),
        hexPart(hex, 4, 2),
        hex.length === 8 ? hexPart(hex, 6, 2) : 1,
      ]
    }
    return WHITE
  }

  const match = value.match(/^rgba?\(([^)]+)\)$/)
  if (!match) return WHITE
  const parts = match[1].split(/[\s,/]+/).filter((p) => p.length > 0)
  if (parts.length < 3) return WHITE
  const channel = (raw: string): number => {
    const n = Number.parseFloat(raw)
    if (!Number.isFinite(n)) return 0
    return raw.endsWith('%') ? n / 100 : n / 255
  }
  const alpha = parts.length > 3 ? Number.parseFloat(parts[3]) : 1
  return [
    channel(parts[0]),
    channel(parts[1]),
    channel(parts[2]),
    Number.isFinite(alpha) ? alpha : 1,
  ]
}

/** Same color at a different alpha, as a style-spec color string. */
export function cssRgbaWithAlpha(color: string, alpha: number): string {
  const [r, g, b] = parseCssRgba(color)
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`
}
