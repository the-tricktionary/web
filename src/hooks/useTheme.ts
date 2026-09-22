import { provideApolloClient } from '@vue/apollo-composable'
import { usePreferredDark } from '@vueuse/core'
import { computed, effectScope, watch } from 'vue'

import { apolloClient } from '../apollo'
import { Theme, useSetUserThemeMutation } from '../graphql/generated/graphql'
import useAuth from './useAuth'
import useSettings from './useSettings'

// one theme for the whole app, so the mutation lives in a detached scope
// rather than in the first component that asked
const scope = effectScope(true)
let state: ReturnType<typeof createState> | undefined

function createState () {
  provideApolloClient(apolloClient)

  const { user } = useAuth()
  const settings = useSettings()
  const preferredDark = usePreferredDark()

  const { mutate: setUserTheme } = useSetUserThemeMutation({ throws: 'never' })

  const theme = computed(() => user.value?.theme ?? settings.value.theme ?? null)

  // the choice follows the account once there is one, once per sign-in
  watch(() => user.value?.id, id => {
    if (!id) return
    if (user.value?.theme) settings.value.theme = user.value.theme
    else if (settings.value.theme) void setUserTheme({ theme: settings.value.theme })
  })

  function setTheme (theme: Theme | null) {
    settings.value.theme = theme
    if (user.value) void setUserTheme({ theme })
  }

  const isDark = computed(() => theme.value ? theme.value === Theme.Dark : preferredDark.value)

  return { theme, isDark, setTheme }
}

export default function useTheme () {
  state ??= scope.run(createState)!
  return state
}
