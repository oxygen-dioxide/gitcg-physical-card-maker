import {
	CARD_TYPE_LABELS,
	COST_DEFS,
	TAG_DEFS,
	HIDDEN_TAGS,
	assetsUrl,
} from "./constants.js";
import { CARDS, imageUrlFor } from "./data.js";
import { renderCard } from "./renderer.js";
import { createCropEditor } from "./crop.js";
import { rawToMarkdown } from "./description.js";

let cropEditor = null;
let bgImage = null;
let allTags = [];

function el(tag, attrs, children) {
	const e = document.createElement(tag);
	if (attrs)
		Object.entries(attrs).forEach(([k, v]) => {
			if (k === "className") e.className = v;
			else if (k.startsWith("on"))
				e.addEventListener(k.slice(2).toLowerCase(), v);
			else if (k === "html") e.innerHTML = v;
			else if (k === "text") e.textContent = v;
			else e.setAttribute(k, v);
		});
	if (typeof children === "string") e.textContent = children;
	else if (Array.isArray(children))
		children.forEach((c) => {
			if (c) e.appendChild(c);
		});
	else if (children) e.appendChild(children);
	return e;
}

function getCostInputs() {
	const costSelects = document.querySelectorAll(".cost-row select");
	const costNums = document.querySelectorAll('.cost-row input[type="number"]');
	const items = [];
	costSelects.forEach((sel, i) => {
		const count = parseInt(costNums[i]?.value) || 0;
		if (sel.value) items.push({ type: sel.value, count });
	});
	return items;
}

function updatePreview() {
	renderCard({
		backgroundImage: bgImage,
		costItems: getCostInputs(),
		name: document.getElementById("name-input")?.value || "",
		tags: allTags,
		effectText: document.getElementById("effect-text")?.value || "",
		footerLeft: document.getElementById("footer-left")?.value || "",
		footerRight: document.getElementById("footer-right")?.value || "",
	}).then((canvas) => {
		const preview = document.getElementById("card-preview");
		preview.innerHTML = "";
		canvas.style.width = "100%";
		canvas.style.height = "auto";
		canvas.style.borderRadius = "12px";
		canvas.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
		preview.appendChild(canvas);
	});
}

function downloadCard() {
	renderCard({
		backgroundImage: bgImage,
		costItems: getCostInputs(),
		name: document.getElementById("name-input")?.value || "",
		tags: allTags,
		effectText: document.getElementById("effect-text")?.value || "",
		footerLeft: document.getElementById("footer-left")?.value || "",
		footerRight: document.getElementById("footer-right")?.value || "",
	}).then((canvas) => {
		const a = document.createElement("a");
		a.download =
			(document.getElementById("name-input")?.value || "card") + ".png";
		a.href = canvas.toDataURL("image/png");
		a.click();
	});
}

function createCostRow(index, type, count) {
	const row = el("div", { className: "cost-row" });
	const sel = el("select", { className: "cost-type" }, null);
	sel.appendChild(el("option", { value: "" }, "—"));
	Object.entries(COST_DEFS).forEach(([k, v]) => {
		sel.appendChild(
			el("option", { value: k }, v.label + " " + k.split("_").pop()),
		);
	});
	if (type) sel.value = type;
	const num = el("input", {
		type: "number",
		min: "0",
		max: "10",
		value: String(count || 0),
		className: "cost-count",
	});
	const addBtn = el("button", { className: "btn btn-sm", text: "+" });
	const delBtn = el("button", { className: "btn btn-sm btn-del", text: "×" });
	row.append(sel, num, addBtn, delBtn);
	return row;
}

function addCostRow(type, count) {
	const container = document.getElementById("cost-list");
	container.appendChild(createCostRow(Date.now(), type, count));
	bindCostEvents();
}

