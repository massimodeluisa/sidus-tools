import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/shared/Panel'

/** Public remote MCP: no local install */
export const SIDUS_MCP_URL = 'https://sidus.tools/api/mcp'
const MCP_DOCS = 'https://github.com/massimodeluisa/sidus-tools/tree/main/mcp'

const CONFIG_SNIPPET = `{
  "mcpServers": {
    "sidus": {
      "url": "${SIDUS_MCP_URL}"
    }
  }
}`

type Props = {
  className?: string
}

/**
 * Public MCP connect card (home): remote URL first (no clone / no npm install).
 * Not shown on individual tool pages.
 */
export function McpConnectCard({ className }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState<'url' | 'config' | null>(null)

  const askHint = t('mcp.ask_generic')

  async function copy(text: string, which: 'url' | 'config') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard may be denied */
    }
  }

  return (
    <Panel title={t('mcp.title')} className={className}>
      <div className="space-y-3 text-sm">
        <p className="leading-relaxed text-muted">{t('mcp.body')}</p>
        <p className="font-mono text-[11px] text-signal">{t('mcp.no_install')}</p>

        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {t('mcp.endpoint_label')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded border border-border bg-bg-elevated px-2 py-1.5 font-mono text-[11px] text-fg sm:text-xs">
              {SIDUS_MCP_URL}
            </code>
            <button
              type="button"
              onClick={() => void copy(SIDUS_MCP_URL, 'url')}
              className="shrink-0 border border-border bg-surface px-2 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-border-strong hover:text-fg"
            >
              {copied === 'url' ? t('tool.copied') : t('tool.copy')}
            </button>
          </div>
        </div>

        <ol className="list-decimal space-y-1.5 pl-5 text-muted">
          <li>{t('mcp.step_add')}</li>
          <li>{t('mcp.step_paste')}</li>
          <li>{t('mcp.step_ask')}</li>
        </ol>

        <div className="relative">
          <pre className="overflow-x-auto border border-border bg-bg-elevated p-3 font-mono text-[10px] leading-relaxed text-muted sm:text-[11px]">
            {CONFIG_SNIPPET}
          </pre>
          <button
            type="button"
            onClick={() => void copy(CONFIG_SNIPPET, 'config')}
            className="absolute right-2 top-2 border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            {copied === 'config' ? t('tool.copied') : t('tool.copy')}
          </button>
        </div>

        <div className="border border-border bg-surface/40 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {t('mcp.ask_kicker')}
          </p>
          <p className="mt-1.5 leading-relaxed text-muted">{askHint}</p>
        </div>

        <p className="text-xs leading-relaxed text-subtle">{t('mcp.offline_note')}</p>

        <a
          href={MCP_DOCS}
          target="_blank"
          rel="noreferrer"
          className="inline-flex font-mono text-[11px] uppercase tracking-[0.12em] text-signal no-underline hover:underline"
        >
          {t('mcp.docs_link')} →
        </a>
      </div>
    </Panel>
  )
}
