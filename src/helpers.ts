import type { TrickBoxFragment, Currency } from './graphql/generated/graphql'
import { Discipline, TrickType, VerificationLevel } from './graphql/generated/graphql'

const enums = {
  discipline: Discipline,
  trickType: TrickType,
  verificationLevel: VerificationLevel
}

/** The message key holding the label of an enum value, e.g. `enums.trickType.Basic` */
export function enumKey (name: keyof typeof enums, value: Discipline | TrickType | VerificationLevel) {
  const member = Object.entries(enums[name]).find(([, enumValue]) => enumValue === value)?.[0]
  return `enums.${name}.${member ?? value}`
}

export function disciplineToSlug (discipline: Discipline) {
  switch (discipline) {
    case Discipline.SingleRope:
      return 'sr'
    case Discipline.DoubleDutch:
      return 'dd'
    case Discipline.Wheel:
      return 'wh'
    default:
      throw new Error(`Unknown discipline: ${String(discipline)}`)
  }
}

export function slugToDiscipline (slug: string) {
  switch (slug) {
    case 'sr':
      return Discipline.SingleRope
    case 'dd':
      return Discipline.DoubleDutch
    case 'wh':
      return Discipline.Wheel
    default:
      throw new Error(`Unknown discipline slug: ${slug}`)
  }
}

interface Localisation {
  name: string
  alternativeNames?: string[] | null
  description?: string | null
}

/**
 * A trick's text in the language it is read in, falling back to English in two
 * groups so that a name is never shown next to alternative names in another
 * language.
 */
export function localiseTrick (trick: { en?: Localisation | null, localised?: Localisation | null }, lang: string) {
  // a localisation only exists once it has a name, so its alternative names
  // belong to it even when there are none
  const names = trick.localised ?? trick.en
  const localisedDescription = trick.localised?.description
  const description = localisedDescription != null && localisedDescription !== '' ? localisedDescription : undefined

  return {
    name: names?.name ?? '',
    alternativeNames: names?.alternativeNames ?? [],
    nameLang: trick.localised ? lang : 'en',
    description: description ?? trick.en?.description ?? '',
    descriptionLang: description != null ? lang : 'en'
  }
}

type SortableTrick = Pick<TrickBoxFragment, 'slug' | 'localised' | 'en'>

export function trickSorter (lang: string) {
  return (a: SortableTrick, b: SortableTrick) => {
    const aName = localiseTrick(a, lang).name || a.slug
    const bName = localiseTrick(b, lang).name || b.slug
    return aName.localeCompare(bName, lang)
  }
}

type PricesFormatFields = Array<{ currency: Currency, unitAmount?: number | null }>

export function formatPrice (prices: PricesFormatFields | Readonly<PricesFormatFields>, currency: Currency, lang: string) {
  const price = prices.find(p => p.currency === currency)
  if (!price?.unitAmount) return '-'
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency
  }).format(price?.unitAmount / 100)
}

export function formatDateTime (date: number | Date, lang: string) {
  return new Intl.DateTimeFormat(lang, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

/** Whole seconds as m:ss, callers say what a missing time limit means */
export function formatClock (seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}
