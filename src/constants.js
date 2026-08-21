export const CARD_W = 63;
export const CARD_H = 88;
export const SCALE = 12;
export const CANVAS_W = CARD_W * SCALE;
export const CANVAS_H = CARD_H * SCALE;

export const CROP_ASPECT_W = 63;
export const CROP_ASPECT_H = 88;

export const CARD_TYPE_LABELS = {
	GCG_CARD_EVENT: "事件牌",
	GCG_CARD_ASSIST: "支援牌",
	GCG_CARD_MODIFY: "装备牌",
};

export const COST_DEFS = {
	GCG_COST_DICE_CRYO: { label: "冰", icon: "UI_Gcg_DiceL_Ice_Glow_HD.png" },
	GCG_COST_DICE_HYDRO: { label: "水", icon: "UI_Gcg_DiceL_Water_Glow_HD.png" },
	GCG_COST_DICE_PYRO: { label: "火", icon: "UI_Gcg_DiceL_Fire_Glow_HD.png" },
	GCG_COST_DICE_ELECTRO: {
		label: "雷",
		icon: "UI_Gcg_DiceL_Electric_Glow_HD.png",
	},
	GCG_COST_DICE_ANEMO: { label: "风", icon: "UI_Gcg_DiceL_Wind_Glow_HD.png" },
	GCG_COST_DICE_GEO: { label: "岩", icon: "UI_Gcg_DiceL_Rock_Glow_HD.png" },
	GCG_COST_DICE_DENDRO: { label: "草", icon: "UI_Gcg_DiceL_Grass_Glow_HD.png" },
	GCG_COST_DICE_SAME: {
		label: "相同元素",
		icon: "UI_Gcg_DiceL_Same_Glow_HD.png",
	},
	GCG_COST_DICE_VOID: {
		label: "无色元素",
		icon: "UI_Gcg_DiceL_Any_Glow_HD.png",
	},
	GCG_COST_ENERGY: { label: "充能", icon: "UI_Gcg_DiceL_Energy_Glow_HD.png" },
	GCG_COST_LEGEND: { label: "秘传", icon: "UI_Gcg_DiceL_Legend_Glow_HD.png" },
};

export const TAG_DEFS = {
	GCG_TAG_FOOD: { label: "料理", icon: "UI_Gcg_Tag_Card_Food.png" },
	GCG_TAG_ALLY: { label: "伙伴", icon: "UI_Gcg_Tag_Card_Ally.png" },
	GCG_TAG_ARTIFACT: { label: "圣遗物", icon: "UI_Gcg_Tag_Card_Relic.png" },
	GCG_TAG_WEAPON: { label: "武器", icon: "UI_Gcg_Tag_Card_Weapon.png" },
	GCG_TAG_WEAPON_BOW: { label: "弓", icon: "UI_Gcg_Tag_Weapon_Bow.png" },
	GCG_TAG_WEAPON_SWORD: {
		label: "单手剑",
		icon: "UI_Gcg_Tag_Weapon_Sword.png",
	},
	GCG_TAG_WEAPON_CLAYMORE: {
		label: "双手剑",
		icon: "UI_Gcg_Tag_Weapon_Claymore.png",
	},
	GCG_TAG_WEAPON_POLE: {
		label: "长柄武器",
		icon: "UI_Gcg_Tag_Weapon_Polearm.png",
	},
	GCG_TAG_WEAPON_CATALYST: {
		label: "法器",
		icon: "UI_Gcg_Tag_Weapon_Catalyst.png",
	},
	GCG_TAG_PLACE: { label: "场地", icon: "UI_Gcg_Tag_Card_Location.png" },
	GCG_TAG_ITEM: { label: "道具", icon: "UI_Gcg_Tag_Card_Item.png" },
	GCG_TAG_TALENT: { label: "天赋", icon: "UI_Gcg_Tag_Card_Talent.png" },
	GCG_TAG_RESONANCE: {
		label: "元素共鸣",
		icon: "UI_Gcg_Tag_Custom_ActionCard.png",
	},
	GCG_TAG_LEGEND: { label: "秘传", icon: "UI_Gcg_Tag_Card_Legend.png" },
	GCG_TAG_VEHICLE: { label: "特技", icon: "UI_Gcg_Tag_Card_Vehicle.png" },
	GCG_TAG_CARD_BLESSING: {
		label: "元素幻变",
		icon: "UI_Gcg_Tag_Card_Blessing.png",
	},
	GCG_TAG_ADVENTURE_PLACE: {
		label: "冒险地点",
		icon: "UI_Gcg_Tag_Card_Adventure.png",
	},
	GCG_TAG_NATION_SIMULANKA: {
		label: "希穆兰卡",
		icon: "UI_Gcg_Tag_Card_Simulanka.png",
	},
	GCG_TAG_HEXENZIRKEL: { label: "魔导", icon: "UI_Gcg_Tag_Hexenzirkel.png" },
	GCG_TAG_SLOWLY: { label: "战斗行动", icon: null },
};

