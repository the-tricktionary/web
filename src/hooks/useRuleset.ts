import { computed, effectScope } from 'vue'
import { useRulesetsQuery } from '../graphql/generated/graphql'
import useAuth from './useAuth'
import useSettings from './useSettings'

import type { ComputedRef } from 'vue'
import type { RulesetsQuery } from '../graphql/generated/graphql'

export type Ruleset = RulesetsQuery['rulesets'][number]

/** The tricktionary's own 1-5 levels, which aren't a ruleset one can pick */
const TRICKTIONARY_RULES_ID = 'tricktionary'

// Detached so the query is created once, on the first call, and keeps running
// for the life of the app instead of stopping when that first component unmounts.
const scope = effectScope(true)
let allRulesets: ComputedRef<Ruleset[]> | undefined

export default function useRuleset () {
  const settings = useSettings()

  // a reactive variables function refetches whenever the user's language changes
  allRulesets ??= scope.run(() => {
    const { user } = useAuth()
    const rulesetsQuery = useRulesetsQuery(() => ({ lang: user.value?.lang }))
    return computed(() => (rulesetsQuery.result.value?.rulesets ?? []).filter(ruleset => ruleset.id !== TRICKTIONARY_RULES_ID))
  })!
  const rulesets = allRulesets

  const primary = computed(() => rulesets.value.find(ruleset => ruleset.isPrimary))
  const selectedRulesId = computed({
    get: () => settings.value.rulesId,
    set: (rulesId: string | null) => { settings.value.rulesId = rulesId }
  })
  /** The selected ruleset, or the primary one if it's not selectable (any more) */
  const ruleset = computed(() => rulesets.value.find(ruleset => ruleset.id === selectedRulesId.value) ?? primary.value)

  return { rulesets, primary, selectedRulesId, ruleset }
}
