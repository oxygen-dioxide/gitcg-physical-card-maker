const CARD_RATIO = 88 / 63;
const PREVIEW_WIDTH = 1760;
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH / CARD_RATIO);
const DATA_PATH = "./data/6.7.0/CHS/action_cards.json";

const COST_OPTIONS = [
  "GCG_COST_DICE_CRYO",
  "GCG_COST_DICE_HYDRO",
  "GCG_COST_DICE_PYRO",
  "GCG_COST_DICE_ELECTRO",
  "GCG_COST_DICE_ANEMO",
  "GCG_COST_DICE_GEO",
  "GCG_COST_DICE_DENDRO",
  "GCG_COST_DICE_VOID",
  "GCG_COST_DICE_SAME",
  "GCG_COST_ENERGY",
  "GCG_COST_LEGEND",
];

const COST_META = {
  GCG_COST_DICE_CRYO: { label: "冰元素骰", short: "冰", fill: "#a2f0ff", text: "#133546" },
  GCG_COST_DICE_HYDRO: { label: "水元素骰", short: "水", fill: "#74cbff", text: "#133046" },
  GCG_COST_DICE_PYRO: { label: "火元素骰", short: "火", fill: "#ff8f70", text: "#461d14" },
  GCG_COST_DICE_ELECTRO: { label: "雷元素骰", short: "雷", fill: "#c69bff", text: "#2d1846" },
  GCG_COST_DICE_ANEMO: { label: "风元素骰", short: "风", fill: "#8ef7d5", text: "#133f38" },
  GCG_COST_DICE_GEO: { label: "岩元素骰", short: "岩", fill: "#f6ca6a", text: "#4a3610" },
  GCG_COST_DICE_DENDRO: { label: "草元素骰", short: "草", fill: "#a5ec77", text: "#234414" },
  GCG_COST_DICE_VOID: { label: "任意骰", short: "任", fill: "#f4f1eb", text: "#2f3138" },
  GCG_COST_DICE_SAME: { label: "同色骰", short: "同", fill: "#ded4ff", text: "#2b2050" },
  GCG_COST_ENERGY: { label: "能量", short: "能", fill: "#ffcb55", text: "#4b3510" },
  GCG_COST_LEGEND: { label: "秘传", short: "秘", fill: "#efe0ff", text: "#432750" },
};

const TYPE_LABELS = {
  GCG_CARD_EVENT: "事件牌",
  GCG_CARD_ASSIST: "支援牌",
  GCG_CARD_MODIFY: "装备牌",
};

const TAG_LABELS = {
  GCG_TAG_TALENT: "天赋",
  GCG_TAG_SLOWLY: "战斗行动",
  GCG_TAG_FOOD: "料理",
  GCG_TAG_PLACE: "场地",
  GCG_TAG_ALLY: "伙伴",
  GCG_TAG_ITEM: "道具",
  GCG_TAG_WEAPON: "武器",
  GCG_TAG_ARTIFACT: "圣遗物",
  GCG_TAG_TECHNIQUE: "特技",
  GCG_TAG_LEGEND: "秘传",
  GCG_TAG_ARCANE_LEGEND: "秘传",
  GCG_TAG_SUB_HURT: "减伤",
  GCG_TAG_VEHICLE: "特技",
  GCG_TAG_NATION_SIMULANKA: "希穆兰卡",
};

const OMITTED_TAGS = new Set(["GCG_TAG_NON_DISCOVERABLE"]);

const elements = {
  cardSearch: document.querySelector("#card-search"),
  cardOptions: document.querySelector("#card-options"),
  applyCard: document.querySelector("#apply-card"),
  loadRemoteImage: document.querySelector("#load-remote-image"),
  cardMeta: document.querySelector("#card-meta"),
  imageUpload: document.querySelector("#image-upload"),
  cropEditor: document.querySelector("#crop-editor"),
  zoomRange: document.querySelector("#zoom-range"),
  offsetXRange: document.querySelector("#offset-x-range"),
  offsetYRange: document.querySelector("#offset-y-range"),
  resetCrop: document.querySelector("#reset-crop"),
  nameInput: document.querySelector("#name-input"),
  tagsInput: document.querySelector("#tags-input"),
  descriptionInput: document.querySelector("#description-input"),
  bottomLeftInput: document.querySelector("#bottom-left-input"),
  bottomRightInput: document.querySelector("#bottom-right-input"),
  costList: document.querySelector("#cost-list"),
  addCost: document.querySelector("#add-cost"),
  statusText: document.querySelector("#status-text"),
  previewCanvas: document.querySelector("#preview-canvas"),
  costRowTemplate: document.querySelector("#cost-row-template"),
  downloadImage: document.querySelector("#download-image"),
};

