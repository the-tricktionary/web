<template>
  <section>
    <h2 class="mb-2">
      {{ t('profile.submissions.title') }}
    </h2>

    <ul class="flex flex-col gap-3 max-w-160">
      <li v-for="submission of submissions" :key="submission.id" class="border border-line rounded p-4">
        <div class="flex items-baseline justify-between gap-4 flex-wrap">
          <h3 class="font-semibold">
            {{ submission.name }}
          </h3>
          <p class="text-muted mb-0">
            <time :datetime="new Date(submission.createdAt).toISOString()">{{ formatDate(submission.createdAt, lang) }}</time>
          </p>
        </div>

        <p class="text-muted font-semibold">
          {{ t(enumKey('discipline', submission.discipline)) }} &mdash; {{ t(enumKey('trickSubmissionStatus', submission.status)) }}
        </p>

        <p v-if="submission.status === TrickSubmissionStatus.Pending">
          {{ t('profile.submissions.video', { status: t(enumKey('videoUploadStatus', submission.upload.status)) }) }}
          <span v-if="submission.upload.error" class="text-ttred-900">{{ submission.upload.error }}</span>
        </p>

        <p v-if="submission.status === TrickSubmissionStatus.Rejected && submission.reviewNote">
          {{ t('profile.submissions.note', { note: submission.reviewNote }) }}
        </p>

        <router-link
          v-if="submission.trick"
          :to="{ name: 'trick', params: { discipline: disciplineToSlug(submission.trick.discipline), slug: submission.trick.slug } }"
          class="inline-flex items-center text-sm text-link hover:text-link-hover underline whitespace-nowrap rounded"
        >
          {{ t('profile.submissions.openTrick') }}
          <icon-chevron-right aria-hidden="true" />
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { TrickSubmissionStatus } from '../graphql/generated/graphql'
import { disciplineToSlug, enumKey, formatDate } from '../helpers'
import useLanguage from '../hooks/useLanguage'

import IconChevronRight from '~icons/mdi/chevron-right'

import type { TrickSubmissionBaseFragment } from '../graphql/generated/graphql'

defineProps<{
  submissions: readonly TrickSubmissionBaseFragment[]
}>()

const { t } = useI18n()
const { lang } = useLanguage()
</script>
