/* eslint-disable import/no-default-export */
import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround, BringToFront, ChevronLeft, Copy, Crop, SendToBack, Trash2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import React from "react";
import { useDesign } from "../../utils/useDesign";
import Image from "next/image";

const actiions = [
    {
        key: "copy",
        name: "Copy",
        icon: <Copy />,
    },

    {
        key: "delete",
        name: "delete",
        icon: <Trash2 />,
    },
    {
        key: "crop",
        name: "Crop",
        icon: <Crop />,
    },
];

const positionFeatures = [{
    key: "center-width",
    name: "Center Width",
    icon: <AlignHorizontalSpaceAround />


},
{
    key: "center-height",
    name: "Center Height",
    icon: <AlignVerticalSpaceAround />


}, {
    key: "bring-to-front",
    name: "Bring to front",
    icon: <BringToFront />
}, {
    key: "send-to-back",
    name: "Send to back",
    icon: <SendToBack />
}

]


const ImageDesignTool = () => {
    const router = useRouter();
    const pathName = usePathname();

    const { setSelected, upload, handleCopy, handleDelete, handleCropImage, bringToFront, sendToBack, centerWidth, centerHeight } = useDesign();

    const { isSelectedImage, setSelectedImage, imageValue, setImageValue } = upload
    const handleSetSelected = () => {
        setSelected(null);
        router.replace(pathName);
    };
    const handleToUploadTab = () => {
        setSelectedImage()
    };


    // change val action
    const handleChangeSize = (type: string, val: number) => {
        if (type === "width") {
            setImageValue({
                ...imageValue,
                width: val
            })
        } else if (type === "height") {
            setImageValue({
                ...imageValue,
                height: val
            })
        }
    }

    const handleChangeRotateDeg = (val: number) => {
        setImageValue({
            ...imageValue,
            rotateDeg: val
        })
    }


    const handleAction = (key: string) => {
        if (key === "copy") {
            handleCopy()
        } else if (key === "delete") {
            handleDelete()
        } else if (key == "crop") {
            handleCropImage()
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
        <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between px-2">
                {
                    isSelectedImage && <ChevronLeft onClick={handleToUploadTab} />
                }

                <h3
                    className="mb-2
                text-center text-2xl font-semibold"
                >
                    Edit upload
                </h3>
                <X onClick={handleSetSelected} />
            </div>
            <div className="flex w-full items-center justify-between px-2">
                <span className="font-light text-sm">
                    Upload Size
                    <br />
                    Width  x Height
                </span>
                <div className="flex items-center gap-2">
                    <input type="number" value={imageValue.width} max={1000} className="w-20 rounded-md px-4 py-1" onChange={(e) => handleChangeSize("width", parseInt(e.target.value as string))} />
                    x
                    <input type="number" value={imageValue.height} max={1000} className="w-20 rounded-md px-4 py-1" onChange={(e) => handleChangeSize("height", parseInt(e.target.value as string))} />
                </div>
            </div>
            <hr className="mt-2" />
            <div className="flex flex-1 flex-col px-2">
                <span className=" font-semibold ">Action</span>
                <div className="flex flex-1 flex-wrap gap-2 py-2">
                    {actiions.map((i) => {
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
            <hr className="mt-2" />
            <div className="flex flex-1 flex-col px-2">
                <span className=" font-semibold ">Position & Layering</span>
                <div className="flex flex-1 flex-wrap gap-2 py-2">
                    {positionFeatures.map((i) => {
                        return (
                            <div
                                onClick={() => handleLayering(i.key)}
                                key={i.key} className="flex flex-col items-center justify-center">
                                <div
                                    title={i.name}
                                    className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                                    {i.icon}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <hr className="mt-2" />
            <div className="flex items-start gap-2 mt-2 px-2 flex-col">
                <span className="font-semibold">Rotation</span>
                <div className="flex items-center gap-2 w-full">
                    <input type="range" min={0} max={360} className="w-full" value={imageValue.rotateDeg} onChange={(e) => handleChangeRotateDeg(parseInt(e.target.value as string))} />
                    <input min={0} max={360} type="number" className="w-24 rounded-md px-4 py-1" value={imageValue.rotateDeg} onChange={(e) => handleChangeRotateDeg(parseInt(e.target.value as string))} />
                </div>

            </div>

            <div className=" relative  w-full px-2 flex flex-col">

                <span className="font-semibold">Image Review</span>
                <div className=" relative h-60 bg-cover w-60 px-2">
                    <Image fill src={imageValue.imageUrl} alt="image review" />
                </div>

            </div>
        </div>
    );
};

export default ImageDesignTool;
