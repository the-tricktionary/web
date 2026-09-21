<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <h1 class="mb-4">
      {{ t('groups.create.title') }}
    </h1>

    <form :id="formId" class="flex flex-col gap-4 max-w-120" @submit.prevent="save()">
      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('groups.create.name') }}</span>
        <input
          v-model="name"
          type="text"
          required
          maxlength="120"
          :placeholder="t('groups.create.namePlaceholder')"
          class="rounded"
          :disabled="saving"
        >
      </label>
    </form>
  </div>

  <bottom-bar v-if="error">
    <p class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>
  </bottom-bar>

  <bottom-bar>
    <router-link :to="{ name: 'groups' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('groups.seeGroups') }}</span>
    </router-link>

    <button
      type="submit"
      :form="formId"
      class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto"
      :disabled="saving || !valid"
    >
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-loading v-if="saving" class="animate-spin" />
        <icon-content-save v-else />
      </span>
      <span class="flex px-2 items-center">{{ t('groups.create.save') }}</span>
    </button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { getAuth } from '@firebase/auth'

import { useCreateGroupMutation } from '../graphql/generated/graphql'
import { addGroupToCache } from '../hooks/useGroups'

import BottomBar from '../components/BottomBar.vue'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconContentSave from '~icons/mdi/content-save'
import IconLoading from '~icons/mdi/loading'

const { t } = useI18n()
const router = useRouter()

/** Lets the submit button live in the bottom bar, outside the form element */
const formId = useId()

useHead({ title: computed(() => t('groups.create.title')) })

const name = ref('')
const error = ref<string | null>(null)

const valid = computed(() => name.value.trim().length > 0)

const { mutate, loading: saving } = useCreateGroupMutation(() => ({
  update (cache, { data }) {
    const userId = getAuth().currentUser?.uid
    if (!data?.createGroup || !userId) return
    addGroupToCache(cache, userId, data.createGroup)
  }
}))

async function save () {
  if (!valid.value || saving.value) return
  error.value = null
  try {
    const result = await mutate({ name: name.value.trim() })
    const created = result?.data?.createGroup
    if (!created) throw new Error('No group returned')
    await router.replace({ name: 'group-tricks', params: { id: created.id } })
  } catch (err) {
    error.value = t('groups.create.failed', { error: (err as Error).message })
  }
}
</script>
