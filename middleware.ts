/**
 * Bot / social-crawler HTML injection for OG tags.
 * SPA shells alone lack per-tool og:image; crawlers that do not run JS
 * get a minimal document with absolute meta + link to /api/og.
 *
 * For tool URLs we also rewrite meta on the real SPA HTML (non-bot) so
 * OpenGraph debuggers that use a browser UA still see the tool image.
 *
 * Runs on Vercel Edge. Local Vite dev does not use this file.
 * Returning void continues the request to the static SPA (Vercel middleware).
 */

/** Social + unfurl + OG debuggers (opengraph.xyz often uses a browser-like UA with “opengraph”). */
const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Slackbot|SkypeUriPreview|vkShare|W3C_Validator|redditbot|Embedly|Quora Link Preview|Showyoubot|outbrain|pinterest|flipboard|tumblr|bitlybot|Applebot|Google-InspectionTool|GPTBot|ChatGPT|ClaudeBot|anthropic|Perplexity|Bytespider|meta-externalagent|opengraph|OpenGraph|iframely|metatags\.io|metainspector|unfurl|preview\.card|linkexpander|embedly|nuzzel|scoop\.it|baiduspider|yandex|duckduckbot|bingpreview|rogerbot|Valve/i

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

  // Cache-bust for scrapers that cached a failed first fetch of og:image
  if (!og.searchParams.has('v')) og.searchParams.set('v', '3')

  return {
    title,
    description,
    canonical: absolute,
    image: og.toString(),
  }
}

/** Patch SPA index.html meta so non-bot scrapers still see tool-specific OG. */
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

  // Bots / unfurlers: minimal HTML shell with OG + preview image
  if (isBot(ua)) {
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
        'x-sidus-bot-shell': '1',
      },
    })
  }

  // All app routes: rewrite SPA shell meta so opengraph.xyz / Chrome-UA scrapers
  // that do not match BOT_RE still see absolute og:image on *this* host.
  // (index.html hardcodes https://sidus.tools — broken on preview + when DNS is down.)
  try {
    const indexUrl = new URL('/index.html', url.origin)
    const indexRes = await fetch(indexUrl)
    if (indexRes.ok) {
      const raw = await indexRes.text()
      const html = patchSpaHtml(raw, ctx)
      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, s-maxage=60, stale-while-revalidate=600',
          'x-sidus-og-patch': '1',
        },
      })
    }
  } catch {
    /* fall through to static SPA */
  }

  return
}

export const config = {
  matcher: ['/', '/tools', '/tools/:path*', '/resources'],
}
