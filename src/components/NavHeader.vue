<template>
  <header ref="headerRef" class="border-b-ttred-900 bg-ttred-500 border-b sticky top-0 left-0 right-0 flex justify-between items-center py-1 px-2 whitespace-nowrap z-1000">
    <router-link ref="brandRef" to="/" class="inline-flex shrink-0 justify-start items-center text-white text-xl">
      <img src="/tricktionary2.svg" height="30" width="30" alt="" class="h-30px mr-1 align-bottom">
      the Tricktionary
    </router-link>

    <button
      v-if="collapsed || !ready"
      type="button"
      class="nav-link inline-flex items-center justify-center min-h-8 cursor-pointer"
      :class="{ invisible: !ready }"
      :aria-expanded="showNav"
      aria-controls="main-nav"
      :aria-label="user && badgeCount ? t('nav.toggleMenuInvites', { count: badgeCount }) : t('nav.toggleMenu')"
      @click="showNav = !showNav"
    >
      <icon-close v-if="showNav" aria-hidden="true" />
      <icon-menu v-else aria-hidden="true" />
      <span v-if="user && badgeCount" class="invite-badge ml-1" aria-hidden="true">{{ badgeCount }}</span>
    </button>

    <nav
      v-show="ready && (!collapsed || showNav)"
      id="main-nav"
      class="flex"
      :class="{ menu: collapsed }"
      :aria-label="t('nav.label')"
      @click="showNav = false"
    >
      <router-link
        v-for="link of links"
        :key="link.to"
        active-class="active"
        class="nav-link"
        :to="link.to"
      >
        {{ link.label }}
        <span v-if="link.badge" class="invite-badge ml-1">
          <span aria-hidden="true">{{ link.badge }}</span>
          <span class="sr-only">{{ t('groups.invitesBadge', { count: link.badge }) }}</span>
        </span>
      </router-link>
    </nav>

    <div aria-hidden="true" class="absolute inset-0 overflow-hidden invisible">
      <div ref="rowRef" class="flex w-max">
        <span v-for="link of links" :key="link.to" class="nav-link">
          {{ link.label }}
          <span v-if="link.badge" class="invite-badge ml-1">{{ link.badge }}</span>
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onClickOutside, unrefElement, until, useResizeObserver, useTimeout } from '@vueuse/core'
import useAuth from '../hooks/useAuth'
import useGroupInvites from '../hooks/useGroupInvites'

import IconMenu from '~icons/mdi/menu'
import IconClose from '~icons/mdi/close'

import type { ComponentPublicInstance } from 'vue'

interface NavLink {
  to: string
  label: string
  show: boolean
  badge?: number
}

const AUTH_TIMEOUT = 2000

const { t } = useI18n()
const { firebaseUser: user } = useAuth()
const { badgeCount } = useGroupInvites()
const showNav = ref(false)
const headerRef = ref<HTMLElement>()
const brandRef = ref<ComponentPublicInstance>()
const rowRef = ref<HTMLElement>()

const links = computed(() => ([
  { to: '/', label: t('nav.tricks'), show: true },
  { to: '/submit', label: t('nav.submit'), show: true },
  { to: '/speed', label: t('nav.speed'), show: true },
  { to: '/groups', label: t('nav.groups'), show: !!user.value, badge: badgeCount.value },
  { to: '/shop', label: t('nav.shop'), show: true },
  { to: '/profile', label: t('nav.profile'), show: !!user.value },
  { to: '/settings', label: t('nav.settings'), show: !!user.value },
  { to: '/auth', label: t('nav.signIn'), show: !user.value }
] satisfies NavLink[]).filter(link => link.show))

const collapsed = ref(true)
/** False until measured with the session's links; meanwhile the button is invisible but keeps the header's height */
const ready = ref(false)

const authTimedOut = useTimeout(AUTH_TIMEOUT)
// the user is undefined until firebase has restored or ruled out a session
const authKnown = computed(() => user.value !== undefined || authTimedOut.value)

// measures the hidden copy of the row, as the nav is laid out as the menu while collapsed
function fit () {
  const header = headerRef.value
  const brand = unrefElement(brandRef)
  if (!header || !brand || !rowRef.value) return

  const style = window.getComputedStyle(header)
  const room = header.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight) - brand.getBoundingClientRect().width
  collapsed.value = rowRef.value.getBoundingClientRect().width > room
}

useResizeObserver([headerRef, rowRef], fit)

void until(authKnown).toBe(true).then(async () => {
  await nextTick()
  fit()
  ready.value = true
})

watch(collapsed, () => {
  showNav.value = false
})

onClickOutside(headerRef, () => {
  showNav.value = false
})
</script>

<style scoped>
.nav-link {
  @apply bg-ttred-900;
  @apply rounded;
  @apply m-1;
  @apply px-2;
  @apply py-1;
  color: white;
}

.menu {
  @apply absolute;
  @apply top-full;
  @apply inset-x-0;
  @apply flex-col;
  @apply bg-ttred-500;
  @apply border-b;
  @apply border-ttred-900;
}

.menu .nav-link {
  @apply rounded-none;
  @apply m-0;
  @apply py-4;
  @apply px-4;
  @apply border-t;
  @apply border-ttred-900;
}

.invite-badge {
  @apply inline-flex items-center justify-center;
  @apply min-w-5 h-5 px-1;
  @apply rounded-full bg-ttyellow-500;
  @apply text-xs font-bold text-black;
}

.nav-link:hover,
.nav-link.active {
  @apply bg-ttyellow-500;
  @apply text-black;
}
</style>