function bindCostEvents() {
	document.querySelectorAll("#cost-list .cost-row select").forEach((s) => {
		s.onchange = updatePreview;
	});
	document
		.querySelectorAll('#cost-list .cost-row input[type="number"]')
		.forEach((s) => {
			s.oninput = updatePreview;
		});
	document.querySelectorAll("#cost-list .cost-row .btn-del").forEach((b) => {
		b.onclick = function () {
			this.closest(".cost-row").remove();
			updatePreview();
		};
	});
	document
		.querySelectorAll("#cost-list .cost-row .btn:not(.btn-del)")
		.forEach((b) => {
			b.onclick = function () {
				const row = this.closest(".cost-row");
				const sel = row.querySelector("select");
				const num = row.querySelector('input[type="number"]');
				addCostRow(sel.value, num.value);
			};
		});
}

function renderTagDisplay() {
	const tagDisplay = document.getElementById("tag-display");
	tagDisplay.innerHTML = "";
	allTags.forEach((t, i) => {
		const chip = el("span", { className: "tag-chip" });
		if (t.iconFile) {
			chip.appendChild(
				el("img", {
					src: assetsUrl(t.iconFile),
					style: "width:14px;height:14px;",
				}),
			);
		}
		chip.append(el("span", null, t.label));
		const x = el("button", { className: "tag-del", text: "×" });
		x.onclick = () => {
			allTags.splice(i, 1);
			renderTagDisplay();
			updatePreview();
		};
		chip.appendChild(x);
		tagDisplay.appendChild(chip);
	});
}

function initTagEditor() {
	const tagSelect = document.getElementById("tag-select");
	tagSelect.innerHTML = '<option value="">选择标签...</option>';
	Object.entries(TAG_DEFS).forEach(([k, v]) => {
		if (!HIDDEN_TAGS.has(k)) {
			tagSelect.appendChild(el("option", { value: k }, v.label));
		}
	});
	tagSelect.onchange = function () {
		if (!this.value) return;
		const def = TAG_DEFS[this.value];
		if (def && !allTags.find((t) => t.key === this.value)) {
			allTags.push({ key: this.value, label: def.label, iconFile: def.icon });
		}
		this.value = "";
		renderTagDisplay();
		updatePreview();
	};
}

function selectCard(card) {
	const typeName = CARD_TYPE_LABELS[card.type] || "";

	allTags = [];
	(card.tags || []).forEach((t) => {
		const def = TAG_DEFS[t];
		if (def && !HIDDEN_TAGS.has(t))
			allTags.push({ key: t, label: def.label, iconFile: def.icon });
	});
	if (typeName && !allTags.find((t) => t.label === typeName)) {
		allTags.unshift({ key: "_type", label: typeName, iconFile: null });
	}

	const costList = document.getElementById("cost-list");
	costList.innerHTML = "";
	(card.playCost || []).forEach((c) => addCostRow(c.type, c.count));
	if (!(card.playCost && card.playCost.length))
		addCostRow("GCG_COST_DICE_SAME", 0);

	document.getElementById("name-input").value = card.name || "";
	document.getElementById("effect-text").value = rawToMarkdown(card.rawDescription) || card.description || "";
	document.getElementById("footer-left").value = "©miHoYo  ©SHININGSOUL";
	document.getElementById("footer-right").value = "ID: " + card.id;

	renderTagDisplay();
	updatePreview();
}

let pickedCardId = null;