const previewContext = elements.previewCanvas.getContext("2d");
const cropContext = elements.cropEditor.getContext("2d");

const state = {
  cards: [],
  selectedCard: null,
  name: "",
  tags: [],
  description: "",
  bottomLeftText: "©miHoYo   ©SHININGSOUL",
  bottomRightText: "",
  costs: [],
  backgroundImage: null,
  backgroundSourceLabel: "",
  backgroundObjectUrl: null,
  crop: {
    zoom: 1,
    centerX: 0.5,
    centerY: 0.5,
  },
  cropDrag: null,
};

elements.bottomLeftInput.value = state.bottomLeftText;

function setStatus(message, isError = false) {
  elements.statusText.textContent = message;
  elements.statusText.style.color = isError ? "#ffb5b5" : "";
}

function sanitizeFileName(name) {
  return (name || "qisheng-card")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

function normalizeTags(text) {
  return text
    .split(/[、，,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCostLabel(type) {
  return COST_META[type]?.label || type;
}

function cloneCosts(costs) {
  return costs.map((cost) => ({
    type: cost.type,
    count: Number(cost.count) || 0,
  }));
}

function createOption(select, value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = getCostLabel(value);
  select.append(option);
}

function populateCostSelect(select, value) {
  select.innerHTML = "";
  COST_OPTIONS.forEach((optionValue) => createOption(select, optionValue));
  select.value = value;
}

function renderCostList() {
  elements.costList.innerHTML = "";

  if (state.costs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hint";
    empty.textContent = "当前没有费用，点击“新增费用”添加。";
    elements.costList.append(empty);
    return;
  }

  state.costs.forEach((cost, index) => {
    const fragment = elements.costRowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".cost-row");
    const typeSelect = fragment.querySelector(".cost-type");
    const countInput = fragment.querySelector(".cost-count");
    const removeButton = fragment.querySelector(".remove-cost");

    row.dataset.index = String(index);
    populateCostSelect(typeSelect, cost.type);
    countInput.value = String(cost.count);

    typeSelect.addEventListener("change", (event) => {
      state.costs[index].type = event.target.value;
      renderPreview();
    });

    countInput.addEventListener("input", (event) => {
      state.costs[index].count = Math.max(0, Number(event.target.value) || 0);
      renderPreview();
    });

    removeButton.addEventListener("click", () => {
      state.costs.splice(index, 1);
      renderCostList();
      renderPreview();
    });

    elements.costList.append(fragment);
  });
}

function syncCropControls() {
  elements.zoomRange.value = String(state.crop.zoom);
  elements.offsetXRange.value = String(state.crop.centerX);
  elements.offsetYRange.value = String(state.crop.centerY);
}

function getImageDimensions(image) {
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
}

function getCropRect(image) {
  const { width, height } = getImageDimensions(image);
  const imageRatio = width / height;

  let baseWidth;
  let baseHeight;
  if (imageRatio > CARD_RATIO) {
    baseHeight = height;
    baseWidth = baseHeight * CARD_RATIO;
  } else {
    baseWidth = width;
    baseHeight = baseWidth / CARD_RATIO;
  }

  const cropWidth = baseWidth / state.crop.zoom;
  const cropHeight = baseHeight / state.crop.zoom;

  const minCenterX = cropWidth / 2;
  const maxCenterX = width - cropWidth / 2;
  const minCenterY = cropHeight / 2;
  const maxCenterY = height - cropHeight / 2;

  const centerX = clamp(state.crop.centerX * width, minCenterX, maxCenterX);
  const centerY = clamp(state.crop.centerY * height, minCenterY, maxCenterY);

  state.crop.centerX = centerX / width;
  state.crop.centerY = centerY / height;

  return {
    x: centerX - cropWidth / 2,
    y: centerY - cropHeight / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle = null, lineWidth = 1) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function wrapText(ctx, text, maxWidth) {
  const paragraphs = String(text || "").split("\n");
  const lines = [];

  paragraphs.forEach((paragraph) => {
    if (!paragraph) {
      lines.push("");
      return;
    }

    let current = "";
    for (const char of paragraph) {
      const testLine = current + char;
      if (ctx.measureText(testLine).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = testLine;
      }
    }

    if (current) {
      lines.push(current);
    }
  });

  return lines;
}

function fitFontSize(ctx, text, maxWidth, maxSize, minSize, fontFamily, fontWeight = "700") {
  let fontSize = maxSize;
  while (fontSize > minSize) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) {
      return fontSize;
    }
    fontSize -= 2;
  }
  return minSize;
}

function drawCostBadge(ctx, x, y, size, cost) {
  const meta = COST_META[cost.type] || COST_META.GCG_COST_DICE_VOID;
  const badgeHeight = size * 1.12;
  const badgeWidth = size;

  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.moveTo(badgeWidth * 0.5, 0);
  ctx.lineTo(badgeWidth * 0.95, badgeHeight * 0.24);
  ctx.lineTo(badgeWidth * 0.88, badgeHeight * 0.86);
  ctx.lineTo(badgeWidth * 0.5, badgeHeight);
  ctx.lineTo(badgeWidth * 0.12, badgeHeight * 0.86);
  ctx.lineTo(badgeWidth * 0.05, badgeHeight * 0.24);
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(badgeWidth * 0.5, 6);
  ctx.lineTo(badgeWidth * 0.91, badgeHeight * 0.25);
  ctx.lineTo(badgeWidth * 0.84, badgeHeight * 0.81);
  ctx.lineTo(badgeWidth * 0.5, badgeHeight - 6);
  ctx.lineTo(badgeWidth * 0.16, badgeHeight * 0.81);
  ctx.lineTo(badgeWidth * 0.09, badgeHeight * 0.25);
  ctx.closePath();
  ctx.fillStyle = meta.fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = meta.text;
  ctx.font = `800 ${size * 0.3}px "Segoe UI", "PingFang SC", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(meta.short, badgeWidth * 0.5, badgeHeight * 0.36);

  ctx.font = `900 ${size * 0.46}px "Segoe UI", "PingFang SC", sans-serif`;
  ctx.fillText(String(cost.count), badgeWidth * 0.5, badgeHeight * 0.68);
  ctx.restore();
}

function drawTagPill(ctx, x, y, text, align = "right") {
  ctx.save();
  ctx.font = '700 34px "Segoe UI", "PingFang SC", sans-serif';
  const paddingX = 22;
  const width = ctx.measureText(text).width + paddingX * 2;
  const height = 46;
  const drawX = align === "right" ? x - width : x;

  drawRoundedRect(
    ctx,
    drawX,
    y,
    width,
    height,
    18,
    "rgba(214, 165, 84, 0.95)",
    "rgba(255, 245, 210, 0.92)",
    3,
  );

  ctx.fillStyle = "#fff7df";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, drawX + width / 2, y + height / 2 + 1);
  ctx.restore();

  return height;
}

function drawNamePlaque(ctx, text, canvasWidth, top) {
  const width = canvasWidth * 0.46;
  const height = 82;
  const x = (canvasWidth - width) / 2;

  drawRoundedRect(
    ctx,
    x,
    top,
    width,
    height,
    28,
    "rgba(245, 225, 185, 0.94)",
    "rgba(163, 114, 48, 0.95)",
    5,
  );

  drawRoundedRect(
    ctx,
    x + 12,
    top + 10,
    width - 24,
    height - 20,
    22,
    "rgba(255, 252, 244, 0.78)",
    "rgba(208, 166, 98, 0.86)",
    2,
  );

  ctx.save();
  const fontSize = fitFontSize(ctx, text || "未命名卡牌", width - 120, 46, 26, '"Segoe UI", "PingFang SC", sans-serif', "800");
  ctx.fillStyle = "#b68248";
  ctx.font = `800 ${fontSize}px "Segoe UI", "PingFang SC", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text || "未命名卡牌", x + width / 2, top + height / 2 + 1);

  ctx.fillStyle = "rgba(196, 151, 76, 0.78)";
  ctx.font = '700 24px "Segoe UI", sans-serif';
  ctx.fillText("✦", x + 34, top + height / 2 + 1);
  ctx.fillText("✦", x + width - 34, top + height / 2 + 1);
  ctx.restore();
}

function renderPreview(targetContext = previewContext, width = elements.previewCanvas.width, height = elements.previewCanvas.height) {
  const ctx = targetContext;
  ctx.clearRect(0, 0, width, height);

  const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
  backgroundGradient.addColorStop(0, "#2e3550");
  backgroundGradient.addColorStop(1, "#171b27");

  drawRoundedRect(ctx, 0, 0, width, height, 42, backgroundGradient);

  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, 42, null);
  ctx.clip();

  if (state.backgroundImage) {
    const crop = getCropRect(state.backgroundImage);
    ctx.drawImage(
      state.backgroundImage,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      width,
      height,
    );
  } else {
    const placeholder = ctx.createLinearGradient(0, 0, width, height);
    placeholder.addColorStop(0, "#314059");
    placeholder.addColorStop(1, "#161d2c");
    ctx.fillStyle = placeholder;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.font = '700 64px "Segoe UI", "PingFang SC", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("上传背景图", width / 2, height / 2 - 20);
    ctx.font = '500 32px "Segoe UI", "PingFang SC", sans-serif';
    ctx.fillText("自动按 88:63 裁剪", width / 2, height / 2 + 44);
  }

  const topShade = ctx.createLinearGradient(0, 0, 0, height * 0.35);
  topShade.addColorStop(0, "rgba(9, 12, 18, 0.54)");
  topShade.addColorStop(1, "rgba(9, 12, 18, 0)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, width, height * 0.35);

  const bottomShade = ctx.createLinearGradient(0, height * 0.55, 0, height);
  bottomShade.addColorStop(0, "rgba(255, 255, 255, 0)");
  bottomShade.addColorStop(1, "rgba(4, 8, 15, 0.25)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  ctx.restore();

  drawRoundedRect(ctx, 14, 14, width - 28, height - 28, 38, null, "rgba(255, 255, 255, 0.42)", 4);
  drawRoundedRect(ctx, 32, 32, width - 64, height - 64, 30, null, "rgba(244, 221, 177, 0.28)", 2);

  drawNamePlaque(ctx, state.name, width, 30);

  const scaledCosts = cloneCosts(state.costs).filter((cost) => cost.count > 0);
  scaledCosts.forEach((cost, index) => {
    drawCostBadge(ctx, 38, 28 + index * 122, 106, cost);
  });

  let currentTagY = 34;
  const tags = state.tags.filter(Boolean);
  tags.forEach((tag) => {
    const heightUsed = drawTagPill(ctx, width - 36, currentTagY, tag);
    currentTagY += heightUsed + 12;
  });

  const descriptionBox = {
    x: width * 0.08,
    y: height * 0.73,
    width: width * 0.84,
    height: height * 0.19,
  };

  drawRoundedRect(
    ctx,
    descriptionBox.x,
    descriptionBox.y,
    descriptionBox.width,
    descriptionBox.height,
    22,
    "rgba(248, 249, 252, 0.8)",
    "rgba(255, 255, 255, 0.55)",
    2,
  );

  ctx.save();
  ctx.font = '700 34px "Segoe UI", "PingFang SC", sans-serif';
  ctx.fillStyle = "#222831";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const descriptionLines = wrapText(ctx, state.description || "输入效果描述后会显示在这里。", descriptionBox.width - 52).slice(0, 5);
  descriptionLines.forEach((line, index) => {
    ctx.fillText(line, descriptionBox.x + 26, descriptionBox.y + 18 + index * 38);
  });
  ctx.restore();

  ctx.save();
  ctx.font = '600 28px "Segoe UI", "PingFang SC", sans-serif';
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(state.bottomLeftText || "", 40, height - 22);
  ctx.textAlign = "right";
  ctx.fillText(state.bottomRightText || "", width - 40, height - 22);
  ctx.restore();
}

function renderCropEditor() {
  const ctx = cropContext;
  const canvas = elements.cropEditor;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!state.backgroundImage) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#263348");
    gradient.addColorStop(1, "#1a2232");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '600 20px "Segoe UI", "PingFang SC", sans-serif';
    ctx.fillText("上传背景图后可在此拖动裁剪区域", canvas.width / 2, canvas.height / 2);
    return;
  }

  const image = state.backgroundImage;
  const { width, height } = getImageDimensions(image);
  const scale = Math.min(canvas.width / width, canvas.height / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const drawX = (canvas.width - drawWidth) / 2;
  const drawY = (canvas.height - drawHeight) / 2;

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const crop = getCropRect(image);
  const cropX = drawX + crop.x * scale;
  const cropY = drawY + crop.y * scale;
  const cropWidth = crop.width * scale;
  const cropHeight = crop.height * scale;

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(drawX, drawY, drawWidth, cropY - drawY);
  ctx.fillRect(drawX, cropY, cropX - drawX, cropHeight);
  ctx.fillRect(cropX + cropWidth, cropY, drawX + drawWidth - (cropX + cropWidth), cropHeight);
  ctx.fillRect(drawX, cropY + cropHeight, drawWidth, drawY + drawHeight - (cropY + cropHeight));

  ctx.strokeStyle = "#f5d086";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1.25;
  ctx.strokeRect(cropX + 0.5, cropY + 0.5, cropWidth - 1, cropHeight - 1);

  state.cropEditorFrame = {
    drawX,
    drawY,
    drawWidth,
    drawHeight,
    scale,
    crop,
  };
}

function updateFormValues() {
  elements.nameInput.value = state.name;
  elements.tagsInput.value = state.tags.join("、");
  elements.descriptionInput.value = state.description;
  elements.bottomLeftInput.value = state.bottomLeftText;
  elements.bottomRightInput.value = state.bottomRightText;
  renderCostList();
  renderCropEditor();
  renderPreview();
}

async function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = url;
  });
}

