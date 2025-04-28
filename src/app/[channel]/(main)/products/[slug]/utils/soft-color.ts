/**
 * Calculate the luminance of a Hex color code
 * Formula: (0.299*R + 0.587*G + 0.114*B)
 * @param hex Hex color code (e.g., #FFFFFF)
 * @returns Luminance value (0-255)
 */
function calculateLuminance(hex: string): number {
	// Remove "#" character if present
	hex = hex.replace("#", "");

	// Convert hex to RGB values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Calculate luminance using standard formula
	return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Sort color array from light to dark
 * @param arr Input array in format ["NAME-#HEXCODE", ...]
 * @returns Sorted array in the same format
 */
export function sortColorsByLuminance(arr: string[]): string[] {
	// Create a copy of array to avoid modifying original
	const colorsCopy = [...arr];
	// Sort colors by luminance (light to dark)
	colorsCopy.sort((a, b) => {
        const hexA = a.split("-")[1]; // Get hex part from string
		const hexB = b.split("-")[1]; // Get hex part from string
		const luminanceA = calculateLuminance(hexA);
		const luminanceB = calculateLuminance(hexB);

		return luminanceB - luminanceA; // Light to dark (descending)
	});

	return colorsCopy;
}
