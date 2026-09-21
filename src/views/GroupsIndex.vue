<template>
  <div class="container mx-auto px-2 py-4 mb-20 flex flex-col gap-8">
    <h1 class="mb-0">
      {{ t('groups.title') }}
    </h1>

    <section v-if="pendingInvites.length">
      <h2 class="mb-2">
        {{ t('groups.invites.title') }}
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <group-invite-card v-for="invite of pendingInvites" :key="invite.id" :invite="invite" />
      </div>
    </section>

    <section v-if="pendingRequests.length">
      <h2 class="mb-2">
        {{ t('groups.requests.title') }}
      </h2>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
        <li v-for="request of pendingRequests" :key="request.id" class="rounded border border-line bg-surface p-2">
          <p class="font-bold mb-0 truncate">
            {{ request.group.name }}
          </p>
          <p class="text-muted text-sm mb-0">
            {{ t('groups.requests.waiting') }}
          </p>
        </li>
      </ul>
    </section>

    <div v-if="loading && !groups.length" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('groups.loading') }}
    </div>

    <div v-else-if="!groups.length" class="flex items-center justify-center flex-col text-center" role="status">
      <icon-account-group class="w-32 h-32" aria-hidden="true" />
      <p>{{ t('groups.empty') }}</p>
      <div class="flex flex-wrap gap-2 justify-center">
        <router-link :to="{ name: 'groups-create' }" class="btn w-max">
          {{ t('groups.createGroup') }}
        </router-link>
        <router-link :to="{ name: 'groups-join' }" class="btn w-max">
          {{ t('groups.joinWithCode') }}
        </router-link>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <group-box v-for="group of groups" :key="group.id" :group="group" />
    </div>
  </div>

  <bottom-bar>
    <router-link :to="{ name: 'groups-join' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-key />
      </span>
      <span class="flex px-2 items-center">{{ t('groups.joinWithCode') }}</span>
    </router-link>
    <router-link :to="{ name: 'groups-create' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-plus />
      </span>
      <span class="flex px-2 items-center">{{ t('groups.createGroup') }}</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'

import { useMyGroupsQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useGroupInvites from '../hooks/useGroupInvites'

import BottomBar from '../components/BottomBar.vue'
import GroupBox from '../components/GroupBox.vue'
import GroupInviteCard from '../components/GroupInviteCard.vue'
import IconAccountGroup from '~icons/mdi/account-group'
import IconKey from '~icons/mdi/key-variant'
import IconLoading from '~icons/mdi/loading'
import IconPlus from '~icons/mdi/plus'

const { t } = useI18n()
const { firebaseUser } = useAuth()
const { pendingInvites, pendingRequests } = useGroupInvites()

useHead({ title: computed(() => t('groups.title')) })

const groupsQuery = useMyGroupsQuery({ fetchPolicy: 'cache-and-network' })
const { loading } = groupsQuery
const groups = computed(() => groupsQuery.result.value?.me?.groups ?? [])

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => { void groupsQuery.refetch() })
</script>
