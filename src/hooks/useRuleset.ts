import { computed } from 'vue'
import { useRulesetsQuery } from '../graphql/generated/graphql'
import useLanguage from './useLanguage'
import useSettings from './useSettings'

// the tricktionary's own 1-5 levels are stored as a ruleset, but aren't one to follow
const TRICKTIONARY_RULES_ID = 'tricktionary'

export default function useRuleset () {
  const { lang } = useLanguage()
  const settings = useSettings()
  const rulesetsQuery = useRulesetsQuery(() => ({ lang: lang.value }))

  const rulesets = computed(() => (rulesetsQuery.result.value?.rulesets ?? []).filter(ruleset => ruleset.id !== TRICKTIONARY_RULES_ID))
  const primary = computed(() => rulesets.value.find(ruleset => ruleset.isPrimary))
  const ruleset = computed(() => rulesets.value.find(ruleset => ruleset.id === settings.value.rulesId) ?? primary.value)

  function follow (rulesId: string) {
    // stored as "no choice" so a later change of primary ruleset carries over
    settings.value.rulesId = rulesId === primary.value?.id ? null : rulesId
  }

  return { rulesets, ruleset, follow }
}
