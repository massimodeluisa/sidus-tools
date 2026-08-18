import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, ExternalLink, Play } from 'lucide-react'
import {
  CODE_LANGS,
  createRunnerUrl,
  getSnippets,
  primaryRunnerUrl,
  runnersForLang,
  supportsOnlineRun,
  UNSUPPORTED_ONLINE_RUN_LANGS,
  type CodeDep,
  type CodeLang,
} from '@/lib/snippets'
import { renderLiveCode, type LiveCodeValues } from '@/lib/snippets/liveValues'
import { tooltipProps } from '@/components/shared/tooltip'
import { cn } from '@/lib/utils'

type Props = {
  formulaId: string
  values?: LiveCodeValues
}

function ecosystemLabel(eco: CodeDep['ecosystem']): string {
  switch (eco) {
    case 'npm':
      return 'npm'
    case 'pypi':
      return 'PyPI'
    case 'crates':
      return 'crates.io'
    case 'github':
      return 'GitHub'
    default:
      return 'link'
  }
}

export function CodeExport({ formulaId, values }: Props) {
  const { t } = useTranslation()
  const snippet = getSnippets(formulaId)
  const available = useMemo(
    () => CODE_LANGS.filter((l) => Boolean(snippet?.code[l.id]?.trim())),
    [snippet],
  )
  const [lang, setLang] = useState<CodeLang>(available[0]?.id ?? 'python')
  const [copied, setCopied] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (available.length > 0 && !available.some((l) => l.id === lang)) {
      setLang(available[0].id)
    }
  }, [available, lang])

  const code = useMemo(() => {
    if (!snippet) return ''
    const body = snippet.code[lang] ?? ''
    return renderLiveCode(body, lang, values)
  }, [snippet, lang, values])

  const runUrl = useMemo(() => primaryRunnerUrl(lang, code), [lang, code])
  const runOptions = useMemo(() => runnersForLang(lang), [lang])
  // Every runnable language opens Compiler Explorer (godbolt.org).
  const canRun = supportsOnlineRun(lang) && Boolean(code.trim())
  const onlineUnsupported = UNSUPPORTED_ONLINE_RUN_LANGS.includes(lang)

  const visibleDeps = useMemo(() => {
    const deps = snippet?.deps ?? []
    return deps.filter((d) => !d.langs?.length || d.langs.includes(lang))
  }, [snippet, lang])

  if (!snippet || available.length === 0) {
    return (
      <p className="font-mono text-sm text-muted">{t('tool.code_unavailable')}</p>
    )
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  async function onRun() {
    if (!canRun || running) return
    setRunning(true)
    try {
      // Always Compiler Explorer (shortener → hash fallback).
      const url = (await createRunnerUrl(lang, code)) ?? runUrl
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      if (runUrl) window.open(runUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="shrink-0 text-xs leading-relaxed text-muted">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
          {t('tool.assumptions')}:
        </span>{' '}
        {snippet.assumptions}
      </p>

      <div className="flex shrink-0 flex-wrap gap-1.5">
        {available.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLang(l.id)}
            className={cn(
              'h-8 border px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
              lang === l.id
                ? 'border-border-strong bg-surface text-fg'
                : 'border-border text-muted hover:text-fg',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Code surface: Run + Copy live inside the black block (top-right) */}
      <div className="relative z-0 min-h-[8rem] min-w-0 flex-1 overflow-hidden border border-border bg-bg">
        <div className="pointer-events-none absolute right-2 top-2 z-10 flex gap-1.5">
          {canRun ? (
            <button
              type="button"
              onClick={() => void onRun()}
              disabled={running}
              {...tooltipProps(
                runOptions[0]?.note ?? t('tool.run_online'),
                'pointer-events-auto inline-flex h-8 items-center gap-1.5 border border-border-strong bg-surface/95 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-signal shadow-sm backdrop-blur-sm transition-colors hover:text-fg disabled:opacity-60',
                'below-end',
              )}
            >
              <Play size={12} />
              {running ? '…' : t('tool.run')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCopy}
            className="pointer-events-auto inline-flex h-8 items-center gap-1.5 border border-border-strong bg-surface/95 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted shadow-sm backdrop-blur-sm transition-colors hover:text-fg"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? t('tool.copied') : t('tool.copy')}
          </button>
        </div>
        <pre className="h-full min-h-[8rem] overflow-auto p-3 pt-12 font-mono text-xs leading-relaxed text-fg sm:pt-3 sm:pr-36">
          <code>{code}</code>
        </pre>
      </div>

      {onlineUnsupported ? (
        <p className="shrink-0 font-mono text-[10px] leading-relaxed text-subtle">
          {t('tool.run_unsupported')}
        </p>
      ) : null}

      <div className="shrink-0 border border-border bg-bg-elevated px-3 py-2.5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          {t('tool.deps')}
        </p>
        {visibleDeps.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted">{t('tool.deps_none')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleDeps.map((d) => (
              <li
                key={`${d.name}-${d.url}`}
                className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3"
              >
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 items-center gap-1.5 font-mono text-xs text-signal hover:underline"
                >
                  <span className="truncate">{d.name}</span>
                  <ExternalLink className="size-3 shrink-0 opacity-70" aria-hidden />
                </a>
                <span className="font-mono text-[10px] uppercase tracking-wide text-subtle">
                  {ecosystemLabel(d.ecosystem)}
                </span>
                {d.install ? (
                  <code className="truncate font-mono text-[11px] text-muted">{d.install}</code>
                ) : null}
                {d.note ? (
                  <span className="text-[11px] leading-snug text-muted sm:ml-auto">{d.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
