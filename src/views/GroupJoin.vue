<template>
  <div class="container mx-auto px-2 py-4 mb-20 flex flex-col gap-4 max-w-120">
    <h1 class="mb-0">
      {{ t('groups.join.title') }}
    </h1>

    <div v-if="requestedName" class="flex flex-col gap-2" role="status">
      <p class="mb-0">
        {{ t('groups.join.requested', { name: requestedName }) }}
      </p>
      <router-link :to="{ name: 'groups' }" class="btn w-max">
        {{ t('groups.seeGroups') }}
      </router-link>
    </div>

    <div v-else-if="looking" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('groups.join.loading') }}
    </div>

    <div v-else-if="group" class="flex flex-col gap-4">
      <p class="font-bold mb-0">
        {{ group.name }}
      </p>
      <p class="mb-0">
        {{ t('groups.join.needsApproval') }}
      </p>

      <group-consent />

      <p v-if="error" class="text-ttred-900 mb-0" role="alert">
        {{ error }}
      </p>

      <div class="flex gap-2">
        <button type="button" class="btn w-max" :disabled="requesting" @click="requestToJoin()">
          <icon-loading v-if="requesting" class="animate-spin inline-block" aria-hidden="true" />
          <span v-else>{{ t('groups.join.confirm') }}</span>
        </button>
        <button type="button" class="btn w-max" :disabled="requesting" @click="reset()">
          {{ t('groups.join.another') }}
        </button>
      </div>
    </div>

    <template v-else>
      <p v-if="notFound" class="text-ttred-900 mb-0" role="alert">
        {{ t('groups.join.notFound') }}
      </p>

      <p class="mb-0">
        {{ t('groups.join.needsApproval') }}
      </p>

      <form class="flex flex-col gap-4" @submit.prevent="lookUp()">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('groups.join.code') }}</span>
          <input
            v-model="code"
            type="text"
            required
            maxlength="64"
            autocapitalize="none"
            autocomplete="off"
            :placeholder="t('groups.join.codePlaceholder')"
            class="rounded"
          >
        </label>

        <button type="submit" class="btn w-max" :disabled="!code.trim()">
          {{ t('groups.join.lookUp') }}
        </button>
      </form>
    </template>
  </div>

  <bottom-bar>
    <router-link :to="{ name: 'groups' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('groups.seeGroups') }}</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { getAuth } from '@firebase/auth'

import { useGroupByJoinCodeQuery, useRequestToJoinGroupMutation } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import { addGroupInviteToCache } from '../hooks/useGroups'

import BottomBar from '../components/BottomBar.vue'
import GroupConsent from '../components/GroupConsent.vue'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconLoading from '~icons/mdi/loading'

const { t } = useI18n()
const route = useRoute()
const { firebaseUser } = useAuth()

useHead({ title: computed(() => t('groups.join.title')) })

const code = ref('')
const lookupCode = ref('')
const looking = ref(false)
const lookupFailed = ref(false)
const requestedName = ref<string | null>(null)
const error = ref<string | null>(null)

const previewQuery = useGroupByJoinCodeQuery(
  () => ({ joinCode: lookupCode.value }),
  () => ({ enabled: lookupCode.value !== '', fetchPolicy: 'cache-and-network' })
)

previewQuery.onResult(({ loading }) => { if (!loading) looking.value = false })
previewQuery.onError(() => {
  looking.value = false
  lookupFailed.value = true
})

const group = computed(() => lookupCode.value !== '' && !lookupFailed.value
  ? previewQuery.result.value?.groupByJoinCode ?? null
  : null
)

const notFound = computed(() => lookupCode.value !== '' && !looking.value && group.value == null)

// a link carries the code, typing it by hand does not
watch(() => route.params.code, param => {
  const linked = typeof param === 'string' ? param : ''
  if (!linked) return
  code.value = linked
  lookUp()
}, { immediate: true })

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => {
  if (lookupCode.value !== '') void previewQuery.refetch()
})

function lookUp () {
  const wanted = code.value.trim()
  if (!wanted) return
  error.value = null
  lookupFailed.value = false
  looking.value = true
  lookupCode.value = wanted
}

function reset () {
  lookupCode.value = ''
  lookupFailed.value = false
  error.value = null
}

const { mutate: request, loading: requesting } = useRequestToJoinGroupMutation(() => ({
  update (cache, { data }) {
    const userId = getAuth().currentUser?.uid
    if (!data?.requestToJoinGroup || !userId) return
    addGroupInviteToCache(cache, userId, data.requestToJoinGroup)
  }
}))

async function requestToJoin () {
  if (requesting.value || !group.value) return
  error.value = null
  try {
    const result = await request({ joinCode: lookupCode.value })
    requestedName.value = result?.data?.requestToJoinGroup.group.name ?? group.value.name
  } catch (err) {
    error.value = t('groups.join.failed', { error: (err as Error).message })
  }
}
</script>
