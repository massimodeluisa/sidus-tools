/**
 * Edge middleware: OG meta + crawler HTML strategy.
 *
 * - AI / search crawlers (GPTBot, ClaudeBot, Perplexity, Googlebot, …): full SPA
 *   `index.html` with patched OG/canonical so they see JSON-LD + rich SSR body
 *   (isready.ai / non-JS extractors). Thin shells fail content-depth checks.
 * - Social unfurlers (Facebook, Twitter, Slack, Discord, …): lightweight HTML
 *   with absolute OG + optional tool preview image (fast TTFB for cards).
 * - Everyone else on app routes: same SPA patch so browser-like scrapers still
 *   get host-correct og:image.
 *
 * Local Vite dev does not run this file.
 * Returning void continues to the static SPA (Vercel middleware).
 */

/** Pure social / unfurl agents — prefer a small HTML card, not the full SPA body. */
const SOCIAL_RE =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Slackbot|SkypeUriPreview|vkShare|redditbot|Embedly|Quora Link Preview|Showyoubot|outbrain|pinterest|flipboard|tumblr|bitlybot|meta-externalagent|opengraph|OpenGraph|iframely|metatags\.io|metainspector|unfurl|preview\.card|linkexpander|embedly|nuzzel|scoop\.it|Valve/i

/**
 * Any bot/crawler (AI + search + social). Social is handled first via SOCIAL_RE;
 * remaining matches get the full SPA document.
 */
const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Slackbot|SkypeUriPreview|vkShare|W3C_Validator|redditbot|Embedly|Quora Link Preview|Showyoubot|outbrain|pinterest|flipboard|tumblr|bitlybot|Applebot|Google-InspectionTool|GPTBot|ChatGPT|ClaudeBot|anthropic|Perplexity|Bytespider|OAI-SearchBot|meta-externalagent|opengraph|OpenGraph|iframely|metatags\.io|metainspector|unfurl|preview\.card|linkexpander|embedly|nuzzel|scoop\.it|baiduspider|yandex|duckduckbot|bingpreview|rogerbot|Valve|isready/i

/** Layout/chrome query keys must not pollute dynamic formula OG images. */
const OG_STRIP_PARAMS = new Set([
  'focus',
  'chrome',
  'title',
  'subtitle',
  'formula',
  'back',
  'edit',
  'tags',
  'meta',
  'precision',
  'sources',
  'blocks',
  'params',
  'results',
  'preview',
  'code',
  'mcp',
])

/** Site “content revised” signal for Last-Modified (ISO date, midnight UTC). */
const CONTENT_REVISED = '2026-08-11T00:00:00.000Z'

function isSocial(ua: string): boolean {
  return SOCIAL_RE.test(ua)
}

function isBot(ua: string): boolean {
  return BOT_RE.test(ua)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s)
}

function botHtml(opts: {
  title: string
  description: string
  url: string
  image: string
  bodyHtml: string
}): string {
  const { title, description, url, image, bodyHtml } = opts
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}"/>
  <meta name="author" content="Massimo De Luisa"/>
  <link rel="canonical" href="${escapeHtml(url)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="SIDUS"/>
  <meta property="og:title" content="${escapeHtml(title)}"/>
  <meta property="og:description" content="${escapeHtml(description)}"/>
  <meta property="og:url" content="${escapeHtml(url)}"/>
  <meta property="og:image" content="${escapeHtml(image)}"/>
  <meta property="og:image:secure_url" content="${escapeHtml(image)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:type" content="image/png"/>
  <meta property="og:image:alt" content="${escapeHtml(title)}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeHtml(title)}"/>
  <meta name="twitter:description" content="${escapeHtml(description)}"/>
  <meta name="twitter:image" content="${escapeHtml(image)}"/>
