import { useI18n } from 'vue-i18n'

import { formatClock, formatDateTime } from '../helpers'
import useLanguage from './useLanguage'

/** Speed values formatted for the language the site is read in */
export default function useSpeedFormat () {
  const { t } = useI18n()
  const { lang } = useLanguage()

  return {
    dateTime: (date: number | Date) => formatDateTime(date, lang.value),
    /** An event's duration, 0 means there is no time limit */
    duration: (seconds: number) => seconds <= 0 ? t('speed.noTimeLimit') : formatClock(seconds),
    /** Seconds as m:ss, with tenths when asked for */
    seconds: (seconds: number, { tenths = false } = {}) => {
      const sign = seconds < 0 ? '-' : ''
      const abs = Math.abs(seconds)
      const minutes = Math.floor(abs / 60)
      const rest = abs - minutes * 60
      const secondsText = tenths ? rest.toFixed(1).padStart(4, '0') : String(Math.floor(rest)).padStart(2, '0')
      return `${sign}${minutes}:${secondsText}`
    },
    number: (n: number) => new Intl.NumberFormat(lang.value).format(n)
  }
}
