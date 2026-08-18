import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ListFilter, Search } from 'lucide-react'
import { TOOLS, primaryTag } from '@/data/tools'
import { parseCatalogTagsParam, serializeCatalogTags } from '@/lib/catalogTags'
import { tooltipProps } from '@/components/shared/tooltip'
import { cn } from '@/lib/utils'
import { SeoHead } from '@/components/site/SeoHead'
import { EditOnGitHub } from '@/components/site/EditOnGitHub'

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
 * True only after the *entire* in-flow catalog chrome (search + tags) has scrolled
 * fully past the site header — i.e. the block is no longer visible under the nav.
 * Hysteresis avoids thrash at the boundary when scrolling slowly.
 */
function useCatalogBlockPastHeader(
  blockRef: React.RefObject<HTMLElement | null>,
  headerPx: number,
): boolean {
  const [past, setPast] = useState(false)
  const pastRef = useRef(false)

  useEffect(() => {
    let raf = 0
    // Dock when bottom of full chrome clears the header
    const PAST_ON = headerPx + 2
    // Undock only once a good chunk of the block would be visible again
    const PAST_OFF = headerPx + 72

    function measure() {
      const el = blockRef.current
      if (!el) return
      const bottom = el.getBoundingClientRect().bottom
      let next = pastRef.current
      if (!pastRef.current && bottom <= PAST_ON) next = true
      else if (pastRef.current && bottom > PAST_OFF) next = false
      if (next !== pastRef.current) {
        pastRef.current = next
        setPast(next)
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [blockRef, headerPx])

  return past
}

/**
 * Animated open/close for tag chips (Filters button + dock mode defaults).
 * grid-template-rows 0fr↔1fr keeps height transition smooth without layout jump hacks.
 */
function TagsReveal({
  open,
  id,
  'aria-label': ariaLabel,
  children,
}: {
  open: boolean
  id: string
  'aria-label': string
  children: React.ReactNode
}) {
  return (
    <div
      id={id}
      role="group"
      aria-label={ariaLabel}
      aria-hidden={!open}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            'flex min-w-0 flex-wrap items-center gap-1.5 border-t border-border pt-2',
            'transition-[margin,padding,border-color] duration-300 ease-out',
            open ? 'mt-2 border-border' : 'mt-0 border-transparent pt-0',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Catalog filters are URL-driven: `/tools?tags=propulsion`, `/tools?tags=delta-v,crew`.
 * Empty `tags` ⇔ ALL mode. Legacy `?tag=` / `?cat=` rewrite to `?tags=`.
 *
 * Full chrome (search + tags) scrolls away in normal document flow.
 * Only AFTER that whole block is past the header do we show a compact fixed
 * toolbar under the nav — filters closed by default in compact, open in full.
 */
export function ToolsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const headerPx = useSiteHeaderOffsetPx()
  const isMobileStrip = useIsMobileStrip()
  const fullBlockRef = useRef<HTMLDivElement | null>(null)
  const compactRef = useRef<HTMLDivElement | null>(null)

  /** Compact toolbar visible only after full search+tags block has scrolled past. */
  const compact = useCatalogBlockPastHeader(fullBlockRef, headerPx)

  /**
   * Separate filter open state so collapsing compact never resizes the in-flow
   * full block (which would jump scroll). Defaults applied on mode switch.
   */
  const [fullFiltersOpen, setFullFiltersOpen] = useState(true)
  const [compactFiltersOpen, setCompactFiltersOpen] = useState(false)

  useEffect(() => {
    if (compact) setCompactFiltersOpen(false)
    else setFullFiltersOpen(true)
  }, [compact])

  // Scroll-padding: header + compact bar when compact is showing
  useEffect(() => {
    if (!compact) {
      document.documentElement.style.setProperty('--tool-sticky-stack', `${headerPx}px`)
      return
    }
    const h = compactRef.current?.offsetHeight || 52
    document.documentElement.style.setProperty('--tool-sticky-stack', `${headerPx + h}px`)
    return () => {
      document.documentElement.style.removeProperty('--tool-sticky-stack')
    }
  }, [compact, compactFiltersOpen, headerPx])

  const q = searchParams.get('q') ?? ''
  const selectedTags = useMemo(() => parseCatalogTagsParam(searchParams), [searchParams])
  const isAll = selectedTags.length === 0

  const patchParams = useCallback(
    (patch: { q?: string; tags?: string[] | null }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('cat')
          next.delete('tag')
          if ('q' in patch) {
            const v = (patch.q ?? '').trim()
            if (v) next.set('q', v)
            else next.delete('q')
          }
          if ('tags' in patch) {
            const list = patch.tags ?? []
            if (list.length === 0) next.delete('tags')
            else next.set('tags', serializeCatalogTags(list))
          }
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    },
    [setSearchParams],
  )

  // Legacy rewrite: tag= / cat= → tags=
  useEffect(() => {
    const hasLegacy = searchParams.has('tag') || searchParams.has('cat')
    if (!hasLegacy) return
    const merged = parseCatalogTagsParam(searchParams)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('cat')
        next.delete('tag')
        if (merged.length) next.set('tags', serializeCatalogTags(merged))
        else next.delete('tags')
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }, [searchParams, setSearchParams])

  /** Tools matching search only (before tag filter). */
  const catalogBase = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return TOOLS
    return TOOLS.filter((tool) => {
      const hay =
        `${tool.title} ${tool.description} ${tool.tags.join(' ')} ${tool.status}`.toLowerCase()
      return hay.includes(qq)
    })
  }, [q])

  /** Tags that still have ≥1 tool under current search. */
  const visibleTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const tool of catalogBase) {
      for (const tg of tool.tags) {
        counts.set(tg, (counts.get(tg) ?? 0) + 1)
      }
    }
    return [...counts.keys()].sort((a, b) => a.localeCompare(b))
  }, [catalogBase])

  // Drop selected tags that vanished under current search
  useEffect(() => {
    if (selectedTags.length === 0) return
    const next = selectedTags.filter((tg) => visibleTags.includes(tg))
    if (next.length !== selectedTags.length) {
      patchParams({ tags: next })
    }
  }, [selectedTags, visibleTags, patchParams])

  const list = useMemo(() => {
    if (isAll) return catalogBase
    const set = new Set(selectedTags)
    return catalogBase.filter((tool) => tool.tags.some((tg) => set.has(tg)))
  }, [catalogBase, isAll, selectedTags])

  function selectAll() {
    if (isAll) return // cannot deselect ALL while it is the active mode
    patchParams({ tags: [] })
  }

  function toggleTag(tg: string) {
    if (selectedTags.includes(tg)) {
      const next = selectedTags.filter((x) => x !== tg)
      patchParams({ tags: next })
    } else {
      patchParams({ tags: [...selectedTags, tg] })
    }
  }

  const filterActive = selectedTags.length > 0

  const tagChips = (
    <>
      <FilterChip active={isAll} onClick={selectAll} aria-pressed={isAll}>
        {t('tools.all')}
      </FilterChip>
      {visibleTags.map((tg) => {
        const active = selectedTags.includes(tg)
        return (
          <FilterChip
            key={tg}
            active={active}
            onClick={() => toggleTag(tg)}
            aria-pressed={active}
          >
            {`#${tg}`}
          </FilterChip>
        )
      })}
    </>
  )

  function renderSearchRow(opts: {
    filtersOpen: boolean
    onToggleFilters: () => void
    tagsId: string
  }) {
    return (
      <>
        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => patchParams({ q: e.target.value })}
              placeholder={t('tools.search')}
              aria-label={t('tools.search')}
              className="h-10 w-full border border-border bg-bg/60 pl-10 pr-3 font-mono text-base text-fg outline-none placeholder:text-subtle focus:border-border-strong"
            />
          </div>
          <button
            type="button"
            onClick={opts.onToggleFilters}
            aria-expanded={opts.filtersOpen}
            aria-controls={opts.tagsId}
            aria-label={t('tools.filters_toggle')}
            {...tooltipProps(
              t('tools.filters_toggle'),
              cn(
                'inline-flex h-10 shrink-0 items-center gap-1.5 border px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors sm:px-3',
                opts.filtersOpen || filterActive
                  ? 'border-border-strong bg-surface text-fg'
                  : 'border-border bg-bg/60 text-muted hover:text-fg',
              ),
              'below-end',
            )}
          >
            <ListFilter className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{t('tools.filters')}</span>
            {filterActive ? (
              <span className="inline-flex min-w-[1.25rem] items-center justify-center border border-border-strong bg-bg px-1 font-mono text-[9px] tabular text-fg">
                {selectedTags.length}
              </span>
            ) : null}
          </button>
        </div>
        <TagsReveal open={opts.filtersOpen} id={opts.tagsId} aria-label={t('tools.tags_group')}>
          {tagChips}
        </TagsReveal>
      </>
    )
  }

  return (
    <div className="sidus-enter relative z-0 flex w-full min-w-0 flex-col">
      <SeoHead
        title="Tools · SIDUS"
        description="Catalog of pure-SI space engineering calculators: orbits, propulsion, SGP4, launch, RF link budgets, and crew ECLSS."
        path="/tools"
      />

      {/* Hero */}
      <div className="page-shell relative z-0 w-full shrink-0 pt-8 pb-5 sm:pt-10 sm:pb-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              {t('tools.kicker')} · {list.length}
              {list.length !== TOOLS.length ? ` / ${TOOLS.length}` : null} {t('tools.modules')}
            </p>
            <EditOnGitHub path="src/data/tools.ts" />
          </div>
          <h1
            className="font-display font-semibold tracking-tight text-fg"
            style={{ fontSize: 'var(--section-title)' }}
          >
            {t('tools.title')}
          </h1>
          <p className="prose-measure text-sm leading-relaxed text-muted sm:text-base">
            {t('tools.subtitle')}
          </p>
        </div>
      </div>

      {/*
        FULL chrome — in-flow floating card (search + tags). Scrolls away with the page.
        Dock breakpoint = after this whole block is past the header (not sticky-on-touch).
      */}
      <div
        ref={fullBlockRef}
        data-catalog-chrome="full"
        data-compact={compact ? '1' : '0'}
        className={cn(
          'relative z-0 w-full max-w-full min-w-0 shrink-0 pt-2',
          'transition-[opacity,transform] duration-300 ease-out',
          // Soft exit as compact attaches (block is already mostly off-screen)
          compact ? 'pointer-events-none opacity-40' : 'opacity-100',
        )}
      >
        <div className="page-shell max-w-full min-w-0">
          <div
            className={cn(
              'relative w-full max-w-full min-w-0 border border-border bg-surface/95 px-2.5 py-2 sm:px-3',
              'shadow-[0_8px_30px_-12px_rgba(0,0,0,0.55)]',
              'transition-[box-shadow,border-color,background-color] duration-300 ease-out',
            )}
          >
            {renderSearchRow({
              filtersOpen: fullFiltersOpen,
              onToggleFilters: () => setFullFiltersOpen((o) => !o),
              tagsId: 'catalog-tag-filters-full',
            })}
          </div>
        </div>
      </div>

      {/*
        COMPACT toolbar — always mounted; animates attach/detach under the menubar.
        Visible only after full search+tags block has scrolled past.
        Tags: closed by default on attach, open by default on detach; Filters animates too.
      */}
      <div
        ref={compactRef}
        data-catalog-chrome="compact"
        data-docked={compact ? '1' : '0'}
        aria-hidden={!compact}
        className={cn(
          'fixed inset-x-0 z-30 w-full max-w-full min-w-0',
          // Attach / detach motion (like tool-detail float → dock)
          'transition-[transform,opacity,box-shadow,background-color,border-color] duration-300 ease-out',
          isMobileStrip
            ? 'top-14 [backface-visibility:hidden]'
            : '',
          compact
            ? 'translate-y-0 border-b border-border bg-bg opacity-100 shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)]'
            : 'pointer-events-none -translate-y-2 border-b border-transparent bg-transparent opacity-0 shadow-none',
        )}
        style={isMobileStrip ? undefined : { top: headerPx }}
      >
        <div className="page-shell max-w-full min-w-0">
          <div
            className={cn(
              'relative w-full max-w-full min-w-0 py-2',
              'transition-[padding] duration-300 ease-out',
              compact ? 'px-0' : 'px-2.5 sm:px-3',
            )}
          >
            {renderSearchRow({
              filtersOpen: compactFiltersOpen,
              onToggleFilters: () => setCompactFiltersOpen((o) => !o),
              tagsId: 'catalog-tag-filters-compact',
            })}
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="page-shell w-full max-w-full min-w-0 shrink-0 pt-6 pb-10 sm:pt-8 sm:pb-12">
        {list.length === 0 ? (
          <p className="font-mono text-sm text-muted">{t('tools.empty')}</p>
        ) : (
          <div className="grid-auto-tools">
            {list.map((tool) => (
              <Link
                key={tool.id}
                to={`/tools/${tool.id}`}
                className="sidus-card group flex h-full min-h-[12rem] flex-col p-5 no-underline transition-colors hover:border-border-strong hover:bg-surface-hover sm:min-h-[13rem] sm:p-5"
              >
                <div className="mb-3 flex h-5 items-center justify-between gap-2">
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                    #{primaryTag(tool)}
                    {tool.status === 'live' ? ` · ${t('tools.status.live')}` : null}
                    {tool.status === 'wave1' ? ` · ${t('tools.status.wave1')}` : null}
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
                <h2 className="line-clamp-2 font-display text-lg font-medium leading-snug text-fg">
                  {tool.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                  {tool.description}
                </p>
                <div className="mt-4 flex min-h-[1.75rem] flex-wrap content-start gap-1 border-t border-border pt-3">
                  {tool.tags.map((tg) => (
                    <span
                      key={tg}
                      className="h-6 border border-border px-1.5 font-mono text-[10px] uppercase leading-6 tracking-wide text-muted"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
  'aria-pressed': ariaPressed,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  'aria-pressed'?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      className={cn(
        'inline-flex h-9 shrink-0 items-center border px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors sm:h-10 sm:px-3',
        active
          ? 'border-border-strong bg-surface text-fg'
          : 'border-border bg-transparent text-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}
