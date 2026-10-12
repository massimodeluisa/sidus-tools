import { useEffect, type ReactNode } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ToolRenderer } from '@/components/tools/ToolRenderer'
import { getTool, suggestTools, TOOL_REDIRECTS } from '@/data/tools'
import { resolveSources } from '@/data/sources'
import { Panel } from '@/components/shared/Panel'
import { SeoHead } from '@/components/site/SeoHead'
import { trackEvent } from '@/lib/gtm'
import { EditOnGitHub, toolSourcePath } from '@/components/site/EditOnGitHub'
import { PrecisionPanel } from '@/components/site/PrecisionPanel'
import { ToolLayoutBar } from '@/components/site/ToolLayoutBar'
import { toolOgMeta } from '@/lib/og'
import { ToolUiLayoutProvider } from '@/lib/ToolUiLayoutContext'
import {
  parseToolUiLayout,
  seedLayoutFromPrefs,
  usesTightPagePad,
} from '@/lib/tool-ui-layout'
import { tooltipProps } from '@/components/shared/tooltip'
import { cn } from '@/lib/utils'

/**
 * Fullscreen tools fill the layout viewport. Overlay chrome is offset by
 * `--vv-top` / `--vv-bottom` so controls stay in the visible hole.
 */
function FullscreenToolShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    const sync = () => {
      const vv = window.visualViewport
      const layoutH = Math.max(document.documentElement.clientHeight, window.innerHeight)
      const height = vv?.height ?? layoutH
      const top = Math.max(0, vv?.offsetTop ?? 0)
      const bottom = Math.max(0, layoutH - top - height)
      root.style.setProperty('--vv-top', `${Math.round(top)}px`)
      root.style.setProperty('--vv-bottom', `${Math.round(bottom)}px`)
    }
    sync()
    window.visualViewport?.addEventListener('resize', sync)
    window.visualViewport?.addEventListener('scroll', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      window.visualViewport?.removeEventListener('resize', sync)
      window.visualViewport?.removeEventListener('scroll', sync)
      window.removeEventListener('orientationchange', sync)
      root.style.removeProperty('--vv-top')
      root.style.removeProperty('--vv-bottom')
    }
  }, [])
  return (
    <div className="h-full w-full min-w-0 overflow-hidden" data-tool-fullscreen="1">
      {children}
    </div>
  )
}

