import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel } from './Panel'
import { cn } from '@/lib/utils'
import { useToolUiLayout } from '@/lib/ToolUiLayoutContext'
import type { SlotSize, ToolUiLayout } from '@/lib/toolUiLayout'

type Props = {
  parameters: ReactNode
  results: ReactNode
  code?: ReactNode
  preview?: ReactNode
  /** Optional override; defaults to URL layout from context */
  layout?: Pick<ToolUiLayout, 'slots'>
}

/** Map slot size → Tailwind grid column span (12-col on lg+). */
function spanClass(size: SlotSize): string {
  switch (size) {
    case 'hidden':
      return 'hidden'
    case 'full':
      return 'col-span-full'
    case 'compact':
      return 'col-span-full lg:col-span-4'
    case 'half':
    default:
      return 'col-span-full lg:col-span-6'
  }
}

/**
 * Shared tool layout driven by URL slot sizes (HALF / FULL / COMPACT / OFF).
 * CSS grid only: equal columns stretch; PREVIEW/CODE share a row when both half.
 */
export function ToolShell({ parameters, results, code, preview, layout }: Props) {
  const { t } = useTranslation()
  const fromUrl = useToolUiLayout()
  const slots = layout?.slots ?? fromUrl.slots

  const showParams = slots.params !== 'hidden'
  const showResults = slots.results !== 'hidden'
  const showPreview = Boolean(preview) && slots.preview !== 'hidden'
  const showCode = Boolean(code) && slots.code !== 'hidden'

  // Side-by-side half pair: dedicated row so both cards share the same height
  const pairedHalfPreviewCode =
    showPreview &&
    showCode &&
    slots.preview === 'half' &&
    slots.code === 'half'

  if (!showParams && !showResults && !showPreview && !showCode) {
    return (
      <p className="font-mono text-sm text-muted">{t('tool.panels_all_off')}</p>
    )
  }

  // Shared min-height so PREVIEW and CODE half-slots stay height-parity
  const halfMin = 'min-h-[22rem] self-stretch sm:min-h-[26rem]'

  return (
    <div className="grid max-w-full min-w-0 grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch lg:gap-4">
      {showParams ? (
        <Panel title={t('tool.parameters')} className={cn(spanClass(slots.params), 'self-stretch')}>
          {parameters}
        </Panel>
      ) : null}

      {showResults ? (
        <Panel title={t('tool.results')} className={cn(spanClass(slots.results), 'self-stretch')}>
          {results}
        </Panel>
      ) : null}

      {pairedHalfPreviewCode ? (
        <div className="col-span-full grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-stretch lg:gap-4">
          <Panel title={t('tool.preview_2d')} className={halfMin}>
            <div className="flex min-h-0 flex-1 flex-col">{preview}</div>
          </Panel>
          <Panel title={t('tool.code')} className={halfMin}>
            <div className="flex min-h-0 flex-1 flex-col">{code}</div>
          </Panel>
        </div>
      ) : (
        <>
          {showPreview ? (
            <Panel
              title={t('tool.preview_2d')}
              className={cn(spanClass(slots.preview), halfMin)}
            >
              <div className="flex min-h-0 flex-1 flex-col">{preview}</div>
            </Panel>
          ) : null}

          {showCode ? (
            <Panel
              title={t('tool.code')}
              className={cn(spanClass(slots.code), halfMin)}
            >
              <div className="flex min-h-0 flex-1 flex-col">{code}</div>
            </Panel>
          ) : null}
        </>
      )}
    </div>
  )
}
