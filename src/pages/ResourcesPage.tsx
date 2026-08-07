import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { RESOURCES } from '@/data/resources'
import { SeoHead } from '@/components/site/SeoHead'
import { EditOnGitHub } from '@/components/site/EditOnGitHub'

export function ResourcesPage() {
  const { t } = useTranslation()

  return (
    <div className="sidus-enter page-shell page-y">
      <SeoHead
        title="Resources · SIDUS"
        description="Public data sources, textbooks, TLE catalogs, and open references used by SIDUS space engineering tools."
        path="/resources"
      />
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
            {t('resources.kicker')}
          </p>
          <EditOnGitHub path="src/data/resources.ts" />
        </div>
        <h1
          className="mt-2 font-display font-semibold tracking-tight text-fg"
          style={{ fontSize: 'var(--section-title)' }}
        >
          {t('resources.title')}
        </h1>
        <p className="prose-measure mt-3 text-sm leading-relaxed text-muted sm:text-base">
          {t('resources.subtitle')}
        </p>
      </div>

      <ul className="grid-auto-tools list-none p-0">
        {RESOURCES.map((r) => (
          <li
            key={r.url}
            className="sidus-card flex min-h-[10rem] flex-col p-5 transition-colors hover:border-border-strong hover:bg-surface-hover sm:p-6"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-base font-medium text-fg no-underline hover:text-signal"
              >
                {r.name}
              </a>
              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-subtle" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              {r.org}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{r.description}</p>
            {r.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1 border-t border-border pt-3">
                {r.tags.map((tg) => (
                  <span
                    key={tg}
                    className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted"
                  >
                    {tg}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
