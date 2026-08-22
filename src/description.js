// 效果描述文本的处理：
//  - rawToMarkdown：把数据库里的 rawDescription 转换成编辑框使用的标记文本
//    （**粗体**、*斜体*、<color=#..>、![](id)、{{关键词名}}）。
//  - parseMarkdown：把标记文本解析成一串可绘制的 span（text / icon / br）。
import { CARDS } from "./data.js";
import charactersData from "../data/7.0.0/CHS/characters.json";
import entitiesData from "../data/7.0.0/CHS/entities.json";
import keywordsData from "../data/7.0.0/CHS/keywords.json";

// ---------- 数据库索引 ----------
const charsById = new Map();
const skillsById = new Map();
for (const c of charactersData.data) {
	charsById.set(c.id, c);
	for (const s of c.skills || []) skillsById.set(s.id, s);
}
const entitiesById = new Map();
for (const e of entitiesData.data) entitiesById.set(e.id, e);
const cardsById = new Map();
for (const c of CARDS) cardsById.set(c.id, c);

const keywordsById = new Map();
const keywordsByName = new Map();
for (const k of keywordsData.data) {
	keywordsById.set(k.id, k);
	if (k.name) keywordsByName.set(k.name, k);
}

const WHITE_COLOR = "FFFFFFFF";

