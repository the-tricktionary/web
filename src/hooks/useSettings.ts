import { useLocalStorage } from '@vueuse/core'

export interface Settings {
  lang: string | null
  /** The ruleset to show levels for, `null` follows the primary ruleset */
  rulesId: string | null
  hideCompleted: boolean
}

const settings = useLocalStorage<Settings>('tricktionary-settings', {
  lang: null,
  rulesId: null,
  hideCompleted: false
})

export default function useSettings () { return settings }
