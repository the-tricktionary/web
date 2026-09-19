import { provideApolloClient } from '@vue/apollo-composable'
import { effectScope, watch } from 'vue'

import { apolloClient } from '../apollo'
import { useUiMessagesQuery } from '../graphql/generated/graphql'
import i18n from '../i18n'
import useLanguage from './useLanguage'

// a query per language, in a detached scope, so switching back to one we already
// have doesn't ask for it again
const scope = effectScope(true)
const asked = new Set(['en'])

export default function useUiMessages () {
  const { lang } = useLanguage()

  watch(lang, lang => {
    if (asked.has(lang)) return
    asked.add(lang)

    scope.run(() => {
      provideApolloClient(apolloClient)
      const { onResult } = useUiMessagesQuery({ lang }, { fetchPolicy: 'cache-first' })
      onResult(({ data }) => {
        // apollo freezes its results and flatJson unfolds the keys in place
        if (data) i18n.global.setLocaleMessage(lang, { ...data.uiMessages })
      })
    })
  }, { immediate: true })
}
