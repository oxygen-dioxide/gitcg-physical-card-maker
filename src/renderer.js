import { CANVAS_W, CANVAS_H, COST_DEFS, TAG_DEFS, HIDDEN_TAGS, assetsUrl } from './constants.js'

const imgCache = new Map()

function loadImg(src) {
  if (imgCache.has(src)) return imgCache.get(src)
  const p = new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed: ' + src))
    img.src = src
  })
  imgCache.set(src, p)
  return p
}

function rRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function diamond(ctx, cx, cy, r) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx + r, cy)
  ctx.lineTo(cx, cy + r)
  ctx.lineTo(cx - r, cy)
  ctx.closePath()
  ctx.fill()
}

function fitText(ctx, text, cx, cy, maxW) {
  ctx.fillText(text, cx, cy)
  const w = ctx.measureText(text).width
  if (w <= maxW || !w) return
  const ratio = maxW / w
  let fs = Number.parseFloat(ctx.font) * ratio
  ctx.font = ctx.font.replace(/\d+(\.\d+)?(?=px)/, fs.toFixed(1))
  ctx.fillText(text, cx, cy)
}

function splitLines(ctx, text, maxW) {
  const lines = []
  let line = ''
  for (const ch of text) {
    const test = line + ch
    if (ctx.measureText(test).width > maxW) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

async function drawDice(ctx, iconName, count, x, y, size) {
  try {
    const icon = await loadImg(assetsUrl(iconName))
    const pad = size * 0.06
    const iconSz = size - pad * 2
    ctx.save()
    ctx.shadowColor = 'rgba(255,255,200,0.55)'
    ctx.shadowBlur = size * 0.1
    ctx.drawImage(icon, x + pad, y + pad, iconSz, iconSz)
    ctx.restore()
  } catch (_) {
    ctx.fillStyle = '#e8d98e'
    rRect(ctx, x, y, size, size, size * 0.18)
    ctx.fill()
  }
  ctx.fillStyle = '#222'
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = size * 0.06
  ctx.font = `bold ${size * 0.52}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeText(String(count), x + size / 2, y + size / 2 + 1)
  ctx.fillText(String(count), x + size / 2, y + size / 2 + 1)
}

function drawName(ctx, name, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h)
  g.addColorStop(0, '#e9e2cc')
  g.addColorStop(1, '#fbf8ee')
  ctx.fillStyle = g
  rRect(ctx, x, y, w, h, h * 0.2)
  ctx.fill()
  ctx.lineWidth = h * 0.09
  ctx.strokeStyle = '#c8b98b'
  ctx.stroke()
  ctx.fillStyle = '#c8b98b'
  diamond(ctx, x - h * 0.34, y + h / 2, h * 0.16)
  diamond(ctx, x + w + h * 0.34, y + h / 2, h * 0.16)
  ctx.fillStyle = '#ac7e51'
  ctx.font = `bold ${h * 0.6}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  fitText(ctx, name, x + w / 2, y + h / 2 + 1, w * 0.82)
}

async function drawTags(ctx, tags, W) {
  if (!tags.length) return
  const fontSize = W * 0.023
  const iconSz = fontSize * 1.05
  const gapY = W * 0.006
  const padX = W * 0.008
  const padY = W * 0.004
  const totalW = W * 0.28
  const startX = W - totalW - W * 0.02
  const startY = W * 0.032
  ctx.font = `${fontSize}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`
  let cy = startY
  for (const tag of tags) {
    const textW = ctx.measureText(tag.label).width
    const boxW = (tag.iconFile ? iconSz + padX * 1.2 : 0) + textW + padX * 2.4
    const boxH = fontSize + padY * 2
    const bx = W - boxW - W * 0.02
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    rRect(ctx, bx, cy, boxW, boxH, boxH / 2)
    ctx.fill()
    ctx.strokeStyle = '#c8b98b'
    ctx.lineWidth = 1
    ctx.stroke()
    let tx = bx + padX * 1.4
    if (tag.iconFile) {
      try {
        const img = await loadImg(assetsUrl(tag.iconFile))
        ctx.drawImage(img, tx, cy + (boxH - iconSz) / 2, iconSz, iconSz)
        tx += iconSz + padX
      } catch (_) {}
    }
    ctx.fillStyle = '#8a7558'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(tag.label, tx, cy + boxH / 2 + 1)
    cy += boxH + gapY
  }
}

async function drawEffect(ctx, main, sub, x, y, w, h) {
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  rRect(ctx, x, y, w, h, h * 0.12)
  ctx.fill()
  ctx.strokeStyle = '#eaeaea'
  ctx.lineWidth = 2
  ctx.stroke()
  const pad = w * 0.06
  const maxTxtW = w - pad * 2
  const mainFs = w * 0.038
  const subFs = w * 0.032
  let cy = y + pad * 0.9
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  if (main) {
    ctx.fillStyle = '#333'
    ctx.font = `500 ${mainFs}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`
    const lines = splitLines(ctx, main, maxTxtW)
    for (const ln of lines) {
      ctx.fillText(ln, x + pad, cy)
      cy += mainFs * 1.45
    }
    cy += mainFs * 0.15
  }
  if (sub) {
    ctx.fillStyle = '#666'
    ctx.font = `${subFs}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`
    const lines = splitLines(ctx, sub, maxTxtW)
    for (const ln of lines) {
      if (cy + subFs > y + h - pad * 0.3) {
        ctx.fillText('…', x + pad, cy)
        break
      }
      ctx.fillText(ln, x + pad, cy)
      cy += subFs * 1.4
    }
  }
}

function drawFooter(ctx, left, right, W, H) {
  const fs = W * 0.02
  ctx.fillStyle = '#b0b0b0'
  ctx.font = `${fs}px sans-serif`
  ctx.textBaseline = 'bottom'
  if (left) {
    ctx.textAlign = 'left'
    ctx.fillText(left, W * 0.035, H - W * 0.008)
  }
  if (right) {
    ctx.textAlign = 'right'
    ctx.fillText(right, W - W * 0.035, H - W * 0.008)
  }
}

export async function renderCard(opts) {
  const {
    backgroundImage,
    costItems = [],
    name = '',
    tags = [],
    effectMain = '',
    effectSub = '',
    footerLeft = '',
    footerRight = '',
  } = opts

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')
  const W = CANVAS_W
  const H = CANVAS_H

  // background
  if (backgroundImage) {
    const iw = backgroundImage.naturalWidth || backgroundImage.width
    const ih = backgroundImage.naturalHeight || backgroundImage.height
    const s = Math.max(W / iw, H / ih)
    ctx.drawImage(backgroundImage, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s)
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#3a3a3a')
    g.addColorStop(1, '#222')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#888'
    ctx.font = `${W * 0.06}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('请上传背景图', W / 2, H / 2)
  }

  // cost dice — stacked vertically top-left
  const diceSize = W * 0.155
  const gap = W * 0.012
  let cy = W * 0.032
  for (const item of costItems) {
    const def = COST_DEFS[item.type]
    if (!def) continue
    await drawDice(ctx, def.icon, item.count, W * 0.025, cy, diceSize)
    cy += diceSize + gap
  }

  // name banner
  const bnW = W * 0.55
  const bnH = H * 0.065
  const bnX = (W - bnW) / 2
  const bnY = H * 0.024
  drawName(ctx, name, bnX, bnY, bnW, bnH)

  // tags
  await drawTags(ctx, tags, W)

  // effect area
  const effW = W * 0.9
  const effH = H * 0.20
  const effX = (W - effW) / 2
  const effY = H - effH - H * 0.044
  await drawEffect(ctx, effectMain, effectSub, effX, effY, effW, effH)

  // footer
  drawFooter(ctx, footerLeft, footerRight, W, H)

  return canvas
}