import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ToolRenderer } from '@/components/tools/ToolRenderer'
import { getTool, primaryTag } from '@/data/tools'
import { resolveSources } from '@/data/sources'
import { Panel } from '@/components/shared/Panel'
import { SeoHead } from '@/components/site/SeoHead'
import { EditOnGitHub, toolSourcePath } from '@/components/site/EditOnGitHub'
import { PrecisionPanel } from '@/components/site/PrecisionPanel'
import { ToolLayoutBar } from '@/components/site/ToolLayoutBar'
import { toolOgMeta } from '@/lib/og'
import { ToolUiLayoutProvider } from '@/lib/ToolUiLayoutContext'
import {
  parseToolUiLayout,
  seedLayoutFromPrefs,
  usesTightPagePad,
} from '@/lib/toolUiLayout'
import { cn } from '@/lib/utils'

export function ToolDetailPage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const tool = getTool(id)
  const sources = resolveSources(tool?.sourceIds)
  const ui = parseToolUiLayout(searchParams)

  useEffect(() => {
    const seeded = seedLayoutFromPrefs(searchParams)
    if (!seeded) return
    setSearchParams(seeded, { replace: true, preventScrollReset: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!tool) {
    return (
      <div className="sidus-enter page-shell page-y space-y-4">
        <p className="text-muted">{t('tools.not_found')}</p>
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
    ? `${tool.title}: ${meta.blurb}. Live pure-SI result from shared parameters.`
    : tool.description

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
        }}
      />

      {/* Sticky strip + hero: must be direct children of this full-page root */}
      {ui.chrome.focus ? (
        <ToolLayoutBar focusChrome />
      ) : (
        <ToolLayoutBar
          doc={{
            title: tool.title,
            showBack: ui.chrome.back,
            showTitle: ui.chrome.title,
            showMeta: ui.chrome.meta,
            metaLine: [
              `#${primaryTag(tool)}`,
              tool.status === 'live' ? t('tools.status.live') : null,
              tool.status === 'wave1' ? t('tools.status.wave1') : null,
            ]
              .filter(Boolean)
              .join(' · '),
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
          <div className="border-t border-border pt-4">
            <EditOnGitHub path={toolSourcePath(tool.id)} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
