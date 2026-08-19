import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  PanelLeft,
  Settings2,
} from 'lucide-react'
import {
  applyLayoutPatch,
  applyLayoutPreset,
  clearLayoutPrefs,
  exitFocusLayout,
  matchLayoutPreset,
  parseToolUiLayout,
  saveLayoutPrefs,
  type LayoutPresetId,
  type SlotSize,
} from '@/lib/toolUiLayout'
import { catalogFilterPath } from '@/lib/catalogTags'
import { tooltipProps } from '@/components/shared/tooltip'
import { cn } from '@/lib/utils'

const BAR_PRESETS: LayoutPresetId[] = ['default', 'fullwidth']

const SIZES: { id: SlotSize; labelKey: string }[] = [
  { id: 'half', labelKey: 'half' },
  { id: 'full', labelKey: 'full' },
  { id: 'compact', labelKey: 'compact' },
  { id: 'hidden', labelKey: 'hidden' },
]

export type ToolLayoutDoc = {
  title?: string
  showBack?: boolean
  showTitle?: boolean
  subtitle?: string
  formula?: string
  tags?: string[]
  showSubtitle?: boolean
  showFormula?: boolean
  showTags?: boolean
}

type Props = {
  className?: string
  focusChrome?: boolean
  title?: string
  showBack?: boolean
  doc?: ToolLayoutDoc
}

const btn =
  // Mobile h-9 matches square back tile; desktop stays compact h-7
  'inline-flex h-9 items-center gap-1.5 border border-border bg-bg/60 px-2 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-border-strong hover:bg-surface hover:text-fg sm:h-7'
const btnActive = 'border-border-strong bg-surface text-fg'

function useSiteHeaderOffsetPx(): number {
  const [px, setPx] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches
      ? 64
      : 56,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const sync = () => setPx(mq.matches ? 64 : 56)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return px
}

/** True below Tailwind `sm` (640px). */
function useIsMobileStrip(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639.98px)').matches : true,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639.98px)')
    const sync = () => setMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return mobile
}

/**
 * Float card at rest → dock under site header on scroll (desktop + mobile).
 *
 * Desktop: `position:sticky` + chrome transitions.
 * Mobile: in-flow while undocked, then `position:fixed` + spacer when docked
 * (avoids dual-sticky rubber-band on iOS while restoring attach/detach motion).
 */
function useToolChromeDock(
  barRef: React.RefObject<HTMLElement | null>,
  headerPx: number,
  onBarHeight?: (px: number) => void,
): boolean {
  const [docked, setDocked] = useState(false)
  const dockedRef = useRef(false)
  /** Last published --tool-sticky-stack px value (not raw offsetHeight). */
  const lastBarH = useRef(0)
  /** Bar's undocked resting padding-top in px (constant on desktop; mobile
   *  still collapses it to 0 via its own class when docked). */
  const padRef = useRef(0)
  /** Bar's offsetHeight cached from the last frame it was measured undocked;
   *  feeds the mobile spacer so its height never reflects a docked (padding-
   *  collapsed) measurement. */
  const undockedFlowHRef = useRef(0)
  const onBarHeightRef = useRef(onBarHeight)
  onBarHeightRef.current = onBarHeight

  useEffect(() => {
    let raf = 0
    const HEIGHT_EPS = 2

    function publishHeight() {
      const el = barRef.current
      const barH = el?.offsetHeight || 48
      if (!dockedRef.current) undockedFlowHRef.current = barH
      const published =
        headerPx + (dockedRef.current ? Math.max(0, barH - padRef.current) : barH)
      if (Math.abs(published - lastBarH.current) < HEIGHT_EPS) return
      lastBarH.current = published
      onBarHeightRef.current?.(undockedFlowHRef.current)
      document.documentElement.style.setProperty('--tool-sticky-stack', `${published}px`)
    }

    // Resting padding-top, used for the dock thresholds and the stack math.
    // Only valid while undocked (docked can collapse it via CSS on mobile).
    function measurePad() {
      const el = barRef.current
      if (!el || dockedRef.current) return
      padRef.current = parseFloat(getComputedStyle(el).paddingTop) || 0
    }

    function measureScrollDock() {
      const y = window.scrollY || 0
      const pad = padRef.current
      const dockOn = pad + 2
      const dockOff = Math.max(2, pad - 8)
      let next = dockedRef.current
      if (!dockedRef.current && y >= dockOn) next = true
      else if (dockedRef.current && y <= dockOff) next = false
      const flipped = next !== dockedRef.current
      if (flipped) {
        dockedRef.current = next
        setDocked(next)
      }

      publishHeight()
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measureScrollDock)
    }

    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        measurePad()
        measureScrollDock()
      })
    }

    measurePad()
    measureScrollDock()
    const ro =
      typeof ResizeObserver !== 'undefined' && barRef.current
        ? new ResizeObserver(() => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(publishHeight)
          })
        : null
    if (ro && barRef.current) ro.observe(barRef.current)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.documentElement.style.removeProperty('--tool-sticky-stack')
    }
  }, [barRef, headerPx])

  return docked
}

