/* eslint-disable import/no-default-export */
import {
    AlignHorizontalSpaceAround,
    AlignVerticalSpaceAround,
    BringToFront,
    ChevronLeft,
    Copy,
    SendToBack,
    Trash,
    X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useDebounceValue } from "usehooks-ts";
import { useDesign, TextTypeEnum } from "../../utils/useDesign";

const textFeatures = [
    {
        key: "copy",
        name: "Copy",
        icon: <Copy />,
    },
    {
        key: "delete",
        name: "Delete",
        icon: <Trash />,
    },
];

const positionFeatures = [
    {
        key: "center-width",
        name: "Center Width",
        icon: <AlignHorizontalSpaceAround />,
    },
    {
        key: "center-height",
        name: "Center Height",
        icon: <AlignVerticalSpaceAround />,
    },
    {
        key: "bring-to-front",
        name: "Bring to front",
        icon: <BringToFront />,
    },
    {
        key: "send-to-back",
        name: "Send to back",
        icon: <SendToBack />,
    },
];

const TextTab = () => {
    const router = useRouter();
    const pathName = usePathname();
    const [inputValue, setInputValue] = React.useState("");
    const [debouncedValue] = useDebounceValue(inputValue, 100);

    const { setSelected, text, handleCopy, handleDelete, bringToFront, sendToBack, centerWidth, centerHeight } = useDesign();
    const { isSelectedText, setIsSelectedText, setTextVal, text: defaultVal } = text;

    const handleSetSelected = () => {
        setSelected(null);
        router.replace(pathName);
    };

    const handleAddTextToDesign = () => {
        setIsSelectedText();
        setTextVal({
            ...defaultVal,
            content: debouncedValue,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleTextStyleChange = (style: TextTypeEnum) => {
        setTextVal({
            ...defaultVal,
            type: defaultVal.type === style ? TextTypeEnum.NORMAL : style,
        });
    };


    const handleChangeFontSize = (size: number) => {
        setTextVal({
            ...defaultVal,
            size: size
        });
    }

    const handleChangeColor = (color: string) => {
        setTextVal({
            ...defaultVal,
            color: color
        });
    }
    const handleRorateDeg = (deg: number) => {
        setTextVal({
            ...defaultVal,
            rotate: deg
        });
    }



    const handleAction = (key: string) => {
        if (key === "copy") {
            handleCopy()
        } else if (key === "delete") {
            handleDelete()
        }
    }


    // handle action position & layering
    const handleLayering = (key: string) => {
        if (key === "center-width") {
            centerWidth()
        } else if (key === "center-height") {
            centerHeight()
        } else if (key === "bring-to-front") {
            bringToFront()
        } else if (key === "send-to-back") {
            sendToBack()
        }
    }



    return (
        <div className="flex flex-1 flex-col px-2">
            <div className="flex w-full items-center justify-between py-2">
                {isSelectedText ? (
                    <ChevronLeft
                        onClick={() => {
                            setIsSelectedText();
                            setTextVal({
                                ...defaultVal,
                                content: "",
                            });
                        }}
                    />
                ) : null}
                <span className="font-semibold"> Edit Text</span>
                <X onClick={handleSetSelected} />
            </div>
            {!isSelectedText ? (
                <div className="mt-2 flex flex-col gap-2">
                    <input
                        type="text"
                        className="rounded-md py-2 focus:border-blue-500 focus:ring-2"
                        placeholder="Enter text here"
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <button
                        onClick={handleAddTextToDesign}
                        className="mt-2 w-full rounded-md bg-[#743C54] py-2 text-white hover:bg-[#743C54]/80"
                    >
                        Add to design
                    </button>
                </div>
            ) : (
                <div className="flex w-full flex-col gap-4">
                    <div className="w-full">
                        <input
                            type="text"
                            className="w-full rounded-md py-2 focus:border-blue-500 focus:ring-2"
                            placeholder="Enter text here"
                            value={defaultVal.content}
                            onChange={(e) => {
                                setTextVal({
                                    ...defaultVal,
                                    content: e.target.value,
                                });
                            }}
                        />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                        <span className="font-semibold">Text Style</span>
                        <div className="flex items-center gap-4">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={defaultVal.type === TextTypeEnum.BOLD}
                                    onChange={() => handleTextStyleChange(TextTypeEnum.BOLD)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#743C54] focus:ring-[#743C54]"
                                />
                                <span className="font-bold">Bold</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={defaultVal.type === TextTypeEnum.ITALIC}
                                    onChange={() => handleTextStyleChange(TextTypeEnum.ITALIC)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#743C54] focus:ring-[#743C54]"
                                />
                                <span className="italic">Italic</span>
                            </label>
                        </div>
                    </div>
                    <hr />

                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <span>Fontsize</span>
                        <input onChange={(e) => handleChangeFontSize(parseInt(e.target.value))} type="number" value={defaultVal.size} className="w-20 rounded-md py-2" />
                    </div>
                    <hr />
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <span>Color</span>
                        <input type="color" value={defaultVal.color} className="w-20 rounded-md" onChange={(e) => handleChangeColor(e.target.value)} />
                    </div>
                    <hr />
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <span>Rotate</span>
                        <input type="range" value={defaultVal.rotate} className="w-full rounded-md" onChange={(e) => handleRorateDeg(parseInt(e.target.value))} min={0} max={360} />
                        <input type="number" value={defaultVal.rotate} className="w-20 rounded-md" onChange={(e) => handleRorateDeg(parseInt(e.target.value))} />
                    </div>
                    <hr />
                    <div className="flex w-full flex-col">
                        <span className="font-semibold">Action</span>
                        <div className="flex items-center gap-x-2">
                            {textFeatures.map((i) => {
                                return (
                                    <div
                                        onClick={() => handleAction(i.key)}
                                        key={i.key} className="flex flex-col items-center justify-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                                            {i.icon}
                                        </div>
                                        <span className="text-sm font-light">{i.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <hr />
                    <div className="flex flex-1 flex-col">
                        <span className="font-semibold ">Position & Layering</span>
                        <div className="flex flex-1 flex-wrap gap-2 py-2">
                            {positionFeatures.map((i) => {
                                return (
                                    <div
                                        onClick={() => handleLayering(i.key)}
                                        key={i.key} className="flex flex-col items-center justify-center">
                                        <div
                                            title={i.name}
                                            className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                                        >
                                            {i.icon}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextTab;
