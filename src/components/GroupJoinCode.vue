<template>
  <section class="flex flex-col gap-2">
    <h2 class="mb-0">
      {{ t('groups.joinCode.title') }}
    </h2>
    <p class="text-muted mb-0">
      {{ t('groups.joinCode.explain') }}
    </p>

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <template v-if="joinCode">
      <p class="font-bold tracking-widest mb-0">
        {{ joinCode }}
      </p>
      <p class="text-muted text-sm break-all mb-0">
        {{ link }}
      </p>
      <p class="text-muted text-sm mb-0">
        {{ t('groups.joinCode.regenerateWarning') }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn w-max" @click="copy()">
          <icon-content-copy class="inline-block" aria-hidden="true" />
          {{ copied ? t('groups.joinCode.copied') : t('groups.joinCode.copyLink') }}
        </button>
        <button type="button" class="btn w-max" :disabled="saving" @click="regenerate()">
          {{ t('groups.joinCode.regenerate') }}
        </button>
        <button type="button" class="btn w-max" :disabled="saving" @click="clear()">
          {{ t('groups.joinCode.clear') }}
        </button>
      </div>
    </template>

    <button v-else type="button" class="btn w-max" :disabled="saving" @click="generate()">
      {{ t('groups.joinCode.generate') }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useClearGroupJoinCodeMutation, useSetGroupJoinCodeMutation } from '../graphql/generated/graphql'

import IconContentCopy from '~icons/mdi/content-copy'

import type { PropType } from 'vue'

const props = defineProps({
  groupId: {
    type: String,
    required: true
  },
  joinCode: {
    type: String as PropType<string | null>,
    default: null
  }
})

const { t } = useI18n()

const copied = ref(false)
const error = ref<string | null>(null)

const link = computed(() => `${window.location.origin}/groups/join/${props.joinCode ?? ''}`)

const { mutate: setCode, loading: setting } = useSetGroupJoinCodeMutation({})
const { mutate: clearCode, loading: clearing } = useClearGroupJoinCodeMutation({})

const saving = computed(() => setting.value || clearing.value)

async function generate () {
  if (saving.value) return
  error.value = null
  try {
    await setCode({ groupId: props.groupId })
  } catch (err) {
    error.value = t('groups.joinCode.failed', { error: (err as Error).message })
  }
}

async function regenerate () {
  if (!window.confirm(t('groups.joinCode.confirmRegenerate'))) return
  await generate()
}

async function clear () {
  if (saving.value) return
  if (!window.confirm(t('groups.joinCode.confirmClear'))) return
  error.value = null
  try {
    await clearCode({ groupId: props.groupId })
  } catch (err) {
    error.value = t('groups.joinCode.failed', { error: (err as Error).message })
  }
}

async function copy () {
  await navigator.clipboard.writeText(link.value)
  copied.value = true
}
</script>
