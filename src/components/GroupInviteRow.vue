<template>
  <li class="rounded border border-line bg-surface p-2 flex flex-col gap-2">
    <div>
      <p class="font-bold mb-0 truncate">
        {{ invite.user.name || invite.user.username || t('groups.requests.someone') }}
      </p>
      <p class="text-muted text-sm mb-0 truncate">
        {{ t(enumKey('groupRole', invite.role)) }}
        &middot; {{ invite.observer ? t('groups.observer') : t('groups.athlete') }}
        <template v-if="invite.member">
          &middot; {{ t('groups.sent.claims', { name: invite.member.name }) }}
        </template>
      </p>
    </div>

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <button type="button" class="btn w-max" :disabled="saving" @click="cancel()">
      {{ t('groups.sent.cancel') }}
    </button>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCancelGroupInviteMutation } from '../graphql/generated/graphql'
import { enumKey } from '../helpers'
import { removeInviteFromGroupCache } from '../hooks/useGroups'

import type { PropType } from 'vue'
import type { GroupInviteAdminFragment } from '../graphql/generated/graphql'

const props = defineProps({
  invite: {
    type: Object as PropType<GroupInviteAdminFragment>,
    required: true
  },
  groupId: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const error = ref<string | null>(null)

const { mutate: cancelInvite, loading: saving } = useCancelGroupInviteMutation(() => ({
  // the invitation is deleted rather than answered, so its status comes back unchanged
  update (cache, { data }) {
    const cancelled = data?.cancelGroupInvite
    if (!cancelled) return
    removeInviteFromGroupCache(cache, props.groupId, cancelled.id)
    cache.evict({ id: cache.identify(cancelled) })
    cache.gc()
  }
}))

async function cancel () {
  if (saving.value) return
  error.value = null
  try {
    await cancelInvite({ inviteId: props.invite.id })
  } catch (err) {
    error.value = t('groups.sent.failed', { error: (err as Error).message })
  }
}
</script>