function applyLoadedImage(image, sourceLabel) {
  state.backgroundImage = image;
  state.backgroundSourceLabel = sourceLabel;
  state.crop.zoom = 1;
  state.crop.centerX = 0.5;
  state.crop.centerY = 0.5;
  syncCropControls();
  renderCropEditor();
  renderPreview();
  setStatus(`背景图已载入：${sourceLabel}`);
}

async function handleUploadedFile(file) {
  if (!file) {
    return;
  }

  if (state.backgroundObjectUrl) {
    URL.revokeObjectURL(state.backgroundObjectUrl);
    state.backgroundObjectUrl = null;
  }

  const objectUrl = URL.createObjectURL(file);
  state.backgroundObjectUrl = objectUrl;

  try {
    const image = await loadImageFromUrl(objectUrl);
    applyLoadedImage(image, file.name);
  } catch (error) {
    setStatus(error.message, true);
  }
}

function deriveTagLabels(card) {
  const labels = [];
  if (TYPE_LABELS[card.type]) {
    labels.push(TYPE_LABELS[card.type]);
  }

  (card.tags || []).forEach((tag) => {
    if (OMITTED_TAGS.has(tag)) {
      return;
    }
    const label = TAG_LABELS[tag] || tag.replace(/^GCG_TAG_/, "");
    if (!labels.includes(label)) {
      labels.push(label);
    }
  });

  return labels;
}

