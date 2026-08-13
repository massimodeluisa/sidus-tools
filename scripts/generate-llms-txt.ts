/**
 * Generate public/llms.txt from the live TOOLS catalog.
 *
 * Agent parsers often mishandle Unicode next to bare paths (em dash, Δ, μ, …)
 * and treat the whole line as a URL. We emit:
 *   - absolute https://sidus.tools/… URLs
 *   - Markdown links [title](url) so the href is unambiguous
 *   - ASCII-safe descriptions (fold common Greek / punctuation)
 *
 * Usage: npx tsx scripts/generate-llms-txt.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS, type ToolCategory, type ToolMeta } from '../src/data/tools.ts'
import { SITE_ORIGIN } from '../src/lib/og/types.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public', 'llms.txt')
const SITE = SITE_ORIGIN

/** Fold common scientific Unicode so naive URL scrapers stay clean. */
function asciiSafe(s: string): string {
  return s
    .replace(/\u2014|\u2013|\u2212/g, '-') // em/en/minus
    .replace(/\u2026/g, '...')
    .replace(/\u00d7/g, 'x')
    .replace(/\u00b7/g, '.')
    .replace(/\u2248/g, '~')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u00bd/g, '1/2')
    .replace(/\u00b2/g, '2')
    .replace(/\u00b3/g, '3')
    .replace(/\u0307/g, '') // combining dot above (q̇)
    .replace(/\u0394|\u2206/g, 'delta') // Δ
    .replace(/\u03bc|\u00b5/g, 'mu') // μ µ
    .replace(/\u03c1/g, 'rho') // ρ
    .replace(/\u03bb/g, 'lambda') // λ
    .replace(/\u03b2/g, 'beta') // β
    .replace(/\u03bd/g, 'nu') // ν
    .replace(/\u03c9/g, 'omega') // ω
    .replace(/\u03b5/g, 'eps') // ε
    .replace(/\u03b1/g, 'alpha') // α
    .replace(/\u221e/g, 'inf') // ∞
    .replace(/\u221a/g, 'sqrt') // √
    .replace(/\u00b0/g, 'deg') // °
    .replace(/\u2092/g, '2') // ₂
    .replace(/\u2093/g, 'x')
    .replace(/\u2080/g, '0')
    .replace(/\u2081/g, '1')
    .replace(/\u2082/g, '2')
    .replace(/\u1d62/g, 'i')
    .replace(/\u1d63/g, 'r')
    .replace(/\u1d64/g, 'u')
    .replace(/\u1d65/g, 'v')
    .replace(/\u209a/g, 'p')
    .replace(/\u1d50/g, 'm') // ₘ
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '') // drop remaining non-ASCII
    .replace(/\s+/g, ' ')
    .trim()
}

const CATEGORY_TITLE: Record<ToolCategory, string> = {
  orbital: 'Orbital / mission design',
  propulsion: 'Propulsion',
  satellite: 'Satellite ops',
  utilities: 'Utilities',
  crew: 'Crew / ECLSS',
  geometry: 'Geometry / navigation',
  planetary: 'Planetary / interplanetary',
}

const CATEGORY_ORDER: ToolCategory[] = [
  'orbital',
  'propulsion',
  'satellite',
  'crew',
  'geometry',
  'planetary',
  'utilities',
]

function toolUrl(id: string): string {
  return `${SITE}/tools/${id}`
}

function toolLine(t: ToolMeta): string {
  const title = asciiSafe(t.title)
  const desc = asciiSafe(t.description)
  return `- [${title}](${toolUrl(t.id)}): ${desc}`
}

