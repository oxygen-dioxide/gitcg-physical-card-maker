import { CROP_W, CROP_H } from './constants.js'

export function createCropEditor(containerEl, imageEl, onChange) {
  const srcW = imageEl.naturalWidth
  const srcH = imageEl.naturalHeight
  const containerRect = containerEl.getBoundingClientRect()
  const maxDispW = containerRect.width
  const maxDispH = containerRect.height || 400

  const aspect = CROP_W / CROP_H
  let dispW, dispH
  if (maxDispW / maxDispH > aspect) {
    dispH = maxDispH
    dispW = dispH * aspect
  } else {
    dispW = maxDispW
    dispH = dispW / aspect
  }

  const scaleX = srcW / dispW
  const scaleY = srcH / dispH

  let cropX = (srcW - srcH * aspect) / 2
  let cropY = (srcH - srcW / aspect) / 2
  let cropW = srcH * aspect
  let cropH = srcW / aspect
  if (cropW > srcW) {
    cropW = srcW
    cropH = srcW / aspect
    cropY = (srcH - cropH) / 2
  }

  containerEl.innerHTML = ''
  containerEl.style.position = 'relative'
  containerEl.style.overflow = 'hidden'
  containerEl.style.cursor = 'move'

  const img = new Image()
  img.src = imageEl.src
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.objectFit = 'fill'
  img.style.pointerEvents = 'none'
  containerEl.appendChild(img)

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
  containerEl.appendChild(overlay)

  const mask = document.createElement('div')
  mask.style.cssText = 'position:absolute;border:2px dashed rgba(255,200,100,0.85);background:rgba(0,0,0,0.08);box-sizing:border-box;pointer-events:none;'
  overlay.appendChild(mask)

  const hint = document.createElement('div')
  hint.style.cssText = 'position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;color:#bbb;'
  overlay.appendChild(hint)

  function updateUI() {
    const dx = cropX / scaleX
    const dy = cropY / scaleY
    const dw = cropW / scaleX
    const dh = cropH / scaleY
    mask.style.left = dx + 'px'
    mask.style.top = dy + 'px'
    mask.style.width = dw + 'px'
    mask.style.height = dh + 'px'
    hint.textContent = `区域: ${Math.round(cropW)}×${Math.round(cropH)} (88:63)`
  }

  function applyCrop() {
    const cropped = document.createElement('canvas')
    cropped.width = Math.round(cropW)
    cropped.height = Math.round(cropH)
    const cctx = cropped.getContext('2d')
    cctx.drawImage(imageEl, cropX, cropY, cropW, cropH, 0, 0, cropped.width, cropped.height)
    const resultImg = new Image()
    resultImg.src = cropped.toDataURL('image/png')
    resultImg.onload = () => onChange(resultImg)
  }

  let dragging = false
  let lastX, lastY
  function onDown(e) {
    e.preventDefault()
    dragging = true
    const p = e.touches ? e.touches[0] : e
    lastX = p.clientX
    lastY = p.clientY
  }
  function onMove(e) {
    if (!dragging) return
    e.preventDefault()
    const p = e.touches ? e.touches[0] : e
    const dx = (p.clientX - lastX) * scaleX
    const dy = (p.clientY - lastY) * scaleY
    lastX = p.clientX
    lastY = p.clientY
    cropX = Math.max(0, Math.min(srcW - cropW, cropX + dx))
    cropY = Math.max(0, Math.min(srcH - cropH, cropY + dy))
    updateUI()
    applyCrop()
  }
  function onUp() { dragging = false }

  containerEl.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  containerEl.addEventListener('touchstart', onDown, { passive: false })
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)

  updateUI()
  applyCrop()

  return {
    destroy() {
      containerEl.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      containerEl.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    },
  }
}