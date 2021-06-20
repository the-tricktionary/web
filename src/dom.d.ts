declare namespace Intl {
  interface ListFormatOptions {
    localeMatcher?: 'lookup' | 'best fit'
    type?: 'conjunction' | 'disjunction' | 'unit'
    style?: 'long' | 'short' | 'narrow'
  }
  class ListFormat {
    constructor (locale?: string | string[], options?: ListFormatOptions)
    public format: (items: Array<string | null | undefined>) => string;
  }
}
