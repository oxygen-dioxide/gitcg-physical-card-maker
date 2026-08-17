import "./style.css";
import { init } from "./ui.js";

async function loadFont() {
	try {
		const [hywh, hywh45w] = await Promise.all([
			new FontFace("HYWH", "url(assets/font/HYWH.ttf)").load(),
			new FontFace("HYWH-55W", "url(assets/font/HYWH-55W.ttf)")
				.load()
				.catch(() => null),
		]);
		document.fonts.add(hywh);
		if (hywh45w) document.fonts.add(hywh45w);
	} catch (_) {
		console.warn("Font failed to load, using fallback");
	}
}

loadFont().then(init);
