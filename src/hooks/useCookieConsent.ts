import { ref } from 'vue'

const granted = ref<boolean | null>(null)

export default function useConsentCookie () {
  if (document.cookie.includes('cookie-consent=allow')) {
    granted.value = true
  } else if (document.cookie.includes('cookie-consent=deny')) {
    granted.value = false
  }

  return {
    granted,
    grant () {
      document.cookie = `cookie-consent=allow; max-age=${60 * 60 * 24 * 356 * 3}; path=/`
      granted.value = true
    },
    deny () {
      document.cookie = `cookie-consent=deny; max-age=${60 * 60 * 24}; path=/`
      granted.value = false
    }
  }
}
