/** The AdSense publisher ID, as in public/ads.txt */
export const AD_CLIENT = 'ca-pub-7956758256491526'

/** One ad unit per placement, so AdSense reports on each separately */
export const AD_SLOTS = {
  /** tT flow v4 */
  home: '4238944283',
  /** tT Trick v4 */
  trick: '6263291406'
}

/** The share of trick page views that get an ad */
export const TRICK_AD_RATE = 0.5

/**
 * AdSense, and Google's consent message with it, only runs on the live site,
 * the one site AdSense serves. Previews and development show an empty slot.
 */
export const adsEnabled = import.meta.env.VITE_CONTEXT === 'production'

/**
 * AdSense's tag, once on every page as AdSense asks, since it also brings
 * Google's consent message. Rejects when the tag doesn't load, e.g. behind an
 * ad blocker.
 */
export async function loadAdsense () {
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`
    script.crossOrigin = 'anonymous'
    script.addEventListener('load', () => { resolve() })
    script.addEventListener('error', () => { reject(new Error('AdSense did not load')) })
    document.head.append(script)
  })
}
