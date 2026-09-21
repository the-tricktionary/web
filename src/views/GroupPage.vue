<template>
  <div v-if="loading && !group" class="container mx-auto flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    {{ t('groups.loading') }}
  </div>

  <div v-else-if="!group" class="container mx-auto flex flex-col items-center justify-center">
    <h1 class="mt-10 text-center">
      {{ t('groups.notFound') }}
    </h1>
    <p>
      <router-link :to="{ name: 'groups' }">
        {{ t('groups.seeGroups') }}
      </router-link>
    </p>
  </div>

  <div v-else class="container mx-auto px-2 py-4 mb-20 flex flex-col gap-4">
    <form v-if="renaming" class="flex flex-wrap items-end gap-2" @submit.prevent="rename()">
      <label class="flex flex-col gap-1 flex-grow max-w-120">
        <span class="font-semibold">{{ t('groups.rename.name') }}</span>
        <input
          v-model="name"
          type="text"
          required
          maxlength="120"
          class="rounded"
          :disabled="saving"
        >
      </label>
      <button type="submit" class="btn w-max" :disabled="saving || !name.trim()">
        <icon-loading v-if="saving" class="animate-spin inline-block" aria-hidden="true" />
        <span v-else>{{ t('groups.rename.save') }}</span>
      </button>
      <button type="button" class="btn w-max" :disabled="saving" @click="renaming = false">
        {{ t('groups.rename.cancel') }}
      </button>
    </form>

    <div v-else class="flex flex-wrap items-center gap-2">
      <h1 class="mb-0">
        {{ group.name }}
      </h1>
      <button v-if="isAdmin" type="button" class="btn w-max" @click="startRename()">
        <icon-pencil class="inline-block" aria-hidden="true" />
        {{ t('groups.rename.title') }}
      </button>
    </div>

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <nav class="flex gap-2 border-b border-line overflow-x-auto" :aria-label="t('groups.title')">
      <router-link
        v-for="tab of tabs"
        :key="tab.name"
        :to="{ name: tab.name, params: { id: groupId } }"
        active-class="border-ttred-900 text-ttred-900"
        class="px-2 py-1 border-b-2 border-transparent whitespace-nowrap"
      >
        {{ t(tab.label) }}
      </router-link>
    </nav>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'

import { GroupRole, useGroupQuery, useUpdateGroupMutation } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'

import IconLoading from '~icons/mdi/loading'
import IconPencil from '~icons/mdi/pencil'

const tabs = [
  { name: 'group-tricks', label: 'groups.tabs.tricks' },
  { name: 'group-speed', label: 'groups.tabs.speed' },
  { name: 'group-members', label: 'groups.tabs.members' }
]

const { t } = useI18n()
const route = useRoute()
const { firebaseUser } = useAuth()

const groupId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const groupQuery = useGroupQuery(
  () => ({ groupId: groupId.value }),
  () => ({ enabled: groupId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = groupQuery
const group = computed(() => groupQuery.result.value?.group ?? null)
const isAdmin = computed(() => group.value?.myMembership?.role === GroupRole.Admin)

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => { void groupQuery.refetch() })

useHead({ title: computed(() => group.value?.name ?? t('groups.title')) })

const renaming = ref(false)
const name = ref('')
const error = ref<string | null>(null)

const { mutate: updateGroup, loading: saving } = useUpdateGroupMutation({})

function startRename () {
  name.value = group.value?.name ?? ''
  error.value = null
  renaming.value = true
}

async function rename () {
  const wanted = name.value.trim()
  if (!wanted || saving.value) return
  error.value = null
  try {
    await updateGroup({ groupId: groupId.value, name: wanted })
    renaming.value = false
  } catch (err) {
    error.value = t('groups.rename.failed', { error: (err as Error).message })
  }
}
</script>
