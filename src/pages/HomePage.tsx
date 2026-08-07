import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { TOOLS, primaryTag } from '@/data/tools'
import { SeoHead } from '@/components/site/SeoHead'
import { McpConnectCard } from '@/components/site/McpConnectCard'
import { AsciiOrbitField } from '@/components/site/AsciiOrbitField'
import { ToolExampleCarousel } from '@/components/site/ToolExampleCarousel'
import { RevealOnScroll } from '@/components/site/home/RevealOnScroll'
import {
  AgentsSvg,
  OrbitSvg,
  SiUnitsSvg,
  TransferSvg,
} from '@/components/site/HomeFeatureSvgs'
import { cn } from '@/lib/utils'

const FEATURED_IDS = [
  'circular-orbit',
  'hohmann',
  'escape',
  'sgp4',
  'rocket-equation',
  'link-budget',
] as const

const TAG_CLOUD = [
  'orbital',
  'propulsion',
  'satellite',
  'crew',
  'geometry',
  'planetary',
  'utilities',
  'delta-v',
  'mission-design',
] as const

/**
 * Production home: hero → (mobile: live examples) → capability cards → featured → tags + MCP.
 * Mobile hero is copy + CTAs only (ASCII field behind); carousel sits above Capabilities.
 * Desktop keeps live examples in the hero grid. Scroll reveals from home-alt.
 */
