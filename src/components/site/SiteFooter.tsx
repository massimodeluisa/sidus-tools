import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpRight,
  ExternalLink,
  GitBranch,
  Heart,

  Terminal,
} from 'lucide-react'
import { openCookiePreferences } from '@/lib/gtm'
import { cn } from '@/lib/utils'

const GITHUB = 'https://github.com/massimodeluisa/sidus-tools'
const AUTHOR = 'https://massimo.deluisa.bio'
const GROK_BUILD = 'https://x.ai/build'
const MCP_URL = 'https://sidus.tools/api/mcp'

type FooterLink = {
  label: string
  to?: string
  href?: string
  external?: boolean
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: FooterLink[]
}) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
        {title}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => {
          const className =
            'group inline-flex max-w-full min-w-0 items-center gap-1 break-words font-mono text-[12px] leading-snug text-muted no-underline transition-colors hover:text-fg'
          if (link.to) {
            return (
              <li key={link.label}>
                <Link to={link.to} className={className}>
                  <span>{link.label}</span>
                  <ArrowUpRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                </Link>
              </li>
            )
          }
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                className={className}
              >
                <span>{link.label}</span>
                {link.external ? (
                  <ExternalLink className="size-3 shrink-0 opacity-40 transition-opacity group-hover:opacity-80" />
                ) : (
                  <ArrowUpRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const product: FooterLink[] = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.tools'), to: '/tools' },
    { label: t('nav.resources'), to: '/resources' },
    { label: t('footer.privacy'), to: '/privacy' },
  ]

  const developers: FooterLink[] = [
    { label: t('footer.dev.github'), href: GITHUB, external: true },
    { label: t('footer.dev.mcp'), to: '/resources' },
    { label: t('footer.dev.mcp_url'), href: MCP_URL, external: true },
    { label: t('footer.dev.agents'), href: `${GITHUB}/blob/main/AGENTS.md`, external: true },
    {
      label: t('footer.dev.conventions'),
      href: `${GITHUB}/blob/main/CONVENTIONS.md`,
      external: true,
    },
    {
      label: t('footer.dev.contributions'),
      href: `${GITHUB}/blob/main/CONTRIBUTING.md`,
      external: true,
    },
    {
      label: t('footer.dev.docs_index'),
      href: `${GITHUB}/blob/main/INDEX.md`,
      external: true,
    },
    { label: t('footer.dev.license'), href: `${GITHUB}/blob/main/LICENSE.md`, external: true },
  ]

  return (
    <footer
      className="relative z-10 mt-auto max-w-full min-w-0 overflow-x-clip border-t border-border"
      style={{ backgroundColor: 'var(--color-bg-elevated)' }}
    >
      {/*
        Cap content width so ultrawide screens don't create a canyon between
        CTA copy and actions / between brand and link columns.
      */}
      <div className="page-shell max-w-full min-w-0">
        <div className="mx-auto w-full max-w-6xl min-w-0">
          {/* CTA: copy + actions as one tight cluster (no justify-between void) */}
          <div className="flex flex-col gap-5 border-b border-border py-8 sm:py-9 lg:flex-row lg:items-center lg:gap-8">
            <div className="min-w-0 flex-1 lg:max-w-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                {t('footer.kicker')}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                {t('footer.cta_title')}
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                {t('footer.cta_body')}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2.5 lg:ml-auto">
              <Link
                to="/tools"
                className="inline-flex h-10 items-center gap-2 bg-accent px-4 font-display text-sm font-medium tracking-wide text-accent-fg no-underline transition-colors hover:bg-fg"
              >
                {t('footer.cta_tools')}
                <ArrowUpRight className="size-3.5" />
              </Link>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border-strong bg-surface px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-fg no-underline transition-colors hover:border-fg/40 hover:bg-surface-hover"
              >
                <GitBranch className="size-3.5" />
                {t('footer.cta_github')}
              </a>
            </div>
          </div>

          {/* Brand + nav columns: brand wide, product + developers */}
          <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-8 py-8 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-3 lg:gap-x-12">
            <div className="min-w-0 sm:col-span-2 md:col-span-1">
              <Link to="/" className="group inline-flex max-w-full min-w-0 items-center gap-2.5 no-underline">
                <span className="flex size-8 shrink-0 items-center justify-center border border-border-strong bg-surface">
                  <img
                    src="/assets/logo-mark.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="size-[1.125rem] transition-transform duration-300 group-hover:rotate-45"
                    decoding="async"
                  />
                </span>
                <span className="flex min-w-0 flex-col leading-none">
                  <span className="truncate font-display text-sm font-semibold tracking-[0.16em] text-fg">
                    SIDUS
                  </span>
                  <span className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.18em] text-subtle">
                    {t('footer.brand_sub')}
                  </span>
                </span>
              </Link>
              <p className="mt-3 max-w-[18rem] break-words text-[13px] leading-relaxed text-muted">
                {t('footer.brand_blurb')}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                  {t('footer.badge_oss')}
                </span>
                <span className="inline-flex items-center border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                  {t('footer.badge_si')}
                </span>
                <span className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                  <Terminal className="size-2.5" />
                  {t('footer.badge_mcp')}
                </span>
              </div>
            </div>

            <FooterCol title={t('footer.col_product')} links={product} />
            <FooterCol title={t('footer.col_developers')} links={developers} />
          </div>

          {/* Disclaimer + legal in one compact bottom band */}
          <div className="space-y-4 border-t border-border py-5">
            <p className="max-w-3xl text-[11px] leading-relaxed text-muted sm:text-xs">
              {t('footer.disclaimer')}
            </p>
            <div
              className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
              )}
            >
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                <span>© {year} SIDUS</span>
                <span className="text-border-strong" aria-hidden>
                  ·
                </span>
                <span>{t('footer.opensource')}</span>
                <span className="text-border-strong" aria-hidden>
                  ·
                </span>
                <Link
                  to="/privacy"
                  className="text-muted no-underline transition-colors hover:text-fg"
                >
                  {t('footer.privacy')}
                </Link>
                <span className="text-border-strong" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => openCookiePreferences()}
                  className="uppercase tracking-[0.12em] text-muted transition-colors hover:text-fg"
                >
                  {t('footer.cookies')}
                </button>
                <span className="text-border-strong" aria-hidden>
                  ·
                </span>
                <span className="normal-case tracking-normal">sidus.tools</span>
              </div>
              <p className="inline-flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted">
                <span>{t('footer.made')}</span>
                <Heart className="size-3 fill-danger/80 text-danger" aria-hidden />
                <span>{t('footer.made_by')}</span>
                <a
                  href={AUTHOR}
                  target="_blank"
                  rel="noreferrer"
                  className="text-signal underline-offset-2 transition-colors hover:text-fg hover:underline"
                >
                  {t('footer.author')}
                </a>
                <span>{t('footer.made_with')}</span>
                <a
                  href={GROK_BUILD}
                  target="_blank"
                  rel="noreferrer"
                  className="text-signal underline-offset-2 transition-colors hover:text-fg hover:underline"
                >
                  {t('footer.made_tool')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
