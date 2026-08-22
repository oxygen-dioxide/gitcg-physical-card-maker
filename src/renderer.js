import {
	CANVAS_W,
	CANVAS_H,
	COST_DEFS,
	TAG_DEFS,
	HIDDEN_TAGS,
	DESCRIPTION_ICON_IMAGES,
	TAG_ICON_ASSETS,
	assetsUrl,
	assetsTagsUrl,
} from "./constants.js";
import { parseMarkdown } from "./description.js";

const S = 12; // scale: 1mm = 12px

const imgCache = new Map();

function loadImg(src) {
	if (imgCache.has(src)) return imgCache.get(src);
	const p = new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Failed: " + src));
		img.src = src;
	});
	imgCache.set(src, p);
	return p;
}

function rRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

function diamond(ctx, cx, cy, r) {
	ctx.beginPath();
	ctx.moveTo(cx, cy - r);
	ctx.lineTo(cx + r, cy);
	ctx.lineTo(cx, cy + r);
	ctx.lineTo(cx - r, cy);
	ctx.closePath();
	ctx.fill();
}

// Measure text and shrink the font to fit maxW, without drawing.
// Returns the final rendered text width.
function measureFit(ctx, text, maxW) {
	let w = ctx.measureText(text).width;
	if (w > maxW && w) {
		const ratio = maxW / w;
		const fs = Number.parseFloat(ctx.font) * ratio;
		ctx.font = ctx.font.replace(/\d+(\.\d+)?(?=px)/, fs.toFixed(1));
		w = ctx.measureText(text).width;
	}
	return w;
}

function fitText(ctx, text, cx, cy, maxW) {
	ctx.fillText(text, cx, cy);
	measureFit(ctx, text, maxW);
	ctx.fillText(text, cx, cy);
}

async function drawDice(ctx, iconName, count, cx, cy, size, showCount = true) {
	const x = cx - size / 2;
	const y = cy - size / 2;
	try {
		const icon = await loadImg(assetsUrl(iconName));
		const pad = size * 0.06;
		const iconSz = size - pad * 2;
		ctx.save();
		ctx.shadowColor = "rgba(255,255,200,0.55)";
		ctx.shadowBlur = size * 0.1;
		ctx.drawImage(icon, x + pad, y + pad, iconSz, iconSz);
		ctx.restore();
	} catch (_) {
		ctx.fillStyle = "#e8d98e";
		rRect(ctx, x, y, size, size, size * 0.18);
		ctx.fill();
	}
	// 秘传（GCG_COST_LEGEND）只显示图标，不显示数字。
	if (!showCount) return;
	ctx.fillStyle = "#fff";
	ctx.strokeStyle = "#000";
	ctx.lineWidth = size * 0.06;
	ctx.font = `bold ${size * 0.5}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.strokeText(String(count), cx, cy + 6);
	ctx.fillText(String(count), cx, cy + 6);
}

function drawName(ctx, name, x, y, w, h) {
	const g = ctx.createLinearGradient(0, y, 0, y + h);
	g.addColorStop(0, "#e9e2cc");
	g.addColorStop(1, "#fbf8ee");
	ctx.fillStyle = g;
	rRect(ctx, x, y, w, h, h / 2);
	ctx.fill();
	ctx.lineWidth = h * 0.09;
	ctx.strokeStyle = "#c8b98b";
	ctx.stroke();
	ctx.fillStyle = "#c8b98b";
	diamond(ctx, x + h / 2, y + h / 2, h * 0.16);
	diamond(ctx, x + w - h / 2, y + h / 2, h * 0.16);
	ctx.fillStyle = "#ac7e51";
	ctx.font = `bold ${h * 0.6}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	fitText(ctx, name, x + w / 2, y + h / 2 + 3, w * 0.82);
}

async function drawTags(ctx, tags) {
	if (!tags.length) return;
	const W = CANVAS_W;
	const tagW = 7.6 * S; // 91.2px
	const tagH = 2.2 * S; // 26.4px
	const firstTagCy = 5.7 * S; // 68.4px
	const tagGap = 3 * S; // 36px (center to center)
	const tagCx = W - 8.1 * S; // 490.8px

	const fontSize = tagH * 0.7;
	const iconSz = tagH * 0.7;
	const padX = tagH * 0.15;

	ctx.font = `${fontSize}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`;
	let tagCy = firstTagCy;
	for (const tag of tags) {
		const tagTop = tagCy - tagH / 2;
		const tagLeft = tagCx - tagW / 2;
		ctx.fillStyle = "#ac7e51";
		rRect(ctx, tagLeft, tagTop, tagW, tagH, tagH / 2);
		ctx.fill();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#ffffff";
		ctx.font = `${fontSize}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`;

		// icon + text rendered as one centered group inside the capsule
		let icon = null;
		if (tag.iconFile) {
			try {
				icon = await loadImg(assetsTagsUrl(tag.iconFile));
			} catch (_) {}
		}
		const iconPad = icon ? iconSz + padX : 0;
		const textMaxW = tagW - 2 * padX - iconPad;
		const textW = measureFit(ctx, tag.label, textMaxW);
		const contentW = textW + iconPad;

		let gx = tagCx - contentW / 2;
		if (icon) {
			ctx.drawImage(icon, gx, tagCy - iconSz / 2, iconSz, iconSz);
			gx += iconSz + padX;
		}
		ctx.fillText(tag.label, gx, tagCy + 1);
		tagCy += tagGap;
	}
}

