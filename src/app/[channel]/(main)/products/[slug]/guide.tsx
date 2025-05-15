import React, { useState } from "react";
import Image from "next/image"; // Nếu dùng Next.js, nếu không thì dùng <img>

const sizeDatas = {
    "tee": {
        img: "/images/guide-tee.png",
        inches: [
            { size: "S", length: "28.00 inch", width: "18.00 inch", sleeve: "16.75 inch" },
            { size: "M", length: "29.00 inch", width: "20.00 inch", sleeve: "18.00 inch" },
            { size: "L", length: "30.00 inch", width: "22.00 inch", sleeve: "19.75 inch" },
            { size: "XL", length: "30.50 inch", width: "24.00 inch", sleeve: "21.00 inch" },
            { size: "2XL", length: "32.00 inch", width: "26.00 inch", sleeve: "22.25 inch" },
            { size: "3XL", length: "34.00 inch", width: "28.00 inch", sleeve: "23.50 inch" },
            { size: "4XL", length: "36.00 inch", width: "30.00 inch", sleeve: "24.50 inch" },
            { size: "5XL", length: "38.00 inch", width: "32.00 inch", sleeve: "25.50 inch" },
        ],
        cm: [
            { size: "S", length: "71.12 cm", width: "45.72 cm", sleeve: "42.55 cm" },
            { size: "M", length: "73.66 cm", width: "50.80 cm", sleeve: "45.72 cm" },
            { size: "L", length: "76.20 cm", width: "55.88 cm", sleeve: "50.16 cm" },
            { size: "XL", length: "77.47 cm", width: "60.96 cm", sleeve: "53.34 cm" },
            { size: "2XL", length: "81.28 cm", width: "66.04 cm", sleeve: "56.52 cm" },
            { size: "3XL", length: "86.36 cm", width: "71.12 cm", sleeve: "59.69 cm" },
            { size: "4XL", length: "91.44 cm", width: "76.20 cm", sleeve: "62.23 cm" },
            { size: "5XL", length: "96.52 cm", width: "81.28 cm", sleeve: "64.77 cm" },
        ],
    },
    "fleece": {
        img: "/images/guide-fleece.png",
        inches: [
            { size: "4", length: "27.00 inch", width: "20.00 inch", sleeve: "34.00 inch" },
            { size: "5", length: "28.00 inch", width: "22.00 inch", sleeve: "35.00 inch" },
            { size: "6", length: "29.00 inch", width: "24.00 inch", sleeve: "36.00 inch" },
            { size: "7", length: "30.00 inch", width: "26.00 inch", sleeve: "37.00 inch" },
            { size: "8", length: "31.00 inch", width: "28.00 inch", sleeve: "38.00 inch" },
        ],
        cm: [
            { size: "4", length: "68.58 cm", width: "50.80 cm", sleeve: "86.36 cm" },
            { size: "5", length: "71.12 cm", width: "55.88 cm", sleeve: "88.90 cm" },
            { size: "6", length: "73.66 cm", width: "60.96 cm", sleeve: "91.44 cm" },
            { size: "7", length: "76.20 cm", width: "66.04 cm", sleeve: "93.98 cm" },
            { size: "8", length: "78.74 cm", width: "71.12 cm", sleeve: "96.52 cm" },
        ],
    }
};


//const sizeData = sizeDatas.tee;

type SizeGuideModalProps = {
    catalog: keyof typeof sizeDatas;
    setShowSizeGuide: React.Dispatch<React.SetStateAction<boolean>>;
};

const SizeGuideModal = ({ catalog, setShowSizeGuide }: SizeGuideModalProps) => {
    const sizeData = sizeDatas[catalog]
    const [unit, setUnit] = useState<"inches" | "cm">("inches");
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;

    const tableData = sizeData[unit];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-2">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl shadow-lg relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
                {/* Left section: options + image */}
                <div className="md:w-1/3 w-full md:pr-6 border-b md:border-b-0 md:border-r flex flex-col">
                    <h2 className="text-lg font-semibold mb-4">Size guide</h2>
                    <div className="mb-4 flex gap-2">
                        <button
                            className={`px-4 py-2 rounded ${unit === "inches" ? "bg-[#8c3c54] text-white" : "bg-gray-200"}`}
                            onClick={() => setUnit("inches")}
                        >
                            Inches
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${unit === "cm" ? "bg-[#8c3c54] text-white" : "bg-gray-200"}`}
                            onClick={() => setUnit("cm")}
                        >
                            Centimeters
                        </button>
                    </div>
                    <div className="w-full flex justify-center md:justify-start">
                        <Image src={sizeData.img} alt="Size Guide" width={200} height={200} className="object-contain" />
                    </div>
                </div>

                {/* Right section: table */}
                <div className="md:w-2/3 w-full md:pl-6 pt-6 md:pt-[54px] overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">Size</th>
                                <th className="p-2 border">Body length</th>
                                <th className="p-2 border">Body width</th>
                                <th className="p-2 border">Sleeve length</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="p-2 border">{row.size}</td>
                                    <td className="p-2 border">{row.length}</td>
                                    <td className="p-2 border">{row.width}</td>
                                    <td className="p-2 border">{row.sleeve}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Close button */}
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
                    onClick={() => {
                        setIsOpen(false);
                        setShowSizeGuide(false);
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default SizeGuideModal;
