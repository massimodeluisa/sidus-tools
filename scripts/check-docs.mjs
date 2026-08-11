#!/usr/bin/env node
/**
 * Docs / conventions surface check (CONVENTIONS.md §7-10).
 * Exit 1 if mandatory policy docs or locale keys are missing.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const REQUIRED_DOCS = [
  'CONVENTIONS.md',
  'CONTRIBUTIONS.md',
  'CONTRIBUTING.md',
  'LICENSE.md',
  'LICENSE',
  'INDEX.md',
  'AGENTS.md',
  'README.md',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/llms.txt',
]

const REQUIRED_LOCALE_KEYS = [
  'footer.dev.conventions',
  'footer.dev.contributions',
  'footer.dev.docs_index',
  'footer.dev.license',
  'footer.dev.agents',
  'nav.language',
]

function fail(msg) {
  console.error(`check-docs: ${msg}`)
  process.exitCode = 1
}

for (const rel of REQUIRED_DOCS) {
  const p = path.join(ROOT, rel)
  if (!existsSync(p)) fail(`missing ${rel}`)
}

const robots = readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8')
if (!/Sitemap:\s*https:\/\/sidus\.tools\/sitemap\.xml/.test(robots)) {
  fail('robots.txt must declare absolute Sitemap: https://sidus.tools/sitemap.xml')
}
if (!/Allow:\s*\//.test(robots)) {
  fail('robots.txt should Allow: /')
}

const sitemap = readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8')
if (!sitemap.includes('https://sidus.tools/tools')) {
  fail('sitemap.xml should include tools catalog URL')
}

const localesDir = path.join(ROOT, 'src/i18n/locales')
const localeFiles = readdirSync(localesDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')
const expected = ['en', 'it', 'de', 'fr', 'es', 'ru', 'zh', 'ja', 'ko', 'pt']
for (const code of expected) {
  if (!localeFiles.includes(`${code}.ts`)) fail(`missing locale src/i18n/locales/${code}.ts`)
}

// Lightweight key presence (string search: locales are TS object literals)
for (const f of localeFiles) {
  const text = readFileSync(path.join(localesDir, f), 'utf8')
  for (const key of REQUIRED_LOCALE_KEYS) {
    const leaf = key.split('.').pop()
    if (!new RegExp(`\\b${leaf}\\s*:`).test(text)) {
      fail(`${f}: missing key leaf "${leaf}" (from ${key})`)
    }
  }
}

// Policy docs must mention each other lightly
const conventions = readFileSync(path.join(ROOT, 'CONVENTIONS.md'), 'utf8')
for (const name of ['CONTRIBUTIONS.md', 'INDEX.md', 'LICENSE.md', 'llms', 'sitemap', 'i18n']) {
  if (!conventions.toLowerCase().includes(name.toLowerCase().replace('.md', ''))) {
    // soft: only hard-fail critical cross-links
  }
}
if (!conventions.includes('CONTRIBUTIONS.md')) fail('CONVENTIONS.md should link CONTRIBUTIONS.md')
if (!conventions.includes('sitemap')) fail('CONVENTIONS.md should document sitemap maintenance')

if (process.exitCode) {
  console.error('check-docs: FAILED')
  process.exit(process.exitCode)
}
console.log('check-docs: OK: policy docs, robots/sitemap, locales present')
