import "./style.css";
import { init } from "./ui.js";

async function loadFont() {
	try {
		// 将字体路径解析为相对当前文档的绝对 URL，
		// 这样在本地根路径与 GitHub Pages 子路径部署下都能正确定位。
		const fontBase = new URL("assets/font/", document.baseURI).href;
		const [hywh, hywh55w] = await Promise.all([
			new FontFace("HYWH", `url(${fontBase}HYWH.ttf)`).load(),
			new FontFace("HYWH-55W", `url(${fontBase}HYWH-55W.ttf)`)
				.load()
				.catch(() => null),
		]);
		document.fonts.add(hywh);
		if (hywh55w) document.fonts.add(hywh55w);
	} catch (_) {
		console.warn("Font failed to load, using fallback");
	}
}

loadFont().then(init);