function findCard(query) {
  const text = String(query || "").trim();
  if (!text) {
    return null;
  }

  const idMatch = text.match(/(\d{2,})$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const byId = state.cards.find((card) => card.id === id);
    if (byId) {
      return byId;
    }
  }

  const exactName = state.cards.find((card) => card.name === text);
  if (exactName) {
    return exactName;
  }

  const exactCompound = state.cards.find((card) => `${card.name}｜${card.id}` === text);
  if (exactCompound) {
    return exactCompound;
  }

  return (
    state.cards.find((card) => card.name.includes(text) || String(card.id).includes(text)) ||
    null
  );
}

async function loadCardBackground(cardId) {
  if (!cardId) {
    setStatus("请先选择一张行动牌。", true);
    return;
  }

  const url = `https://static-data.piovium.org/api/v4/image/${cardId}`;
  setStatus(`正在载入远程背景图：${cardId}…`);

  try {
    const image = await loadImageFromUrl(url);
    applyLoadedImage(image, `卡牌背景 ${cardId}`);
  } catch (error) {
    setStatus("远程背景图加载失败，请改用本地上传。", true);
  }
}

async function applyCardData(card) {
  state.selectedCard = card;
  state.name = card.name || "";
  state.tags = deriveTagLabels(card);
  state.description = card.description || card.playingDescription || "";
  state.bottomLeftText = "©miHoYo   ©SHININGSOUL";
  state.bottomRightText = card.shareId ? `ID ${card.id} / Share ${card.shareId}` : `ID ${card.id}`;
  state.costs = cloneCosts(card.playCost || []);
  elements.cardSearch.value = `${card.name}｜${card.id}`;
  elements.cardMeta.textContent = `已载入：${card.name}（id ${card.id}，版本 ${card.sinceVersion || "未知"}）`;
  updateFormValues();
  await loadCardBackground(card.id);
}