function applyFont(ctx, fs, item) {
	const fam = item.bold ? "'HYWH'" : "'HYWH-55W','HYWH'";
	ctx.font = `500 ${fs}px ${fam},'Microsoft YaHei','Noto Sans SC',sans-serif`;
}

// 将 span 流按宽度折行，返回各行（每行是 span 数组）以及图标尺寸。
// 换行以单个字符为单位，与加粗/斜体/颜色的边界无关：只有当前行真正放不下
// 下一个字符时才换行；同一行内相邻且样式相同的字符会合并回一个文本 span，
// 以便整段一起描边/填充。
function layoutItems(ctx, items, fs, maxW) {
	const iconSize = Math.round(fs * 1.25);
	const lines = [];
	let cur = []; // 当前行的原子：{kind:'icon'} 或 {kind:'text', ch, bold, italic, color}
	let w = 0;
	const pushLine = () => {
		// 把相邻、样式相同的文本字符合并成一个 span，再作为一行输出。
		const run = [];
		let last = null;
		for (const atom of cur) {
			if (atom.kind === "text") {
				if (
					last &&
					last.kind === "text" &&
					last.bold === atom.bold &&
					last.italic === atom.italic &&
					last.color === atom.color
				) {
					last.text += atom.ch;
				} else {
					last = {
						kind: "text",
						text: atom.ch,
						bold: atom.bold,
						italic: atom.italic,
						color: atom.color,
					};
					run.push(last);
				}
			} else {
				run.push(atom);
				last = null;
			}
		}
		lines.push(run);
		cur = [];
		w = 0;
	};
	for (const item of items) {
		if (item.kind === "br") {
			if (cur.length) pushLine();
			continue;
		}
		if (item.kind === "icon") {
			if (w > 0 && w + iconSize > maxW) pushLine();
			cur.push({ kind: "icon", iconId: item.iconId });
			w += iconSize;
			continue;
		}
		// 文本：逐字符填充，满了再换行。
		for (const ch of Array.from(item.text)) {
			applyFont(ctx, fs, item);
			const cw = ctx.measureText(ch).width;
			if (w > 0 && w + cw > maxW) pushLine();
			cur.push({
				kind: "text",
				ch,
				bold: item.bold,
				italic: item.italic,
				color: item.color,
			});
			w += cw;
		}
	}
	if (cur.length) pushLine();
	return { lines, iconSize };
}

// 把图标绘制成正方形。资源可用则画图片，否则画黑色正方形。
async function drawIcon(ctx, iconId, x, y, size) {
	const def = DESCRIPTION_ICON_IMAGES[iconId];
	let src = null;
	if (def && def.image) src = assetsUrl(def.image);
	else if (def && def.tagIcon) {
		const f = TAG_ICON_ASSETS[def.tagIcon];
		if (f) src = assetsTagsUrl(f);
	}
	if (src) {
		try {
			const img = await loadImg(src);
			ctx.drawImage(img, x, y, size, size);
			return;
		} catch (_) {}
	}
	ctx.fillStyle = "#000";
	ctx.fillRect(x, y, size, size);
}

async function drawEffect(ctx, items, x, y, w, h) {
	ctx.fillStyle = "rgba(255,255,255,0.6)";
	rRect(ctx, x, y, w, h, 12);
	ctx.fill();
	ctx.strokeStyle = "#eaeaea";
	ctx.lineWidth = 2;
	ctx.stroke();
	const pad = 1.4 * S; // 16.8px
	const maxTxtW = w - pad * 2;
	const fs = 24;
	const { lines, iconSize } = layoutItems(ctx, items, fs, maxTxtW);
	const lineH = fs * 1.4;
	const iconOffset = (fs - iconSize) / 2;
	let cy = y + pad;
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 5;
	for (const line of lines) {
		if (cy + fs > y + h - pad) {
			ctx.fillStyle = "#333";
			ctx.font = `500 ${fs}px 'HYWH-55W','HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`;
			ctx.fillText("…", x + pad, cy);
			return;
		}
		let cx = x + pad;
		for (const item of line) {
			if (item.kind === "icon") {
				await drawIcon(ctx, item.iconId, cx, cy + iconOffset, iconSize);
				cx += iconSize;
				continue;
			}
			applyFont(ctx, fs, item);
			ctx.fillStyle = item.color || "#333";
			if (item.italic) {
				// 以文本起点为锚点向右倾斜（负剪切系数 → 右上倾），且不改变锚点位置。
				ctx.save();
				ctx.translate(cx, cy);
				ctx.transform(1, 0, -0.25, 1, 0, 0);
				ctx.translate(-cx, -cy);
				ctx.strokeText(item.text, cx, cy);
				ctx.fillText(item.text, cx, cy);
				ctx.restore();
			} else {
				ctx.strokeText(item.text, cx, cy);
				ctx.fillText(item.text, cx, cy);
			}
			cx += ctx.measureText(item.text).width;
		}
		cy += lineH;
	}
}

