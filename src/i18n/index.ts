import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { it } from './locales/it'
import { de } from './locales/de'
import { fr } from './locales/fr'
import { es } from './locales/es'
import { ru } from './locales/ru'
import { zh } from './locales/zh'
import { ja } from './locales/ja'
import { ko } from './locales/ko'
import { pt } from './locales/pt'

/**
 * Languages of major space-agency nations / partners:
 * en (NASA, ESA working, ISRO/UKSA/CSA), it (ASI), de (DLR), fr (CNES),
 * es (INTA / ESA-ES), ru (Roscosmos), zh (CNSA), ja (JAXA),
 * ko (KARI), pt (AEB / INPE).
 */
export const SUPPORTED_LOCALES = [
  'en',
  'it',
  'de',
  'fr',
  'es',
  'ru',
  'zh',
  'ja',
  'ko',
  'pt',
] as const

export type TLocaleCode = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: TLocaleCode = 'en'

const STORAGE_KEY = 'sidus.locale'

const resources = {
  en: { translation: en },
  it: { translation: it },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  pt: { translation: pt },
}

function isSupported(code: string | undefined | null): code is TLocaleCode {
  if (!code) return false
  const short = code.slice(0, 2).toLowerCase()
  return (SUPPORTED_LOCALES as readonly string[]).includes(short)
}

/** Pick initial language: saved → navigator → default. */
export function detectLocale(): TLocaleCode {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      const saved = globalThis.localStorage.getItem(STORAGE_KEY)
      if (isSupported(saved)) return saved.slice(0, 2).toLowerCase() as TLocaleCode
    }
  } catch {
    /* private mode */
  }
  try {
    if (typeof navigator !== 'undefined') {
      const list = navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      for (const raw of list) {
        if (isSupported(raw)) return raw.slice(0, 2).toLowerCase() as TLocaleCode
        const short = raw?.slice(0, 2).toLowerCase()
        if (isSupported(short)) return short as TLocaleCode
      }
    }
  } catch {
    /* ssr / test */
  }
  return DEFAULT_LOCALE
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  // Keep language code short (it, de, …) for our resource keys
  load: 'languageOnly',
  nonExplicitSupportedLngs: true,
})

/** Persist user choice (LanguageSwitcher + external callers). */
export function setAppLocale(code: string): void {
  const short = code.slice(0, 2).toLowerCase()
  const lng = isSupported(short) ? short : DEFAULT_LOCALE
  void i18n.changeLanguage(lng)
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(STORAGE_KEY, lng)
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng
    }
  } catch {
    /* ignore */
  }
}

// Sync <html lang> on start and on change
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language?.slice(0, 2) || DEFAULT_LOCALE
}
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng.slice(0, 2)
  }
})

export default i18n
