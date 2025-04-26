/**
 * Tính toán độ sáng của một mã màu Hex
 * Công thức: (0.299*R + 0.587*G + 0.114*B)
 * @param hex Mã màu hex (ví dụ: #FFFFFF)
 * @returns Giá trị độ sáng (0-255)
 */
function calculateLuminance(hex: string): number {
	// Loại bỏ ký tự "#" nếu có
	hex = hex.replace("#", "");

	// Chuyển đổi hex thành giá trị RGB
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Tính toán độ sáng theo công thức chuẩn
	return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Sắp xếp mảng màu từ sáng đến tối
 * @param arr Mảng đầu vào với định dạng ["NAME-#HEXCODE", ...]
 * @returns Mảng đã sắp xếp với cùng định dạng
 */
export function sortColorsByLuminance(arr: string[]): string[] {
	// Tạo bản sao của mảng để không thay đổi mảng gốc
	const colorsCopy = [...arr];
	// Sắp xếp màu theo độ sáng (từ sáng đến tối)
	colorsCopy.sort((a, b) => {
        const hexA = a.split("-")[1]; // Lấy phần hex từ chuỗi
		const hexB = b.split("-")[1]; // Lấy phần hex từ chuỗi
        
        console.log(hexA, hexB)


		const luminanceA = calculateLuminance(hexA);
		const luminanceB = calculateLuminance(hexB);

		return luminanceB - luminanceA; // Từ sáng đến tối (giảm dần)
	});

	return colorsCopy;
}
