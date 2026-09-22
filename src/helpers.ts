import type { TrickBoxFragment, Currency } from './graphql/generated/graphql'
import { Discipline, GroupInviteKind, GroupRole, TimingCueType, TrickSubmissionStatus, TrickType, VerificationLevel, VideoUploadStatus } from './graphql/generated/graphql'

const enums = {
  discipline: Discipline,
  groupInviteKind: GroupInviteKind,
  groupRole: GroupRole,
  trickSubmissionStatus: TrickSubmissionStatus,
  trickType: TrickType,
  verificationLevel: VerificationLevel,
  videoUploadStatus: VideoUploadStatus
}

/** The message key holding the label of an enum value, e.g. `enums.trickType.Basic` */
export function enumKey (name: keyof typeof enums, value: Discipline | GroupInviteKind | GroupRole | TrickSubmissionStatus | TrickType | VerificationLevel | VideoUploadStatus) {
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

/** The name of a language in that language itself, the tag when we can't name it */
export function languageName (tag: string) {
  try {
    const name = new Intl.DisplayNames([tag], { type: 'language' }).of(tag) ?? tag
    return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1)
  } catch {
    return tag
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

export function formatDate (date: number | Date, lang: string) {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(date)
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

/**
 * The event picker's value for "none of the listed events": the score then
 * carries its own definition rather than pointing at one.
 */
export const CUSTOM_EVENT = 'custom'

/**
 * The set of athletes on a score, encoded as the API encodes it: distinct
 * member ids, sorted, joined with a pipe.
 */
export function constellationKey (memberIds: readonly string[]) {
  return [...new Set(memberIds)].sort((a, b) => a.localeCompare(b)).join('|')
}

export function constellationMemberIds (key: string) {
  return key ? key.split('|') : []
}

/** The athletes of a constellation, named for a filter option or a legend */
export function constellationNames (members: ReadonlyArray<{ name: string }>) {
  return members.map(member => member.name).sort((a, b) => a.localeCompare(b)).join(', ')
}

/** A switch in a custom relay as the form edits it, offset in seconds */
export interface SwitchRow {
  key: number
  offset: number | undefined
  label: string
}

/**
 * The switch rows in the shape the API takes: sorted, in milliseconds, and
 * without the empty labels or the keys the form needs for its list.
 *
 * A segment is named by the cue that opens it, so the opening one needs a
 * start cue at zero to carry its name. It is only worth sending when there
 * is a switch to divide the event in the first place.
 */
export function switchCuesInput (cues: SwitchRow[], openingLabel = '') {
  if (!cues.length) return {}
  const opening = openingLabel.trim()
  return {
    cues: [
      ...(opening ? [{ type: TimingCueType.Start, offset: 0, label: opening }] : []),
      ...[...cues]
        .sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0))
        .map(cue => ({
          type: TimingCueType.Switch,
          offset: (cue.offset ?? 0) * 1000,
          ...(cue.label.trim() ? { label: cue.label.trim() } : {})
        }))
    ]
  }
}

export interface Segment {
  index: number
  label?: string
  /** Seconds from the start of the event */
  start: number
  end: number
}

/**
 * The stretches an event is divided into, mirroring the API's own split so
 * the counter can say which one is running. Cue offsets are measured from
 * the start cue where there is one, and from zero otherwise.
 */
export function segmentsOf (
  totalDuration: number,
  cues: ReadonlyArray<{ type: TimingCueType, offset: number, label?: string | null }> = []
): Segment[] {
  const startCue = cues.find(cue => cue.type === TimingCueType.Start)
  const switches = cues.filter(cue => cue.type === TimingCueType.Switch).sort((a, b) => a.offset - b.offset)
  const opening = { offset: startCue?.offset ?? 0, label: startCue?.label }
  if (!switches.length) return [{ index: 0, start: 0, end: totalDuration, ...(opening.label ? { label: opening.label } : {}) }]

  const segments: Segment[] = []
  let previous: { offset: number, label?: string | null } = opening
  for (const cue of [...switches, { offset: opening.offset + totalDuration * 1000, label: null }]) {
    segments.push({
      index: segments.length,
      start: (previous.offset - opening.offset) / 1000,
      end: Math.min(totalDuration, (cue.offset - opening.offset) / 1000),
      ...(previous.label ? { label: previous.label } : {})
    })
    previous = cue
  }
  return segments
}