function renderCardList(keyword) {
	const cardList = document.getElementById("card-list");
	const kw = String(keyword || "")
		.trim()
		.toLowerCase();
	const filtered = kw
		? CARDS.filter((c) => {
				const inName = (c.name || "").toLowerCase().includes(kw);
				const inEn = (c.englishName || "").toLowerCase().includes(kw);
				const inId = String(c.id).includes(kw);
				return inName || inEn || inId;
			})
		: CARDS.slice(0, 80);
	cardList.innerHTML = "";
	const shown = filtered.slice(0, 200);
	shown.forEach((card) => {
		const item = el("div", { className: "card-list-item" });
		item.addEventListener("click", () => {
			pickedCardId = card.id;
			const info = document.getElementById("picked-card-info");
			info.textContent = `已选: ${card.name} (${card.id})`;
			const imgUrl = imageUrlFor(card.id);
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				bgImage = img;
				const cropContainer = document.getElementById("crop-container");
				if (cropEditor) cropEditor.destroy();
				cropEditor = createCropEditor(cropContainer, img, (cropped) => {
					bgImage = cropped;
					updatePreview();
				});
			};
			img.src = imgUrl;
			selectCard(card);
		});
		const thumb = el("img", {
			src: imageUrlFor(card.id),
			className: "card-thumb",
			loading: "lazy",
		});
		const info = el("div", { className: "card-item-info" }, [
			el("div", { className: "card-item-name", text: card.name }),
			el("div", { className: "card-item-id", text: String(card.id) }),
		]);
		item.append(thumb, info);
		cardList.appendChild(item);
	});
}

export function init() {
	const app = document.getElementById("app");
	app.innerHTML = `
  <div class="app-container">
    <div class="panel">
      <h2>七圣召唤卡牌制作器</h2>
      <div class="section">
        <h3>背景图</h3>
        <input type="file" id="bg-upload" accept="image/*" />
        <div id="crop-container" class="crop-container"></div>
      </div>
      <div class="section">
        <h3>从数据库选择行动牌</h3>
        <div class="card-picker">
          <input type="text" id="card-search" placeholder="搜索卡名或ID..." />
          <div id="card-list" class="card-list"></div>
          <div id="picked-card-info" class="picked-info"></div>
        </div>
      </div>
      <div class="section">
        <h3>费用</h3>
        <div id="cost-list"></div>
        <button id="add-cost-btn" class="btn btn-sm" style="margin-top:4px">+ 添加费用</button>
      </div>
      <div class="section">
        <label>名称</label>
        <input type="text" id="name-input" placeholder="卡牌名称" />
      </div>
      <div class="section">
        <label>标签</label>
        <div id="tag-display" class="tag-display"></div>
        <select id="tag-select"><option value="">选择标签...</option></select>
      </div>
      <div class="section">
        <label>效果描述</label>
        <textarea id="effect-text" rows="3" placeholder="支持 **粗体**、*斜体*、&lt;color=#RRGGBBAA&gt;颜色&lt;/color&gt;、![](图标编号)、{{关键词名}}"></textarea>
      </div>
      <div class="section row-2">
        <div>
          <label>左下角文本</label>
          <input type="text" id="footer-left" placeholder="©miHoYo  ©SHININGSOUL" />
        </div>
        <div>
          <label>右下角文本</label>
          <input type="text" id="footer-right" placeholder="编号等" />
        </div>
      </div>
      <button id="download-btn" class="btn btn-primary">下载卡片</button>
    </div>
    <div class="preview-panel">
      <h3>预览</h3>
      <div id="card-preview" class="card-preview"></div>
    </div>
  </div>
  `;

	document.getElementById("bg-upload").addEventListener("change", (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				bgImage = img;
				const cropContainer = document.getElementById("crop-container");
				if (cropEditor) cropEditor.destroy();
				cropEditor = createCropEditor(cropContainer, img, (cropped) => {
					bgImage = cropped;
					updatePreview();
				});
			};
			img.src = reader.result;
		};
		reader.readAsDataURL(file);
	});

	document.getElementById("card-search").oninput = function () {
		renderCardList(this.value);
	};
	renderCardList("");

	document.getElementById("add-cost-btn").onclick = () => {
		addCostRow("", 0);
	};

	initTagEditor();

	document.getElementById("name-input").oninput = updatePreview;
	document.getElementById("effect-text").oninput = updatePreview;
	document.getElementById("footer-left").oninput = updatePreview;
	document.getElementById("footer-right").oninput = updatePreview;

	document.getElementById("download-btn").onclick = downloadCard;

	updatePreview();
}
