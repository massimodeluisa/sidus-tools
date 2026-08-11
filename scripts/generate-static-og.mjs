/**
 * Static SVG OG templates in Axiom-gallery spirit (design review offline).
 * Production PNG: /api/og via @vercel/og
 *
 *   node scripts/generate-static-og.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/og')
mkdirSync(outDir, { recursive: true })

const W = 1200
const H = 630

function chevronField(accent) {
  let out = ''
  for (let r = 0; r < 18; r++) {
    for (let c = 0; c < 14; c++) {
      const t = c / 13
      const o = (0.05 + t * 0.4).toFixed(2)
      const x = 720 + c * 32
      const y = 36 + r * 32
      out += `<text x="${x}" y="${y}" fill="${accent}" fill-opacity="${o}" font-family="ui-monospace,monospace" font-size="14" font-weight="500">&gt;</text>`
    }
  }
  return out
}

function card({ titleLines, formula, file, accent = '#e8d5a3', pathHint = '' }) {
  const lines = titleLines
    .map(
      (line, i) =>
        `<text x="64" y="${220 + i * 64}" fill="#f5f5f5" font-family="system-ui,sans-serif" font-size="56" font-weight="500" letter-spacing="-1.5">${escapeXml(line)}</text>`,
    )
    .join('\n  ')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#000"/>
  <defs>
    <radialGradient id="wash" cx="90%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#wash)"/>
  <!-- orbital ellipses -->
  <ellipse cx="1080" cy="300" rx="210" ry="110" fill="none" stroke="${accent}" stroke-opacity="0.2" transform="rotate(-18 1080 300)"/>
  <ellipse cx="1060" cy="300" rx="170" ry="80" fill="none" stroke="${accent}" stroke-opacity="0.14" transform="rotate(-18 1060 300)"/>
  <circle cx="1000" cy="260" r="5" fill="${accent}" fill-opacity="0.85"/>
  ${chevronField(accent)}
  <!-- brand -->
  <circle cx="82" cy="72" r="16" fill="none" stroke="${accent}" stroke-width="1.5"/>
  <circle cx="82" cy="72" r="4" fill="${accent}"/>
  <text x="110" y="80" fill="#f5f5f5" font-family="system-ui,sans-serif" font-size="26" font-weight="700" letter-spacing="4">SIDUS</text>
  ${lines}
  ${
    formula
      ? `<text x="64" y="${220 + titleLines.length * 64 + 24}" fill="#a3a3a3" font-family="ui-monospace,monospace" font-size="20">${escapeXml(formula)}</text>`
      : ''
  }
  <text x="64" y="580" fill="#737373" font-family="ui-monospace,monospace" font-size="18">https://sidus.tools</text>
  <text x="280" y="580" fill="${accent}" font-family="ui-monospace,monospace" font-size="18">→</text>
  ${pathHint ? `<text x="310" y="580" fill="#3a3a3a" font-family="ui-monospace,monospace" font-size="16">${escapeXml(pathHint)}</text>` : ''}
</svg>`
  writeFileSync(join(outDir, file), svg)
  console.log('wrote', file)
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

card({
  file: 'default.svg',
  titleLines: ['Space engineering', 'tools, pure SI,', 'open source.'],
  accent: '#e8d5a3',
})

card({
  file: 'tools.svg',
  titleLines: ['Thirty calculators.', 'One SI stack.'],
  accent: '#7a9bb8',
  pathHint: '/tools',
})

card({
  file: 'hohmann.svg',
  titleLines: ['Hohmann transfer'],
  formula: 'Δv = |vₚ − v₁| + |v₂ − vₐ|   ·   TOF = π √(a³/μ)',
  accent: '#e8d5a3',
  pathHint: '/tools/hohmann',
})

console.log('Axiom-style static SVG in public/og/. Production PNG: /api/og')
