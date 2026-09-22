import { useLocalStorage } from '@vueuse/core'

import type { Theme } from '../graphql/generated/graphql'

export interface Settings {
  lang: string | null
  /** `null` follows the system */
  theme: Theme | null
  /** The ruleset to show levels for, `null` follows the primary ruleset */
  rulesId: string | null
  hideCompleted: boolean
  /** By notice id, the `updatedAt` it was dismissed at */
  dismissedNotices: Record<string, number>
}

const settings = useLocalStorage<Settings>('tricktionary-settings', {
  lang: null,
  theme: null,
  rulesId: null,
  hideCompleted: false,
  dismissedNotices: {}
}, { mergeDefaults: true })

export default function useSettings () { return settings }
