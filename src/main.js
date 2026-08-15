import './style.css'
import { init } from './ui.js'

async function loadFont() {
  try {
    const font = new FontFace('HYWH', 'url(assets/font/HYWH.ttf)')
    await font.load()
    document.fonts.add(font)
  } catch (_) {
    console.warn('HYWH font failed to load, using fallback')
  }
}

loadFont().then(init)