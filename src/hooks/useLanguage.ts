import { provideApolloClient } from '@vue/apollo-composable'
import { computed, effectScope, watch } from 'vue'

import { apolloClient } from '../apollo'
import { useLanguagesQuery, useSetUserLangMutation } from '../graphql/generated/graphql'
import useAuth from './useAuth'
import useSettings from './useSettings'

// one language for the whole app, so the queries live in a detached scope
// rather than in the first component that asked
const scope = effectScope(true)
let state: ReturnType<typeof createState> | undefined

function createState () {
  provideApolloClient(apolloClient)

  const { user } = useAuth()
  const settings = useSettings()

  const languagesQuery = useLanguagesQuery()
  const { mutate: setUserLang } = useSetUserLangMutation({ throws: 'never' })

  const languages = computed(() => [...languagesQuery.result.value?.languages ?? []]
    .filter(language => language.enabled)
    .sort((a, b) => a.id.localeCompare(b.id))
  )

  /** The tag as we offer it, matching `sv-SE` to `sv`, or nothing when we offer no such language */
  function offered (tag: string | null | undefined) {
    if (!tag) return undefined
    const lower = tag.toLowerCase()
    const primary = lower.split('-')[0]
    return languages.value.find(language => language.id === lower)?.id ??
      languages.value.find(language => language.id === primary)?.id
  }

  const lang = computed(() =>
    offered(user.value?.lang) ??
    offered(settings.value.lang) ??
    navigator.languages.map(offered).find(tag => tag != null) ??
    'en'
  )

  // the choice follows the account once there is one, once per sign-in
  watch(() => user.value?.id, id => {
    if (!id) return
    if (user.value?.lang) settings.value.lang = user.value.lang
    else if (offered(settings.value.lang)) void setUserLang({ lang: settings.value.lang })
  })

  function setLang (lang: string) {
    settings.value.lang = lang
    if (user.value) void setUserLang({ lang })
  }

  return { languages, lang, setLang }
}

export default function useLanguage () {
  state ??= scope.run(createState)!
  return state
}