function hexToCss(hex) {
	const s = (hex || "").replace(/^#/, "");
	if (s.length === 8) {
		const r = parseInt(s.slice(0, 2), 16);
		const g = parseInt(s.slice(2, 4), 16);
		const b = parseInt(s.slice(4, 6), 16);
		const a = (parseInt(s.slice(6, 8), 16) / 255).toFixed(3);
		return `rgba(${r},${g},${b},${a})`;
	}
	return `#${s}`;
}

// ---------- rawDescription → 标记文本 ----------
const COLOR_OPEN_RE = /^<color=#([0-9A-Fa-f]{8})>/;
const COLOR_CLOSE_RE = /^<\/color>/;
const SPRITE_RE = /^\{SPRITE_PRESET#(\d+)\}/;
const REF_RE = /^\$\[([ACSK])(\d+)\]/;

function resolveRef(type, num) {
	if (type === "K") {
		// 关键词 id 为负数：$[K1] → 关键词 id -1
		const k = keywordsById.get(-num) || keywordsById.get(num);
		if (k) return `{{${k.name}}}`;
		return `$[K${num}]`;
	}
	let name = null;
	if (type === "A") name = charsById.get(num)?.name;
	else if (type === "S") name = skillsById.get(num)?.name;
	else if (type === "C") {
		name = entitiesById.get(num)?.name || cardsById.get(num)?.name;
	}
	return name || `$[${type}${num}]`;
}

export function rawToMarkdown(raw, inline) {
	if (!raw) return "";
	const src = String(raw);
	const out = [];
	let i = 0;
	let atLineStart = !inline;
	while (i < src.length) {
		const rest = src.slice(i);
		let m;
		if ((m = rest.match(COLOR_OPEN_RE))) {
			const hex = m[1];
			const end = src.indexOf("</color>", i);
			const endIdx = end === -1 ? src.length : end;
			const inner = src.slice(i + m[0].length, endIdx);
			const converted = rawToMarkdown(inner, true);
			if (hex.toUpperCase() === WHITE_COLOR) {
				out.push(`**${converted}**`);
			} else if (/^\{\{[^{}]*\}\}$/.test(converted)) {
				// 关键词引用有内部颜色，外部颜色被覆盖（内部颜色优先）。
				out.push(`**${converted}**`);
			} else {
				out.push(`<color=#${hex}>**${converted}**</color>`);
			}
			atLineStart = false;
			i = endIdx + (end === -1 ? 0 : "</color>".length);
			continue;
		}
		if ((m = rest.match(COLOR_CLOSE_RE))) {
			i += m[0].length;
			continue;
		}
		if ((m = rest.match(SPRITE_RE))) {
			out.push(`![](${m[1]})`);
			atLineStart = false;
			i += m[0].length;
			continue;
		}
		if ((m = rest.match(REF_RE))) {
			const refType = m[1];
			const refText = resolveRef(refType, Number(m[2]));
			if (refType === "A" && atLineStart) {
				out.push(`**${refText}**`);
			} else {
				out.push(refText);
			}
			atLineStart = false;
			i += m[0].length;
			continue;
		}
		if (rest.startsWith("\\n")) {
			out.push("\n");
			atLineStart = true;
			i += 2;
			continue;
		}
		const ch = src[i];
		if (ch === "（" || ch === "(") {
			out.push(`*${ch}`);
			atLineStart = false;
			i += 1;
			continue;
		}
		if (ch === "）" || ch === ")") {
			out.push(`${ch}*`);
			atLineStart = false;
			i += 1;
			continue;
		}
		out.push(ch);
		atLineStart = false;
		i += 1;
	}
	return out.join("");
}

// ---------- 标记文本 → span 列表 ----------
const MARK_OPEN_RE = /^<color=#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6})>/;
const MARK_ICON_RE = /^!\[\]\((\d+)\)/;
const MARK_KEYWORD_RE = /^\{\{([^{}]*)\}\}/;

function expandKeyword(name, out, outer) {
	const k = keywordsByName.get(name);
	if (!k) {
		out.push({
			kind: "text",
			text: `{{${name}}}`,
			bold: outer.bold,
			italic: outer.italic,
			color: outer.color,
		});
		return;
	}
	const sub = parseMarkdown(rawToMarkdown(k.rawName), { depth: outer.depth });
	for (const it of sub) {
		if (it.kind === "br") continue;
		if (it.kind === "icon") {
			out.push(it);
			continue;
		}
		out.push({
			kind: "text",
			text: it.text,
			// 外部粗体/斜体仍然生效；内部颜色优先。
			bold: outer.bold || it.bold,
			italic: outer.italic || it.italic,
			color: it.color ?? outer.color,
		});
	}
}

export function parseMarkdown(md, opts) {
	if (!md) return [];
	const src = String(md);
	const depth = (opts && opts.depth) || 0;
	if (depth > 6)
		return [
			{ kind: "text", text: src, bold: false, italic: false, color: null },
		];
	const items = [];
	let bold = false;
	let italic = false;
	const colorStack = [];
	let buf = "";
	const flush = () => {
		if (!buf) return;
		items.push({
			kind: "text",
			text: buf,
			bold,
			italic,
			color: colorStack.length ? colorStack[colorStack.length - 1] : null,
		});
		buf = "";
	};
	let i = 0;
	while (i < src.length) {
		const rest = src.slice(i);
		let m;
		if (rest.startsWith("**")) {
			flush();
			bold = !bold;
			i += 2;
			continue;
		}
		if (rest.startsWith("*")) {
			flush();
			italic = !italic;
			i += 1;
			continue;
		}
		if ((m = rest.match(MARK_OPEN_RE))) {
			flush();
			if (m[1].toUpperCase() === WHITE_COLOR) {
				bold = !bold;
			} else {
				colorStack.push(hexToCss(m[1]));
			}
			i += m[0].length;
			continue;
		}
		if (rest.startsWith("</color>")) {
			flush();
			colorStack.pop();
			i += "</color>".length;
			continue;
		}
		if ((m = rest.match(MARK_ICON_RE))) {
			flush();
			items.push({ kind: "icon", iconId: Number(m[1]) });
			i += m[0].length;
			continue;
		}
		if ((m = rest.match(MARK_KEYWORD_RE))) {
			flush();
			expandKeyword(m[1], items, {
				bold,
				italic,
				color: colorStack.length ? colorStack[colorStack.length - 1] : null,
				depth: depth + 1,
			});
			i += m[0].length;
			continue;
		}
		if (rest.startsWith("\n")) {
			flush();
			items.push({ kind: "br" });
			i += 1;
			continue;
		}
		buf += src[i];
		i += 1;
	}
	flush();
	return items;
}

export { hexToCss };
