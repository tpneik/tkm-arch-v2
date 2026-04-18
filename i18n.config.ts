import type { I18nConfig } from 'next-i18next'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'vi'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  resourceLoader: (language: string, namespace: string) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
}

export default i18nConfig
