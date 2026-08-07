import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, FlaskConical } from 'lucide-react'
import { TOOLS, primaryTag } from '@/data/tools'
import { RESOURCES } from '@/data/resources'
import { BODIES } from '@/lib/physics'
import { SeoHead } from '@/components/site/SeoHead'
import { McpConnectCard } from '@/components/site/McpConnectCard'
import { AsciiOrbitField } from '@/components/site/AsciiOrbitField'
import { ToolExampleCarousel } from '@/components/site/ToolExampleCarousel'
import { RevealOnScroll } from '@/components/site/home/RevealOnScroll'
import { useCountUpWhenVisible } from '@/components/site/home/useCountUpWhenVisible'
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

function StatCell({ label, target }: { label: string; target: number }) {
  const { ref, value } = useCountUpWhenVisible(target)
  return (
    <div className="bg-bg px-5 py-6 sm:px-6">
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className="font-display text-2xl font-semibold tabular text-fg sm:text-3xl"
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
        {label}
      </p>
    </div>
  )
}

/**
 * Motion-study home (`/home-alt`): same IA as production `/`, with extra
 * Firecrawl-class scroll energy below Capabilities (reveal, stagger, scan, count-up).
 */
export function HomeAltPage() {
  const { t } = useTranslation()

  const featured = FEATURED_IDS.map((id) => TOOLS.find((tool) => tool.id === id)).filter(
    (tool): tool is NonNullable<typeof tool> => Boolean(tool),
  )

  const tagCount = new Set(TOOLS.flatMap((x) => x.tags)).size

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
        title={t('home.lab.seo_title')}
        description={t('home.lab.seo_description')}
        path="/home-alt"
      />

      <div className="border-b border-border">
        <div className="page-shell flex flex-wrap items-center justify-between gap-2 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
            <FlaskConical className="mr-1.5 inline size-3 opacity-70" aria-hidden />
            {t('home.lab.ribbon')}
          </p>
          <div className="flex gap-4">
            <Link
              to="/"
              className="font-mono text-[10px] uppercase tracking-wider text-muted no-underline hover:text-fg"
            >
              {t('home.lab.production')}
            </Link>
          </div>
        </div>
      </div>

      {/* Hero: same as production (stable claim + carousel) */}
      <section className="relative min-h-[min(92dvh,52rem)] overflow-hidden border-b border-border">
        <AsciiOrbitField className="z-0" density={1.15} opacity={0.78} />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(105deg, color-mix(in oklab, var(--color-bg) 72%, transparent) 0%, color-mix(in oklab, var(--color-bg) 28%, transparent) 42%, transparent 68%), linear-gradient(180deg, color-mix(in oklab, var(--color-bg) 35%, transparent) 0%, transparent 28%, color-mix(in oklab, var(--color-bg) 55%, transparent) 100%)',
          }}
        />
        <div className="page-shell relative z-10 flex min-h-[min(92dvh,52rem)] flex-col justify-center py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
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
            <div className="min-w-0 w-full lg:justify-self-end">
              <ToolExampleCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Stats with count-up */}
      <section className="border-b border-border">
        <div className="page-shell grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
          <StatCell label={t('home.stats.tools')} target={TOOLS.length} />
          <StatCell label={t('home.stats.categories')} target={tagCount} />
          <StatCell label={t('home.stats.bodies')} target={BODIES.length} />
          <StatCell label={t('home.stats.sources')} target={RESOURCES.length} />
        </div>
      </section>

      {/* Capabilities: staggered reveal */}
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

      {/* Featured: reveal + stagger */}
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

      {/* Tags wave-in + MCP scanline */}
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
