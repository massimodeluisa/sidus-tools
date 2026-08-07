import { useTranslation } from 'react-i18next'
import { setAppLocale, SUPPORTED_LOCALES, type TLocaleCode } from '@/i18n'
import { cn } from '@/lib/utils'

/** Agency-nation labels (short codes for chrome). */
const LABELS: Record<TLocaleCode, string> = {
  en: 'EN',
  it: 'IT',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  ru: 'RU',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  pt: 'PT',
}

type Props = {
  /** Override size/chrome (mobile header uses h-10 to match burger). */
  className?: string
}

export function LanguageSwitcher({ className }: Props) {
  const { i18n, t } = useTranslation()
  const current = (i18n.language?.slice(0, 2) || 'en') as TLocaleCode

  return (
    <select
      aria-label={t('nav.language', { defaultValue: 'Language' })}
      className={cn(
        // text-base (≥16px) prevents iOS focus zoom on the language <select>
        'box-border h-9 border border-border-strong bg-surface px-2 font-mono text-base uppercase leading-none tracking-[0.12em] text-muted outline-none transition-colors hover:text-fg focus:border-border-strong focus:text-fg lg:text-[10px]',
        className,
      )}
      value={SUPPORTED_LOCALES.includes(current) ? current : 'en'}
      onChange={(e) => setAppLocale(e.target.value)}
    >
      {SUPPORTED_LOCALES.map((code) => (
        <option key={code} value={code}>
          {LABELS[code]}
        </option>
      ))}
    </select>
  )
}
