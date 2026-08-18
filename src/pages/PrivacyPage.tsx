import { useTranslation } from 'react-i18next'
import { SeoHead } from '@/components/site/SeoHead'
import { EditOnGitHub } from '@/components/site/EditOnGitHub'

export function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="sidus-enter page-shell page-y">
      <SeoHead
        title={t('privacy.seo_title')}
        description={t('privacy.seo_description')}
        path="/privacy"
      />
      <div className="mb-8 max-w-prose">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
            {t('privacy.kicker')}
          </p>
          <EditOnGitHub path="src/pages/PrivacyPage.tsx" />
        </div>
        <h1
          className="mt-2 font-display font-semibold tracking-tight text-fg"
          style={{ fontSize: 'var(--section-title)' }}
        >
          {t('privacy.title')}
        </h1>
        <p className="mt-2 font-mono text-[11px] text-subtle">{t('privacy.updated')}</p>
      </div>

      <article className="prose-measure max-w-prose space-y-8 text-sm leading-relaxed text-muted sm:text-base">
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">{t('privacy.who_title')}</h2>
          <p className="mt-2">{t('privacy.who_body')}</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">{t('privacy.what_title')}</h2>
          <p className="mt-2">{t('privacy.what_body')}</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">{t('privacy.gtm_title')}</h2>
          <p className="mt-2">{t('privacy.gtm_body')}</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">{t('privacy.cf_title')}</h2>
          <p className="mt-2">{t('privacy.cf_body')}</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">
            {t('privacy.cookies_title')}
          </h2>
          <p className="mt-2">{t('privacy.cookies_body')}</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">{t('privacy.legal_title')}</h2>
          <p className="mt-2">{t('privacy.legal_body')}</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">{t('privacy.rights_title')}</h2>
          <p className="mt-2">{t('privacy.rights_body')}</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-fg">
            {t('privacy.contact_title')}
          </h2>
          <p className="mt-2">
            {t('privacy.contact_body')}{' '}
            <a
              href="https://massimo.deluisa.bio"
              target="_blank"
              rel="noreferrer"
              className="text-signal underline-offset-2 hover:text-fg hover:underline"
            >
              massimo.deluisa.bio
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  )
}