async function loadActionCards() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`读取数据失败：${response.status}`);
    }

    const payload = await response.json();
    state.cards = Array.isArray(payload.data) ? payload.data : [];

    const fragment = document.createDocumentFragment();
    state.cards.forEach((card) => {
      const option = document.createElement("option");
      option.value = `${card.name}｜${card.id}`;
      fragment.append(option);
    });
    elements.cardOptions.append(fragment);
    elements.cardMeta.textContent = `已载入 ${state.cards.length} 张行动牌，支持按名称或 id 搜索。`;
  } catch (error) {
    elements.cardMeta.textContent = "行动牌数据读取失败，请确认通过本地 HTTP 服务打开页面。";
    setStatus(error.message, true);
  }
}

function canvasPointFromEvent(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function updateCropCenterByPixels(centerX, centerY) {
  const image = state.backgroundImage;
  if (!image) {
    return;
  }

  const cropRect = getCropRect(image);
  const { width, height } = getImageDimensions(image);
  const clampedCenterX = clamp(centerX, cropRect.width / 2, width - cropRect.width / 2);
  const clampedCenterY = clamp(centerY, cropRect.height / 2, height - cropRect.height / 2);

  state.crop.centerX = clampedCenterX / width;
  state.crop.centerY = clampedCenterY / height;
  syncCropControls();
  renderCropEditor();
  renderPreview();
}

function handleCropPointerDown(event) {
  if (!state.backgroundImage || !state.cropEditorFrame) {
    return;
  }

  const point = canvasPointFromEvent(event, elements.cropEditor);
  const cropFrame = state.cropEditorFrame;
  const cropX = cropFrame.drawX + cropFrame.crop.x * cropFrame.scale;
  const cropY = cropFrame.drawY + cropFrame.crop.y * cropFrame.scale;
  const cropWidth = cropFrame.crop.width * cropFrame.scale;
  const cropHeight = cropFrame.crop.height * cropFrame.scale;

  if (
    point.x < cropX ||
    point.x > cropX + cropWidth ||
    point.y < cropY ||
    point.y > cropY + cropHeight
  ) {
    return;
  }

  state.cropDrag = {
    startX: point.x,
    startY: point.y,
    centerX: state.crop.centerX,
    centerY: state.crop.centerY,
  };
  elements.cropEditor.classList.add("dragging");
}

function handleCropPointerMove(event) {
  if (!state.cropDrag || !state.backgroundImage) {
    return;
  }

  const point = canvasPointFromEvent(event, elements.cropEditor);
  const deltaX = point.x - state.cropDrag.startX;
  const deltaY = point.y - state.cropDrag.startY;
  const { width, height } = getImageDimensions(state.backgroundImage);
  const scale = state.cropEditorFrame.scale;

  updateCropCenterByPixels(
    state.cropDrag.centerX * width + deltaX / scale,
    state.cropDrag.centerY * height + deltaY / scale,
  );
}

function handleCropPointerUp() {
  state.cropDrag = null;
  elements.cropEditor.classList.remove("dragging");
}

function bindEvents() {
  elements.applyCard.addEventListener("click", async () => {
    const card = findCard(elements.cardSearch.value);
    if (!card) {
      setStatus("没有找到对应的行动牌。", true);
      return;
    }
    await applyCardData(card);
  });

  elements.cardSearch.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    elements.applyCard.click();
  });

  elements.loadRemoteImage.addEventListener("click", async () => {
    if (!state.selectedCard) {
      const card = findCard(elements.cardSearch.value);
      if (card) {
        state.selectedCard = card;
      }
    }
    await loadCardBackground(state.selectedCard?.id);
  });

  elements.imageUpload.addEventListener("change", async (event) => {
    await handleUploadedFile(event.target.files?.[0]);
  });

  elements.zoomRange.addEventListener("input", (event) => {
    state.crop.zoom = Number(event.target.value);
    renderCropEditor();
    renderPreview();
  });

  elements.offsetXRange.addEventListener("input", (event) => {
    state.crop.centerX = Number(event.target.value);
    renderCropEditor();
    renderPreview();
  });

  elements.offsetYRange.addEventListener("input", (event) => {
    state.crop.centerY = Number(event.target.value);
    renderCropEditor();
    renderPreview();
  });

  elements.resetCrop.addEventListener("click", () => {
    state.crop.zoom = 1;
    state.crop.centerX = 0.5;
    state.crop.centerY = 0.5;
    syncCropControls();
    renderCropEditor();
    renderPreview();
  });

  elements.nameInput.addEventListener("input", (event) => {
    state.name = event.target.value;
    renderPreview();
  });

  elements.tagsInput.addEventListener("input", (event) => {
    state.tags = normalizeTags(event.target.value);
    renderPreview();
  });

  elements.descriptionInput.addEventListener("input", (event) => {
    state.description = event.target.value;
    renderPreview();
  });

  elements.bottomLeftInput.addEventListener("input", (event) => {
    state.bottomLeftText = event.target.value;
    renderPreview();
  });

  elements.bottomRightInput.addEventListener("input", (event) => {
    state.bottomRightText = event.target.value;
    renderPreview();
  });

  elements.addCost.addEventListener("click", () => {
    state.costs.push({ type: "GCG_COST_DICE_VOID", count: 1 });
    renderCostList();
    renderPreview();
  });

  elements.cropEditor.addEventListener("mousedown", handleCropPointerDown);
  window.addEventListener("mousemove", handleCropPointerMove);
  window.addEventListener("mouseup", handleCropPointerUp);
  elements.cropEditor.addEventListener("mouseleave", handleCropPointerUp);
  elements.cropEditor.addEventListener("wheel", (event) => {
    if (!state.backgroundImage) {
      return;
    }
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.05 : 1 / 1.05;
    state.crop.zoom = clamp(state.crop.zoom * factor, 1, 4);
    syncCropControls();
    renderCropEditor();
    renderPreview();
  });

  elements.downloadImage.addEventListener("click", () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = PREVIEW_WIDTH;
    exportCanvas.height = PREVIEW_HEIGHT;
    const exportContext = exportCanvas.getContext("2d");
    renderPreview(exportContext, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    try {
      const link = document.createElement("a");
      link.href = exportCanvas.toDataURL("image/png");
      link.download = `${sanitizeFileName(state.name)}.png`;
      link.click();
      setStatus("图片已生成并开始下载。");
    } catch (error) {
      setStatus("下载失败：远程图片可能未开放跨域，请改用本地上传背景图。", true);
    }
  });
}

function init() {
  bindEvents();
  syncCropControls();
  renderCostList();
  renderCropEditor();
  renderPreview();
  loadActionCards();
}

init();
