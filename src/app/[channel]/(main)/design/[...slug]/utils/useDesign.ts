import { create } from "zustand";
import { type PrintFaceData } from "./type";
//import { type SizeColor } from "./test";

type ColorType = {
    colorCode: string
    setColorCode: (color: string) => void
}

type ImageValue = {
    imageUrl: string,
    width: number,
    height: number,
    rotateDeg: number
}

type UploadType = {
    isSelectedImage: boolean,
    imageValue: ImageValue
    setSelectedImage: () => void,
    setImageValue: (val: ImageValue) => void
}

export enum TextTypeEnum { "NORMAL", "BOLD", "ITALIC" }

type Text = {
    size: number,
    rotate: number,
    color: string,
    type?: TextTypeEnum
    fontFamily?: string
    content?: string
}

type TextType = {
    isSelectedText: boolean,
    setIsSelectedText: () => void,
    text: Text
    setTextVal: (textVal: Text) => void
}

type ColorDesign = {
    color_name: string,
    color_value: string,
    meta_data: {
        key: string,
        value: string
    },
    variant_id: string
}






export type DesignType = {
    sizeDefault: string,
    setSizeDefault: (size: string) => void,
    // listVariantSizeColor: SizeColor[]
    //setListVariantSizeColor: (list: SizeColor[]) => void
    face: string
    playGroundData: PrintFaceData[] | null
    setPlayGroundData: (data: PrintFaceData[]) => void
    colorDesign: ColorDesign,
    setColorDesign: (color: ColorDesign) => void
    colorDesigns: ColorDesign[],
    setColorDesigns: (color: ColorDesign[]) => void
    selected: string | null,
    setSelected: (selected: string | null) => void
    color: ColorType
    upload: UploadType
    text: TextType


    copyFnc: () => void | null
    setCopyFnc: (fnc: () => void) => void
    handleCopy: () => void
    handleDelete: () => void
    handleCropImage: () => void
    centerWidth: () => void
    centerHeight: () => void
    bringToFront: () => void
    sendToBack: () => void
    handleRedo: () => void
    handleUndo: () => void
    handleChangeFace: (face: string) => void

}

export const useDesign = create<DesignType>()((set) => ({
    sizeDefault: "",
    setSizeDefault: (size: string) => set(() => ({
        sizeDefault: size
    })),
    listVariantSizeColor: [],
    // setListVariantSizeColor: (list: SizeColor[]) => set(() => ({
    //     listVariantSizeColor: list
    // })),
    face: "front",
    selected: null,
    setSelected: (selected) => set(() => ({
        selected: selected
    })),
    playGroundData: null,
    setPlayGroundData: (data: PrintFaceData[]) => set(() => ({
        playGroundData: data
    })),
    colorDesign: {
        size_default: "",
        color_name: "",
        color_value: "",
        meta_data: {
            key: "",
            value: ""
        },
        variant_id: ""
    },
    setColorDesign: (color: ColorDesign) => set(() => ({
        colorDesign: color
    })),
    // Color Tabs Action
    colorDesigns: [{
        color_name: "",
        color_value: "",
        meta_data: {
            key: "",
            value: ""
        },
        variant_id: ""
    }],
    setColorDesigns: (color: ColorDesign[]) => set(() => ({
        colorDesigns: color
    })),
    color: {
        colorCode: "",
        setColorCode: (color) => set((state) => ({
            color: {
                ...state.color,
                colorCode: color
            }
        }))
    },
    // Upload Tabs Action
    upload: {
        isSelectedImage: false,
        imageValue: {
            width: 100,
            height: 100,
            imageUrl: "",
            rotateDeg: 0,
        },
        setSelectedImage: () => set((state) => ({
            upload: {
                ...state.upload,
                isSelectedImage: !state.upload.isSelectedImage
            }
        })),
        setImageValue: (val: ImageValue) => set((state) => ({
            upload: {
                ...state.upload,
                imageValue: val
            }
        }))
    },
    // Text Tabs Action
    text: {
        isSelectedText: false,
        setIsSelectedText: () => set((state) => ({
            text: {
                ...state.text,
                isSelectedText: !state.text.isSelectedText
            }
        })),
        text: {
            size: 16,
            rotate: 0,
            color: "#000000",
            type: TextTypeEnum.NORMAL,
            fontFamily: "Arial",
            content: ""
        },
        setTextVal: (textVal: Text) => set((state) => ({
            text: {
                ...state.text,
                text: textVal
            }
        }))

    },
    copyFnc: () => { },
    setCopyFnc: (fnc: () => void) => set(() => ({
        copyFnc: fnc
    })),
    // handle actions
    handleCopy: () => {
        // Gọi hàm copyFnc nếu đã được gán
        set((state) => {
            if (typeof state.copyFnc === "function") {
                state.copyFnc();
            }
            return {};
        });
    },
    handleDelete: () => {
        alert("heheh");
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    handleCropImage: () => {
        alert("heheh");
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    centerWidth: () => {
        alert("heheh");
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    centerHeight: () => {
        alert("heheh");
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    bringToFront: () => {
        alert("heheh");
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    sendToBack: () => {
        alert("heheh");
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    handleRedo: () => {
        alert("heheh");
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    handleUndo: () => {
        // Update state if needed, for now do nothing:
        set(() => ({}));
    },
    handleChangeFace: (face: string) => {
        set(() => ({
            face: face
        }));
    },
}))