function build(): string {
  const byCat = new Map<ToolCategory, ToolMeta[]>()
  for (const t of TOOLS) {
    const list = byCat.get(t.category) ?? []
    list.push(t)
    byCat.set(t.category, list)
  }
  for (const list of byCat.values()) {
    list.sort((a, b) => a.id.localeCompare(b.id))
  }

  const lines: string[] = [
    '# SIDUS - Space Engineering Tools',
    '> Open-source educational calculators for orbital mechanics, propulsion, satellite ops, launch, RF, and crew ECLSS. Pure SI, browser-local, no backend for math.',
    '',
    `Site: ${SITE}`,
    'Repository: https://github.com/massimodeluisa/sidus-tools',
    'License: MIT',
    'Contact: https://massimo.deluisa.bio',
    '',
    '## What SIDUS is',
    'SIDUS (Latin *sidus* = constellation) is a non-profit educational project with no affiliation to NASA, ESA, SpaceX, Firefly, Roscosmos, or any agency or company. Equations are independent reimplementations from public textbooks and standards (Vallado, Curtis, NASA GRC, OCHMO, etc.).',
    '',
    '## How to use with AI agents',
    `- Catalog: [${SITE}/tools](${SITE}/tools) - each tool is \`${SITE}/tools/{id}\`.`,
    '- Pure physics library: `src/lib/physics/` (TypeScript, SI units).',
    `- MCP (public, no install): [${SITE}/api/mcp](${SITE}/api/mcp) - add that URL to Claude Desktop / Cursor / any MCP client.`,
    '- Optional offline stdio: `npm run mcp` from a clone of this repo.',
    '- Prefer citing primary sources linked on each tool page.',
    `- Open Graph images: [${SITE}/api/og?page=home](${SITE}/api/og?page=home), \`${SITE}/api/og?tool={id}\` (optional tool query params for live formula results).`,
    '',
    '## Project docs (GitHub)',
    '- [INDEX.md](https://github.com/massimodeluisa/sidus-tools/blob/main/INDEX.md) - documentation map',
    '- [CONVENTIONS.md](https://github.com/massimodeluisa/sidus-tools/blob/main/CONVENTIONS.md) - coding + maintenance rules',
    '- [CONTRIBUTING.md](https://github.com/massimodeluisa/sidus-tools/blob/main/CONTRIBUTING.md) - how to contribute',
    '- [AGENTS.md](https://github.com/massimodeluisa/sidus-tools/blob/main/AGENTS.md) - agent entrypoint',
    '- [LICENSE.md](https://github.com/massimodeluisa/sidus-tools/blob/main/LICENSE.md) - MIT license notes',
    '',
    '## Tool catalog (live)',
    '',
  ]

  for (const cat of CATEGORY_ORDER) {
    const list = byCat.get(cat)
    if (!list?.length) continue
    lines.push(`### ${CATEGORY_TITLE[cat]}`)
    for (const t of list) lines.push(toolLine(t))
    lines.push('')
  }

  lines.push(
    '## Other pages',
    `- [Home](${SITE}/)`,
    `- [Resources / public data](${SITE}/resources)`,
    `- [Privacy and cookies](${SITE}/privacy)`,
    `- [MCP endpoint](${SITE}/api/mcp)`,
    `- [robots.txt](${SITE}/robots.txt)`,
    `- [sitemap.xml](${SITE}/sitemap.xml)`,
    '',
    '## Non-goals (do not expect)',
    '- Full CAD/PLM/FEA/CFD products',
    '- CR3BP/n-body mission design suites',
    '- Live CelesTrak subscription API as a service',
    '- Flight-rule medical certification (ECLSS tools are educational)',
    '',
    '## Documentation (GitHub)',
    '- https://github.com/massimodeluisa/sidus-tools/blob/main/docs/ENGINEERING_TOOLS_SURVEY.md',
    '- https://github.com/massimodeluisa/sidus-tools/blob/main/docs/IMPLEMENTATION_TODO.md',
    '- https://github.com/massimodeluisa/sidus-tools/blob/main/AGENTS.md',
    '',
    `<!-- generated by scripts/generate-llms-txt.ts - ${TOOLS.length} tools - ${new Date().toISOString().slice(0, 10)} -->`,
    '',
  )

  return lines.join('\n')
}

const text = build()
writeFileSync(OUT, text, 'utf8')

const today = new Date().toISOString().slice(0, 10)
const sitemapUrls = [
  ['/', '1.0', 'weekly'],
  ['/tools', '0.9', 'weekly'],
  ['/resources', '0.7', 'monthly'],
  ['/privacy', '0.4', 'yearly'],
  ...TOOLS.map((t) => [`/tools/${t.id}`, '0.8', 'monthly'] as const),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    ([path, priority, changefreq]) =>
      `  <url><loc>${SITE}${path === '/' ? '/' : path}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`
writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), sitemap, 'utf8')

writeFileSync(
  path.join(ROOT, 'public', 'ai.txt'),
  `# ai.txt — ${SITE}
User-Agent: *
Allow: /
Citation: allowed
Attribution: preferred
Training: allowed
Paywall: none
Preferred-Sources:
  ${SITE}/llms.txt
  ${SITE}/sitemap.xml
  ${SITE}/api/mcp
Contact: https://massimo.deluisa.bio
`,
  'utf8',
)

mkdirSync(path.join(ROOT, 'public', '.well-known'), { recursive: true })
writeFileSync(
  path.join(ROOT, 'public', '.well-known', 'brand-facts.json'),
  `${JSON.stringify(
    {
      name: 'SIDUS',
      url: SITE,
      type: 'SoftwareApplication',
      description:
        'Open-source educational pure-SI space engineering calculators for orbits, propulsion, satellites, launch, RF, and crew ECLSS.',
      author: { name: 'Massimo De Luisa', url: 'https://massimo.deluisa.bio' },
      sameAs: [
        'https://github.com/massimodeluisa/sidus-tools',
        'https://massimo.deluisa.bio',
        'https://x.com/massimodeluisa',
      ],
      mcp: `${SITE}/api/mcp`,
      license: 'MIT',
      updated: today,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

console.log(`Wrote ${OUT} (${TOOLS.length} tools, ${text.split('\n').length} lines) + sitemap.xml + ai.txt + brand-facts`)