export const HIDDEN_TAGS = new Set([
	"GCG_TAG_DISABLE",
	"GCG_TAG_NON_DISCOVERABLE",
	"GCG_TAG_NOT_HENSHIN",
	"GCG_TAG_SUB_HURT",
]);

export const assetsUrl = (name) => `assets/${name}`;
export const assetsTagsUrl = (name) => `assets/tags/${name}`;

// 效果描述中的图标（SPRITE_PRESET）编号 → 资源。
// 每条要么指向一个普通资源（image），要么指向一个卡面标签（tagIcon）。
export const DESCRIPTION_ICON_IMAGES = {
	4007: { image: "UI_Gcg_Keyword_Shield.png" },
	2100: { image: "UI_Gcg_Keyword_Element_Physics.png" },
	2101: { image: "UI_Gcg_Keyword_Element_Ice.png" },
	2102: { image: "UI_Gcg_Keyword_Element_Water.png" },
	2103: { image: "UI_Gcg_Keyword_Element_Fire.png" },
	2104: { image: "UI_Gcg_Keyword_Element_Electric.png" },
	2105: { image: "UI_Gcg_Keyword_Element_Wind.png" },
	2106: { image: "UI_Gcg_Keyword_Element_Rock.png" },
	2107: { image: "UI_Gcg_Keyword_Element_Grass.png" },
	1101: { image: "UI_Gcg_DiceL_Ice.png" },
	1102: { image: "UI_Gcg_DiceL_Water.png" },
	1103: { image: "UI_Gcg_DiceL_Fire.png" },
	1104: { image: "UI_Gcg_DiceL_Elec.png" },
	1105: { image: "UI_Gcg_DiceL_Wind.png" },
	1106: { image: "UI_Gcg_DiceL_Rock.png" },
	1107: { image: "UI_Gcg_DiceL_Grass.png" },
	1108: { image: "UI_Gcg_DiceL_Same.png" },
	1109: { image: "UI_Gcg_DiceL_Diff.png" },
	1110: { image: "UI_Gcg_Keyword_Energy.png" },
	1111: { image: "UI_Gcg_DiceL_Any.png" },
	1112: { image: "UI_Gcg_Keyword_Legend.png" },
	4008: { image: "UI_Gcg_Keyword_Fighting_Spirit.png" },
	4009: { image: "UI_Gcg_Keyword_Energy_SKK.png" },
	3003: { tagIcon: "GCG_TAG_WEAPON" },
	3004: { tagIcon: "GCG_TAG_ARTIFACT" },
	3006: { tagIcon: "GCG_TAG_TALENT" },
	3007: { tagIcon: "GCG_TAG_LEGEND" },
	3008: { tagIcon: "GCG_TAG_VEHICLE" },
	3101: { tagIcon: "GCG_TAG_FOOD" },
	3102: { tagIcon: "GCG_TAG_ITEM" },
	3103: { tagIcon: "GCG_TAG_ALLY" },
	3104: { tagIcon: "GCG_TAG_PLACE" },
	3200: { tagIcon: "GCG_TAG_WEAPON_NONE" },
	3201: { tagIcon: "GCG_TAG_WEAPON_CATALYST" },
	3202: { tagIcon: "GCG_TAG_WEAPON_BOW" },
	3203: { tagIcon: "GCG_TAG_WEAPON_CLAYMORE" },
	3204: { tagIcon: "GCG_TAG_WEAPON_POLE" },
	3205: { tagIcon: "GCG_TAG_WEAPON_SWORD" },
	3401: { tagIcon: "GCG_TAG_NATION_MONDSTADT" },
	3402: { tagIcon: "GCG_TAG_NATION_LIYUE" },
	3403: { tagIcon: "GCG_TAG_NATION_INAZUMA" },
	3404: { tagIcon: "GCG_TAG_NATION_SUMERU" },
	3405: { tagIcon: "GCG_TAG_NATION_FONTAINE" },
	3406: { tagIcon: "GCG_TAG_NATION_NATLAN" },
	3407: { tagIcon: "GCG_TAG_NATION_NODKRAI" },
	3408: { tagIcon: "GCG_TAG_NATION_SNEZHNAYA" },
	3501: { tagIcon: "GCG_TAG_CAMP_FATUI" },
	3502: { tagIcon: "GCG_TAG_CAMP_HILICHURL" },
	3503: { tagIcon: "GCG_TAG_CAMP_MONSTER" },
	3504: { tagIcon: "GCG_TAG_ARKHE_PNEUMA" },
	3505: { tagIcon: "GCG_TAG_ARKHE_OUSIA" },
	3901: { tagIcon: "GCG_TAG_ADVENTURE_PLACE" },
};

