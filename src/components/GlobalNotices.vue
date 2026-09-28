<template>
  <div
    v-if="current"
    class="w-full bg-notice text-notice-content"
    role="region"
    :aria-label="t('notices.region')"
  >
    <div class="container mx-auto px-2 py-2 flex flex-col gap-2">
      <div class="flex gap-2 items-start">
        <p class="flex-1 whitespace-pre-line mb-0" :lang="textLang">
          {{ current.text.body }}
        </p>
        <button
          type="button"
          class="btn w-max touch-target flex items-center justify-center"
          :aria-label="t('notices.close')"
          @click="dismiss()"
        >
          <icon-close aria-hidden="true" />
        </button>
      </div>

      <div v-if="current.text.links.length || visible.length > 1" class="flex flex-wrap gap-2 items-center">
        <div v-if="current.text.links.length" class="flex flex-wrap gap-2" :lang="textLang">
          <template v-for="(link, i) of current.text.links" :key="i">
            <router-link v-if="link.url.startsWith('/')" class="btn w-max" :to="link.url">
              {{ link.label }}
            </router-link>
            <a v-else class="btn w-max" target="_blank" rel="noopener noreferrer" :href="link.url">
              {{ link.label }}
            </a>
          </template>
        </div>

        <pager
          v-if="visible.length > 1"
          class="ml-auto"
          :index="index"
          :total="visible.length"
          :previous-label="t('notices.previous')"
          :next-label="t('notices.next')"
          @step="step"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useNoticesQuery } from '../graphql/generated/graphql'
import useLanguage from '../hooks/useLanguage'
import usePager from '../hooks/usePager'
import useSettings from '../hooks/useSettings'

import Pager from './Pager.vue'
import IconClose from '~icons/mdi/close'

const { t } = useI18n()
const { lang } = useLanguage()
const settings = useSettings()

const noticesQuery = useNoticesQuery(() => ({ lang: lang.value }), { fetchPolicy: 'cache-and-network' })
const visible = computed(() => (noticesQuery.result.value?.notices ?? [])
  .filter(notice => settings.value.dismissedNotices?.[notice.id] !== notice.updatedAt)
)

const { index, step } = usePager(() => visible.value.length)
const current = computed(() => visible.value[index.value])
const textLang = computed(() => current.value?.text.lang === lang.value ? undefined : current.value?.text.lang)

function dismiss () {
  if (!current.value) return
  settings.value.dismissedNotices ??= {}
  settings.value.dismissedNotices[current.value.id] = current.value.updatedAt
}
</script>
