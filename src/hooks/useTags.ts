import { computed } from 'vue'
import { useTagsQuery } from '../graphql/generated/graphql'
import { TRICK_TYPE_TAG } from '../helpers'
import useLanguage from './useLanguage'

/** Names in the site's language */
export default function useTags () {
  const { lang } = useLanguage()
  const { result } = useTagsQuery(() => ({ lang: lang.value }))

  const tags = computed(() => new Map((result.value?.tags ?? []).map(tag => [tag.id, tag])))

  /** The IDs of the trick type values, in order */
  const trickTypes = computed(() => tags.value.get(TRICK_TYPE_TAG)?.values.map(value => value.id) ?? [])

  function trickTypeLabel (trickType: string) {
    return tags.value.get(TRICK_TYPE_TAG)?.values.find(value => value.id === trickType)?.name ?? trickType
  }

  return { tags, trickTypes, trickTypeLabel }
}
