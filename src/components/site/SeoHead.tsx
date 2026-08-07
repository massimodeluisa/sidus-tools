import { useEffect } from 'react'
import { OG_H, OG_W, SITE_ORIGIN, buildOgImageUrl } from '@/lib/og'

type Props = {
  title: string
  description: string
  path?: string
  /** Full search string or URLSearchParams for dynamic tool OG */
  search?: string | URLSearchParams
  /** Override absolute og:image URL */
  image?: string
  imageAlt?: string
  /** JSON-LD object or array */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * Lightweight head manager for SPA navigations.
 * Sets Open Graph + Twitter cards with absolute 1200×630 og:image
 * (dynamic /api/og when tool URL params present).
 */
export function SeoHead({
  title,
  description,
  path = '/',
  search,
  image,
  imageAlt,
  jsonLd,
}: Props) {
  useEffect(() => {
    document.title = title
    const ensure = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name'
      let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.content = content
    }

    // Prefer live origin (preview deploys) so og:image hits the same host as the page
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : SITE_ORIGIN

    const pageUrl = `${origin}${path}${
      search
        ? typeof search === 'string'
          ? search.startsWith('?')
            ? search
            : search
              ? `?${search}`
              : ''
          : search.toString()
            ? `?${search.toString()}`
            : ''
        : ''
    }`
    // Canonical without hash; keep query for shareable tool state
    const canonical = `${origin}${path}${
      search && (typeof search === 'string' ? search : search.toString())
        ? `?${typeof search === 'string' ? search.replace(/^\?/, '') : search.toString()}`
        : ''
    }`

    const ogImage = image ?? buildOgImageUrl(path, search, origin)
    const alt = imageAlt ?? title

    ensure('description', description)
    ensure('og:title', title, true)
    ensure('og:description', description, true)
    ensure('og:url', pageUrl.split('#')[0], true)
    ensure('og:type', 'website', true)
    ensure('og:site_name', 'SIDUS', true)
    ensure('og:image', ogImage, true)
    ensure('og:image:secure_url', ogImage, true)
    ensure('og:image:width', String(OG_W), true)
    ensure('og:image:height', String(OG_H), true)
    ensure('og:image:type', 'image/png', true)
    ensure('og:image:alt', alt, true)

    ensure('twitter:card', 'summary_large_image')
    ensure('twitter:title', title)
    ensure('twitter:description', description)
    ensure('twitter:image', ogImage)
    ensure('twitter:image:alt', alt)

    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical.split('#')[0]

    const scriptId = 'sidus-jsonld'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    }
  }, [title, description, path, search, image, imageAlt, jsonLd])

  return null
}
