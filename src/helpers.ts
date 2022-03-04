import { Discipline, TrickBoxFragment, Currency } from './graphql/generated/graphql'

export function disciplineToSlug (discipline: Discipline) {
  switch (discipline) {
    case Discipline.SingleRope:
      return 'sr'
    case Discipline.DoubleDutch:
      return 'dd'
    case Discipline.Wheel:
      return 'wh'
    default:
      throw new Error(`Unknown discipline: ${discipline}`)
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

export function trickSorter (a: Pick<TrickBoxFragment, 'slug' | 'localised' | 'en'>, b: Pick<TrickBoxFragment, 'slug' | 'localised' | 'en'>) {
  const aName = a.localised?.name ?? a.en?.name ?? a.slug
  const bName = b.localised?.name ?? b.en?.name ?? b.slug
  return aName.localeCompare(bName)
}

type PricesFormatFields = Array<{ currency: Currency, unitAmount?: number | null }>

export function formatPrice (prices: PricesFormatFields | Readonly<PricesFormatFields>, currency: Currency | string) {
  const price = prices.find(p => p.currency === currency)
  if (!price?.unitAmount) return '-'
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency
  }).format(price?.unitAmount / 100)
}

export function formatDateTime (date: number | Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
