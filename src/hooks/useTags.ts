import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTagsQuery } from '../graphql/generated/graphql'
import { enumKey, TRICK_TYPE_TAG } from '../helpers'
import useLanguage from './useLanguage'

import type { TrickType } from '../graphql/generated/graphql'

/** Every tag with its names in the site's language, falling back to english */
export default function useTags () {
  const { t } = useI18n()
  const { lang } = useLanguage()
  const { result } = useTagsQuery(() => ({ lang: lang.value }))

  const tags = computed(() => new Map((result.value?.tags ?? []).map(tag => [tag.id, tag])))

  /** Until the tags have loaded, the site's own label stands in */
  function trickTypeLabel (trickType: TrickType) {
    // the tag's value IDs are the trick types
    const valueId: string = trickType
    return tags.value.get(TRICK_TYPE_TAG)?.values.find(value => value.id === valueId)?.name ?? t(enumKey('trickType', trickType))
  }

  return { tags, trickTypeLabel }
}