</head>
<body style="font-family:system-ui,sans-serif;background:#050505;color:#e8e8e8;max-width:42rem;margin:2rem auto;padding:0 1rem;line-height:1.55">
${bodyHtml}
<p><a href="${escapeHtml(url)}" style="color:#c4c8ce">Open interactive tool</a> · <a href="https://sidus.tools/" style="color:#c4c8ce">SIDUS</a></p>
</body>
</html>`
}

type OgCtx = {
  title: string
  description: string
  canonical: string
  image: string
}

function resolveOgCtx(requestUrl: URL): OgCtx {
  const origin = `${requestUrl.protocol}//${requestUrl.host}`
  const absolute = requestUrl.toString().split('#')[0]
  const og = new URL('/api/og', origin)

  let title = 'SIDUS: Space Engineering Tools'
  let description =
    'Open-source pure-SI space engineering calculators for orbits, propulsion, satellites, launch, RF, and crew ECLSS.'

  if (requestUrl.pathname === '/' || requestUrl.pathname === '') {
    og.searchParams.set('page', 'home')
  } else if (requestUrl.pathname === '/tools') {
    og.searchParams.set('page', 'tools')
    title = 'Tools · SIDUS'
    description = 'Catalog of pure-SI space engineering calculators.'
  } else if (requestUrl.pathname === '/resources') {
    og.searchParams.set('page', 'resources')
    title = 'Resources · SIDUS'
    description = 'Public data sources and references used by SIDUS.'
  } else {
    const m = requestUrl.pathname.match(/^\/tools\/([^/]+)\/?$/)
    if (m) {
      const toolId = decodeURIComponent(m[1])
      og.searchParams.set('tool', toolId)
      requestUrl.searchParams.forEach((v, k) => {
        if (k === 'tool' || k === 'page' || OG_STRIP_PARAMS.has(k)) return
        og.searchParams.set(k, v)
      })
      title = `${toolId} · SIDUS`
      description = `SIDUS pure-SI calculator: ${toolId}. Educational orbital / propulsion / ECLSS models.`
    } else {
      og.searchParams.set('page', 'home')
    }
  }

  // Cache-bust for scrapers that cached empty/failed og:image bodies
  if (!og.searchParams.has('v')) og.searchParams.set('v', '5')

  return {
    title,
    description,
    canonical: absolute,
    image: og.toString(),
  }
}

/** Patch SPA index.html meta so scrapers see tool-specific OG + correct host. */
function patchSpaHtml(html: string, ctx: OgCtx): string {
  const { title, description, canonical, image } = ctx
  let out = html
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    const re = new RegExp(
      `<meta\\s+${attr}=["']${key}["']\\s+content=["'][^"']*["']\\s*/?>`,
      'i',
    )
    const re2 = new RegExp(
      `<meta\\s+content=["'][^"']*["']\\s+${attr}=["']${key}["']\\s*/?>`,
      'i',
    )
    const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`
    if (re.test(out)) out = out.replace(re, tag)
    else if (re2.test(out)) out = out.replace(re2, tag)
    else out = out.replace('</head>', `    ${tag}\n  </head>`)
  }
  setMeta('name', 'description', description)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', canonical)
  setMeta('property', 'og:image', image)
  setMeta('property', 'og:image:secure_url', image)
  setMeta('property', 'og:image:alt', title)
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', image)
  setMeta('name', 'twitter:image:alt', title)
  out = out.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
  )
  return out
}

async function spaResponse(url: URL, ctx: OgCtx, extraHeaders: Record<string, string> = {}) {
  const indexUrl = new URL('/index.html', url.origin)
  const indexRes = await fetch(indexUrl)
  if (!indexRes.ok) return null
  const raw = await indexRes.text()
  const html = patchSpaHtml(raw, ctx)
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'last-modified': new Date(CONTENT_REVISED).toUTCString(),
      ...extraHeaders,
    },
  })
}

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') ?? ''
  const url = new URL(request.url)

  // Never intercept API / static assets
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(xml|txt|svg|png|ico|js|css|map|webp|jpg)$/)
  ) {
    return
  }

  const ctx = resolveOgCtx(url)
  const toolMatch = url.pathname.match(/^\/tools\/([^/]+)\/?$/)

  // Social unfurlers: light shell (fast cards). AI/search bots get full SPA below.
  if (isSocial(ua)) {
    let body = `<h1>SIDUS</h1><p>${escapeHtml(ctx.description)}</p>`
    if (url.pathname === '/tools') body = `<h1>Tools</h1><p>${escapeHtml(ctx.description)}</p>`
    else if (url.pathname === '/resources')
      body = `<h1>Resources</h1><p>${escapeHtml(ctx.description)}</p>`
    else if (toolMatch) {
      const toolId = decodeURIComponent(toolMatch[1])
      body = `<h1>${escapeHtml(toolId)}</h1><p>${escapeHtml(ctx.description)}</p>
<p>Formula card and live results are rendered in the Open Graph image.</p>
<img src="${escapeHtml(ctx.image)}" alt="${escapeHtml(ctx.title)}" width="1200" height="630" style="max-width:100%;height:auto;border:1px solid #222"/>`
    }

    const html = botHtml({
      title: ctx.title,
      description: ctx.description,
      url: ctx.canonical,
      image: ctx.image,
      bodyHtml: body,
    })

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
        'last-modified': new Date(CONTENT_REVISED).toUTCString(),
        'x-sidus-bot-shell': 'social',
      },
    })
  }

  // AI / search crawlers + normal app routes: full SPA (JSON-LD + rich SSR body)
  try {
    const res = await spaResponse(url, ctx, {
      'x-sidus-og-patch': '1',
      ...(isBot(ua) ? { 'x-sidus-bot-shell': 'spa-full' } : {}),
    })
    if (res) return res
  } catch {
    /* fall through to static SPA */
  }

  return
}

export const config = {
  matcher: ['/', '/tools', '/tools/:path*', '/resources'],
}
