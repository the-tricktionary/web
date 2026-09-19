<template>
  <div v-if="loading && !user" class="container mx-auto flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    {{ t('profile.loading') }}
  </div>

  <div v-else-if="!user" class="container mx-auto flex flex-col items-center justify-center">
    <h1 class="mt-10 text-center">
      {{ t('profile.notFound') }}
    </h1>
    <p>
      <router-link to="/">
        {{ t('notFound.goHome') }}
      </router-link>
    </p>
  </div>

  <div v-else class="container mx-auto px-2 py-4 mb-20 flex flex-col gap-8">
    <header class="flex items-center gap-4">
      <img
        v-if="user.photo"
        :src="user.photo"
        alt=""
        width="80"
        height="80"
        class="w-20 h-20 rounded-full bg-placeholder object-cover"
      >
      <icon-account-circle v-else class="w-20 h-20 text-muted" aria-hidden="true" />

      <div>
        <h1>{{ displayName }}</h1>
        <p v-if="user.username" class="text-muted mb-0">
          &commat;{{ user.username }}
        </p>
      </div>
    </header>

    <p v-if="isMe && !user.profile.public" class="text-muted mb-0">
      {{ t('profile.private') }}
      <router-link :to="{ name: 'settings' }">
        {{ t('profile.privateSettings') }}
      </router-link>
    </p>

    <profile-stats :stats="user.checklistStats" />

    <profile-personal-bests v-if="personalBests.length" :results="personalBests" :is-me="isMe" />

    <profile-checklist v-if="checklist" :checklist="checklist" :is-me="isMe" />
  </div>

  <bottom-bar v-if="user">
    <router-link v-if="isMe" :to="{ name: 'settings' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-cog />
      </span>
      <span class="flex px-2 items-center">{{ t('profile.settings') }}</span>
    </router-link>

    <icon-button
      v-if="canShare"
      class="w-max btn inline-flex items-center mt-0 ml-auto"
      @click="share()"
    >
      <template #icon>
        <icon-share />
      </template>
      {{ t('trick.share') }}
    </icon-button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { useHead } from '@unhead/vue'

import { useMyProfileDetailsQuery, useProfileDetailsQuery, useProfileHeaderQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useLanguage from '../hooks/useLanguage'

import BottomBar from '../components/BottomBar.vue'
import IconButton from '../components/IconButton.vue'
import ProfileChecklist from '../components/ProfileChecklist.vue'
import ProfilePersonalBests from '../components/ProfilePersonalBests.vue'
import ProfileStats from '../components/ProfileStats.vue'
import IconAccountCircle from '~icons/mdi/account-circle'
import IconCog from '~icons/mdi/cog'
import IconLoading from '~icons/mdi/loading'
import IconShare from '~icons/mdi/share'

import type { ProfileHeaderFragment, ProfileUserFragment } from '../graphql/generated/graphql'

const { t } = useI18n()
const route = useRoute()
const analytics = getAnalytics()
const { firebaseUser } = useAuth()
const { lang } = useLanguage()

const usernameOrId = computed(() => typeof route.params.usernameOrId === 'string' ? route.params.usernameOrId : '')
const isOwnRoute = computed(() => usernameOrId.value === '')

// a field the profile hides errors and nulls the whole user, so the header
// decides what the details ask for
const headerQuery = useProfileHeaderQuery(
  () => ({ usernameOrId: usernameOrId.value }),
  () => ({ enabled: !isOwnRoute.value, fetchPolicy: 'cache-and-network' })
)
const header = computed(() => headerQuery.result.value?.user ?? null)

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => {
  if (!isOwnRoute.value) void headerQuery.refetch()
})

const isMe = computed(() => isOwnRoute.value || (header.value != null && header.value.id === firebaseUser.value?.uid))

const detailsQuery = useProfileDetailsQuery(
  () => ({
    usernameOrId: usernameOrId.value,
    withChecklist: isMe.value || header.value?.profile.checklist === true,
    withSpeed: isMe.value || header.value?.profile.speed === true,
    withLocalised: lang.value !== 'en',
    lang: lang.value
  }),
  () => ({ enabled: !isOwnRoute.value && header.value != null, fetchPolicy: 'cache-and-network' })
)

const myDetailsQuery = useMyProfileDetailsQuery(
  () => ({ withChecklist: true, withSpeed: true, withLocalised: lang.value !== 'en', lang: lang.value }),
  () => ({ enabled: isOwnRoute.value, fetchPolicy: 'cache-and-network' })
)

const details = computed(() => (isOwnRoute.value ? myDetailsQuery.result.value?.me : detailsQuery.result.value?.user) ?? null)
const user = computed<ProfileUserFragment | ProfileHeaderFragment | null>(() => details.value ?? header.value)
const loading = computed(() => isOwnRoute.value ? myDetailsQuery.loading.value : headerQuery.loading.value)

const personalBests = computed(() => details.value?.speedPersonalBests ?? [])
const checklist = computed(() => details.value?.checklist)

const displayName = computed(() => {
  const profile = user.value
  return (profile?.name ?? '') || (profile?.username ?? '') || t('profile.anonymous')
})

useHead({
  title: computed(() => user.value ? displayName.value : t('profile.title'))
})

const shareSupported = ref('share' in navigator)
const canShare = computed(() => shareSupported.value && !(isMe.value && user.value?.profile.public !== true))

async function share () {
  const profile = user.value
  if (!profile || !canShare.value) return
  await navigator.share({
    title: t('profile.shareTitle', { name: displayName.value }),
    text: t('profile.shareText'),
    url: `${window.location.origin}/profile/${profile.username ?? profile.id}?utm_source=webshare&utm_medium=referral`
  })
  logEvent(analytics, 'share', {
    item_id: `Profile:${profile.id}`
  })
}
</script>
