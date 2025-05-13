export interface PrintFaceData {
  name: string;
  code: string;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  image: string;
  z_index: number;
}

export const data: PrintFaceData[] = [
  {
    name: "front",
    code: "front",
    position: {
      x: 1.0,
      y: 1.0,
    },
    width: 10,
    height: 20,
    image: "/img/crew_front.png",
    z_index: 1,
  },
  {
    name: "back",
    code: "back",
    position: {
      x: 1.0,
      y: 1.0,
    },
    width: 10,
    height: 20,
    image: "/img/crew_back.png",
    z_index: 2,
  },
];

export interface DesignFace {
  final_image_url: string,
  designs: Array<object>
}

export interface DesignInfo {
  productId: string,
  variantId: string | null,
  colorData: Record<string, object>;
  colorValue: string,
  faces: PrintFaceData[];
  backgroundColor: string;
  designs: Array<DesignFace>;
}

export interface UploadDataType {
  file: File
}