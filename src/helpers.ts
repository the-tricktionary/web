import { Discipline, TrickBoxFragment } from './graphql/generated/graphql'

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
