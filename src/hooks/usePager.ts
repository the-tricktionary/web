import { computed, ref } from 'vue'

/** A position in a list that wraps around at both ends, and stays in the list as it shrinks */
export default function usePager (length: () => number) {
  const picked = ref(0)
  const index = computed(() => Math.min(picked.value, Math.max(0, length() - 1)))

  function step (by: number) {
    if (length() === 0) return
    picked.value = (index.value + by + length()) % length()
  }

  function reset () {
    picked.value = 0
  }

  return { index, step, reset }
}
