import {
	CANVAS_W,
	CANVAS_H,
	COST_DEFS,
	TAG_DEFS,
	HIDDEN_TAGS,
	assetsUrl,
} from "./constants.js";

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

function fitText(ctx, text, cx, cy, maxW) {
	ctx.fillText(text, cx, cy);
	const w = ctx.measureText(text).width;
	if (w <= maxW || !w) return;
	const ratio = maxW / w;
	let fs = Number.parseFloat(ctx.font) * ratio;
	ctx.font = ctx.font.replace(/\d+(\.\d+)?(?=px)/, fs.toFixed(1));
	ctx.fillText(text, cx, cy);
}

function splitLines(ctx, text, maxW) {
	if (!text) return [];
	const lines = [];
	let line = "";
	for (const ch of text) {
		const test = line + ch;
		if (ctx.measureText(test).width > maxW) {
			lines.push(line);
			line = ch;
		} else {
			line = test;
		}
	}
	if (line) lines.push(line);
	return lines;
}

async function drawDice(ctx, iconName, count, cx, cy, size) {
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
	ctx.fillStyle = "#fff";
	ctx.strokeStyle = "#000";
	ctx.lineWidth = size * 0.06;
	ctx.font = `bold ${size * 0.52}px sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.strokeText(String(count), cx, cy + 1);
	ctx.fillText(String(count), cx, cy + 1);
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
	fitText(ctx, name, x + w / 2, y + h / 2 + 1, w * 0.82);
}

async function drawTags(ctx, tags) {
	if (!tags.length) return;
	const W = CANVAS_W;
	const tagW = 7.6 * S; // 91.2px
	const tagH = 2.2 * S; // 26.4px
	const firstTagCy = 5.7 * S; // 68.4px
	const tagGap = 3 * S; // 36px (center to center)
	const tagCx = W - 8.1 * S; // 490.8px

	const fontSize = tagH * 0.58;
	const iconSz = tagH * 0.7;
	const padX = tagH * 0.15;

	ctx.font = `${fontSize}px 'HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`;
	let tagCy = firstTagCy;
	for (const tag of tags) {
		const tagTop = tagCy - tagH / 2;
		const tagLeft = tagCx - tagW / 2;
		ctx.fillStyle = "rgba(255,255,255,0.72)";
		rRect(ctx, tagLeft, tagTop, tagW, tagH, tagH / 2);
		ctx.fill();
		ctx.strokeStyle = "#c8b98b";
		ctx.lineWidth = 1;
		ctx.stroke();
		let tx = tagLeft + padX;
		if (tag.iconFile) {
			try {
				const img = await loadImg(assetsUrl(tag.iconFile));
				ctx.drawImage(img, tx, tagCy - iconSz / 2, iconSz, iconSz);
				tx += iconSz + padX;
			} catch (_) {}
		}
		ctx.fillStyle = "#8a7558";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		const textMaxW = tagLeft + tagW - padX - tx;
		fitText(ctx, tag.label, tx, tagCy + 1, textMaxW);
		tagCy += tagGap;
	}
}

async function drawEffect(ctx, text, x, y, w, h) {
	ctx.fillStyle = "rgba(255,255,255,0.88)";
	rRect(ctx, x, y, w, h, 12);
	ctx.fill();
	ctx.strokeStyle = "#eaeaea";
	ctx.lineWidth = 2;
	ctx.stroke();
	const pad = 10;
	const maxTxtW = w - pad * 2;
	const fs = 24;
	let cy = y + pad;
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "#333";
	ctx.font = `500 ${fs}px 'HYWH-55W','HYWH','Microsoft YaHei','Noto Sans SC',sans-serif`;
	const rawLines = (text || "").split("\n");
	for (const raw of rawLines) {
		const wrapped = splitLines(ctx, raw || " ", maxTxtW);
		for (const ln of wrapped) {
			if (cy + fs > y + h - pad) {
				ctx.fillText("…", x + pad, cy);
				return;
			}
			ctx.fillText(ln, x + pad, cy);
			cy += fs * 1.4;
		}
		cy += fs * 0.2;
	}
}

