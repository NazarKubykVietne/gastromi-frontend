export default function getDeviceType() {
  let ua = ''
  try {
    ua = navigator.userAgent.toLowerCase()
  } catch {}

  const width = window.innerWidth

  const isAndroid = /android/.test(ua)

  const isAndroidMobile = isAndroid && /mobile/.test(ua) && width < 768

  const isAndroidTablet = isAndroid && !/mobile/.test(ua)

  const isTablet =
    /(ipad|tablet)/.test(ua) ||
    isAndroidTablet ||
    (width >= 768 && width <= 1024)

  const isMobile =
    !isAndroid &&
    /mobile|iphone|ipod|windows phone/.test(ua) &&
    width < 768

  if (isAndroidMobile) return 'android'
  if (isTablet) return 'tablet'
  if (isMobile) return 'mobile'

  return 'desktop'
}
