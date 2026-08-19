import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, BookOpen, Wrench, Home } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const NAV = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/tools', label: t('nav.tools'), icon: Wrench, end: false },
    { to: '/resources', label: t('nav.resources'), icon: BookOpen, end: false },
  ] as const

  return (
    // Mobile: fixed (not sticky) so it does not rubber-band against a second sticky strip.
    // Desktop: sticky + frosted glass as before.
    <header
      className={cn(
        'z-40 max-w-full min-w-0 border-b border-border bg-bg [backface-visibility:hidden]',
        'fixed inset-x-0 top-0',
        'sm:sticky sm:bg-bg/90 sm:backdrop-blur-md',
      )}
    >
      <div className="page-shell flex h-14 max-w-full min-w-0 items-center justify-between gap-2 sm:h-16 sm:gap-4">
        <Link to="/" className="group flex min-w-0 max-w-[min(100%,12rem)] items-center gap-2 no-underline sm:max-w-none sm:gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center border border-border-strong bg-surface">
            <img
              src="/assets/logo-mark.svg"
              alt=""
              width={20}
              height={20}
              className="size-5 transition-transform duration-300 group-hover:rotate-45"
              decoding="async"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-sm font-semibold tracking-[0.18em] text-fg">
              SIDUS
            </span>
            <span className="hidden truncate font-mono text-[9px] uppercase tracking-[0.22em] text-subtle min-[380px]:block">
              Space Engineering Tools
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex h-9 items-center gap-2 rounded-sm px-3 font-mono text-[11px] uppercase tracking-[0.14em] no-underline transition-colors',
                  isActive
                    ? 'border border-border-strong bg-surface text-fg'
                    : 'text-muted hover:bg-surface/60 hover:text-fg',
                )
              }
            >
              <item.icon className="size-3.5" />
              {item.label}
            </NavLink>
          ))}
          <LanguageSwitcher />
        </nav>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          {/* Same footprint as burger (size-10 = 40×40) */}
          <LanguageSwitcher className="h-10 min-h-10" />
          <button
            type="button"
            className="box-border flex size-10 shrink-0 items-center justify-center border border-border-strong bg-surface text-fg"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-bg-elevated lg:hidden">
          <nav className="page-shell flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 px-2 font-mono text-xs uppercase tracking-[0.14em] text-fg no-underline hover:bg-surface"
              >
                <item.icon className="size-4 text-muted" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