/**
 * Focus-mode chrome: compact control top-RIGHT; expanded panel floats detached
 * (inset from edges) under the toggle. Hover (desktop) or tap; outside tap collapses.
 */
function FocusCornerChrome({
  className,
  leaveFocus,
  setPreset,
  advancedBody,
  focusBadge,
  cornerLabel,
  exitLabel,
  presetDefault,
  presetFullwidth,
}: {
  className?: string
  leaveFocus: () => void
  setPreset: (id: LayoutPresetId) => void
  advancedBody: ReactNode
  focusBadge: string
  cornerLabel: string
  exitLabel: string
  presetDefault: string
  presetFullwidth: string
}) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  /** Sticky open from tap (mobile / click); hover is independent. */
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const expanded = pinned || hovered

  // Tap / click outside → compact
  useEffect(() => {
    if (!expanded) return
    const onPtr = (e: PointerEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      setPinned(false)
      setHovered(false)
    }
    document.addEventListener('pointerdown', onPtr, true)
    return () => document.removeEventListener('pointerdown', onPtr, true)
  }, [expanded])

  function togglePin() {
    setPinned((p) => !p)
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        // Top-RIGHT, inset so the open sheet is clearly detached from the viewport edge
        'pointer-events-none fixed top-3 right-3 z-50 flex flex-col items-end gap-2 sm:top-4 sm:right-4',
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!pinned) setHovered(false)
      }}
    >
      {/* Compact toggle — always top-right */}
      <button
        type="button"
        onClick={togglePin}
        aria-expanded={expanded}
        aria-label={cornerLabel}
        className={cn(
          'pointer-events-auto flex size-9 shrink-0 items-center justify-center border border-border-strong bg-surface text-signal shadow-lg backdrop-blur-md transition-colors',
          'hover:border-signal hover:text-fg',
          expanded && 'border-signal text-fg',
        )}
      >
        <Settings2 className="size-4" strokeWidth={2} aria-hidden />
      </button>

      {/* Detached floating sheet (gap from toggle + from screen edges via root inset) */}
      <div
        role="region"
        aria-label={focusBadge}
        className={cn(
          'pointer-events-auto w-[min(calc(100vw-1.5rem),18rem)] origin-top-right border border-border-strong bg-surface/98 p-3 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all duration-200 ease-out',
          expanded
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {focusBadge}
          </span>
          <button
            type="button"
            onClick={togglePin}
            className={cn(btn, pinned && btnActive)}
            aria-expanded={expanded}
            aria-label={cornerLabel}
          >
            <Settings2 className="size-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPreset('default')}
            className={cn(btn, 'w-full justify-center')}
          >
            {presetDefault}
          </button>
          <button
            type="button"
            onClick={() => setPreset('fullwidth')}
            className={cn(btn, 'w-full justify-center')}
          >
            {presetFullwidth}
          </button>
          {advancedBody}
          <button
            type="button"
            onClick={leaveFocus}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 border border-border-strong bg-accent px-2.5 font-mono text-[10px] uppercase tracking-wide text-accent-fg"
          >
            <Minimize2 className="size-3.5" />
            {exitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Tool page chrome: sticky control strip under site header + free-flow hero.
 * Dock animation: floating card → full-bleed bar under SIDUS header.
 */
export function ToolLayoutBar({
  className,
  focusChrome = false,
  title: titleProp,
  showBack: showBackProp = true,
  doc,
}: Props) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const headerPx = useSiteHeaderOffsetPx()
  const isMobileStrip = useIsMobileStrip()
  const barRef = useRef<HTMLDivElement | null>(null)
  /** Mobile fixed-strip height → in-flow spacer (keeps content below the bar). */
  const [mobileBarH, setMobileBarH] = useState(88)

  const title = doc?.title ?? titleProp
  const showBack = doc?.showBack ?? showBackProp
  const showTitle = doc?.showTitle !== false && Boolean(title)
  const showSubtitle = Boolean(doc?.showSubtitle && doc.subtitle)
  const showFormula = Boolean(doc?.showFormula && doc.formula)
  const showTags = Boolean(doc?.showTags && doc.tags && doc.tags.length > 0)
  const hasExpandedDoc = showTitle || showSubtitle || showFormula || showTags

  // Float → dock on scroll (both breakpoints). Mobile uses fixed when docked.
  const docked = useToolChromeDock(barRef, headerPx, setMobileBarH)

  const ui = useMemo(() => parseToolUiLayout(searchParams), [searchParams])
  const activePreset = useMemo(() => matchLayoutPreset(searchParams), [searchParams])
  const isFocus = focusChrome || ui.chrome.focus

  function commit(next: URLSearchParams) {
    saveLayoutPrefs(next)
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  function setPreset(id: LayoutPresetId) {
    if (id === 'default') {
      clearLayoutPrefs()
      commit(applyLayoutPreset(searchParams, 'default'))
      setOpen(false)
      return
    }
    if (id === 'fullwidth' && isFocus) {
      commit(
        applyLayoutPatch(searchParams, {
          focus: '1',
          params: 'full',
          results: 'full',
          preview: 'full',
          code: 'full',
        }),
      )
      return
    }
    commit(applyLayoutPreset(searchParams, id))
  }

  function setSlot(slot: 'params' | 'results' | 'preview' | 'code', size: SlotSize) {
    commit(applyLayoutPatch(searchParams, { [slot]: size === 'half' ? null : size }))
  }

  function setChromeFlag(key: 'precision' | 'sources', on: boolean) {
    commit(applyLayoutPatch(searchParams, { [key]: on ? '1' : '0' }))
  }

  function toggleFocus() {
    if (isFocus) {
      commit(exitFocusLayout(searchParams))
    } else {
      commit(applyLayoutPreset(searchParams, 'focus'))
    }
  }

  function leaveFocus() {
    commit(exitFocusLayout(searchParams))
  }

  // Close advanced sheet on scroll (normal chrome only)
  useEffect(() => {
    if (!open || isFocus) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [open, isFocus])

  // Esc: exit focus mode (documented in layout.focus_hint)
  useEffect(() => {
    if (!isFocus) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Don't steal Esc from inputs / selects
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      e.preventDefault()
      commit(exitFocusLayout(searchParams))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFocus, searchParams, setSearchParams])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  const advancedBody: ReactNode = (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      {/* Mobile: presets live in the layout sheet (strip has no room / fullwidth N/A) */}
      {isMobileStrip ? (
        <fieldset className="min-w-0 w-full space-y-2">
          <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {t('layout.kicker')}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setPreset('default')}
              className={cn(btn, activePreset === 'default' && btnActive)}
            >
              {t('layout.presets.default')}
            </button>
          </div>
        </fieldset>
      ) : null}
      <fieldset className="min-w-0 flex-1 space-y-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          {t('layout.slots')}
        </legend>
        {(['params', 'results', 'preview', 'code'] as const).map((slot) => (
          <div key={slot} className="flex flex-wrap items-center gap-2">
            <span className="w-16 font-mono text-[10px] uppercase text-muted">
              {t(`layout.slot.${slot}`)}
            </span>
            <div className="flex flex-wrap gap-1">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlot(slot, s.id)}
                  className={cn(
                    'h-6 border px-1.5 font-mono text-[9px] uppercase tracking-wide',
                    ui.slots[slot] === s.id
                      ? 'border-border-strong bg-bg-elevated text-fg'
                      : 'border-border text-muted hover:text-fg',
                  )}
                >
                  {t(`layout.size.${s.labelKey}`)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </fieldset>
      <fieldset className="min-w-0 flex-1 space-y-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          {t('layout.panels')}
        </legend>
        {(
          [
            ['precision', ui.chrome.precision],
            ['sources', ui.chrome.sources],
          ] as const
        ).map(([key, on]) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-muted"
          >
            <input
              type="checkbox"
              checked={on}
              onChange={(e) => setChromeFlag(key, e.target.checked)}
              className="size-3.5 accent-signal"
            />
            {t(`layout.panel.${key}`)}
          </label>
        ))}
        <p className="pt-1 text-[11px] leading-relaxed text-subtle">{t('layout.hint')}</p>
      </fieldset>
    </div>
  )

  // Focus mode: top-LEFT page-fold corner → expands on hover (desktop) or tap (mobile).
  // Tap outside collapses. Exit focus lives inside the expanded sheet only.
  if (isFocus) {
    return (
      <FocusCornerChrome
        className={className}
        leaveFocus={leaveFocus}
        setPreset={setPreset}
        advancedBody={advancedBody}
        focusBadge={t('layout.focus_badge')}
        cornerLabel={t('layout.focus_corner_label')}
        exitLabel={t('layout.exit_focus')}
        presetDefault={t('layout.presets.default')}
        presetFullwidth={t('layout.presets.fullwidth')}
      />
    )
  }

  const viewControls = (
    <div className="flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-1.5">
      <span className="mr-0.5 hidden font-mono text-[9px] uppercase tracking-[0.14em] text-subtle sm:inline">
        {t('layout.kicker')}
      </span>
      {/* Desktop strip presets; mobile presets live in the layout sheet */}
      {!isMobileStrip
        ? BAR_PRESETS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPreset(id)}
              {...tooltipProps(
                t(`layout.presets.${id}`),
                cn(btn, activePreset === id && btnActive),
                'below-end',
              )}
            >
              {t(`layout.presets.${id}`)}
            </button>
          ))
        : null}
      <button
        type="button"
        onClick={toggleFocus}
        {...tooltipProps(
          t('layout.focus_hint'),
          cn(btn, 'size-9 justify-center px-0 sm:h-7 sm:w-auto sm:px-2', ui.chrome.focus && btnActive),
          'below-end',
        )}
        aria-label={t('layout.focus')}
      >
        <Maximize2 className="size-3.5" />
        <span className="hidden sm:inline">{t('layout.focus')}</span>
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        {...tooltipProps(
          copied ? t('tool.copied') : t('layout.copy_link'),
          cn(btn, 'size-9 justify-center px-0 sm:h-7 sm:w-auto sm:px-2'),
          'below-end',
        )}
        aria-label={copied ? t('tool.copied') : t('layout.copy_link')}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        <span className="hidden sm:inline">
          {copied ? t('tool.copied') : t('layout.copy_link')}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        {...tooltipProps(
          t('layout.advanced'),
          cn(btn, 'size-9 justify-center px-0 sm:h-7 sm:w-auto sm:px-2', open && btnActive),
          'below-end',
        )}
        aria-expanded={open}
        aria-label={t('layout.advanced')}
      >
        <PanelLeft className="size-3.5" />
        <span className="hidden sm:inline">{t('layout.advanced')}</span>
      </button>
    </div>
  )

  // Strip title when docked, or always when there is no hero block
  const showStripTitle = Boolean(showTitle && (docked || !hasExpandedDoc))

  return (
    <>
      {/*
        Float → dock under site header.
        Desktop: sticky + pad/chrome transitions.
        Mobile: in-flow float, then position:fixed + spacer when docked
        (no dual-sticky; keeps attach/detach without iOS rubber-band jitter).
      */}
      {isMobileStrip && docked ? (
        <div
          aria-hidden
          className="w-full shrink-0"
          style={{ height: mobileBarH }}
        />
      ) : null}
      <div
        ref={barRef}
        data-docked={docked ? '1' : '0'}
        data-mobile-strip={isMobileStrip ? '1' : '0'}
        className={cn(
          'z-30 w-full max-w-full min-w-0',
          isMobileStrip
            ? cn(
                // Mobile still discretely collapses padding on dock; keep its own tween.
                'transition-[padding] duration-200 ease-out',
                docked
                  ? // Pinned under fixed SiteHeader (h-14)
                    'fixed inset-x-0 top-14 shrink-0 pt-0 [backface-visibility:hidden] [transform:translateZ(0)]'
                  : // Floating: top gap = same token as page-shell horizontal inset
                    'relative shrink-0 pt-[var(--page-pad-x)]',
              )
            : // Desktop: padding is constant (flow height never changes); the
              // dock glide is a transform on the inner chrome div instead.
              'sticky shrink-0 pt-[var(--page-pad-x)] sm:pt-[var(--page-pad-x)]',
          className,
        )}
        style={isMobileStrip ? undefined : { top: headerPx }}
      >
        <div
          className={cn(
            'relative w-full max-w-full min-w-0 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out',
            docked
              ? isMobileStrip
                ? 'border-b border-border bg-bg'
                : 'border-b border-border bg-bg/95 shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)] backdrop-blur-md'
              : 'border-b border-transparent bg-transparent',
          )}
          style={
            isMobileStrip
              ? undefined
              : { transform: docked ? 'translateY(calc(-1 * var(--page-pad-x)))' : 'translateY(0)' }
          }
        >
          <div className="page-shell max-w-full min-w-0">
            <div
              className={cn(
                'relative w-full max-w-full min-w-0 transition-[background-color,border-color,box-shadow,padding] duration-200 ease-out',
                docked
                  ? 'border border-transparent bg-transparent px-0 py-1.5 sm:py-1.5'
                  : 'border border-border bg-surface/95 px-2.5 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.55)] sm:px-3 sm:py-1.5',
              )}
            >
              {/*
                Single strip:
                  [← back · tool title] → /tools · layout controls
                Mobile: no strip presets (default is in layout sheet); title truncates.
              */}
              <div className="flex w-full min-w-0 items-center gap-2 sm:min-h-10 sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  {showBack || showStripTitle ? (
                    <Link
                      to="/tools"
                      aria-label={t('tool.back')}
                      {...tooltipProps(
                        t('tool.back'),
                        cn(
                          'flex min-w-0 max-w-full items-center gap-1.5 no-underline transition-colors sm:gap-2',
                          'text-muted hover:text-fg',
                        ),
                        'below-start',
                      )}
                    >
                      {showBack ? (
                        <ArrowLeft
                          className="size-4 shrink-0 sm:size-3.5"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      ) : null}
                      {showBack ? (
                        <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] sm:inline">
                          {t('tool.back')}
                        </span>
                      ) : null}
                      {showBack && showStripTitle ? (
                        <span
                          className="hidden h-3 w-px shrink-0 bg-border-strong sm:block"
                          aria-hidden
                        />
                      ) : null}
                      {showStripTitle ? (
                        <span
                          className={cn(
                            'min-w-0 truncate font-display font-semibold tracking-tight text-fg',
                            'text-base sm:text-sm sm:font-medium sm:text-[15px]',
                          )}
                        >
                          {title}
                        </span>
                      ) : showBack ? (
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] sm:hidden">
                          {t('tool.back')}
                        </span>
                      ) : null}
                    </Link>
                  ) : null}

                  {!showTitle && !showBack ? (
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                      <Settings2 className="size-3.5" strokeWidth={1.5} />
                      {t('layout.kicker')}
                    </span>
                  ) : null}
                </div>

                {viewControls}
              </div>

              {/* Undocked advanced: inside floating card */}
              {open && !docked ? (
                <div className="mt-2 border-t border-border pt-3">{advancedBody}</div>
              ) : null}
            </div>
          </div>

          {/* Docked advanced: full-bleed under bar */}
          {open && docked ? (
            <div
              className={cn(
                'border-t border-border bg-surface py-3',
                !isMobileStrip && 'bg-surface/98 shadow-lg backdrop-blur-md',
              )}
            >
              <div className="page-shell">{advancedBody}</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Hero scrolls away under sticky strip */}
      {hasExpandedDoc ? (
        <div
          className="page-shell relative z-0 w-full shrink-0 pt-5 pb-3 sm:pt-6 sm:pb-4"
          data-tool-hero="1"
        >
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {showTitle ? (
              <h1
                className="font-display font-semibold tracking-tight text-fg"
                style={{ fontSize: 'var(--section-title)' }}
              >
                {title}
              </h1>
            ) : null}
            {showSubtitle ? (
              <p className="prose-measure text-sm leading-relaxed text-muted sm:text-base">
                {doc?.subtitle}
              </p>
            ) : null}
            {showFormula ? (
              <p
                {...tooltipProps(
                  doc?.formula,
                  'w-fit max-w-full cursor-help font-mono text-sm tracking-wide text-white sm:text-[15px]',
                  'above-start',
                )}
              >
                {doc?.formula}
              </p>
            ) : null}
            {showTags ? (
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label={t('tools.tags_group')}
              >
                {doc!.tags!.map((tg) => (
                  <Link
                    key={tg}
                    to={catalogFilterPath([tg])}
                    aria-label={t('tools.filter_by_tag', { tag: tg })}
                    {...tooltipProps(
                      t('tools.filter_by_tag', { tag: tg }),
                      cn(
                        'inline-flex cursor-pointer items-center border border-border px-1.5 py-0.5',
                        'font-mono text-[10px] uppercase tracking-wide text-muted no-underline',
                        'transition-colors hover:border-border-strong hover:text-fg',
                        'outline-none focus:border-border-strong focus:text-fg',
                      ),
                      'above-start',
                    )}
                  >
                    #{tg}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
