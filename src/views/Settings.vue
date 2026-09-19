<template>
  <div class="container mx-auto px-2 py-4 mb-20 max-w-160">
    <h1 class="mb-4">
      {{ t('settings.title') }}
    </h1>

    <section class="mb-8">
      <h2 class="mb-2">
        {{ t('settings.profile') }}
      </h2>

      <div class="flex items-center gap-4 mb-4">
        <img
          v-if="user?.photo"
          :src="user.photo"
          alt=""
          width="64"
          height="64"
          class="w-16 h-16 rounded-full bg-placeholder object-cover"
        >
        <icon-account-circle v-else class="w-16 h-16 text-muted" aria-hidden="true" />
        <p class="text-muted text-sm mb-0">
          {{ t('settings.photoNote') }}
        </p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="saveProfile()">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('settings.name') }}</span>
          <input
            v-model="name"
            type="text"
            maxlength="120"
            required
            autocomplete="name"
            class="rounded"
            :disabled="savingProfile"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('settings.username') }}</span>
          <input
            v-model="username"
            type="text"
            minlength="3"
            maxlength="30"
            :pattern="USERNAME_PATTERN"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            class="rounded"
            :disabled="savingProfile"
            :aria-describedby="usernameHelpId"
            @input="username = ($event.target as HTMLInputElement).value.toLowerCase()"
          >
          <span :id="usernameHelpId" class="text-muted text-sm">
            {{ t('settings.usernameHelp') }}
            <template v-if="username">
              {{ t('settings.usernameUrl', { url: profileUrl }) }}
            </template>
          </span>
        </label>

        <p v-if="profileError" class="text-ttred-900 mb-0" role="alert">
          {{ profileError }}
        </p>

        <button type="submit" class="btn w-max" :disabled="!profileDirty || savingProfile">
          {{ t('settings.save') }}
        </button>
      </form>
    </section>

    <section class="mb-8">
      <h2 class="mb-2">
        {{ t('settings.language') }}
      </h2>
      <language-selector show-label />
    </section>

    <section class="mb-8">
      <h2 class="mb-2">
        {{ t('settings.privacy') }}
      </h2>

      <div class="flex flex-col gap-4">
        <div>
          <icon-checkbox
            :checked="options.public"
            :disabled="savingOption !== null"
            :loading="savingOption === 'public'"
            @update:checked="setOption('public', $event)"
          >
            {{ t('settings.public') }}
          </icon-checkbox>
          <p class="text-muted text-sm mt-1 mb-0">
            {{ t('settings.publicExplanation') }}
          </p>
        </div>

        <div>
          <icon-checkbox
            :checked="options.checklist"
            :disabled="!options.public || savingOption !== null"
            :loading="savingOption === 'checklist'"
            @update:checked="setOption('checklist', $event)"
          >
            {{ t('settings.checklist') }}
          </icon-checkbox>
          <p class="text-muted text-sm mt-1 mb-0">
            {{ t('settings.checklistExplanation') }}
          </p>
        </div>

        <div>
          <icon-checkbox
            :checked="options.speed"
            :disabled="!options.public || savingOption !== null"
            :loading="savingOption === 'speed'"
            @update:checked="setOption('speed', $event)"
          >
            {{ t('settings.speed') }}
          </icon-checkbox>
          <p class="text-muted text-sm mt-1 mb-0">
            {{ t('settings.speedExplanation') }}
          </p>
        </div>

        <p v-if="optionsError" class="text-ttred-900 mb-0" role="alert">
          {{ optionsError }}
        </p>

        <p v-if="options.public" class="mb-0">
          <router-link :to="{ name: 'profile' }">
            {{ t('settings.viewProfile') }}
          </router-link>
        </p>
      </div>
    </section>

    <section>
      <h2 class="mb-2">
        {{ t('settings.account') }}
      </h2>

      <label class="flex flex-col gap-1 mb-4">
        <span class="font-semibold">{{ t('settings.email') }}</span>
        <input :value="user?.email ?? ''" type="email" readonly disabled class="rounded">
      </label>

      <button type="button" class="btn w-max" @click="signOut()">
        {{ t('settings.signOut') }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuth, updateProfile } from '@firebase/auth'
