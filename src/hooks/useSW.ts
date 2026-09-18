import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { watch } from 'vue'

const needRefresh = ref(false)

const updateSW = useRegisterSW()
watch(updateSW.needRefresh, newNeedRefresh => {
  console.log('refresh needed')
  needRefresh.value = newNeedRefresh
})

export default function useSW () {
  return {
    needRefresh,
    updateSW: async () => { await updateSW.updateServiceWorker() },
    dismiss () {
      needRefresh.value = false
    }
  }
}
