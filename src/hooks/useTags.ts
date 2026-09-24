import { computed } from 'vue'
import { useTagsQuery } from '../graphql/generated/graphql'
import { TRICK_TYPE_SLUG } from '../helpers'
import useLanguage from './useLanguage'

import type { Discipline } from '../graphql/generated/graphql'

/** Names in the site's language */
export default function useTags () {
  const { lang } = useLanguage()
  const { result } = useTagsQuery(() => ({ lang: lang.value }))

  const tags = computed(() => new Map((result.value?.tags ?? []).map(tag => [tag.id, tag])))

  function trickTypeTag (discipline: Discipline) {
    return [...tags.value.values()].find(tag => tag.slug === TRICK_TYPE_SLUG && (tag.disciplines.length === 0 || tag.disciplines.includes(discipline)))
  }

  /** The IDs of the discipline's trick type values, in order */
  function trickTypes (discipline: Discipline) {
    return trickTypeTag(discipline)?.values.map(value => value.id) ?? []
  }

  function trickTypeLabel (discipline: Discipline, trickType: string) {
    return trickTypeTag(discipline)?.values.find(value => value.id === trickType)?.name ?? trickType
  }

  return { tags, trickTypes, trickTypeLabel }
}
