import { computed } from 'vue'
import { useTagsQuery } from '../graphql/generated/graphql'
import { TRICK_TYPE_TAG } from '../helpers'
import useLanguage from './useLanguage'

import type { TrickType } from '../graphql/generated/graphql'

/** Names in the site's language */
export default function useTags () {
  const { lang } = useLanguage()
  const { result } = useTagsQuery(() => ({ lang: lang.value }))

  const tags = computed(() => new Map((result.value?.tags ?? []).map(tag => [tag.id, tag])))

  function trickTypeLabel (trickType: TrickType) {
    const valueId: string = trickType
    return tags.value.get(TRICK_TYPE_TAG)?.values.find(value => value.id === valueId)?.name ?? trickType
  }

  return { tags, trickTypeLabel }
}
