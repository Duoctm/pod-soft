export function groupAndSortColors(colors: string[]): string[] {
	function hexToHSL(hex: string): [number, number, number] {
		hex = hex.replace("#", "");
		const r = parseInt(hex.substring(0, 2), 16) / 255;
		const g = parseInt(hex.substring(2, 4), 16) / 255;
		const b = parseInt(hex.substring(4, 6), 16) / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0, s = 0, l = (max + min) / 2;
		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [h * 360, s * 100, l * 100];
	}

	function getHueGroup(h: number, s: number): string {
		if (s < 10) return "gray";
		if (h < 30 || h >= 330) return "red";
		if (h < 60) return "orange";
		if (h < 90) return "yellow";
		if (h < 150) return "green";
		if (h < 210) return "cyan";
		if (h < 270) return "blue";
		if (h < 330) return "purple";
		return "others";
	}

	const groupOrder = ["gray", "red", "orange", "yellow", "green", "cyan", "blue", "purple", "others"];
	const groups: Record<string, string[]> = Object.fromEntries(groupOrder.map(g => [g, []]));

	for (const color of colors) {
		const hex = color.split("-")[1];
		const [h, s, _l] = hexToHSL(hex);
		const group = getHueGroup(h, s);
		groups[group].push(color);
	}

	// Sort each group by lightness descending
	for (const key in groups) {
		groups[key].sort((a, b) => {
			const hexA = a.split("-")[1];
			const hexB = b.split("-")[1];
			const [, , lA] = hexToHSL(hexA);
			const [, , lB] = hexToHSL(hexB);
			return lB - lA;
		});
	}

	// Flatten into a single array
	return groupOrder.flatMap(group => groups[group]);
}