// tagIcon 常量 → assets/tags/ 下的文件名。
export const TAG_ICON_ASSETS = {
	GCG_TAG_WEAPON: "UI_Gcg_Tag_Card_Weapon.png",
	GCG_TAG_ARTIFACT: "UI_Gcg_Tag_Card_Relic.png",
	GCG_TAG_TALENT: "UI_Gcg_Tag_Card_Talent.png",
	GCG_TAG_LEGEND: "UI_Gcg_Tag_Card_Legend.png",
	GCG_TAG_VEHICLE: "UI_Gcg_Tag_Card_Vehicle.png",
	GCG_TAG_FOOD: "UI_Gcg_Tag_Card_Food.png",
	GCG_TAG_ITEM: "UI_Gcg_Tag_Card_Item.png",
	GCG_TAG_ALLY: "UI_Gcg_Tag_Card_Ally.png",
	GCG_TAG_PLACE: "UI_Gcg_Tag_Card_Location.png",
	GCG_TAG_WEAPON_NONE: "UI_Gcg_Tag_Weapon_None.png",
	GCG_TAG_WEAPON_CATALYST: "UI_Gcg_Tag_Weapon_Catalyst.png",
	GCG_TAG_WEAPON_BOW: "UI_Gcg_Tag_Weapon_Bow.png",
	GCG_TAG_WEAPON_CLAYMORE: "UI_Gcg_Tag_Weapon_Claymore.png",
	GCG_TAG_WEAPON_POLE: "UI_Gcg_Tag_Weapon_Polearm.png",
	GCG_TAG_WEAPON_SWORD: "UI_Gcg_Tag_Weapon_Sword.png",
	GCG_TAG_NATION_MONDSTADT: "UI_Gcg_Tag_Faction_Mondstadt.png",
	GCG_TAG_NATION_LIYUE: "UI_Gcg_Tag_Faction_Liyue.png",
	GCG_TAG_NATION_INAZUMA: "UI_Gcg_Tag_Faction_Inazuma.png",
	GCG_TAG_NATION_SUMERU: "UI_Gcg_Tag_Faction_Sumeru.png",
	GCG_TAG_NATION_FONTAINE: "UI_Gcg_Tag_Faction_Fontaine.png",
	GCG_TAG_NATION_NATLAN: "UI_Gcg_Tag_Faction_Natlan.png",
	GCG_TAG_NATION_NODKRAI: "UI_Gcg_Tag_Faction_NodKrai.png",
	GCG_TAG_NATION_SNEZHNAYA: null,
	GCG_TAG_CAMP_FATUI: "UI_Gcg_Tag_Faction_Fatui.png",
	GCG_TAG_CAMP_HILICHURL: "UI_Gcg_Tag_Faction_Hili.png",
	GCG_TAG_CAMP_MONSTER: "UI_Gcg_Tag_Faction_Monster.png",
	GCG_TAG_ARKHE_PNEUMA: "UI_Gcg_Tag_Faction_Pneuma.png",
	GCG_TAG_ARKHE_OUSIA: "UI_Gcg_Tag_Faction_Ousia.png",
	GCG_TAG_ADVENTURE_PLACE: "UI_Gcg_Tag_Card_Adventure.png",
};

// 效果文本默认（正文）颜色
export const EFFECT_TEXT_COLOR = "#333333";
