import actionCardsData from '../data/7.0.0/CHS/action_cards.json'

const { data } = actionCardsData

export const CARDS = data

export function getCardById(id) {
  return CARDS.find((c) => String(c.id) === String(id)) || null
}

export function searchCards(keyword) {
  const kw = String(keyword || '').trim().toLowerCase()
  if (!kw) return CARDS
  return CARDS.filter((c) => {
    return (
      String(c.id).toLowerCase().includes(kw) ||
      (c.name || '').toLowerCase().includes(kw) ||
      (c.englishName || '').toLowerCase().includes(kw)
    )
  })
}

export function imageUrlFor(id) {
  return `https://static-data.piovium.org/api/v4/image/${id}`
}