export function HomePage() {
  const { t } = useTranslation()

  const featured = FEATURED_IDS.map((id) => TOOLS.find((tool) => tool.id === id)).filter(
    (tool): tool is NonNullable<typeof tool> => Boolean(tool),
  )

  const pillars = [
    {
      id: 'orbital',
      kicker: '01',
      title: t('home.highlights.orbital.title'),
      body: t('home.highlights.orbital.body'),
      href: '/tools?tags=orbital',
      Svg: OrbitSvg,
    },
    {
      id: 'transfer',
      kicker: '02',
      title: t('home.highlights.propulsion.title'),
      body: t('home.highlights.propulsion.body'),
      href: '/tools?tags=propulsion',
      Svg: TransferSvg,
    },
    {
      id: 'si',
      kicker: '03',
      title: t('home.highlights.si.title'),
      body: t('home.highlights.si.body'),
      href: '/tools/units',
      Svg: SiUnitsSvg,
    },
    {
      id: 'agents',
      kicker: '04',
      title: t('home.highlights.agents.title'),
      body: t('home.highlights.agents.body'),
      href: '/resources',
      Svg: AgentsSvg,
    },
  ] as const

  return (
    <div className="sidus-enter">
      <SeoHead
        title="SIDUS: Space Engineering Tools"
        description="Open-source pure-SI calculators for orbital mechanics, propulsion, SGP4, launch, RF link budgets, and crew ECLSS. No affiliation with NASA, ESA, or SpaceX."
        path="/"
      />

      {/* ── Hero: full viewport under sticky header (h-14 / sm:h-16) ─── */}
      <section
        className={cn(
          'relative flex w-full flex-col overflow-hidden border-b border-border',
          // Fill remaining viewport; allow growth if content is taller (narrow phones)
          'min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)]',
        )}
      >
        <AsciiOrbitField className="z-0" density={1.15} opacity={0.78} />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(105deg, color-mix(in oklab, var(--color-bg) 72%, transparent) 0%, color-mix(in oklab, var(--color-bg) 28%, transparent) 42%, transparent 68%), linear-gradient(180deg, color-mix(in oklab, var(--color-bg) 35%, transparent) 0%, transparent 28%, color-mix(in oklab, var(--color-bg) 55%, transparent) 100%)',
          }}
        />

        <div
          className={cn(
            'page-shell relative z-10 flex w-full flex-1 flex-col justify-center',
            'py-10 sm:py-12 lg:py-14',
            'min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)]',
          )}
        >
          <div className="grid w-full flex-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
            {/* Mobile: hero copy + CTAs only (animation field stays behind). */}
            <div className="min-w-0 max-w-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
                {t('home.badge')} · {t('home.version')}
              </p>
              <h1
                className="mt-4 font-display font-semibold leading-[1.05] tracking-tight text-fg sm:mt-5"
                style={{ fontSize: 'var(--hero-title)' }}
              >
                {t('home.title_line1')}
                <br />
                {t('home.title_line2')}
                <br />
                <span className="text-muted">{t('home.title_line3')}</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
                {t('home.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/tools"
                  className="inline-flex h-12 items-center gap-2 bg-accent px-7 font-display text-sm font-medium tracking-wide text-accent-fg no-underline transition-colors hover:bg-fg"
                >
                  {t('home.cta_tools')}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/resources"
                  className="inline-flex h-12 items-center gap-2 border border-border-strong bg-bg/40 px-7 font-display text-sm font-medium text-fg no-underline backdrop-blur-sm transition-colors hover:bg-surface"
                >
                  {t('home.cta_resources')}
                </Link>
              </div>
            </div>

            {/* Desktop / large: live examples stay in the hero column */}
            <div className="hidden min-w-0 w-full lg:block lg:justify-self-end">
              <ToolExampleCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: live examples between hero and Capabilities */}
      <section className="border-b border-border page-shell py-8 lg:hidden">
        <ToolExampleCarousel />
      </section>

      {/* ── Capabilities: staggered reveal (home-alt motion) ─────────── */}
      <section className="page-shell page-y">
        <RevealOnScroll>
          <div className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              {t('home.section.capabilities_kicker')}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {t('home.section.capabilities_title')}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pillars.map((p, i) => (
            <RevealOnScroll key={p.id} delayMs={i * 90}>
              <Link
                to={p.href}
                className={cn(
                  'group flex h-full flex-col overflow-hidden border border-border bg-surface no-underline transition-colors hover:border-border-strong hover:bg-surface-hover',
                  'sidus-motion-border',
                )}
              >
                <div className="relative flex h-40 items-center justify-center border-b border-border bg-bg sm:h-44">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      background:
                        'radial-gradient(ellipse 70% 60% at 50% 45%, color-mix(in oklab, var(--color-signal) 14%, transparent), transparent 70%)',
                    }}
                  />
                  {/* OrbitSvg / TransferSvg craft animations unchanged */}
                  <p.Svg className="relative z-[1] h-[7.5rem] w-full max-w-[13rem] text-fg sm:h-[8.5rem] sm:max-w-[14rem]" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                    {p.kicker}
                  </p>
                  <h3 className="mt-2 font-display text-base font-medium text-fg group-hover:text-signal">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-signal">
                    {t('home.explore')}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ── Featured: reveal + stagger ──────────────────────────────── */}
      <section className="border-t border-border bg-bg-elevated">
        <div className="page-shell page-y">
          <RevealOnScroll>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
                  {t('home.section.featured_kicker')}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">
                  {t('home.featured_title')}
                </h2>
              </div>
              <Link
                to="/tools"
                className="font-mono text-[11px] uppercase tracking-wider text-signal no-underline hover:underline"
              >
                {t('home.featured_all')} →
              </Link>
            </div>
          </RevealOnScroll>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tool, i) => (
              <RevealOnScroll key={tool.id} delayMs={i * 70}>
                <Link
                  to={`/tools/${tool.id}`}
                  className="group flex h-full flex-col bg-bg p-5 no-underline transition-colors hover:bg-surface"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                    #{primaryTag(tool)}
                  </span>
                  <span className="mt-2 font-display text-base font-medium text-fg group-hover:text-signal">
                    {tool.title}
                  </span>
                  <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {tool.description}
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tags wave-in + MCP scanline ──────────────────────────────── */}
      <section className="page-shell page-y">
        <RevealOnScroll>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
            {t('home.section.tags_kicker')}
          </p>
        </RevealOnScroll>
        <div className="mt-4 flex flex-wrap gap-2">
          {TAG_CLOUD.map((tg, i) => (
            <Link
              key={tg}
              to={`/tools?tags=${tg}`}
              style={{ ['--sidus-tag-delay' as string]: `${i * 45}ms` }}
              className="sidus-motion-tag border border-border bg-surface px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-muted no-underline transition-colors hover:border-border-strong hover:text-fg"
            >
              #{tg}
            </Link>
          ))}
        </div>

        <RevealOnScroll delayMs={120}>
          <div className="sidus-motion-scan mt-12">
            <McpConnectCard />
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={200}>
          <p className="mt-10 max-w-xl text-sm leading-relaxed text-subtle">
            {t('home.etymology')} {t('home.disclaimer')}
          </p>
        </RevealOnScroll>
      </section>
    </div>
  )
}