function drawFooter(ctx, left, right) {
	const W = CANVAS_W;
	const H = CANVAS_H;
	const fs = 18;
	const leftX = 5.3 * S; // 63.6px
	const rightX = W - 5.3 * S;
	const bottomY = H - 3.8 * S; // 404.4px
	ctx.strokeStyle = "#ffffff";
	ctx.fillStyle = "#000000";
	ctx.font = `${fs}px sans-serif`;
	ctx.textBaseline = "bottom";
	if (left) {
		ctx.textAlign = "left";
		ctx.strokeText(left, leftX, bottomY);
		ctx.fillText(left, leftX, bottomY);
	}
	if (right) {
		ctx.textAlign = "right";
		ctx.strokeText(right, rightX, bottomY);
		ctx.fillText(right, rightX, bottomY);
	}
}

export async function renderCard(opts) {
	const {
		backgroundImage,
		costItems = [],
		name = "",
		tags = [],
		effectText = "",
		footerLeft = "",
		footerRight = "",
	} = opts;

	const canvas = document.createElement("canvas");
	canvas.width = CANVAS_W;
	canvas.height = CANVAS_H;
	const ctx = canvas.getContext("2d");
	const W = CANVAS_W;
	const H = CANVAS_H;

	// background (背景图)
	if (backgroundImage) {
		const iw = backgroundImage.naturalWidth || backgroundImage.width;
		const ih = backgroundImage.naturalHeight || backgroundImage.height;
		const s = Math.max(W / iw, H / ih);
		ctx.drawImage(
			backgroundImage,
			(W - iw * s) / 2,
			(H - ih * s) / 2,
			iw * s,
			ih * s,
		);
	} else {
		const g = ctx.createLinearGradient(0, 0, 0, H);
		g.addColorStop(0, "#3a3a3a");
		g.addColorStop(1, "#222");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
		ctx.fillStyle = "#888";
		ctx.font = `${W * 0.06}px sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("请上传背景图", W / 2, H / 2);
	}

	// cost dice (费用)
	// stacked vertically top-left
	const diceSize = 10 * S; // 120px
	const firstDiceCx = 7.9 * S; // 94.8px
	const firstDiceCy = 7.1 * S; // 85.2px
	const diceGap = 9.8 * S; // 117.6px center-to-center
	let diceCy = firstDiceCy;
	for (const item of costItems) {
		const def = COST_DEFS[item.type];
		if (!def) continue;
		const showCount = item.type !== "GCG_COST_LEGEND";
		await drawDice(
			ctx,
			def.icon,
			item.count,
			firstDiceCx,
			diceCy,
			diceSize,
			showCount,
		);
		diceCy += diceGap;
	}

	// name banner (名称)
	// 31mm × 5mm, centered
	const bnW = 31 * S; // 492px
	const bnH = 5 * S; // 60px
	const bnX = (W - bnW) / 2; // 132px
	const bnY = firstDiceCy - bnH / 2; // aligned with first dice, slightly up
	drawName(ctx, name, bnX, bnY, bnW, bnH);

	// tags (标签)
	await drawTags(ctx, tags);

	// effect area (效果描述) — 自适应高度
	// 3.9mm from left/right, 6.6mm from bottom; 高度根据文本量自动伸缩
	const effX = 3.9 * S; // 46.8px
	const effW = W - effX * 2; // 662.4px
	const effBottomMargin = 6.6 * S; // 79.2px
	const effPad = 1.4 * S; // 16.8px
	const effFs = 24; // 与 drawEffect 中的字号保持一致
	const effMaxTxtW = effW - effPad * 2;

	// 解析标记文本 → span 流，并按固定宽度折行得到总行数。
	const effItems = parseMarkdown(effectText || "");
	const { lines: effLines } = layoutItems(ctx, effItems, effFs, effMaxTxtW);
	const effLineH = effFs * 1.4;
	const effRawSpacing = effFs * 0.2;
	let effLineCount = effLines.length;
	const effRawCount = effItems.filter((it) => it.kind === "br").length + 1;

	let effH =
		effPad * 2 + effLineCount * effLineH + (effRawCount - 1) * effRawSpacing;

	// 不让文本框向上越过名称条，避免重叠
	const effMinY = bnY + bnH + S;
	const effMaxH = H - effBottomMargin - effMinY;
	if (effH > effMaxH) effH = effMaxH;

	const effY = H - effBottomMargin - effH;
	await drawEffect(ctx, effItems, effX, effY, effW, effH);

	// footer (页脚，包括左下角文本和右下角文本)
	drawFooter(ctx, footerLeft, footerRight);

	return canvas;
}
