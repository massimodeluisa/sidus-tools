import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Reset window scroll on pathname changes (e.g. /tools → /tools/hohmann).
 * Without this, SPA navigation keeps the previous list scroll offset so the
 * tool page appears to open scrolled midway/down.
 *
 * Search-param-only updates (shareable tool state) intentionally do NOT reset.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    // Instant jump: no smooth scroll (would feel like the page "falls")
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}
