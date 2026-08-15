export const CARD_W = 63
export const CARD_H = 88
export const SCALE = 12
export const CANVAS_W = CARD_W * SCALE
export const CANVAS_H = CARD_H * SCALE

export const CROP_W = 88
export const CROP_H = 63

export const CARD_TYPE_LABELS = {
  GCG_CARD_EVENT: '事件牌',
  GCG_CARD_ASSIST: '支援牌',
  GCG_CARD_MODIFY: '装备牌',
}

export const COST_DEFS = {
  GCG_COST_DICE_ANEMO: { label: '风', icon: 'UI_Gcg_DiceL_Wind_Glow_HD.png' },
  GCG_COST_DICE_CRYO: { label: '冰', icon: 'UI_Gcg_DiceL_Ice_Glow_HD.png' },
  GCG_COST_DICE_DENDRO: { label: '草', icon: 'UI_Gcg_DiceL_Grass_Glow_HD.png' },
  GCG_COST_DICE_ELECTRO: { label: '雷', icon: 'UI_Gcg_DiceL_Electric_Glow_HD.png' },
  GCG_COST_DICE_GEO: { label: '岩', icon: 'UI_Gcg_DiceL_Rock_Glow_HD.png' },
  GCG_COST_DICE_HYDRO: { label: '水', icon: 'UI_Gcg_DiceL_Water_Glow_HD.png' },
  GCG_COST_DICE_PYRO: { label: '火', icon: 'UI_Gcg_DiceL_Fire_Glow_HD.png' },
  GCG_COST_DICE_SAME: { label: '同', icon: 'UI_Gcg_DiceL_Same_Glow_HD.png' },
  GCG_COST_DICE_VOID: { label: '任', icon: 'UI_Gcg_DiceL_Any_Glow_HD.png' },
  GCG_COST_ENERGY: { label: '能', icon: 'UI_Gcg_DiceL_Energy_Glow_HD.png' },
  GCG_COST_LEGEND: { label: '秘', icon: 'UI_Gcg_DiceL_Legend_Glow_HD.png' },
}

export const TAG_DEFS = {
  GCG_TAG_FOOD: { label: '料理', icon: 'UI_Gcg_Tag_Card_Food.png' },
  GCG_TAG_ALLY: { label: '伙伴', icon: 'UI_Gcg_Tag_Card_Ally.png' },
  GCG_TAG_ARTIFACT: { label: '圣遗物', icon: 'UI_Gcg_Tag_Card_Relic.png' },
  GCG_TAG_WEAPON: { label: '武器', icon: 'UI_Gcg_Tag_Card_Weapon.png' },
  GCG_TAG_WEAPON_BOW: { label: '弓', icon: 'UI_Gcg_Tag_Weapon_Bow.png' },
  GCG_TAG_WEAPON_SWORD: { label: '单手剑', icon: 'UI_Gcg_Tag_Weapon_Sword.png' },
  GCG_TAG_WEAPON_CLAYMORE: { label: '双手剑', icon: 'UI_Gcg_Tag_Weapon_Claymore.png' },
  GCG_TAG_WEAPON_POLE: { label: '长柄武器', icon: 'UI_Gcg_Tag_Weapon_Polearm.png' },
  GCG_TAG_WEAPON_CATALYST: { label: '法器', icon: 'UI_Gcg_Tag_Weapon_Catalyst.png' },
  GCG_TAG_PLACE: { label: '场地', icon: 'UI_Gcg_Tag_Card_Location.png' },
  GCG_TAG_ITEM: { label: '道具', icon: 'UI_Gcg_Tag_Card_Item.png' },
  GCG_TAG_TALENT: { label: '天赋', icon: 'UI_Gcg_Tag_Card_Talent.png' },
  GCG_TAG_RESONANCE: { label: '元素共鸣', icon: 'UI_Gcg_Tag_Custom_ActionCard.png' },
  GCG_TAG_LEGEND: { label: '秘传', icon: 'UI_Gcg_Tag_Card_Legend.png' },
  GCG_TAG_VEHICLE: { label: '特技', icon: 'UI_Gcg_Tag_Card_Vehicle.png' },
  GCG_TAG_CARD_BLESSING: { label: '元素幻变', icon: 'UI_Gcg_Tag_Card_Blessing.png' },
  GCG_TAG_ADVENTURE_PLACE: { label: '冒险地点', icon: 'UI_Gcg_Tag_Card_Adventure.png' },
  GCG_TAG_NATION_SIMULANKA: { label: '希穆兰卡', icon: 'UI_Gcg_Tag_Card_Simulanka.png' },
  GCG_TAG_SLOWLY: { label: '魔导', icon: 'UI_Gcg_Tag_Hexenzirkel.png' },
  GCG_TAG_SLOWLY: { label: '战斗行动', icon: 'UI_Gcg_Tag_Card_CombatAction.png' },
}

export const HIDDEN_TAGS = new Set([
  'GCG_TAG_DISABLE',
  'GCG_TAG_NON_DISCOVERABLE',
  'GCG_TAG_NOT_HENSHIN',
  'GCG_TAG_SUB_HURT',
])

export const assetsUrl = (name) => `assets/${name}`