export function ToolDetailPage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const redirectTo = TOOL_REDIRECTS[id]
  const tool = getTool(id)
  const sources = resolveSources(tool?.sourceIds)
  const ui = parseToolUiLayout(searchParams)

  useEffect(() => {
    const seeded = seedLayoutFromPrefs(searchParams)
    if (!seeded) return
    setSearchParams(seeded, { replace: true, preventScrollReset: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!tool) return
    trackEvent('tool_view', { tool_id: tool.id, tool_title: tool.title, category: tool.category })
  }, [tool])

  if (redirectTo) {
    const q = searchParams.toString()
    return <Navigate to={q ? `/tools/${redirectTo}?${q}` : `/tools/${redirectTo}`} replace />
  }

  if (!tool) {
    const suggestions = suggestTools(id)
    return (
      <div className="sidus-enter page-shell page-y space-y-4">
        <SeoHead
          title={`${t('tools.not_found')} · SIDUS`}
          description={t('tools.not_found')}
          path={`/tools/${id}`}
          robots="noindex, follow"
        />
        <p className="text-muted">{t('tools.not_found')}</p>
        {suggestions.length > 0 ? (
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
              {t('tools.did_you_mean')}
            </p>
            <ul className="space-y-1">
              {suggestions.map((candidate) => (
                <li key={candidate.id}>
                  <Link
                    to={`/tools/${candidate.id}`}
                    className="font-mono text-sm text-signal hover:text-fg hover:underline"
                  >
                    {candidate.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Link
          to="/tools"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal hover:text-fg"
        >
          ← {t('tool.back')}
        </Link>
      </div>
    )
  }

  const path = `/tools/${tool.id}`
  const meta = toolOgMeta(tool.id)
  const hasParams = [...searchParams.keys()].length > 0
  const description = hasParams
    ? t('tools.live_si_blurb', { title: tool.title, blurb: meta.blurb })
    : tool.description

  const seo = (
    <SeoHead
      title={`${tool.title} · SIDUS`}
      description={description.slice(0, 160)}
      path={path}
      search={searchParams}
      imageAlt={`${tool.title}: ${meta.formula}`}
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.title,
        description: tool.description,
        applicationCategory: 'EducationalApplication',
        url: `https://sidus.tools${path}`,
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        keywords: tool.tags.join(', '),
        ...(tool.created ? { datePublished: tool.created } : {}),
        ...(tool.updated ? { dateModified: tool.updated } : {}),
      }}
    />
  )

  /* Fullscreen tools own the viewport: no bar, no hero, no panel sections. The
     tool component draws its own overlay chrome on top of the canvas. */
  if (tool.fullscreen) {
    return (
      <FullscreenToolShell>
        {seo}
        <ToolUiLayoutProvider value={ui}>
          <ToolRenderer id={tool.id} />
        </ToolUiLayoutProvider>
      </FullscreenToolShell>
    )
  }

  // Focus mode always uses tight inset (matches vertical rhythm); fullwidth slots too
  const tightPad = usesTightPagePad(ui) || ui.chrome.focus
  const showPrecision = ui.chrome.precision
  const showSources = ui.chrome.sources && sources.length > 0
  const showEdit = ui.chrome.edit

  return (
    <div
      className={cn(
        'relative z-0 flex w-full min-w-0 flex-col',
        ui.chrome.focus && 'min-h-dvh',
      )}
      data-focus={ui.chrome.focus ? '1' : '0'}
      data-page-pad={tightPad ? 'gap' : 'standard'}
    >
      {seo}

      {/* Sticky strip + hero: must be direct children of this full-page root */}
      {ui.chrome.focus ? (
        <ToolLayoutBar focusChrome />
      ) : (
        <ToolLayoutBar
          doc={{
            title: tool.title,
            showBack: ui.chrome.back,
            showTitle: ui.chrome.title,
            showSubtitle: ui.chrome.subtitle,
            subtitle: tool.description,
            showFormula: ui.chrome.formula,
            formula: meta.formula,
            showTags: ui.chrome.tags,
            tags: tool.tags,
          }}
        />
      )}

      <div
        className={cn(
          'sidus-enter page-shell flex w-full min-w-0 flex-col gap-6 sm:gap-8',
          // Focus: tight vertical pad matching tight horizontal (--page-gap via data-page-pad)
          ui.chrome.focus ? 'py-3 sm:py-4' : 'pb-8 pt-5 sm:pb-10 sm:pt-6',
        )}
      >
        <section data-tool-block="tool" className="relative w-full min-w-0">
          {/* Slot sizes (HALF/FULL/COMPACT/OFF) flow from URL → context → ToolShell */}
          <ToolUiLayoutProvider value={ui}>
            <ToolRenderer id={tool.id} />
          </ToolUiLayoutProvider>
        </section>

        {showPrecision ? (
          <section data-tool-block="precision" className="relative w-full min-w-0">
            <PrecisionPanel toolId={tool.id} />
          </section>
        ) : null}

        {showSources ? (
          <section data-tool-block="sources" className="relative w-full min-w-0">
            <Panel title={t('tool.sources')}>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sources.map((s) => (
                  <li key={s.id} className="min-w-0 text-sm">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-words font-mono text-signal hover:underline"
                    >
                      {s.name}
                    </a>
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-wide text-subtle">
                      {s.org}
                    </span>
                    <p className="mt-1 text-muted">{s.note}</p>
                    {s.license ? (
                      <p className="mt-0.5 font-mono text-[10px] text-subtle">
                        {t('tool.license')}: {s.license}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        ) : null}

        {showEdit ? (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4">
            <EditOnGitHub path={toolSourcePath(tool.id)} />
            <ToolFooterDates created={tool.created} updated={tool.updated} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ToolFooterDates({ created, updated }: { created?: string; updated?: string }) {
  const { t } = useTranslation()
  if (!created && !updated) return null
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
      {created ? (
        <time
          dateTime={created}
          {...tooltipProps(t('tool.created', { date: created }), 'cursor-help')}
        >
          {t('tool.created', { date: created })}
        </time>
      ) : null}
      {created && updated ? <span aria-hidden> · </span> : null}
      {updated ? (
        <time
          dateTime={updated}
          {...tooltipProps(t('tool.updated', { date: updated }), 'cursor-help')}
        >
          {t('tool.updated', { date: updated })}
        </time>
      ) : null}
    </p>
  )
}
