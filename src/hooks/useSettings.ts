import { useLocalStorage } from '@vueuse/core'

export interface Settings {
  lang: string | null
  hideCompleted: boolean
}

const settings = useLocalStorage<Settings>('tricktionary-settings', {
  lang: null,
  hideCompleted: false
})

export default function useSettings () { return settings }
