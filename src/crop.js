import { CROP_ASPECT_W, CROP_ASPECT_H } from './constants.js'

export function createCropEditor(containerEl, imageEl, onChange) {
  const srcW = imageEl.naturalWidth
  const srcH = imageEl.naturalHeight
  const containerRect = containerEl.getBoundingClientRect()
  const maxDispW = containerRect.width
  const maxDispH = containerRect.height

  // Uniform scale to fit container
  const imgScale = Math.min(maxDispW / srcW, maxDispH / srcH)
  const dispImgW = Math.round(srcW * imgScale)
  const dispImgH = Math.round(srcH * imgScale)
  const dispOffX = Math.round((maxDispW - dispImgW) / 2)
  const dispOffY = Math.round((maxDispH - dispImgH) / 2)

  const aspect = CROP_ASPECT_W / CROP_ASPECT_H

  // Maximized crop box in source pixels, centered
  let cropW, cropH
  if (srcW / srcH > aspect) {
    cropW = srcW
    cropH = srcW / aspect
  } else {
    cropH = srcH
    cropW = srcH * aspect
  }
  let cropX = (srcW - cropW) / 2
  let cropY = (srcH - cropH) / 2

  // --- Build DOM ---
  containerEl.innerHTML = ''
  containerEl.style.position = 'relative'
  containerEl.style.overflow = 'hidden'
  containerEl.style.background = '#111'

  const canvas = document.createElement('canvas')
  canvas.width = maxDispW
  canvas.height = maxDispH
  canvas.style.cssText = 'display:block;cursor:move;'
  containerEl.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  const hint = document.createElement('div')
  hint.style.cssText = 'position:absolute;bottom:4px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;color:#ccc;text-shadow:0 1px 2px #000;pointer-events:none;'
  containerEl.appendChild(hint)

  function draw() {
    ctx.clearRect(0, 0, maxDispW, maxDispH)

    // Dark background
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, maxDispW, maxDispH)

    // Draw image (uniform scale, centered)
    ctx.drawImage(imageEl, dispOffX, dispOffY, dispImgW, dispImgH)

    // Dark overlay on areas outside the crop box (in display coords)
    const cx = dispOffX + cropX * imgScale
    const cy = dispOffY + cropY * imgScale
    const cw = cropW * imgScale
    const ch = cropH * imgScale

    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    // Top strip
    ctx.fillRect(0, 0, maxDispW, cy)
    // Bottom strip
    ctx.fillRect(0, cy + ch, maxDispW, maxDispH - cy - ch)
    // Left strip (between top and bottom)
    ctx.fillRect(0, cy, cx, ch)
    // Right strip (between top and bottom)
    ctx.fillRect(cx + cw, cy, maxDispW - cx - cw, ch)

    // Crop box dashed border
    ctx.setLineDash([8, 6])
    ctx.strokeStyle = 'rgba(255,200,100,0.9)'
    ctx.lineWidth = 2
    ctx.strokeRect(cx, cy, cw, ch)
    ctx.setLineDash([])

    hint.textContent = `区域: ${Math.round(cropW)}×${Math.round(cropH)} (缩放: ×${imgScale.toFixed(3)})`
  }

  function emitCropped() {
    const cropped = document.createElement('canvas')
    cropped.width = Math.round(cropW)
    cropped.height = Math.round(cropH)
    const cctx = cropped.getContext('2d')
    cctx.drawImage(imageEl, cropX, cropY, cropW, cropH, 0, 0, cropped.width, cropped.height)
    const result = new Image()
    result.src = cropped.toDataURL('image/png')
    result.onload = () => onChange(result)
  }

  // --- Drag ---
  let dragging = false
  let lastMX, lastMY

  function onDown(e) {
    e.preventDefault()
    dragging = true
    const p = e.touches ? e.touches[0] : e
    lastMX = p.clientX
    lastMY = p.clientY
  }

  function onMove(e) {
    if (!dragging) return
    e.preventDefault()
    const p = e.touches ? e.touches[0] : e
    const ddx = p.clientX - lastMX
    const ddy = p.clientY - lastMY
    lastMX = p.clientX
    lastMY = p.clientY
    // Convert display delta to source delta
    const dsx = ddx / imgScale
    const dsy = ddy / imgScale
    cropX = Math.max(0, Math.min(srcW - cropW, cropX + dsx))
    cropY = Math.max(0, Math.min(srcH - cropH, cropY + dsy))
    draw()
    emitCropped()
  }

  function onUp() { dragging = false }

  canvas.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  canvas.addEventListener('touchstart', onDown, { passive: false })
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onUp)

  draw()
  emitCropped()

  return {
    destroy() {
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    },
  }
}