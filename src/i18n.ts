import { createI18n } from 'vue-i18n'

import en from './locales/en.json'

export default createI18n<typeof en, string, false>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
  // the API hands out translated messages as a flat map keyed like `trick.level`
  flatJson: true,
  missingWarn: false,
  fallbackWarn: false
})
