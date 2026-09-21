import { useLocalStorage } from '@vueuse/core'

export interface Settings {
  lang: string | null
  /** The ruleset to show levels for, `null` follows the primary ruleset */
  rulesId: string | null
  hideCompleted: boolean
  /** By notice id, the `updatedAt` it was dismissed at */
  dismissedNotices: Record<string, number>
}

const settings = useLocalStorage<Settings>('tricktionary-settings', {
  lang: null,
  rulesId: null,
  hideCompleted: false,
  dismissedNotices: {}
}, { mergeDefaults: true })

export default function useSettings () { return settings }
