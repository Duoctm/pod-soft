import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid"
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react"
import { getSaveDesign } from "../utils/save-design/getSaveDesign"
import { deleteDesign } from "../utils/save-design/deleteSaveDesign"
import { type FaceData } from "../utils/type";

interface PrintSide {
    id: string;
    name: string;
    thumbnailUrl: string;
    designJson: object;
}

interface Design {
    id: string;
    name: string | null | undefined;
    createdAt: string;
    sides: PrintSide[];
}

interface ImportMultiData {
    code: string,
    designs: object[]
}

interface SavedDesignsModalProps {
    onClose: () => void;
    faceData: FaceData[];
    onImportDesignToFace: (faceCodes: string[], data: object[]) => void
    onImportDesignToMultiFace: (data: object[]) => void
    setSpinner: React.Dispatch<React.SetStateAction<boolean>>;
}



function formatISOToUSDate(isoString: string, withTime = false) {
    const date = new Date(isoString);

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    if (!withTime) {
        return `${month}/${day}/${year}`;
    }

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 12h format

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}


export default function GetDesignsModal({ onClose, faceData, onImportDesignToFace, onImportDesignToMultiFace, setSpinner }: SavedDesignsModalProps) {
    const [expandedDesignIds, setExpandedDesignIds] = useState<Set<string>>(new Set());
    const [checkedSides, setCheckedSides] = useState<{ id: string; name: string }[]>([]);

    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
    const [applySide, setApplySide] = useState<string | null>(null);

    const [designsData, setDesignsData] = useState<Design[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const [isLoadData, setIsLoadData] = useState<boolean>(false);


    const loadSaveDesignData = async () => {
        try {
            const data = await getSaveDesign();

            const designsDataTemp: Design[] = [];
            if (data.customerDesignFavorites?.edges) {
                for (const item of data.customerDesignFavorites?.edges) {
                    const sideTemps: PrintSide[] = [];
                    const designJsons = JSON.parse(item.node.designJson || "") as any;

                    for (const faceDesign of designJsons) {
                        const sideChildTemp = {
                            id: uuid(),
                            designJson: faceDesign.designs,
                            name: faceDesign.face_code,
                            thumbnailUrl: faceDesign.final_image_url
                        }
                        sideTemps.push(sideChildTemp);
                    }
                    designsDataTemp.push({
                        id: item.node.id,
                        createdAt: formatISOToUSDate(item.node.createdAt),
                        name: item.node.note,
                        sides: sideTemps
                    })
                }

            }
            setDesignsData(designsDataTemp);
        }
        catch (err) {
            console.log(err);
        }
    }

    const handleDownloadImage = async () => {
        if (!viewImageUrl) {
            toast.error("No image URL provided.");
            return;
        }

        try {
            const response = await fetch(viewImageUrl); // `viewImageUrl` chắc chắn là string
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "design-preview.png"; // Tên file tùy chỉnh
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
        }
    };



    useEffect(() => {
        if (!isLoadData) {
            loadSaveDesignData();
            setIsLoadData(true);
        }

    }, [isLoadData]);

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedDesignIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);

        setExpandedDesignIds(newSet);

    };


    const toggleSideCheck = (side: { id: string; name: string }, isChecked: boolean) => {
        setCheckedSides(prev => {
            const exists = prev.find(item => item.name === side.name);

            if (isChecked) {
                // Check
                if (exists) {
                    toast.error("This side has already been selected.");
                    return prev; // không thay đổi
                } else {
                    return [...prev, side]; // thêm mới
                }
            } else {
                // Uncheck
                return prev.filter(item => item.id !== side.id); // loại bỏ phần tử
            }
        });
    };





    const handleApplySideClick = (sideId: string) => {
        setApplySide(sideId);
    };

    const closeApplySide = () => setApplySide(null);
    const closeImageView = () => setViewImageUrl(null);

    const handleGlobalApply = () => {

        if (checkedSides.length == 0) {
            toast.error("Please select the designed print side");
            return;
        }
        setSpinner(true);
        const faceSelect: PrintSide[] = [];
        for (const check of checkedSides) {
            faceSelect.push(designsData.flatMap((design) => design.sides).find((x) => x.id === check.id) as PrintSide);
        }
        //alert("aaaaaaaaaaaaaaaaaaaaaaaaaa");
        const importMultiData: ImportMultiData[] = [];
        for (const face of faceSelect) {
            importMultiData.push({
                code: face.name,
                designs: face.designJson as object[]
            })
        }

        //console.log('importMultiData', importMultiData);

        onImportDesignToMultiFace(importMultiData);
        setSpinner(false);
        toast.success('Design has been applied successfully');

    };


    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4 overflow-auto">
                <div className="bg-white rounded-lg shadow-lg max-w-[95%] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] overflow-auto p-3 sm:p-4 md:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Saved Designs</h2>

                    {designsData.map((design) => {
                        const isExpanded = expandedDesignIds.has(design.id);


                        return (
                            <div key={design.id} className="border rounded mb-4">
                                {/* Header row */}
                                <div
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleExpand(design.id)}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mb-2 sm:mb-0">
                                        {/* Ảnh đại diện dòng cha */}
                                        {design.sides[0] && (
                                            <img
                                                src={design.sides[0].thumbnailUrl}
                                                alt={design.name || ""}
                                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm sm:text-base">{design.name}</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Created at: {design.createdAt}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        {/* Nút Delete */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDeleteId(design.id);
                                            }}
                                            className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm"
                                        >
                                            Delete
                                        </button>


                                        {/* Nút mở rộng */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(design.id);
                                            }}
                                            className="px-2 py-1 rounded text-[#303c54]"
                                        >
                                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5"></ChevronDown>
                                        </button>
                                    </div>
                                </div>

                                {/* Dropdown content */}
                                {isExpanded && (
                                    <div className="bg-gray-50 p-4 border-t">
                                        {design.sides.map((side) => (
                                            <div
                                                key={side.id}
                                                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border-b py-3 last:border-b-0"
                                            >
                                                <img
                                                    src={side.thumbnailUrl}
                                                    alt={side.name}
                                                    className="w-full sm:w-16 h-32 sm:h-16 object-cover rounded border"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm sm:text-base">{side.name}</p>
                                                </div>
                                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end mt-2 sm:mt-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedSides.some(item => item.id === side.id)}
                                                        onChange={(e) => toggleSideCheck({ id: side.id, name: side.name }, e.target.checked)}
                                                        className="w-5 h-5"
                                                    />

                                                    <button
                                                        onClick={() => setViewImageUrl(side.thumbnailUrl)}
                                                        className="flex-1 sm:flex-none px-3 py-1 bg-[#303c54] text-white rounded hover:bg-[#2a3246] text-xs sm:text-sm"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleApplySideClick(side.id)}
                                                        className="flex-1 sm:flex-none px-3 py-1 bg-[#303c54] text-white rounded hover:bg-[#2a3246] text-xs sm:text-sm"
                                                    >
                                                        Apply Side
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}


                    {/* Buttons for whole popup */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                handleGlobalApply();
                                if (onClose) {
                                    onClose();
                                }
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-[#303c54] text-white rounded hover:bg-[#2a3246] text-sm sm:text-base"
                        >
                            Apply Selected
                        </button>
                    </div>
                </div>
            </div>

            {/* Image viewer popup */}
            {viewImageUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999] p-4">
                    <div className="bg-white rounded shadow-lg p-4 relative max-w-xl max-h-full overflow-auto flex flex-col items-center">
                        <img
                            src={viewImageUrl}
                            alt="Design Detail"
                            className="max-w-full max-h-[80vh] object-contain mb-4"
                        />

                        <div className="flex justify-end gap-2 w-full mt-4">
                            <button
                                onClick={closeImageView}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleDownloadImage}
                                className="px-4 py-2 bg-[#303c54] text-white rounded hover:bg-[#2a3246]"
                            >
                                Download
                            </button>

                        </div>
                    </div>
                </div>

            )}

            {/* Apply side popup */}
            {applySide && (
                <ApplySidePopup
                    side={
                        designsData
                            .flatMap((design) => design.sides)
                            .find((x) => x.id === applySide)
                    }
                    faceData={faceData}
                    onClose={closeApplySide}
                    onImportDesignToFace={onImportDesignToFace}
                    setSpinner={setSpinner}
                />
            )}

            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this design?</h3>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={async () => {
                                    try {
                                        const result = await deleteDesign(confirmDeleteId);
                                        if (result.customerDesignFavoriteDelete?.result?.ok) {
                                            toast.success("Design save deleted successfully");
                                            setIsLoadData(false);
                                        }
                                        else {
                                            toast.error("An error occurred, the design could not be deleted");
                                        }

                                    }
                                    catch (error) {
                                        console.log(error);
                                        toast.error("An error occurred, the design could not be deleted");
                                    }

                                    setConfirmDeleteId(null);
                                    // TODO: thêm logic gọi API xoá nếu cần
                                }}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}

interface ApplySidePopupProps {
    side: PrintSide | undefined;
    faceData: FaceData[]
    onClose: () => void;
    onImportDesignToFace: (faceCodes: string[], data: object[]) => void;
    setSpinner: React.Dispatch<React.SetStateAction<boolean>>;
}

function ApplySidePopup({ side, faceData, onClose, onImportDesignToFace, setSpinner }: ApplySidePopupProps) {
    const [selectedSideIds, setSelectedSideIds] = useState<string[]>([]);

    const toggleSelectSide = (faceCode: string) => {
        setSelectedSideIds(prev => {
            if (prev.includes(faceCode)) {
                // Nếu đã chọn rồi thì bỏ chọn
                return prev.filter(id => id !== faceCode);
            } else {
                // Thêm vào mảng chọn
                return [...prev, faceCode];
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999] p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg overflow-auto max-h-full">
                <h3 className="text-xl font-semibold mb-4">Select Side to Apply</h3>

                {/* Horizontal list */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {faceData.map((face) => (
                        <div
                            key={face.face_code}
                            className={`flex flex-col items-center cursor-pointer border rounded p-2 w-48 transition-all duration-150 ${selectedSideIds.includes(face.face_code) ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"
                                }`}
                            onClick={() => toggleSelectSide(face.face_code)}
                        >
                            <img
                                src={face.image_url}
                                alt={face.face_code}
                                className="w-full h-48 object-cover rounded border mb-2"
                            />
                            <p className="text-center text-sm font-medium">{face.face_code}</p>
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (selectedSideIds.length === 0) {
                                toast.error("Please select at least one print side to apply the design");
                            } else {
                                setSpinner(true);
                                // Áp dụng cho tất cả mặt đã chọn
                                onImportDesignToFace(selectedSideIds, side?.designJson as object[] || []);
                                setSpinner(false);
                                toast.success("Design has been applied successfully");
                                // Bạn có thể gọi onClose() nếu muốn đóng popup sau khi apply
                                // onClose();
                                if (onClose) {
                                    onClose();
                                }
                            }
                        }}
                        className="px-4 py-2 bg-[#303c54] text-white rounded hover:bg-[#2a3246]"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

