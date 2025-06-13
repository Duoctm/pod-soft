/* eslint-disable import/no-default-export */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Typography, Box, Paper, Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { Rnd } from "react-rnd";
import Konva from "konva";
import {
  Pen,
  ShirtIcon,
  ShoppingCart,
  XIcon,
  MousePointerClickIcon,
  Palette,
  CloudUpload,
  Type,
  X,
  Check,
  Copy,
  Trash,
  PenTool,
  Crop,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  BringToFront,
  SendToBack,
  ChevronLeft,
  RedoIcon,
  Undo,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import TShirtDesigner from "../utils/design";
import { type DesignInfo, type PrintFaceData } from "..//utils/type";
import { getMetaDtataFromColorVariant, getVariantIdFromColorSize } from "../utils/data";
import { addItem, UpdateDesign, checkUser } from "../utils/checkout";
import { fetchProductDetail } from "../utils/test";
import "react-toastify/dist/ReactToastify.css";
import { useDesign } from "../utils/useDesign";
import { cn } from "@/lib/utils";
import { redoStackHistory, undoStackHistory } from "../utils/designHistory";

interface DesignPageProps {
  variantId: string;
  productId: string;
  colorId: string;
  designInfor: DesignInfo | null;
  typeDesign: number;
  channel: string;
}


function DesignPage(param: DesignPageProps) {
  const router = useRouter();
  const params = useSearchParams();

  const { selected, setSelected } = useDesign();
  const [variantSizeColor, setVariantSizeColor] = useState<Map<string, object> | null>(new Map());
  const [sizeIdDefault, setSizeIdDefault] = useState<string>();

  const [colorData, setColorData] = useState<Map<string, object>>(new Map());
  const [data, setData] = useState<PrintFaceData[]>([]);
  const [colorLoading, setColorLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  let sort_data = data.sort((a, b) => a.z_index - b.z_index);
  const designerRef = useRef<TShirtDesigner | null>(null);
  //const [importError, setImportError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string>(param.productId);
  const [colorId, setColorId] = useState<string>(param.colorId);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [showObjectMenu, setShowObjectMenu] = useState(false);
  const [menuIndex, setMenuIndex] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
  const [resizeWidth, setResizeWidth] = useState<number | undefined>(undefined);
  const [resizeHeight, setResizeHeight] = useState<number | undefined>(undefined);
  const [maxResizeWidth, setMaxResizeWidth] = useState<number | undefined>(undefined);
  const [maxResizeHeight, setMaxResizeHeight] = useState<number | undefined>(undefined);
  const [rotationAngle, setRotationAngle] = useState<number | undefined>(undefined);
  const [resizeFontSize, setFontSize] = useState<number | undefined>(undefined);
  const [maxResizeFontSize, setMaxFontSize] = useState<number | undefined>(undefined);
  const [variantIdOfUpdate, setVariantIdOfUpdate] = useState<string | null>(null);
  const [isSpinner, setSpinner] = useState<boolean>(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>("");
  const cropContainerRefMobile = useRef<HTMLDivElement | null>(null);
  const cropContainerRefDesktop = useRef<HTMLDivElement | null>(null);

  const [isShowDialog, setIsShowDialog] = useState<boolean>(false);
  const [isShowFaceDialog, setIsShowFaceDialog] = useState<boolean>(false);

  const [frameState, setFrameState] = useState({
    width: 160,
    height: 200,
    top: 0,
    left: 0,
  });

  console.warn(showObjectMenu);

  const loadProductData = async (productId: string) => {
    let result: Map<string, object>;
    let variantSizeColor: Map<string, object> | null = null;
    let sizeIdDefault: string = "";
    if (param.designInfor?.colorData != null) {
      result = new Map(Object.entries(param.designInfor.colorData)); //param.designInfor.colorData;
      sizeIdDefault = param.designInfor.sizeIdDefault ?? "";
      variantSizeColor =
        param.designInfor.variantSizeColorData != null
          ? new Map(Object.entries(param.designInfor.variantSizeColorData))
          : null;
    } else {
      const data = await fetchProductDetail(productId, param.variantId);
      result = data.listColorVariant;
      sizeIdDefault = data.sizeIdDefault;
      variantSizeColor = data.listVariantSizeColor;
    }
    setColorData(result);
    setSizeIdDefault(sizeIdDefault);
    setVariantSizeColor(variantSizeColor);
  };

  const updateVariant = (colorId: string, productId: string, colorData: Map<string, object>) => {
    const result = getMetaDtataFromColorVariant(colorId, colorData);
    setData(result);
    setProductId(productId);
    setColorId(colorId);
    // const variant = getVariantIdFromColorVariant(colorId, colorData);
    // setVariantId(variant);
    setVariantId(param.variantId);
  };

  useEffect(() => {
    const fetchColorData = async () => {
      try {
        // const result = await fetchProductDetail(productId);
        // setColorData(result);
        setColorLoading(true);
        await loadProductData(productId);
        setColorLoading(false);
      } catch (error) {
        console.error("Error fetching color data:", error);
        setColorLoading(false);
        toast.error("Failed to fetch color data");
      }
    };

    // Use void operator to explicitly mark the promise as ignored
    void fetchColorData();
  }, [param.designInfor]);

  useEffect(() => {
    if (!colorLoading) {
      const fetchData = async () => {
        try {
          updateVariant(colorId, productId, colorData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [colorLoading, colorData]);

  useEffect(() => {
    if (!loading) {
      // Initialize TShirtDesigner
      designerRef.current = new TShirtDesigner(
        data.sort((a, b) => a.z_index - b.z_index),
        productId,
        variantId,
        colorId,
        colorData,
        sizeIdDefault,
        variantSizeColor,
        setMenuIndex,
        setResizeWidth,
        setResizeHeight,
        setRotationAngle,
        setFontSize,
        setMaxResizeWidth,
        setMaxResizeHeight,
        setMaxFontSize,
      );

      // Thêm callback khi chọn/bỏ chọn đối tượng
      if (designerRef.current) {
        designerRef.current.onSelectObject = (hasSelection) => {
          setShowObjectMenu(hasSelection);
        };

        const importUpload = async (designs: object[][]) => {
          await designerRef.current?.importDesignFromJson(designs);
        };
        try {
          if (param.designInfor) {
            const designs: object[][] = [];
            let index = -1;
            for (const design of param.designInfor.designs) {
              index++;
              designs[index] = design.designs;
            }

            importUpload(designs);
            setVariantIdOfUpdate(variantId);
          }
        } catch (error) {
          console.log(error);
        }
        // }
      }
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === "c" || e.key === "C" || e.key === "v" || e.key === "V")) {
          e.preventDefault(); // Ngăn chặn hành vi mặc định
          if (designerRef.current) {
            if (e.key.toLowerCase() === "c") {
              designerRef.current.copySelectedNode();
            } else if (e.key.toLowerCase() === "v") {
              designerRef.current.pasteNode();
            }
          }
        }
      };

      // Thêm event listener cho phím tắt
      document.addEventListener("keydown", handleKeyDown);

      // Xử lý sự kiện click cho thumbnail
      const handleThumbnailClick = (e: Event) => {
        if (
          designerRef.current != null &&
          designerRef.current.currentStage.stage &&
          designerRef.current.currentStage.stage?.getChildren().length > 0
        ) {
          for (const item in designerRef.current.data) {
            if (designerRef.current.stages[item] == designerRef.current.currentStage) {
              const domImage = document.getElementById(
                designerRef.current.data[item].code + "Image",
              ) as HTMLImageElement;
              designerRef.current.exportStage(designerRef.current.currentStage, domImage).then((base64) => {
                if (designerRef.current != null) {
                  designerRef.current.faceImage[designerRef.current.data[item].code] = base64;
                }
              });
            }
          }
        }
        const target = e.currentTarget as HTMLDivElement;
        const view = target.getAttribute("data-view");

        // Cập nhật active state
        document.querySelectorAll(".thumbnail").forEach((thumb) => {
          thumb.classList.remove("active");
        });
        target.classList.add("active");
        for (const item in sort_data) {
          const imageDom = document.getElementById(sort_data[item].code + "Image") as HTMLImageElement;
          const previewDom = document.getElementById("preview-" + sort_data[item].code);
          imageDom.style.display = "none";
          previewDom!.style.display = "none";
        }

        for (const item in sort_data) {
          const imageDom = document.getElementById(sort_data[item].code + "Image") as HTMLImageElement;
          const previewDom = document.getElementById("preview-" + sort_data[item].code);

          if (view === sort_data[item].code) {
            imageDom.style.display = "block";
            previewDom!.style.display = "block";
            if (designerRef.current) {
              designerRef.current.switchToStage(sort_data[item].code);
            }
          }
        }
      };

      // Thêm event listeners
      const thumbnails = document.querySelectorAll(".thumbnail");
      thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", handleThumbnailClick);
      });

      // Cleanup function
      return () => {
        if (designerRef.current) {
          // Add any cleanup code here if needed
        }
        // Remove event listeners
        thumbnails.forEach((thumb) => {
          thumb.removeEventListener("click", handleThumbnailClick);
        });
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [loading, data, param.designInfor]);

  const colors = [
    "#FFFFFF",
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#616161",
    "#f0f0f0",
    "#5b5b5b",
    "#222222",
    "#fc8d74",
    "#432d26",
    "#eead91",
    "#806355",
    "#382d21",
    "#faef93",
    "#aeba5e",
    "#8aa140",
    "#1f6522",
    "#13afa2",
    "#b8d5d7",
    "#15aeda",
    "#a5def8",
    "#0f77c0",
    "#3469b7",
    "#c50404",
  ];

  // const menuWidth = "10vw";

  const handleResizeWidthChange = (value: number | undefined) => {
    if (value == undefined) {
      return;
    }
    setResizeWidth(value);
    if (designerRef.current && value !== undefined) {
      designerRef.current.setWHOfNode(value, null);
    }
  };

  const handleResizeHeightChange = (value: number | undefined) => {
    if (value == undefined) {
      return;
    }
    setResizeHeight(value);
    if (designerRef.current && value !== undefined) {
      designerRef.current.setWHOfNode(null, value);
    }
  };

  const handleRotationChange = (value: number | undefined) => {
    if (value == undefined) {
      return;
    }
    setRotationAngle(value);
    if (designerRef.current && value !== undefined) {
      designerRef.current.setROfNodeheight(value);
    }
  };

  const handleFontSizeChange = (value: number | undefined) => {
    if (value == undefined) {
      return;
    }
    if (designerRef.current && value !== undefined) {
      designerRef.current.setRSOfNode(value);
    }
  };

  const handleDeselect = () => {
    if (designerRef.current) {
      if (designerRef.current.onSelectObject) {
        designerRef.current.onSelectObject(false);
      }
      if (designerRef.current.currentStage.borderDiv) {
        designerRef.current.currentStage.borderDiv.style.display = "none";
      }
      designerRef.current.clearBorderNode(designerRef.current.currentStage);
      designerRef.current.resetWHROfNode();
      designerRef.current.resetRSOfNode();
      setMenuIndex(0);
    }
  };

  const handleThumbnailClick = (e: Event) => {
    if (designerRef.current != null) {
      for (const item in designerRef.current.data) {
        if (designerRef.current.stages[item] == designerRef.current.currentStage) {
          const domImage = document.getElementById(
            designerRef.current.data[item].code + "Image",
          ) as HTMLImageElement;
          designerRef.current.exportStage(designerRef.current.currentStage, domImage).then((base64) => {
            if (designerRef.current != null) {
              designerRef.current.faceImage[designerRef.current.data[item].code] = base64;
            }
          });
        }
      }
    }
    const target = e.currentTarget as HTMLDivElement;
    const view = target.getAttribute("data-view");

    document.querySelectorAll(".thumbnail").forEach((thumb) => {
      thumb.classList.remove("active");
    });
    target.classList.add("active");
    for (const item in sort_data) {
      const imageDom = document.getElementById(sort_data[item].code + "Image") as HTMLImageElement;
      const previewDom = document.getElementById("preview-" + sort_data[item].code);
      imageDom.style.display = "none";
      previewDom!.style.display = "none";
    }

    for (const item in sort_data) {
      const imageDom = document.getElementById(sort_data[item].code + "Image") as HTMLImageElement;
      const previewDom = document.getElementById("preview-" + sort_data[item].code);

      if (view === sort_data[item].code) {
        imageDom.style.display = "block";
        previewDom!.style.display = "block";
        if (designerRef.current) {
          designerRef.current.switchToStage(sort_data[item].code);
        }
      }
    }
  };

  const cropImage = (cropContainerRef: React.RefObject<HTMLDivElement>) => {
    if (!cropContainerRef.current) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = cropImageUrl;
    const leftScale = frameState.left / cropContainerRef.current?.clientWidth;
    const topScale = frameState.top / cropContainerRef.current?.clientHeight;
    const widthScale = frameState.width / cropContainerRef.current?.clientWidth;
    const heightScale = frameState.height / cropContainerRef.current?.clientHeight;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width * widthScale;
      canvas.height = image.height * heightScale;
      const ctx = canvas.getContext("2d");

      // Vẽ vùng được chọn từ ảnh gốc vào canvas
      if (ctx != null) {
        ctx.drawImage(
          image,
          image.width * leftScale,
          image.height * topScale,
          image.width * widthScale,
          image.height * heightScale,
          0,
          0,
          image.width * widthScale,
          image.height * heightScale,
        );

        const croppedDataUrl = canvas.toDataURL();

        const imageNode = designerRef.current?.currentStage?.selectedNode;

        if (!imageNode || !(imageNode instanceof Konva.Image)) {
          console.warn("No image node selected or invalid node");
          return;
        }

        const newImage = new Image();
        newImage.src = croppedDataUrl;

        newImage.onload = () => {
          if (
            designerRef.current &&
            designerRef.current.currentStage &&
            designerRef.current.currentStage.stage
          ) {
            // const scale = designerRef.current?.currentStage.stage?.width() / newImage.width;
            // imageNode.width(newImage.width * scale * 0.8);
            //  imageNode.height(newImage.height * scale * 0.8);
            imageNode.offsetX(imageNode.width() / 2);
            imageNode.offsetY(imageNode.height() / 2);
            imageNode.x(designerRef.current?.currentStage.stage?.width() / 2);
            imageNode.y(designerRef.current?.currentStage.stage?.height() / 2);
            // imageNode.rotation(0);
            designerRef.current?.showBorderNode(imageNode, designerRef.current?.currentStage);

            // imageNode.x(((designerRef.current?.currentStage.stage?.width() - imageNode.width()) / 2) * scale);
            // imageNode.y(((designerRef.current?.currentStage.stage?.height() - imageNode.height()) / 2) * scale);
            imageNode.image(newImage);
            imageNode.getLayer()?.draw();
            //imageNode.setAttr('rotationOfLastWidth', imageNode.width());
            //imageNode.setAttr('rotationOfLastHeight', imageNode.height());
          }
        };
        designerRef.current?.handleAddHistory({
          node: imageNode, rotationAngle: imageNode.rotation(), CroptParam: {
            HeightScale: heightScale,
            WidthScale: widthScale,
            LeftScale: leftScale,
            TopScale: topScale
          }, action: "cropt"
        });

      }
    };
  };

  useEffect(() => {
    if (menuIndex === 3 && designerRef.current) {
      designerRef.current.changeFontWeight("normal");
      designerRef.current.changeFontStyle("normal");
      designerRef.current.changeFontFamily("Montserrat");
    }
  }, [menuIndex]);

  useEffect(() => {
    return () => {
      if (designerRef?.current?.currentStage.borderDiv) {
        designerRef.current.currentStage.borderDiv.style.display = "none";
        designerRef.current.clearBorderNode(designerRef.current.currentStage);
      }
    };
  }, []);

  useEffect(() => {
    const containerWidth = 300;
    const containerHeight = 180;

    const img = new Image();
    img.src = cropImageUrl;

    img.onload = () => {
      let scaleWidth = 1;
      let scaleHeight = 1;
      if (img.width > containerWidth) {
        scaleWidth = containerWidth / img.width;
      }
      if (img.height > containerHeight) {
        scaleHeight = containerHeight / img.height;
      }
      const standardWidth = img.width * scaleWidth;
      const standardHeight = img.height * scaleHeight;
      const clientWidth = standardWidth / 2;
      const clientHeight = standardHeight / 2;

      setFrameState({
        width: clientWidth,
        height: clientHeight,
        left: 0,
        top: 0,
      });
    };
  }, [cropImageUrl]);

  useEffect(() => {
    const defaultSelected = params.get("value");
    setSelected(defaultSelected);
  }, [params]);

  return (
    <>
      {isSpinner && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
      )}
      <ToastContainer />
      <Box className="relative flex h-screen w-full flex-1 flex-row items-center justify-start">
        <div
          id="rightMenu"
          className="lg:flex h-full w-full max-w-[370px] flex-row overflow-hidden rounded-md border hidden "
        >
          <div className="flex h-full w-20 flex-col items-start justify-start bg-[#743C54] pt-2 text-white relative ">
            <div
              className={cn(
                "flex h-20 w-20 flex-col items-center justify-center hover:bg-white/20 hover:text-white",
                { "border-l-[4px] border-l-blue-500 bg-white text-black": selected === "color" },
              )}
              onClick={() => {
                //setIsColorModalOpen(true)
                router.push(`?value=color`);
                handleDeselect();
                setMenuIndex(1);
              }}
              id="color"
            >
              <Palette className="h-8 w-8" />
              <span className="text-xs">Color</span>
            </div>
            <div
              id="uploadFromPC"
              className={cn(
                "flex h-20 w-20 flex-col items-center justify-center hover:bg-white/20 hover:text-white",
                { "border-l-[4px] border-l-blue-500 bg-white text-black": selected === "upload" },
              )}
              onClick={() => {
                router.push(`?value=upload`);
                handleDeselect();
                setMenuIndex(2);
              }}
            >
              <CloudUpload className="h-8 w-8" />
              <span className="text-xs">Images</span>
            </div>
            <button
              id="addingText"
              onClick={() => {
                router.push(`?value=add-text`);
                handleDeselect();
                setMenuIndex(3);
              }}
              className={cn(
                "flex h-20 w-20 flex-col items-center justify-center hover:bg-white/20 hover:text-white",
                { "border-l-[4px] border-l-blue-500 bg-white text-black": selected === "add-text" },
              )}
            >
              <Type className="h-8 w-8" />
              <span className="text-xs">Text</span>
            </button>
          </div>
          {/* Function Area */}
          <div className="h-full w-full  !bg-white  p-2  lg:flex lg:flex-col relative">
            <div className="w-full items-start">
              <input
                type="file"
                id="file-select"
                name="file-select"
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
              />
              {menuIndex === 0 && (
                <div className="flex flex-col items-center px-2 md:pt-3">
                  <h3 className="text-2xl font-bold">What&apos;s next for you?</h3>
                  <div className="mt-4 grid w-full grid-cols-1 items-center justify-items-center gap-2">
                    <div
                      onClick={() => setMenuIndex(1)}
                      className="flex w-full flex-col items-center justify-center rounded-md border py-2 shadow-inner transition-all hover:scale-95 hover:bg-slate-50"
                    >
                      <Palette className="h-8 w-8" />
                      <span className="text-xl font-medium">Colors</span>
                    </div>
                    <div
                      onClick={() => setMenuIndex(2)}
                      className="flex w-full flex-col items-center justify-center rounded-md border py-2 shadow-inner transition-all hover:scale-95 hover:bg-slate-50"
                    >
                      <CloudUpload className="h-8 w-8" />
                      <span className="text-xl font-medium">Images</span>
                    </div>
                    <div
                      onClick={() => setMenuIndex(3)}
                      className="flex w-full flex-col items-center justify-center rounded-md border py-2 shadow-inner transition-all hover:scale-95 hover:bg-slate-50"
                    >
                      <Type className="h-8 w-8" />
                      <span className="text-xl font-medium">Text</span>
                    </div>
                  </div>
                </div>
              )}

              {menuIndex === 1 && (
                <div className="flex flex-1 flex-col p-2">
                  <div className="flex items-center justify-between ">
                    <span className="text-md font-semibold">Choose Color</span>
                    <X />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 ">
                    {Array.from(colorData.entries()).map(([key, value]) => (
                      <div
                        key={key}
                        onClick={() => {
                          if (designerRef.current) {
                            setLoading(true);
                            const result = getMetaDtataFromColorVariant(key, colorData);
                            sort_data = result.sort((a, b) => a.z_index - b.z_index);

                            for (const item of result) {
                              const imageDom = document.getElementById(
                                item.code + "Image",
                              ) as HTMLImageElement;
                              const thumbnailDom = document.getElementById(`thumb-${item.code}`);
                              imageDom.src = item.image;
                              if (thumbnailDom) {
                                thumbnailDom.setAttribute("src", item.image);
                              }
                            }
                            const thumbnails = document.querySelectorAll(".thumbnail");
                            thumbnails.forEach((thumb) => {
                              thumb.addEventListener("click", handleThumbnailClick);
                            });

                            designerRef.current.data = result;
                            designerRef.current.colorValue = key;
                            if (variantSizeColor) {
                              const selectVariant = getVariantIdFromColorSize(
                                key,
                                sizeIdDefault,
                                variantSizeColor,
                              );

                              if (selectVariant !== undefined) {
                                setVariantId(selectVariant);
                              }
                            }
                            setLoading(false);
                          }
                        }}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md border-2 hover:border-black/50",
                          { "border-black": designerRef.current?.colorValue === key },
                        )}
                        style={{ backgroundColor: (value as { color_value: string }).color_value }}
                      >
                        {designerRef.current?.colorValue === key && <Check />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(menuIndex === 2 || menuIndex === 5) && (
                <div className="flex w-full max-w-xs flex-1 flex-col ">

                  {menuIndex === 2 && (
                    <>
                      <div className="w-full flex items-center justify-between">
                        <span className="font-semibold">Images</span>
                        <X onClick={() => setMenuIndex(0)} />
                      </div>
                      <hr className="mt-2" />
                      <div className="flex items-center justify-center w-full ">

                        <label
                          htmlFor="dropzone-file"
                          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition border-gray-300`}
                          onClick={() => {
                            const fileInput = document.getElementById("file-select");
                            if (fileInput) {
                              fileInput.click();
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.style.borderColor = "#1976d2";
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.style.borderColor = "#282c34";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.style.borderColor = "#282c34";

                            const files = e.dataTransfer.files;
                            if (files && files.length > 0) {
                              const file = files[0];
                              if (file.type.startsWith("image/")) {
                                const fileInput = document.getElementById("file-select") as HTMLInputElement;
                                if (fileInput) {
                                  const dataTransfer = new DataTransfer();
                                  dataTransfer.items.add(file);
                                  fileInput.files = dataTransfer.files;
                                  fileInput.dispatchEvent(new Event("change", { bubbles: true }));
                                }
                              }
                            }
                          }}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 800x400px)</p>
                          </div>
                        </label>
                      </div>
                    </>
                  )}

                  {menuIndex === 5 && (
                    <div className="flex w-full max-w-xs flex-1 flex-col ">
                      <div className="flex items-center justify-between w-full">
                        <ChevronLeft onClick={() => setMenuIndex(2)} />
                        <h3
                          className="
                        text-center text-2xl font-semibold"
                        >
                          Image Tools
                        </h3>
                        <X onClick={() => setMenuIndex(0)} />
                      </div>

                      <hr className="mt-2" />
                      <div className="flex flex-1 flex-col px-2">
                        <span className=" font-semibold ">Action</span>
                        <div className="flex flex-1 flex-wrap gap-2 py-2">
                          <div
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.copySelectedNode();
                              }
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                              <Copy />
                            </div>
                            <span className="text-sm font-light">Copy</span>
                          </div>
                          <div
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.deleteSelectedNode();
                              }
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                              <Trash />
                            </div>
                            <span className="text-sm font-light">Delete</span>
                          </div>
                          <div
                            onClick={() => {
                              handleDeselect();
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                              <PenTool />
                            </div>
                            <span className="text-sm font-light">Deselect</span>
                          </div>
                          <div
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (designerRef?.current?.currentStage.selectedNode == undefined) {
                                return;
                              }
                              console.log(designerRef)
                              const newUrl =
                                designerRef.current?.originImageOfStage[
                                designerRef.current.currentStage.selectedNode?.id()
                                ];

                              setCropImageUrl(newUrl);
                              if (designerRef.current?.currentStage.selectedNode != null) {
                                setMenuIndex(7);
                              }
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                              <Crop />
                            </div>
                            <span className="text-sm font-light">Crop</span>
                          </div>
                        </div>
                      </div>
                      <hr className="mt-2" />
                      <div className="flex flex-1 flex-col px-2">
                        <span className=" font-semibold ">Position & Layering</span>
                        <div className="flex flex-1 flex-wrap gap-2 py-2">
                          <div
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.setWidthCenterPosition();
                              }
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div
                              title={"center width"}
                              className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                            >
                              <AlignHorizontalSpaceAround />
                            </div>
                          </div>

                          <div
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.setHeightCenterPosition();
                              }
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div
                              title={"center height"}
                              className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                            >
                              <AlignVerticalSpaceAround />
                            </div>
                          </div>

                          <div
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.bringToFrontNode();
                              }
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div
                              title={"bring to front"}
                              className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                            >
                              <BringToFront />
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.sendToBackNode();
                              }
                            }}
                            className="flex flex-col items-center justify-center"
                          >
                            <div
                              title={"send to back"}
                              className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                            >
                              <SendToBack />
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr className="mt-2" />
                      <div className="flex w-full flex-col items-start justify-between px-2">
                        <span className=" font-semibold ">Upload Size (Width x Height)</span>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            value={resizeWidth || 0}
                            max={maxResizeWidth}
                            className="w-20 rounded-md px-4 py-1"
                            onChange={(e) => {
                              handleResizeWidthChange(e.target.value ? Number(e.target.value) : undefined);
                            }}
                          />
                          x
                          <input
                            type="number"
                            max={maxResizeHeight}
                            className="w-20 rounded-md px-4 py-1"
                            value={resizeHeight || 0}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onChange={(e) =>
                              handleResizeHeightChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </div>
                      </div>
                      <hr className="mt-2" />
                      <div className="mt-2 flex flex-col items-start gap-2 px-2">
                        <span className="font-semibold">Rotation</span>
                        <div className="flex w-full items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={360}
                            className="w-full"
                            value={Math.round(rotationAngle || 0)}
                            onChange={(e) =>
                              handleRotationChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                          <input
                            min={0}
                            max={360}
                            type="number"
                            className="w-24 rounded-md px-4 py-1"
                            value={Math.round(rotationAngle || 0)}
                            onChange={(e) => handleRotationChange(Number(e.target.value))}
                          />
                          deg
                        </div>
                      </div>

                      <hr className="mt-2" />
                    </div>
                  )}
                </div>
              )}

              {(menuIndex === 3 || menuIndex === 6) && (
                <>
                  {menuIndex == 3 && (
                    <div className="flex flex-1 flex-col px-2">
                      <div className="flex w-full items-center justify-between py-2">
                        <span className="font-semibold"> Edit Text</span>
                        <X onClick={() => setMenuIndex(0)} />
                      </div>
                      <hr className="mt-2" />

                      <input
                        className="rounded-md focus:border-blue-500 focus:ring-2 w-full mt-2"
                        id="textInput"
                        placeholder="Enter your text here..."
                      />


                      <hr className="mt-2" />
                      <div className="flex w-full items-start justify-between flex-col mt-2">
                        <span className="font-semibold">Color</span>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color: string) => (
                            <div
                              key={color}
                              className="w-7 h-7 rounded-md border hover:border-black/50 cursor-pointer transition-transform transform hover:scale-110"
                              style={{ backgroundColor: color }}
                              data-color={color}
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.changeTextColor(color);
                                  const textInput = document.getElementById(
                                    "textInput",
                                  ) as HTMLTextAreaElement;
                                  if (textInput) {
                                    textInput.style.color = color;
                                  }
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <hr className="mt-2" />
                      <div className="flex w-full flex-col mt-2">
                        <span className="font-semibold">Text Style</span>
                        <div className="flex items-center gap-4">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (designerRef.current) {
                                  const textInput = document.getElementById(
                                    "textInput",
                                  ) as HTMLTextAreaElement;
                                  if (textInput) {
                                    textInput.style.fontWeight = e.target.checked ? "bold" : "normal";
                                    designerRef.current.changeFontWeight(
                                      e.target.checked ? "bold" : "normal",
                                    );
                                  }
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-[#743C54] focus:ring-[#743C54]"
                            />
                            <span className="font-bold">Bold</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (designerRef.current) {
                                  const textInput = document.getElementById(
                                    "textInput",
                                  ) as HTMLTextAreaElement;
                                  if (textInput) {
                                    textInput.style.fontStyle = e.target.checked ? "italic" : "normal";
                                    designerRef.current.changeFontStyle(
                                      e.target.checked ? "italic" : "normal",
                                    );
                                  }
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-[#743C54] focus:ring-[#743C54]"
                            />
                            <span className="italic">Italic</span>
                          </label>
                        </div>
                      </div>

                      <hr className="mt-2" />
                      <div id="fontFamily" className="flex w-full flex-col mt-2">
                        <span className="font-semibold">Text Style</span>
                        <select
                          className="w-full rounded-lg border"
                          id="chooseFontFamily"
                          onChange={(e) => {
                            if (designerRef.current) {
                              designerRef.current.changeFontFamily(e.target.value);
                              const textInput = document.getElementById("textInput") as HTMLTextAreaElement;
                              if (textInput) {
                                textInput.style.fontFamily = e.target.value;
                              }
                            }
                          }}
                        >
                          <option value="Montserrat" style={{ fontFamily: "Montserrat, sans-serif" }}>Montserrat</option>
                          <option value="Sans Serif" style={{ fontFamily: "sans-serif" }}>Sans Serif</option>
                          <option value="Arial" style={{ fontFamily: "Arial, sans-serif" }}>Arial</option>
                          <option value="Comic Sans MS" style={{ fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Comic Sans MS</option>
                          <option value="Times New Roman" style={{ fontFamily: "Times New Roman, serif" }}>Times New Roman</option>
                          <option value="Courier New" style={{ fontFamily: "Courier New, monospace" }}>Courier New</option>
                          <option value="Verdana" style={{ fontFamily: "Verdana, sans-serif" }}>Verdana</option>
                          <option value="Trebuchet MS" style={{ fontFamily: "Trebuchet MS, sans-serif" }}>Trebuchet MS</option>
                          <option value="Arial Black" style={{ fontFamily: "Arial Black, sans-serif" }}>Arial Black</option>
                          <option value="Impact" style={{ fontFamily: "Impact, sans-serif" }}>Impact</option>
                          <option value="Bookman" style={{ fontFamily: "Bookman, serif" }}>Bookman</option>
                          <option value="Garamond" style={{ fontFamily: "Garamond, serif" }}>Garamond</option>
                          <option value="Palatino" style={{ fontFamily: "Palatino, serif" }}>Palatino</option>
                          <option value="Georgia" style={{ fontFamily: "Georgia, serif" }}>Georgia</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="mt-2 w-full rounded-lg border border-gray-300  py-2 focus:border-gray-300 focus:outline-none focus:ring-0 text-white bg-[#8C3859]"
                        id="submitText"
                        onClick={() => {
                          const text = (
                            document.getElementById("textInput") as HTMLTextAreaElement
                          ).value.trim();
                          if (text && designerRef.current) {
                            designerRef.current.addText(text);
                            const textInput = document.getElementById("textInput") as HTMLTextAreaElement;
                            if (textInput) {
                              textInput.value = "";
                            }
                          }
                        }}
                      >
                        Add Text
                      </button>
                    </div>
                  )
                  }

                  {
                    menuIndex === 6 && (
                      <div className="flex w-full max-w-xs flex-1 flex-col ">
                        <div className="flex items-center justify-between w-full">
                          <ChevronLeft onClick={() => setMenuIndex(3)} />
                          <h3
                            className="
                        text-center text-2xl font-semibold"
                          >
                            Text Tools
                          </h3>
                          <X onClick={() => setMenuIndex(0)} />
                        </div>

                        <hr className="mt-2" />
                        <div className="flex flex-1 flex-col px-2">
                          <span className=" font-semibold ">Action</span>
                          <div className="flex flex-1 flex-wrap gap-2 py-2">
                            <div
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.copySelectedNode();
                                }
                              }}
                              className="flex flex-col items-center justify-center"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                                <Copy />
                              </div>
                              <span className="text-sm font-light">Copy</span>
                            </div>
                            <div
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.deleteSelectedNode();
                                }
                              }}
                              className="flex flex-col items-center justify-center"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                                <Trash />
                              </div>
                              <span className="text-sm font-light">Delete</span>
                            </div>
                            <div
                              onClick={() => {
                                handleDeselect();
                              }}
                              className="flex flex-col items-center justify-center"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                                <PenTool />
                              </div>
                              <span className="text-sm font-light">Deselect</span>
                            </div>
                          </div>
                        </div>
                        <hr className="mt-2" />
                        <div className="flex flex-1 flex-col px-2">
                          <span className=" font-semibold ">Position & Layering</span>
                          <div className="flex flex-1 flex-wrap gap-2 py-2">
                            <div
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.setWidthCenterPosition();
                                }
                              }}
                              className="flex flex-col items-center justify-center"
                            >
                              <div
                                title={"center width"}
                                className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                              >
                                <AlignHorizontalSpaceAround />
                              </div>
                            </div>

                            <div
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.setHeightCenterPosition();
                                }
                              }}
                              className="flex flex-col items-center justify-center"
                            >
                              <div
                                title={"center height"}
                                className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                              >
                                <AlignVerticalSpaceAround />
                              </div>
                            </div>

                            <div
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.bringToFrontNode();
                                }
                              }}
                              className="flex flex-col items-center justify-center"
                            >
                              <div
                                title={"bring to front"}
                                className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                              >
                                <BringToFront />
                              </div>
                            </div>
                            <div
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.sendToBackNode();
                                }
                              }}
                              className="flex flex-col items-center justify-center"
                            >
                              <div
                                title={"send to back"}
                                className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                              >
                                <SendToBack />
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr className="mt-2" />
                        <div className="mt-2 flex flex-col items-start gap-2 px-2">
                          <span className="font-semibold">FrontSize</span>
                          <div className="flex w-full items-center gap-2">
                            <input
                              type="range"
                              value={resizeFontSize || 0}
                              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                              style={{ accentColor: "#1976d2" }}
                              min="0"
                              max={maxResizeFontSize}
                              className="w-full"
                            />
                            <input
                              type="number"
                              value={resizeFontSize || 0}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) =>
                                handleFontSizeChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                              max={maxResizeFontSize}
                              className="w-20 rounded border px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                              placeholder="Width"
                              min="0"
                            />
                            px
                          </div>
                        </div>
                        <hr className="mt-2" />
                        <div className="mt-2 flex flex-col items-start gap-2 px-2">
                          <span className="font-semibold">Rotation</span>
                          <div className="flex w-full items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={360}
                              className="w-full"
                              value={Math.round(rotationAngle || 0)}
                              onChange={(e) =>
                                handleRotationChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                            <input
                              min={0}
                              max={360}
                              type="number"
                              className="w-24 rounded-md px-4 py-1"
                              value={Math.round(rotationAngle || 0)}
                              onChange={(e) => handleRotationChange(Number(e.target.value))}
                            />
                            deg
                          </div>
                        </div>

                        <hr className="mt-2" />
                      </div>
                    )
                  }


                  <Box>
                  </Box>
                </>
              )}
              {
                menuIndex === 7 && <div className="flex flex-1 flex-col">
                  <div className="flex  flex-1 items-center justify-between mt-2">
                    <ChevronLeft onClick={() => setMenuIndex(2)} />
                    <h3 className="text-center text-2xl font-semibold">Crop Image</h3>
                    <X onClick={() => setMenuIndex(0)} />
                  </div>
                  <div className="w-full h-40 flex items-center justify-center" ref={cropContainerRefDesktop}>
                    {
                      cropImageUrl ? <>
                        <img
                          src={cropImageUrl}
                          style={{
                            width: "100%",           // Chiếm hết chiều rộng của Box
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                        <Rnd
                          size={{ width: frameState.width, height: frameState.height }}
                          position={{ x: frameState.left, y: frameState.top }}
                          bounds="parent"
                          onDrag={(e, d) => {
                            console.warn(e, d);
                            if (designerRef.current == null) {
                              return;
                            }
                            const newState = {
                              ...frameState,
                              left: d.x,
                              top: d.y,
                            };
                            setFrameState(newState);
                          }}
                          onResizeStop={(e, __, ref, ___, position) => {
                            if (designerRef.current == null) {
                              return;
                            }
                            console.warn(e);

                            const newState = {
                              width: parseInt(ref.style.width),
                              height: parseInt(ref.style.height),
                              top: position.y,
                              left: position.x,
                            };
                            setFrameState(newState);
                          }}
                          style={{
                            border: "2px dashed black",
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                            zIndex: 10,
                          }}
                        />
                      </> : <Typography color="text.secondary">No image selected</Typography>
                    }
                  </div>
                  <div
                    className="mt-2 flex w-full items-center justify-center bg-[#8C3859] py-2 text-white rounded-md cursor-pointer hover:bg-[#743C54] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      cropImage(cropContainerRefDesktop);
                      //designerRef.current?.clearBorderNode(designerRef.current?.currentStage);
                    }}
                  >
                    Submit
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <Box
          className="flex min-h-[calc(100vh-142px)] flex-1 items-center justify-center lg:items-start relative"
          component="section"
          id="editorImage"
        >
          <div className='w-16 flex flex-col  border-2  rounded-md absolute top-0 left-1 lg:left-2 '>
            <div
              onClick={() => {
                if (!designerRef.current?.currentStage)
                  return;
                const result = redoStackHistory(designerRef.current?.currentStage.StackHistories);

                if (result != null) {
                  if (designerRef.current) {
                    //designerRef.current.updateHistoryStatus(result.type, result.id, result.node);
                    designerRef.current.updateHistoryStatus(result, "redo");
                  }
                }
              }}
              onTouchStart={() => {
                if (!designerRef.current?.currentStage)
                  return;
                const result = redoStackHistory(designerRef.current?.currentStage.StackHistories);

                if (result != null) {
                  if (designerRef.current) {
                    //designerRef.current.updateHistoryStatus(result.type, result.id, result.node);
                    designerRef.current.updateHistoryStatus(result, "redo");
                  }
                }
              }}
              className='w-full h-16 flex items-center justify-center hover:bg-black/10 flex-col'>
              <RedoIcon />
              Redo
            </div>
            <div
              onClick={() => {
                if (!designerRef.current?.currentStage)
                  return;

                const result = undoStackHistory(designerRef.current?.currentStage.StackHistories);
                /*if (result != null) {

                  if (result.node != null) {

                    designerRef.current.updateHistoryStatus(result.type, result.id, result.node);

                  }
                  else if (result.node == null) {
                    const nodes = designerRef.current?.currentStage.layer?.getChildren();
                    if (nodes) {
                      for (const nodeChild of nodes) {
                        if (nodeChild.id() == result.id) {
                          nodeChild.destroy();
                          designerRef.current?.clearBorderNode(designerRef.current.currentStage)
                          break;
                        }
                      }
                    }
                  }
                }*/
                if (result != null)

                  designerRef.current.updateHistoryStatus(result, "undo");
              }}
              onTouchStart={() => {
                if (!designerRef.current?.currentStage)
                  return;

                const result = undoStackHistory(designerRef.current?.currentStage.StackHistories);
                /*if (result != null) {

                  if (result.node != null) {

                    designerRef.current.updateHistoryStatus(result.type, result.id, result.node);

                  }
                  else if (result.node == null) {
                    const nodes = designerRef.current?.currentStage.layer?.getChildren();
                    if (nodes) {
                      for (const nodeChild of nodes) {
                        if (nodeChild.id() == result.id) {
                          nodeChild.destroy();
                          designerRef.current?.clearBorderNode(designerRef.current.currentStage)
                          break;
                        }
                      }
                    }
                  }
                }*/
                if (result != null)

                  designerRef.current.updateHistoryStatus(result, "undo");
              }}
              className='w-full h-16 flex items-center justify-center hover:bg-black/20 flex-col'>
              <Undo />
              Undo

            </div>

          </div>

          {sort_data.map((item: PrintFaceData, index: number) => {
            return (
              <Box key={index}>
                <Box
                  component="img"
                  id={item.code + "Image"}
                  className={
                    index == 0
                      ? item.code + "Image border-2 border-dashed "
                      : item.code + "Image hidden border-2 border-dashed "
                  }
                  src={item.image}
                  alt=""
                  crossOrigin="anonymous"
                  sx={{
                    height: "auto",
                    width: "auto",
                    maxHeight: "100vh",
                  }}
                />
                <div id={"preview-" + item.code}></div>
              </Box>
            );
          })}
        </Box>

        <div className="absolute right-2  top-0 flex-col gap-2 rounded-md border bg-white p-1 hidden lg:flex">
          {!sort_data
            ? Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="h-24 w-24 animate-pulse rounded-md border bg-gray-200" />
            ))
            : sort_data.map((face, index) => {
              // const faceChange = face.name.toLocaleLowerCase()
              return (
                <img
                  id={`thumb-${face.code}`}
                  data-view={face.code}
                  // onClick={() => handleChangeFace(faceChange)}
                  src={face.image}
                  width={96}
                  height={96}
                  alt={face.name}
                  key={face.name}
                  className={cn(
                    "thumbnail rounded-md border hover:bg-black/10",
                    {
                      "thumbnail active": index === 0,
                    },

                    // {"border-[#8C3859] border-2 bg-black/10": face.name.toLocaleLowerCase() === designerRef.current.des }
                  )}
                />
              );
            })}

          {(param.typeDesign == 1 || (param.typeDesign == 2 && variantId != variantIdOfUpdate)) && (
            <Button
              sx={{
                backgroundColor: "#743C54",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#2b2966",
                },
                width: "100%",
                mt: "20px",
                textTransform: "none",
              }}
              onClick={async () => {
                const isLogin = await checkUser();

                if (isLogin == false) {
                  window.location.replace(`/${param.channel}/login`);
                }
                setSpinner(true);
                const json = localStorage.getItem("cart");

                if (json != null && json !== undefined) {
                  const cartItem = JSON.parse(json) as {
                    params: any; // Loại của params có thể thay đổi tuỳ theo nhu cầu
                    selectedVariantId: string;
                    quantity: number;
                  };

                  if (designerRef.current != null) {
                    let metaData = null;
                    const printFace: { data: string[] } = { data: [] };
                    let hasObjectInStage = false;
                    if (designerRef.current.stages != null) {
                    }
                    for (const stage of designerRef.current.stages) {
                      if (
                        stage.layer?.getChildren().length != null &&
                        stage.layer?.getChildren().length > 0
                      ) {
                        hasObjectInStage = true;
                        break;
                      }
                    }
                    if (hasObjectInStage == true) {
                      metaData = (await designerRef.current.exportDesignToJson()) as any;

                      for (const item of metaData.designs) {
                        if (item.designs.length > 0) {
                          printFace.data.push(item.face_code);
                        }
                      }
                      if (printFace.data.length > 0) {
                        metaData.face_code = printFace;
                      }
                    }
                    let result = false;
                    if (param.typeDesign == 1) {
                      result = (await addItem(
                        cartItem.params,
                        variantId,
                        cartItem.quantity,
                        JSON.stringify(metaData, null, 2),
                      )) as boolean;
                    } else {
                      result = (await addItem(
                        cartItem.params,
                        variantId,
                        1,
                        JSON.stringify(metaData, null, 2),
                      )) as boolean;
                    }
                    if (result === true) {
                      toast.success("Design added to cart successfully");
                    } else {
                      toast.error("An error occurred during processing. Please try again later");
                    }
                  }
                }
                setSpinner(false);
              }}
            >
              Add to Cart
            </Button>
          )}




          {param.typeDesign === 2 && variantId === variantIdOfUpdate && (
            <Button
              sx={{
                backgroundColor: "#743C54",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#2b2966",
                },
                width: "100%",
                mt: "20px",
                textTransform: "none",
              }}
              onClick={async () => {
                setSpinner(true);
                const cartId = localStorage.getItem("cartId");
                if (cartId != null && cartId != undefined) {
                  if (designerRef.current != null) {
                    const metaData = await designerRef.current.exportDesignToJson();

                    const result = await UpdateDesign(cartId, JSON.stringify(metaData, null, 2));
                    if (result == true) {
                      toast.success("Design updated successfully");
                    } else {
                      toast.error("An error occurred during processing. Please try again later");
                    }
                    //localStorage.removeItem('cartId');
                  }
                  //window.location.replace(`/${param.channel}/cart`);
                }
                setSpinner(false);
              }}
            >
              Update
            </Button>
          )}
        </div>

        {/* <Paper
          id="leftMenu"
          className="hidden h-full w-full max-w-[120px] flex-col gap-1 gap-y-2 !bg-[#743c54] px-2 lg:flex"
          elevation={3}
        >
          {sort_data.map((item: PrintFaceData, index: number) => (
            <Box
              key={item.code}
              sx={{ display: "flex", flexDirection: "column", gap: 0.5, marginTop: "10px" }}
            >
              <Box>
                <Box
                  className={index === 0 ? "thumbnail active" : "thumbnail"}
                  data-view={item.code}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  <Box
                    id={`thumb-${item.code}`}
                    component="img"
                    src={item.image}
                    alt={`${item.code}View`}
                    sx={{
                      width: "80%",
                      height: "80%",
                      objectFit: "cover",
                      borderRadius: "4px",
                      background: "white",
                      margin: "auto",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "15px", textAlign: "center", color: "#ffffff" }}
                  >
                    <strong>{item.name}</strong>
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}

          {(param.typeDesign == 1 || (param.typeDesign == 2 && variantId != variantIdOfUpdate)) && (
            <Button
              sx={{
                backgroundColor: "#000000",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#2b2966",
                },
                width: "100%",
                mt: "20px",
                textTransform: "none",
              }}
              onClick={async () => {
                const isLogin = await checkUser();

                if (isLogin == false) {
                  window.location.replace(`/${param.channel}/login`);
                }
                setSpinner(true);
                const json = localStorage.getItem("cart");


                if (json != null && json !== undefined) {
                  const cartItem = JSON.parse(json) as {
                    params: any; // Loại của params có thể thay đổi tuỳ theo nhu cầu
                    selectedVariantId: string;
                    quantity: number;
                  };

                  if (designerRef.current != null) {
                    let metaData = null;
                    const printFace: { data: string[] } = { data: [] };
                    let hasObjectInStage = false;
                    if (designerRef.current.stages != null) {
                    }
                    for (const i of designerRef.current.stages) {
                      if (i.layer?.getChildren().length != null && i.layer?.getChildren().length > 0) {
                        hasObjectInStage = true;
                        break;
                      }
                    }
                    if (hasObjectInStage == true) {
                      metaData = await designerRef.current.exportDesignToJson() as any;

                      console.log('okokokokokokokokko', metaData);
                      for (const item of metaData.designs) {
                        if (item.designs.length > 0) {
                          printFace.data.push(item.face_code)
                        }
                      }
                      if (printFace.data.length > 0) {
                        metaData.face_code = printFace;
                      }
                    }
                    let result = false;
                    if (param.typeDesign == 1) {

                      result = (await addItem(
                        cartItem.params,
                        variantId,
                        cartItem.quantity,
                        JSON.stringify(metaData, null, 2),
                      )) as boolean;
                    } else {
                      result = (await addItem(cartItem.params, variantId, 1, JSON.stringify(metaData, null, 2))) as boolean;
                    }
                    if (result === true) {
                      toast.success("Design added to cart successfully");
                    } else {
                      toast.error("An error occurred during processing. Please try again later");
                    }
                  }
                }
                setSpinner(false);
              }}
            >
              Add to Cart
            </Button>
          )}

          {param.typeDesign === 2 && variantId === variantIdOfUpdate && (
            <Button
              sx={{
                backgroundColor: "#000000",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#2b2966",
                },
                width: "100%",
                mt: "20px",
                textTransform: "none",
              }}
              onClick={async () => {
                setSpinner(true);
                const cartId = localStorage.getItem("cartId");
                if (cartId != null && cartId != undefined) {
                  if (designerRef.current != null) {
                    const metaData = await designerRef.current.exportDesignToJson();

                    const result = await UpdateDesign(cartId, JSON.stringify(metaData, null, 2));
                    if (result == true) {
                      toast.success("Design updated successfully");
                    } else {
                      toast.error("An error occurred during processing. Please try again later");
                    }
                    //localStorage.removeItem('cartId');
                  }
                  //window.location.replace(`/${param.channel}/cart`);
                }
                setSpinner(false);
              }}
            >
              Update
            </Button>
          )}
        </Paper> */}

        <Pen
          className="absolute right-1 top-1 z-10 block h-12 w-12 rounded-full bg-[#8C3859] p-3 lg:hidden"
          stroke="white"
          onClick={() => setIsShowDialog(!isShowDialog)}
        />

        <ShirtIcon
          className="absolute right-1 top-14 z-10 block h-12 w-12 rounded-full bg-[#8C3859] p-3 lg:hidden"
          stroke="white"
          onClick={() => setIsShowFaceDialog(!isShowFaceDialog)}
        />
        <MousePointerClickIcon
          onClick={() => handleDeselect()}
          className="fixed bottom-20 right-1 z-10 block h-12 w-12 rounded-full bg-[#8C3859] p-3 lg:hidden"
          stroke="white"
        />
      </Box>
      <div
        className={`fixed inset-0 z-50 h-screen transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${isShowDialog ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold capitalize text-gray-800"></h2>
            <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => setIsShowDialog(false)}>
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            <input
              type="file"
              id="file-select"
              name="file-select"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
            />

            {menuIndex === 0 && (
              <Box>
                <div className="flex flex-col items-center px-2 md:pt-3">
                  <h3 className="text-2xl font-bold">What&apos;s next for you?</h3>
                  <div className="mt-4 grid w-full grid-cols-1 items-center justify-items-center gap-2">

                    <div
                      onClick={() => setMenuIndex(1)}
                      className="flex w-full flex-col items-center justify-center rounded-md border py-2 shadow-inner transition-all hover:scale-95 hover:bg-slate-50"
                    >
                      <Palette className="h-8 w-8" />
                      <span className="text-xl font-medium">Colors</span>
                    </div>
                    <div
                      onClick={() => setMenuIndex(2)}
                      className="flex w-full flex-col items-center justify-center rounded-md border py-2 shadow-inner transition-all hover:scale-95 hover:bg-slate-50"
                    >
                      <CloudUpload className="h-8 w-8" />
                      <span className="text-xl font-medium">Images</span>
                    </div>
                    <div
                      onClick={() => setMenuIndex(3)}
                      className="flex w-full flex-col items-center justify-center rounded-md border py-2 shadow-inner transition-all hover:scale-95 hover:bg-slate-50"
                    >
                      <Type className="h-8 w-8" />
                      <span className="text-xl font-medium">Text</span>
                    </div>

                  </div>


                </div>

              </Box>
            )}


            {menuIndex === 1 && (
              <div className="flex flex-1 flex-col p-2">
                <div className="flex items-center justify-between ">
                  <span className="flex items-center" onClick={() => setMenuIndex(0)}>
                    <ChevronLeft />
                    Back
                  </span>
                  <span className="text-md font-semibold">Choose Color</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 ">
                  {Array.from(colorData.entries()).map(([key, value]) => (
                    <div
                      key={key}
                      onClick={() => {
                        if (designerRef.current) {
                          setLoading(true);
                          const result = getMetaDtataFromColorVariant(key, colorData);
                          sort_data = result.sort((a, b) => a.z_index - b.z_index);

                          for (const item of result) {
                            const imageDom = document.getElementById(
                              item.code + "Image",
                            ) as HTMLImageElement;
                            const thumbnailDom = document.getElementById(`thumb-${item.code}`);
                            imageDom.src = item.image;
                            if (thumbnailDom) {
                              thumbnailDom.setAttribute("src", item.image);
                            }
                          }
                          const thumbnails = document.querySelectorAll(".thumbnail");
                          thumbnails.forEach((thumb) => {
                            thumb.addEventListener("click", handleThumbnailClick);
                          });

                          designerRef.current.data = result;
                          designerRef.current.colorValue = key;
                          if (variantSizeColor) {
                            const selectVariant = getVariantIdFromColorSize(
                              key,
                              sizeIdDefault,
                              variantSizeColor,
                            );

                            if (selectVariant !== undefined) {
                              setVariantId(selectVariant);
                            }
                          }
                          setLoading(false);
                        }
                      }}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border-2 hover:border-black/50",
                        { "border-black": designerRef.current?.colorValue === key },
                      )}
                      style={{ backgroundColor: (value as { color_value: string }).color_value }}
                    >
                      {designerRef.current?.colorValue === key && <Check />}
                    </div>
                  ))}
                </div>
              </div>
              // <Box>
              //   <Typography variant="h6" sx={{ color: "#282c34", mb: 2 }}>
              //     Choose a color
              //   </Typography>
              //   <Box
              //     sx={{
              //       display: "grid",
              //       gridTemplateColumns: "repeat(8, 1fr)",
              //       gap: 1,
              //       bgcolor: "#f5f5f5",
              //       p: 3,
              //       borderRadius: 1,
              //     }}
              //   >
              //     {Array.from(colorData.entries()).map(([key, value]) => (
              //       <Box
              //         key={key}
              //         data-color={key}
              //         onClick={() => {
              //           if (designerRef.current) {
              //             setLoading(true);
              //             const result = getMetaDtataFromColorVariant(key, colorData);
              //             sort_data = result.sort((a, b) => a.z_index - b.z_index);

              //             for (const item of result) {
              //               const imageDom = document.getElementById(item.code + "Image") as HTMLImageElement;
              //               const thumbnailDom = document.getElementById(`thumb-${item.code}`);
              //               imageDom.src = item.image;
              //               if (thumbnailDom) {
              //                 thumbnailDom.setAttribute("src", item.image);
              //               }
              //             }
              //             const thumbnails = document.querySelectorAll(".thumbnail");
              //             thumbnails.forEach((thumb) => {
              //               thumb.addEventListener("click", handleThumbnailClick);
              //             });

              //             designerRef.current.data = result;
              //             designerRef.current.colorValue = key;

              //             if (variantSizeColor) {
              //               const selectVariant = getVariantIdFromColorSize(
              //                 key,
              //                 sizeIdDefault,
              //                 variantSizeColor,
              //               ); //getVariantIdFromColorVariant(key, colorData);

              //               designerRef.current.variantId = selectVariant ?? designerRef.current.variantId;
              //               designerRef.current.updateStagePositions();
              //               if (selectVariant !== undefined) {
              //                 setVariantId(selectVariant); // selectVariant là string hoặc null
              //               }
              //             }
              //             setIsShowDialog(false);
              //           }
              //         }}
              //         sx={{
              //           width: 40,
              //           height: 40,
              //           borderRadius: "50%",
              //           backgroundColor: (value as { color_value: string }).color_value,
              //           cursor: "pointer",
              //           transition: "transform 0.2s",
              //           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              //           "&:hover": {
              //             transform: "scale(1.1)",
              //             boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              //           },
              //         }}
              //       />
              //     ))}
              //   </Box>
              //   <div className="mt-2">
              //     <button
              //       className="w-full rounded-md bg-[#8C3859] py-2 text-center text-white"
              //       onClick={() => setMenuIndex(0)}
              //     >
              //       Back to menu
              //     </button>
              //   </div>
              // </Box>
            )}

            {(menuIndex === 2 || menuIndex === 5) && (
              <div>
                {menuIndex === 2 && (
                  <>
                    <div className="flex items-center justify-between ">
                      <span className="flex items-center hover:bg-slate-50" onClick={() => setMenuIndex(0)}>
                        <ChevronLeft />
                        Back
                      </span>
                      <span className="text-md font-semibold">Images</span>
                    </div>
                    <hr className="mt-2" />
                    <div className="flex items-center justify-center w-full ">

                      <label
                        htmlFor="dropzone-file"
                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition border-gray-300`}
                        onClick={() => {
                          const fileInput = document.getElementById("file-select");
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.style.borderColor = "#1976d2";
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.style.borderColor = "#282c34";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.style.borderColor = "#282c34";

                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            const file = files[0];
                            if (file.type.startsWith("image/")) {
                              const fileInput = document.getElementById("file-select") as HTMLInputElement;
                              if (fileInput) {
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(file);
                                fileInput.files = dataTransfer.files;
                                fileInput.dispatchEvent(new Event("change", { bubbles: true }));
                              }
                            }
                          }
                        }}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 800x400px)</p>
                        </div>
                      </label>
                    </div>
                  </>
                )}
                {menuIndex === 5 && (
                  <div className="flex w-full  flex-1 flex-col ">
                    <div className="flex items-center justify-between w-full">
                      <ChevronLeft onClick={() => setMenuIndex(2)} />
                      <h3
                        className="
                        text-center text-2xl font-semibold"
                      >
                        Image Tools
                      </h3>
                      <span onClick={() => setMenuIndex(0)} >

                        Close
                      </span>
                    </div>

                    <hr className="mt-2" />
                    <div className="flex flex-1 flex-col px-2">
                      <span className=" font-semibold ">Action</span>
                      <div className="flex flex-1 flex-wrap gap-2 py-2">
                        <div
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.copySelectedNode();
                            }
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                            <Copy />
                          </div>
                          <span className="text-sm font-light">Copy</span>
                        </div>
                        <div
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.deleteSelectedNode();
                            }
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                            <Trash />
                          </div>
                          <span className="text-sm font-light">Delete</span>
                        </div>
                        <div
                          onClick={() => {
                            handleDeselect();
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                            <PenTool />
                          </div>
                          <span className="text-sm font-light">Deselect</span>
                        </div>
                        <div
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (designerRef?.current?.currentStage.selectedNode == undefined) {
                              return;
                            }
                            const newUrl =
                              designerRef.current?.originImageOfStage[
                              designerRef.current.currentStage.selectedNode?.id()
                              ];

                            setCropImageUrl(newUrl);
                            if (designerRef.current?.currentStage.selectedNode != null) {
                              setMenuIndex(7);
                            }

                            // cropImage();

                            // const container = cropContainerRef.current;
                            // if (container) {
                            //   //const { clientWidth, clientHeight } = container;
                            //   const clientWidth = container.clientWidth / 2;
                            //   const clientHeight = container.clientHeight / 2;
                            //   const left = (container.clientWidth - clientWidth) / 2;
                            //   const top = (container.clientHeight - clientHeight) / 2;
                            //   setFrameState({
                            //     width: clientWidth,
                            //     height: clientHeight,
                            //     left: left,
                            //     top: top,
                            //   });
                            // }

                            // setMenuIndex(7);
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10">
                            <Crop />
                          </div>
                          <span className="text-sm font-light">Crop</span>
                        </div>
                      </div>
                    </div>
                    <hr className="mt-2" />
                    <div className="flex flex-1 flex-col px-2">
                      <span className=" font-semibold ">Position & Layering</span>
                      <div className="flex flex-1 flex-wrap gap-2 py-2">
                        <div
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.setWidthCenterPosition();
                            }
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div
                            title={"center width"}
                            className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                          >
                            <AlignHorizontalSpaceAround />
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.setHeightCenterPosition();
                            }
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div
                            title={"center height"}
                            className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                          >
                            <AlignVerticalSpaceAround />
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.bringToFrontNode();
                            }
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div
                            title={"bring to front"}
                            className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                          >
                            <BringToFront />
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.sendToBackNode();
                            }
                          }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div
                            title={"send to back"}
                            className="flex h-10 w-10 items-center justify-center rounded-md border shadow-2xl hover:bg-black/10"
                          >
                            <SendToBack />
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr className="mt-2" />
                    <div className="flex w-full flex-col items-start justify-between px-2">
                      <span className=" font-semibold ">Upload Size (Width x Height)</span>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          value={resizeWidth || 0}
                          max={1000}
                          className="w-20 rounded-md px-4 py-1"
                          onChange={(e) => {
                            handleResizeWidthChange(e.target.value ? Number(e.target.value) : undefined);
                          }}
                        />
                        x
                        <input
                          type="number"
                          max={1000}
                          className="w-20 rounded-md px-4 py-1"
                          value={resizeHeight || 0}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onChange={(e) =>
                            handleResizeHeightChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </div>
                    </div>
                    <hr className="mt-2" />
                    <div className="mt-2 flex flex-col items-start gap-2 px-2">
                      <span className="font-semibold">Rotation</span>
                      <div className="flex w-full items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={360}
                          className="w-full"
                          value={Math.round(rotationAngle || 0)}
                          onChange={(e) =>
                            handleRotationChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                        <input
                          min={0}
                          max={360}
                          type="number"
                          className="w-24 rounded-md px-4 py-1"
                          value={Math.round(rotationAngle || 0)}
                          onChange={(e) => handleRotationChange(Number(e.target.value))}
                        />
                        deg
                      </div>
                    </div>

                    <hr className="mt-2" />
                  </div>
                )}
              </div>
            )}

            {(menuIndex === 3 || menuIndex === 6) && (
              <Box>
                <Typography variant="h6" sx={{ color: "#282c34", mb: 2 }}>
                  Add text
                </Typography>
                {menuIndex == 3 && (
                  <div className="space-y-6">
                    <div>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-gray-300 focus:outline-none focus:ring-0"
                        id="textInput-mobile"
                        rows={3}
                        placeholder="Enter your text here..."
                      ></textarea>
                    </div>

                    <div id="fontColorPickerWrap">
                      <h5 className="mb-3 text-lg font-medium">Text Color</h5>
                      <div id="fontColorPicker">
                        <div className="grid grid-cols-10 gap-1">
                          {colors.map((color) => (
                            <div
                              key={color}
                              className="h-7 w-7 transform cursor-pointer rounded-full transition-transform hover:scale-110"
                              style={{ backgroundColor: color }}
                              data-color={color}
                              onClick={() => {
                                if (designerRef.current) {
                                  designerRef.current.changeTextColor(color);
                                  const textInput = document.getElementById(
                                    "textInput",
                                  ) as HTMLTextAreaElement;
                                  if (textInput) {
                                    textInput.style.color = color;
                                  }
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div id="fontStyle">
                      <h5 className="mb-3 text-lg font-medium">Font Style</h5>
                      <div className="flex justify-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="boldCheck"
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                            onChange={(e) => {
                              if (designerRef.current) {
                                const textInput = document.getElementById("textInput") as HTMLTextAreaElement;
                                if (textInput) {
                                  textInput.style.fontWeight = e.target.checked ? "bold" : "normal";
                                  designerRef.current.changeFontWeight(e.target.checked ? "bold" : "normal");
                                }
                              }
                            }}
                          />
                          <span>Bold</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="italicCheck"
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                            onChange={(e) => {
                              if (designerRef.current) {
                                const textInput = document.getElementById("textInput") as HTMLTextAreaElement;
                                if (textInput) {
                                  textInput.style.fontStyle = e.target.checked ? "italic" : "normal";
                                  designerRef.current.changeFontStyle(e.target.checked ? "italic" : "normal");
                                }
                              }
                            }}
                          />
                          <span>Italic</span>
                        </label>
                      </div>
                    </div>

                    <div id="fontFamily">
                      <h5 className="mb-3 text-lg font-medium">Font Family</h5>
                      <select
                        className="w-full rounded-lg border p-2"
                        id="chooseFontFamily"
                        onChange={(e) => {
                          if (designerRef.current) {
                            designerRef.current.changeFontFamily(e.target.value);
                            const textInput = document.getElementById("textInput") as HTMLTextAreaElement;
                            if (textInput) {
                              textInput.style.fontFamily = e.target.value;
                            }
                          }
                        }}
                      >
                        <option value="Montserrat">Montserrat</option>
                        <option value="Sans Serif">Sans Serif</option>
                        <option value="Arial">Arial</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Arial Black">Arial Black</option>
                        <option value="Impact">Impact</option>
                        <option value="Bookman">Bookman</option>
                        <option value="Garamond">Garamond</option>
                        <option value="Palatino">Palatino</option>
                        <option value="Georgia">Georgia</option>
                      </select>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        className="w-full rounded-lg bg-[#8C3859] px-6 py-2.5 text-white hover:bg-[#8C3859]/70 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        id="submitText"
                        onClick={() => {
                          const text = (
                            document.getElementById("textInput-mobile") as HTMLTextAreaElement
                          ).value.trim();

                          if (text && designerRef.current) {
                            designerRef.current.addText(text);
                            const textInput = document.getElementById("textInput") as HTMLTextAreaElement;
                            if (textInput) {
                              textInput.value = "";
                            }
                          }
                          setIsShowDialog(false);
                        }}
                      >
                        Add Text
                      </button>
                    </div>
                  </div>
                )}
                {menuIndex === 6 && (
                  <Box
                    sx={{
                      bgcolor: "#f5f5f5",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: "#282c34", mb: 2 }}>
                      Text Tools
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          p: { xs: 1, sm: 1.5 },
                          bgcolor: "white",
                          borderRadius: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: { xs: 0.5, sm: 1 },
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "#e8e8e8",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => {
                          if (designerRef.current) {
                            designerRef.current.copySelectedNode();
                          }
                        }}
                      >
                        <i className="fas fa-copy text-xl" style={{ color: "#282c34" }}></i>
                        <Typography variant="caption" sx={{ color: "#282c34" }}>
                          Copy
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          p: { xs: 1, sm: 1.5 },
                          bgcolor: "white",
                          borderRadius: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: { xs: 0.5, sm: 1 },
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "#e8e8e8",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => {
                          if (designerRef.current) {
                            designerRef.current.deleteSelectedNode();
                          }
                        }}
                      >
                        <i className="fas fa-trash text-xl" style={{ color: "#282c34" }}></i>
                        <Typography variant="caption" sx={{ color: "#282c34" }}>
                          Delete
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          p: { xs: 1, sm: 1.5 },
                          bgcolor: "white",
                          borderRadius: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: { xs: 0.5, sm: 1 },
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "#e8e8e8",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => {
                          handleDeselect();
                        }}
                      >
                        <i className="fas fa-times text-xl" style={{ color: "#282c34" }}></i>

                        <Typography variant="caption" sx={{ color: "#282c34" }}>
                          Deselect
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "white",
                          borderRadius: 1,
                          p: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: "#282c34", mb: 2 }}>
                          Resize
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: "#666666", width: "60px" }}>
                              Font Size:
                            </Typography>
                            <input
                              type="number"
                              value={resizeFontSize || 0}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) =>
                                handleFontSizeChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                              className="w-20 rounded border px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                              placeholder="Width"
                              min="0"
                              max={maxResizeFontSize}
                            />
                            <Typography variant="caption" sx={{ color: "#666666" }}>
                              px
                            </Typography>
                          </Box>
                          <input
                            type="range"
                            value={resizeFontSize || 0}
                            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                            min="0"
                            max={maxResizeFontSize}
                            className="w-full"
                            style={{ accentColor: "#1976d2" }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          bgcolor: "white",
                          borderRadius: 1,
                          p: 2,
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: "#282c34", mb: 2 }}>
                          Rotation
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: "#666666", width: "60px" }}>
                            Angle:
                          </Typography>
                          <input
                            type="number"
                            value={Math.round(rotationAngle || 0)}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onChange={(e) =>
                              handleRotationChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-20 rounded border px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder="Angle"
                            max="360"
                            min="0"
                          />
                          <Typography variant="caption" sx={{ color: "#666666" }}>
                            deg
                          </Typography>
                        </Box>
                        <input
                          type="range"
                          value={rotationAngle || 0}
                          onChange={(e) => handleRotationChange(Number(e.target.value))}
                          min="0"
                          max="360"
                          className="w-full"
                          style={{ accentColor: "#1976d2" }}
                        />
                      </Box>

                      <Box
                        sx={{
                          bgcolor: "white",
                          borderRadius: 1,
                          p: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: "#282c34", mb: 2 }}>
                          Position & Layering
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.setWidthCenterPosition();
                              }
                            }}
                            sx={{
                              flex: 1,
                              borderColor: "#282c34",
                              color: "#282c34",
                              "&:hover": {
                                borderColor: "#1976d2",
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                              },
                            }}
                          >
                            <i className="fas fa-arrows-alt-h mr-2"></i>
                            Center Width
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.setHeightCenterPosition();
                              }
                            }}
                            sx={{
                              flex: 1,
                              borderColor: "#282c34",
                              color: "#282c34",
                              "&:hover": {
                                borderColor: "#1976d2",
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                              },
                            }}
                          >
                            <i className="fas fa-arrows-alt-v mr-2"></i>
                            Center Height
                          </Button>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.bringToFrontNode();
                              }
                            }}
                            sx={{
                              flex: 1,
                              borderColor: "#282c34",
                              color: "#282c34",
                              "&:hover": {
                                borderColor: "#1976d2",
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                              },
                            }}
                          >
                            <i className="fas fa-layer-group mr-2"></i>
                            Bring to Front
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (designerRef.current) {
                                designerRef.current.sendToBackNode();
                              }
                            }}
                            sx={{
                              flex: 1,
                              borderColor: "#282c34",
                              color: "#282c34",
                              "&:hover": {
                                borderColor: "#1976d2",
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                              },
                            }}
                          >
                            <i className="fas fa-layer-group fa-flip-vertical mr-2"></i>
                            Send to Back
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {menuIndex === 7 && <div className="flex flex-1 flex-col">
              <div className="flex  flex-1 items-center justify-between mt-2">
                <ChevronLeft onClick={() => setMenuIndex(2)} />
                <h3 className="text-center text-2xl font-semibold">Crop Image</h3>
                <span onClick={() => setMenuIndex(0)}>
                  Close
                </span>

              </div>
              <div className="w-full h-40 flex items-center justify-center" ref={cropContainerRefMobile}>
                {
                  cropImageUrl ? <>
                    <img
                      src={cropImageUrl}
                      style={{
                        width: "100%",           // Chiếm hết chiều rộng của Box
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                    <Rnd
                      size={{ width: frameState.width, height: frameState.height }}
                      position={{ x: frameState.left, y: frameState.top }}
                      bounds="parent"
                      onDrag={(e, d) => {
                        console.warn(e, d);
                        if (designerRef.current == null) {
                          return;
                        }
                        const newState = {
                          ...frameState,
                          left: d.x,
                          top: d.y,
                        };
                        setFrameState(newState);
                      }}
                      onResizeStop={(e, __, ref, ___, position) => {
                        if (designerRef.current == null) {
                          return;
                        }
                        console.warn(e);

                        const newState = {
                          width: parseInt(ref.style.width),
                          height: parseInt(ref.style.height),
                          top: position.y,
                          left: position.x,
                        };
                        setFrameState(newState);
                      }}
                      style={{
                        border: "2px dashed black",
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        zIndex: 10,
                      }}
                    />
                  </> : <Typography color="text.secondary">No image selected</Typography>
                }
              </div>
              <div
                className="mt-2 flex w-full items-center justify-center bg-[#8C3859] py-2 text-white rounded-md cursor-pointer hover:bg-[#743C54] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();

                  cropImage(cropContainerRefMobile);
                }}
              >
                Submit
              </div>
            </div>}
          </Box>
        </div>
      </div >
      <div
        className={`fixed inset-0 z-50 h-screen transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${isShowFaceDialog ? "-translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold capitalize text-gray-800"></h2>
            <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => setIsShowFaceDialog(false)}>
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <Paper id="leftMenu" className="flex h-full w-full flex-col gap-1 gap-y-2 px-2" elevation={0}>
            {sort_data.map((item: PrintFaceData, index: number) => (
              <Box
                key={item.code}
                sx={{ display: "flex", flexDirection: "column", gap: 0.5, marginTop: "10px" }}
              >
                <Box>
                  <Box
                    onClick={() => {
                      setIsShowFaceDialog(false);
                    }}
                    className={index === 0 ? "thumbnail active" : "thumbnail"}
                    data-view={item.code}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0,
                      cursor: "pointer",
                      marginBottom: "20px",
                      border: "1px solid #302c34",
                    }}
                  >
                    <Box
                      id={`thumb-${item.code}`}
                      component="img"
                      src={item.image}
                      alt={`${item.code}View`}
                      sx={{
                        width: "80%",
                        height: "80%",
                        objectFit: "cover",
                        borderRadius: "4px",
                        background: "white",
                        margin: "auto",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "15px", textAlign: "center", color: "#ffffff" }}
                    >
                      <strong>{item.name}</strong>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 block  md:hidden">
        {(param.typeDesign == 1 || (param.typeDesign == 2 && variantId != variantIdOfUpdate)) && (
          <Button
            className="flex h-12 w-12  items-center justify-center rounded-full bg-[#8C3859] p-2"
            onClick={async () => {
              const isLogin = await checkUser();
              if (isLogin == false) {
                window.location.replace(`/${param.channel}/login`);
              }
              setSpinner(true);
              const json = localStorage.getItem("cart");
              if (json != null && json !== undefined) {
                const cartItem = JSON.parse(json) as {
                  // Ép kiểu trực tiếp ở đây
                  params: any; // Loại của params có thể thay đổi tuỳ theo nhu cầu
                  selectedVariantId: string;
                  quantity: number;
                };

                if (designerRef.current != null) {
                  let metaData = null;
                  const printFace: { data: string[] } = { data: [] };
                  let hasObjectInStage = false;
                  if (designerRef.current.stages != null) {
                  }
                  for (const stage of designerRef.current.stages) {
                    if (stage.layer?.getChildren().length != null && stage.layer?.getChildren().length > 0) {
                      hasObjectInStage = true;
                      break;
                    }
                  }
                  if (hasObjectInStage == true) {
                    metaData = (await designerRef.current.exportDesignToJson()) as any;
                    for (const item of metaData.designs) {
                      if (item.designs.length > 0) {
                        printFace.data.push(item.face_code);
                      }
                    }
                    if (printFace.data.length > 0) {
                      metaData.face_code = printFace;
                    }
                  }
                  let result = false;
                  // console.log(cartItem.params,
                  //   variantId,
                  //   cartItem.quantity);
                  if (param.typeDesign == 1) {
                    result = (await addItem(
                      cartItem.params,
                      variantId,
                      cartItem.quantity,
                      JSON.stringify(metaData, null, 2),
                    )) as boolean;
                  } else {
                    result = (await addItem(
                      cartItem.params,
                      variantId,
                      1,
                      JSON.stringify(metaData, null, 2),
                    )) as boolean;
                  }
                  if (result === true) {
                    toast.success("Design added to cart successfully");
                  } else {
                    toast.error("An error occurred during processing. Please try again later");
                  }
                }
              }
              setSpinner(false);
              setIsShowFaceDialog(false);
            }}
          >
            <ShoppingCart
              className="flex h-12 w-12  items-center justify-center rounded-full bg-[#8C3859] p-2"
              stroke="white"
            />
          </Button>
        )}

        {param.typeDesign === 2 && variantId === variantIdOfUpdate && (
          <Button
            onClick={async () => {
              setSpinner(true);
              const cartId = localStorage.getItem("cartId");
              if (cartId != null && cartId != undefined) {
                if (designerRef.current != null) {
                  const metaData = await designerRef.current.exportDesignToJson();

                  const result = await UpdateDesign(cartId, JSON.stringify(metaData, null, 2));
                  if (result == true) {
                    toast.success("Design updated successfully");
                  } else {
                    toast.error("An error occurred during processing. Please try again later");
                  }
                  //localStorage.removeItem('cartId');
                }
                //window.location.replace(`/${param.channel}/cart`);
              }
              setSpinner(false);
            }}
          >
            <ShoppingCart
              stroke="white"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8C3859] p-2"
            />
          </Button>
        )}
      </div>

      <div className="fixed inset-0 z-50 hidden items-center justify-center" role="status">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}

export default DesignPage;
