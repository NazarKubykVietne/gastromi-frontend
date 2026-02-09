export default function enterFullscreen(element, videoEl) {
  if (!element) return

  const request =
    element?.requestFullscreen ||
    element?.webkitRequestFullscreen ||
    element?.msRequestFullscreen

  if (request) {
    request.call(element)
    return
  }

  if (videoEl?.webkitEnterFullscreen) {
    videoEl.webkitEnterFullscreen()
  }
}
