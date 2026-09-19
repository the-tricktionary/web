import { createI18n } from 'vue-i18n'

import en from './locales/en.json'

export default createI18n<typeof en, string, false>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
  missingWarn: false,
  fallbackWarn: false
})