import { useHead } from '@unhead/vue'

import { useSetProfileOptionsMutation, useUpdateUserProfileMutation } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'

import IconCheckbox from '../components/IconCheckbox.vue'
import LanguageSelector from '../components/LanguageSelector.vue'
import IconAccountCircle from '~icons/mdi/account-circle'

import type { UserProfileInput } from '../graphql/generated/graphql'

/**
 * Kept in step with the API: 3 to 30 lowercase letters, digits, dots, dashes
 * or underscores, starting and ending with a letter or a digit
 */
const USERNAME_PATTERN = '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$'

type ProfileOption = 'public' | 'checklist' | 'speed'

const { t } = useI18n()
const auth = getAuth()
const { user } = useAuth()

const usernameHelpId = useId()

useHead({ title: computed(() => t('settings.title')) })

const name = ref('')
const username = ref('')

// The form follows the saved values, not the query result: the account is
// refetched on every token refresh, and that must not wipe what is being
// typed, while a save (or a sign-in that lands here) does fill the form in
watch(() => user.value?.name ?? '', saved => { name.value = saved }, { immediate: true })
watch(() => user.value?.username ?? '', saved => { username.value = saved }, { immediate: true })

const profileUrl = computed(() => `${window.location.origin}/profile/${username.value}`)

const profileDirty = computed(() =>
  name.value.trim() !== (user.value?.name ?? '') ||
  username.value.trim() !== (user.value?.username ?? '')
)

const profileError = ref<string | null>(null)
const { mutate: updateUserProfile, loading: savingProfile } = useUpdateUserProfileMutation({})

async function saveProfile () {
  if (!user.value || !profileDirty.value || savingProfile.value) return
  profileError.value = null

  const trimmedName = name.value.trim()
  const trimmedUsername = username.value.trim()
  const nameChanged = trimmedName !== (user.value.name ?? '')
  // both fields are set on every save, an emptied username releases it
  const data: UserProfileInput = {
    name: trimmedName,
    username: trimmedUsername === '' ? null : trimmedUsername
  }

  try {
    await updateUserProfile({ data })
  } catch (err) {
    profileError.value = usernameTaken(err)
      ? t('settings.usernameTaken')
      : t('settings.failedSave', { error: (err as Error).message })
    return
  }

  // Firebase carries the display name into the sign-in provider's own UI and
  // into the token, but it is not where the profile is read from
  try {
    if (nameChanged && auth.currentUser) await updateProfile(auth.currentUser, { displayName: trimmedName })
  } catch { /* the name is saved where it matters, so this is not worth reporting */ }
}

/** Whether the API refused the username because somebody else holds it */
function usernameTaken (err: unknown) {
  const graphQLErrors = (err as { graphQLErrors?: Array<{ extensions?: Record<string, unknown> }> } | null | undefined)?.graphQLErrors ?? []
  return graphQLErrors.some(error => error.extensions?.reason === 'taken' && error.extensions.field === 'username')
}

const options = computed(() => user.value?.profile ?? { public: false, checklist: false, speed: false })

const savingOption = ref<ProfileOption | null>(null)
const optionsError = ref<string | null>(null)
const { mutate: setProfileOptions } = useSetProfileOptionsMutation({})

async function setOption (option: ProfileOption, checked: boolean) {
  if (savingOption.value !== null) return
  optionsError.value = null
  savingOption.value = option

  try {
    await setProfileOptions({
      data: {
        public: options.value.public,
        checklist: options.value.checklist,
        speed: options.value.speed,
        [option]: checked
      }
    })
  } catch (err) {
    optionsError.value = t('settings.failedSave', { error: (err as Error).message })
  } finally {
    savingOption.value = null
  }
}

// the router sends signed out visitors of this page to the sign in page
async function signOut () {
  await auth.signOut()
}
</script>