function drawFooter(ctx, left, right) {
	const W = CANVAS_W;
	const H = CANVAS_H;
	const fs = 14;
	const leftX = 5.3 * S; // 63.6px
	const rightX = W - 5.3 * S;
	const bottomY = H - 3.8 * S; // 404.4px
	ctx.fillStyle = "#b0b0b0";
	ctx.font = `${fs}px sans-serif`;
	ctx.textBaseline = "bottom";
	if (left) {
		ctx.textAlign = "left";
		ctx.fillText(left, leftX, bottomY);
	}
	if (right) {
		ctx.textAlign = "right";
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

	// background
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

	// cost dice — stacked vertically top-left
	const diceSize = 10 * S; // 120px
	const firstDiceCx = 7.9 * S; // 94.8px
	const firstDiceCy = 7.1 * S; // 85.2px
	const diceGap = 9.8 * S; // 117.6px center-to-center
	let diceCy = firstDiceCy;
	for (const item of costItems) {
		const def = COST_DEFS[item.type];
		if (!def) continue;
		await drawDice(ctx, def.icon, item.count, firstDiceCx, diceCy, diceSize);
		diceCy += diceGap;
	}

	// name banner: 31mm × 5mm, centered
	const bnW = 31 * S; // 492px
	const bnH = 5 * S; // 60px
	const bnX = (W - bnW) / 2; // 132px
	const bnY = firstDiceCy - bnH / 2 - S; // aligned with first dice, slightly up
	drawName(ctx, name, bnX, bnY, bnW, bnH);

	// tags
	await drawTags(ctx, tags);

	// effect area: 3.9mm from left/right, 6.6mm from bottom
	const effX = 3.9 * S; // 46.8px
	const effW = W - effX * 2; // 662.4px
	const effH = H - (3.9 + 6.6) * S - (H - effX * 2); // = H - 10.5*12 - top
	// Actually: bottom edge at 6.6mm from bottom, top edge at 3.9mm from sides
	// effY = H - effBottomMargin - effH, where effBottomMargin = 6.6mm
	// But we need effH. Let's compute: top of effect = some value
	// From spec:距左右两侧3.9mm, 距底部6.6mm → that gives X, width, and bottomY
	// We need to derive height. Let's use the bottom margin:
	const effBottomMargin = 6.6 * S; // 79.2px
	const effTopMargin = H - effBottomMargin; // bottom of effect area in canvas coords
	// We need a reasonable height. Let's compute from remaining space:
	// Top of card to top of effect area. Let's set a reasonable top.
	// From the spec, no top position is given for effect area. Let's use the space between name/tags and footer.
	// Name top ≈ 51px, name bottom ≈ 111px. Footer at ≈ 404px.
	// Effect top ≈ 140px (below tags), effect bottom = H - 6.6mm = 1056 - 79.2 = 976.8px
	// That's too tall. Let me use a more reasonable height.
	// Actually: effTop = tags area bottom + some margin. Tags first at 68px, last tag maybe at 68+36*4=212px.
	// Let's set effH based on remaining space with proper margins.
	// Better approach: the effect area spans from below the tags to above the footer text.
	// effTop = firstDiceCy + diceSize/2 + diceGap * (costItems.length-1) + some margin
	// Simplest: just set a fixed height based on the示例 proportions.
	// In示例: effect area height = 90px in 440px card = 20.5%
	// 88mm * 20.5% ≈ 18mm
	const effHeightMm = 18;
	const effHCalc = effHeightMm * S; // 216px
	const effYCalc = H - effBottomMargin - effHCalc; // 1056 - 79.2 - 216 = 760.8px
	await drawEffect(ctx, effectText, effX, effYCalc, effW, effHCalc);

	// footer
	drawFooter(ctx, footerLeft, footerRight);

	return canvas;
}
