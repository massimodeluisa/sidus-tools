import { Routes, Route, useSearchParams, useLocation } from 'react-router-dom'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { ScrollToTop } from '@/components/site/ScrollToTop'
import { HomePage } from '@/pages/HomePage'
import { ToolsPage } from '@/pages/ToolsPage'
import { ToolDetailPage } from '@/pages/ToolDetailPage'
import { ResourcesPage } from '@/pages/ResourcesPage'
import { HomeAltPage } from '@/pages/HomeAltPage'
import { cn } from '@/lib/utils'

function useFocusMode(): boolean {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  if (!pathname.startsWith('/tools/')) return false
  const focus = params.get('focus')
  const chrome = params.get('chrome')
  if (focus != null && ['1', 'true', 'yes', 'on'].includes(focus.toLowerCase())) return true
  if (chrome != null && ['0', 'false', 'no', 'off'].includes(chrome.toLowerCase())) return true
  return false
}

export default function App() {
  const focus = useFocusMode()

  return (
    <div
      className={cn(
        'flex min-h-dvh max-w-full min-w-0 flex-col overflow-x-clip',
        !focus && 'sidus-grid',
        focus && 'bg-bg',
      )}
      data-ui-focus={focus ? '1' : '0'}
    >
      <ScrollToTop />
      {!focus ? <SiteHeader /> : null}
      {/*
        Mobile: SiteHeader is position:fixed (h-14). Reserve that space so content
        does not slide under it. Desktop header is sticky in-flow → no pad.
      */}
      <main
        className={cn(
          'relative max-w-full min-w-0 flex-1 overflow-x-clip',
          !focus && 'max-sm:pt-14',
        )}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home-alt" element={<HomeAltPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:id" element={<ToolDetailPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Routes>
      </main>
      {!focus ? <SiteFooter /> : null}
    </div>
  )
}
