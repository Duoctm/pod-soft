import { useState } from "react";
import { toast } from "react-toastify";
import { saveDesign } from "../utils/save-design/saveDesign";

interface SaveDesignModalProps {
    onClose: () => void;
    onExportDesign: () => Promise<{ design: object, hasDesign: boolean } | null>;
    setSpinner: React.Dispatch<React.SetStateAction<boolean>>;
}

const SaveDesignModal = ({ onClose, onExportDesign, setSpinner }: SaveDesignModalProps) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Design name cannot be empty");
            return;
        }

        setSpinner(true);
        try {
            const design = await onExportDesign();
            if (!design?.hasDesign) {
                toast.error("No design has been inserted");
                setSpinner(false);
                return;
            }
            if (design) {
                const result = await saveDesign(name, design.design);
                if (result.customerDesignFavoriteCreate?.errors?.length) {
                    console.error("Error saving design:", result.customerDesignFavoriteCreate.errors);
                    toast.error("An error occurred while saving the design. Please try again.");
                }
                else {
                    toast.success("Design saved successfully");
                }
            }
            else {
                toast.error("An error occurred while saving the design. Please try again.");
            }
        }
        catch (error) {
            console.error("Error exporting design:", error);
            toast.error("An error occurred while saving the design. Please try again.");
        }
        setSpinner(false);



        onClose();
    };


    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg relative">
                <h2 className="text-xl font-semibold mb-4">Enter Design Name</h2>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                    }}
                    placeholder="Design name..."
                    className={`w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                />
                {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

                <div className="flex justify-center gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-[#303c54] text-white hover:bg-[#2a3246] rounded"
                    >
                        Submit
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SaveDesignModal;
