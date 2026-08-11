# SIDUS Open Graph images

## Spec (industry best practice)

| Property | Value |
|----------|--------|
| Size | **1200 × 630** px (1.91:1) |
| Safe zone | ~60 px margin; key text in center ~1080×560 |
| Format | PNG (`image/png`) via `@vercel/og` |
| File / CDN | Edge-cached `s-maxage=600` |
| Meta | `og:image`, `og:image:width/height/type/alt`, `twitter:card=summary_large_image` |

References: [MyOGImage size guide](https://myogimage.com/blog/og-image-size-meta-tags-complete-guide), [ogimage.gallery SaaS](https://www.ogimage.gallery/category/saas), Meta sharing docs.

## Visual system (Axiom-gallery tier)

Reference: [Axiom on ogimage.gallery](https://www.ogimage.gallery/og-images/axiom): pure black, huge left headline, URL + arrow, abstract right rail.

SIDUS adaptation:

- Background pure `#000`, fg `#f5f5f5`, muted `#737373`
- **Left column only** for type (massive air, no card soup)
- Brand: orbital mark + **SIDUS** wordmark
- Tool: category whisper → huge title → mono formula
- Dynamic: 2-3 oversized metric numbers (LIVE badge)
- **Right rail:** fading `>` chevron field + orbital ellipses (brand DNA, like Axiom’s chevrons)
- Footer: `https://sidus.tools →` (+ tool path)
- Per-tool accent from `src/lib/og/catalog.ts`

## Modes

1. **Static tool card**: `/api/og?tool=hohmann`  
   Title · blurb · formula · tags (no metrics).

2. **Dynamic result card**: same query string as the tool page  
   e.g. `/tools/hohmann?h1=200&h2=35786&hu=km&body=earth`  
   → metrics: Δv total, Δv₁, Δv₂, TOF + context line.

3. **Site pages**: `?page=home|tools|resources`

## Architecture

```
share URL  →  middleware (bots) injects og:image
           →  /api/og  (Edge ImageResponse)
                ├─ resolveOgPayload (src/lib/og/compute.ts)
                └─ Satori layout (api/og.tsx)

SPA SeoHead  →  updates og:image when searchParams change
```

Crawlers that do not execute JS still get correct tags from `middleware.ts`.

## Local design SVG

```bash
npm run og:static   # writes public/og/default.svg, tools.svg
```

Production share previews use PNG from `/api/og` (Facebook/LinkedIn/X do not use SVG reliably).
