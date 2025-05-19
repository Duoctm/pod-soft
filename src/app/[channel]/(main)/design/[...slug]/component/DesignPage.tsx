"use client"

import { useEffect, useRef, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Typography, IconButton, Box, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import TShirtDesigner from '../utils/design';
import { type DesignInfo, type PrintFaceData } from '..//utils/type';
import { getMetaDtataFromColorVariant, getVariantIdFromColorVariant } from '../utils/data'
import { addItem, UpdateDesign, checkUser } from '../utils/checkout'
import { fetchProductDetail } from '../utils/test'
import 'react-toastify/dist/ReactToastify.css';
import { Rnd } from "react-rnd";
import Konva from 'konva';


const StyledButton = styled(IconButton)(() => ({
  backgroundColor: 'transparent',
  border: 'none',
  padding: '6px',
  borderRadius: '4px',
  cursor: 'pointer',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)',
  },
  transition: 'all 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
}));

interface DesignPageProps {
  productId: string;
  colorId: string;
  designInfor: DesignInfo | null,
  typeDesign: number,
  channel: string
}

function DesignPage(param: DesignPageProps) {
  const [colorData, setColorData] = useState<Map<string, object>>(new Map);
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
  const [cropImageUrl, setCropImageUrl] = useState<string>('');
  var cropContainerRef = useRef<HTMLDivElement>();
  const [frameState, setFrameState] = useState({
    width: 200,
    height: 200,
    top: 0,
    left: 0,
  });

  console.log(showObjectMenu);



  const loadProductData = async (productId: string) => {
    let result: Map<string, object>;
    if (param.designInfor?.colorData != null) {
      result = new Map(Object.entries(param.designInfor.colorData)); //param.designInfor.colorData;
    }
    else {
      result = await fetchProductDetail(productId);
    }
    setColorData(result);
  }

  const updateVariant = (colorId: string, productId: string, colorData: Map<string, object>) => {
    const result = getMetaDtataFromColorVariant(colorId, colorData)
    setData(result);
    setProductId(productId)
    setColorId(colorId)
    const variant = getVariantIdFromColorVariant(colorId, colorData);
    setVariantId(variant);
  }



  useEffect(() => {
    const fetchColorData = async () => {
      try {
        // const result = await fetchProductDetail(productId);
        // setColorData(result);
        setColorLoading(true);
        await loadProductData(productId);
        setColorLoading(false);
      } catch (error) {
        console.error('Error fetching color data:', error);
        setColorLoading(false);
      }
    };

    fetchColorData();
  }, [param.designInfor]);

  useEffect(() => {
    if (!colorLoading) {
      const fetchData = async () => {
        try {
          updateVariant(colorId, productId, colorData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [colorLoading, colorData]);

  useEffect(() => {
    if (!loading) {
      // Initialize TShirtDesigner
      designerRef.current = new TShirtDesigner(data.sort((a, b) => a.z_index - b.z_index), productId, variantId, colorId, colorData,
        setMenuIndex, setResizeWidth, setResizeHeight, setRotationAngle, setFontSize, setMaxResizeWidth, setMaxResizeHeight, setMaxFontSize);

      // Thêm callback khi chọn/bỏ chọn đối tượng
      if (designerRef.current) {
        designerRef.current.onSelectObject = (hasSelection) => {
          setShowObjectMenu(hasSelection);
        };

        const importUpload = async (designs: object[][]) => {
          await designerRef.current?.importDesignFromJson(designs);
        }
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
        }
        catch (error) {
          console.log(error);
        }
        // }
      }
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
          e.preventDefault(); // Ngăn chặn hành vi mặc định
          if (designerRef.current) {
            if (e.key.toLowerCase() === 'c') {
              designerRef.current.copySelectedNode();
            } else if (e.key.toLowerCase() === 'v') {
              designerRef.current.pasteNode();
            }
          }
        }
      };

      // Thêm event listener cho phím tắt
      document.addEventListener('keydown', handleKeyDown);

      // Xử lý sự kiện click cho thumbnail
      const handleThumbnailClick = (e: Event) => {
        if (designerRef.current != null && designerRef.current.currentStage.stage && designerRef.current.currentStage.stage?.getChildren().length > 0) {
          for (const item in designerRef.current.data) {
            if (designerRef.current.stages[item] == designerRef.current.currentStage) {
              const domImage = document.getElementById(designerRef.current.data[item].code + 'Image') as HTMLImageElement;
              designerRef.current.exportStage(designerRef.current.currentStage, domImage).then(base64 => {
                if (designerRef.current != null) {
                  designerRef.current.faceImage[designerRef.current.data[item].code] = base64;
                }

              });
            }
          }
        }
        const target = e.currentTarget as HTMLDivElement;
        const view = target.getAttribute('data-view');

        // Cập nhật active state
        document.querySelectorAll('.thumbnail').forEach(thumb => {
          thumb.classList.remove('active');
        });
        target.classList.add('active');
        for (const item in sort_data) {
          const imageDom = document.getElementById(sort_data[item].code + 'Image') as HTMLImageElement;
          const previewDom = document.getElementById('preview-' + sort_data[item].code);
          imageDom.style.display = 'none';
          previewDom!.style.display = 'none';
        }

        for (const item in sort_data) {
          const imageDom = document.getElementById(sort_data[item].code + 'Image') as HTMLImageElement;
          const previewDom = document.getElementById('preview-' + sort_data[item].code);

          if (view === sort_data[item].code) {
            imageDom.style.display = 'block';
            previewDom!.style.display = 'block';
            if (designerRef.current) {
              designerRef.current.switchToStage(sort_data[item].code);
            }
          }
        }
      }

      // Thêm event listeners
      const thumbnails = document.querySelectorAll('.thumbnail');
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', handleThumbnailClick);
      });

      // Cleanup function
      return () => {
        if (designerRef.current) {
          // Add any cleanup code here if needed
        }
        // Remove event listeners
        thumbnails.forEach(thumb => {
          thumb.removeEventListener('click', handleThumbnailClick);
        });
        document.removeEventListener('keydown', handleKeyDown);
      };

    }
  }, [loading, data, param.designInfor]);


  const colors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#616161', '#f0f0f0', '#5b5b5b', '#222222', '#fc8d74',
    '#432d26', '#eead91', '#806355', '#382d21', '#faef93',
    '#aeba5e', '#8aa140', '#1f6522', '#13afa2', '#b8d5d7',
    '#15aeda', '#a5def8', '#0f77c0', '#3469b7', '#c50404'
  ];

  const menuWidth = '10vw';

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
        designerRef.current.currentStage.borderDiv.style.display = 'none';
      }
      designerRef.current.clearBorderNode(designerRef.current.currentStage);
      designerRef.current.resetWHROfNode();
      designerRef.current.resetRSOfNode();
      setMenuIndex(0);

    }
  }

  const handleThumbnailClick = (e: Event) => {
    if (designerRef.current != null) {
      for (const item in designerRef.current.data) {
        if (designerRef.current.stages[item] == designerRef.current.currentStage) {
          const domImage = document.getElementById(designerRef.current.data[item].code + 'Image') as HTMLImageElement;
          designerRef.current.exportStage(designerRef.current.currentStage, domImage).then(base64 => {
            if (designerRef.current != null) {
              designerRef.current.faceImage[designerRef.current.data[item].code] = base64;
            }

          });
        }
      }
    }
    const target = e.currentTarget as HTMLDivElement;
    const view = target.getAttribute('data-view');

    document.querySelectorAll('.thumbnail').forEach(thumb => {
      thumb.classList.remove('active');
    });
    target.classList.add('active');
    for (const item in sort_data) {
      let imageDom = document.getElementById(sort_data[item].code + 'Image') as HTMLImageElement;
      let previewDom = document.getElementById('preview-' + sort_data[item].code);
      imageDom.style.display = 'none';
      previewDom!.style.display = 'none';
    }

    for (const item in sort_data) {
      let imageDom = document.getElementById(sort_data[item].code + 'Image') as HTMLImageElement;
      let previewDom = document.getElementById('preview-' + sort_data[item].code);

      if (view === sort_data[item].code) {
        imageDom.style.display = 'block';
        previewDom!.style.display = 'block';
        if (designerRef.current) {
          designerRef.current.switchToStage(sort_data[item].code);
        }
      }
    }
  }

  const cropImage = () => {
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
          console.warn('No image node selected or invalid node');
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
            const scale = (designerRef.current?.currentStage.stage?.width() / newImage.width);
            imageNode.width(newImage.width * scale * 0.8);
            imageNode.height(newImage.height * scale * 0.8);
            imageNode.offsetX(imageNode.width() / 2);
            imageNode.offsetY(imageNode.height() / 2);
            imageNode.x(designerRef.current?.currentStage.stage?.width() / 2);
            imageNode.y(designerRef.current?.currentStage.stage?.height() / 2);
            designerRef.current?.showBorderNode(imageNode, designerRef.current?.currentStage);

            // imageNode.x(((designerRef.current?.currentStage.stage?.width() - imageNode.width()) / 2) * scale);
            // imageNode.y(((designerRef.current?.currentStage.stage?.height() - imageNode.height()) / 2) * scale);
            imageNode.image(newImage);
            imageNode.getLayer()?.draw();
          }
        };
      }
    };
  };



  useEffect(() => {
    if (menuIndex === 3 && designerRef.current) {
      designerRef.current.changeFontWeight('normal');
      designerRef.current.changeFontStyle('normal');
      designerRef.current.changeFontFamily('Montserrat');
    }
  }, [menuIndex]);



  useEffect(() => {
    return () => {
      if (designerRef?.current?.currentStage.borderDiv) {
        designerRef.current.currentStage.borderDiv.style.display = 'none';
        designerRef.current.clearBorderNode(designerRef.current.currentStage);
      }

    };
  }, []);


  useEffect(() => {
    console.log('cropImageUrl', cropImageUrl);
    const container = cropContainerRef.current;
    console.log('container', container?.style.width, container?.style.height);
    if (container) {

      const clientWidth = container.clientWidth / 2;
      const clientHeight = container.clientHeight / 2;
      const left = (container.clientWidth - clientWidth) / 2;
      const top = (container.clientHeight - clientHeight) / 2;

      setFrameState({
        width: clientWidth,
        height: clientHeight,
        left,
        top,
      });
      //setMenuIndex(7);
      // }
      //if (designerRef.current?.currentStage.selectedNode != null) {

      // }
    }
    // if (designerRef.current?.currentStage.selectedNode != null) {
    //   setMenuIndex(7);
    // }


  }, [cropImageUrl]); // 👈 chạy lại khi cropImageUrl thay đổi



  return (
    <>
      {isSpinner && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>

      )}
      <ToastContainer />
      <Box className="w-full">
        <Box className="relative">
          <Paper
            id="rightMenu"
            elevation={3}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: menuWidth,
              maxWidth: '100px',
              backgroundColor: '#282c34',
              py: 1,
              px: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              borderRadius: '0'
            }}
          >
            <StyledButton
              onClick={() => {
                //setIsColorModalOpen(true)

                handleDeselect();
                setMenuIndex(1);
              }}
              id="color"
            >
              <i className="fas fa-palette text-2xl"></i>
              <span className="text-xs">Colors</span>
            </StyledButton>
            <button className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 hover:translate-x-1 transition-all flex flex-col items-center gap-0.5">
              <label id="uploadFromPC" className="cursor-pointer flex flex-col items-center gap-0.5" onClick={() => {

                handleDeselect();
                setMenuIndex(2)
              }
              }>
                <i className="fas fa-images text-2xl"></i>
                <span className="text-xs">Images</span>
              </label>
            </button>
            <button
              id="addingText"
              onClick={() => {

                handleDeselect();
                setMenuIndex(3);
              }}
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 hover:translate-x-1 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-font text-2xl"></i>
              <span className="text-xs">Text</span>
            </button>
          </Paper>

          {/* Function Area */}
          <Paper
            className='flex items-center justify-center'
            elevation={3}
            sx={{
              position: 'absolute',
              left: '100px',
              top: 0,
              bottom: 0,
              width: '450px',
              backgroundColor: '#ffffff',
              py: 2,
              px: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              borderRadius: '0',
              maxHeight: '100vh',
              overflow: 'hidden',
            }}
          >
            <Box sx={{
              flex: 1,
              overflowY: 'auto',
              pr: 2, // Add padding right to prevent content overlap with scrollbar
              mr: -2, // Negative margin to compensate for padding
            }}>
              <input
                type="file"
                id="file-select"
                name="file-select"
                className="hidden"
                accept="image/jpeg,image/png,image/gif"

              />
              {menuIndex === 0 && (
                <Box>
                  <Typography variant="h4" sx={{ color: '#000000', mb: 3, textAlign: 'center' }}>
                    Choose your next step
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(1, 1fr)',
                    gap: 3,
                    px: 2
                  }}>
                    <Paper
                      elevation={2}
                      onClick={() => setMenuIndex(1)}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <i className="fas fa-palette text-3xl" style={{ color: '#282c34' }}></i>
                      <Typography sx={{ fontSize: '0.9rem', color: '#000000' }}>Colors</Typography>
                    </Paper>

                    <Paper
                      elevation={2}
                      onClick={() => setMenuIndex(2)}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <i className="fas fa-images text-3xl" style={{ color: '#282c34' }}></i>
                      <Typography sx={{ fontSize: '0.9rem', color: '#000000' }}>Images</Typography>
                    </Paper>

                    <Paper
                      elevation={2}
                      onClick={() => setMenuIndex(3)}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <i className="fas fa-font text-3xl" style={{ color: '#282c34' }}></i>
                      <Typography sx={{ fontSize: '0.9rem', color: '#000000' }}>Text</Typography>
                    </Paper>
                  </Box>
                </Box>
              )}

              {menuIndex === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ color: '#282c34', mb: 2 }}>
                    Choose a color
                  </Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: 1,
                    bgcolor: '#f5f5f5',
                    p: 3,
                    borderRadius: 1
                  }}>
                    {Array.from(colorData.entries()).map(([key, value]) => (
                      <Box
                        key={key}
                        data-color={key}
                        onClick={() => {
                          if (designerRef.current) {
                            setLoading(true);
                            const result = getMetaDtataFromColorVariant(key, colorData);
                            sort_data = result.sort((a, b) => a.z_index - b.z_index);

                            for (const item in result) {
                              const imageDom = document.getElementById(result[item].code + "Image") as HTMLImageElement;
                              const thumbnailDom = document.getElementById(`thumb-${result[item].code}`);
                              imageDom.src = result[item].image;
                              if (thumbnailDom) {
                                thumbnailDom.setAttribute('src', result[item].image);
                              }
                            }
                            const thumbnails = document.querySelectorAll('.thumbnail');
                            thumbnails.forEach(thumb => {
                              thumb.addEventListener('click', handleThumbnailClick);
                            });

                            designerRef.current.data = result;
                            designerRef.current.colorValue = key;
                            const selectVariant = getVariantIdFromColorVariant(key, colorData);
                            designerRef.current.variantId = selectVariant;
                            designerRef.current.updateStagePositions();
                            setVariantId(selectVariant);
                          }
                        }}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: (value as { color_value: string }).color_value,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {(menuIndex === 2 || menuIndex === 5) && (
                <Box>
                  <Typography variant="h6" sx={{ color: '#282c34', mb: 2 }}>
                    Add images
                  </Typography>

                  {/* Upload Area */}
                  {(menuIndex === 2) && (
                    <Box
                      sx={{
                        border: '2px dashed #282c34',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: '#f5f5f5',
                        transition: 'all 0.2s',
                        mb: 3,
                        '&:hover': {
                          bgcolor: '#e8e8e8',
                          borderColor: '#1976d2'
                        }
                      }}
                      onClick={() => {
                        const fileInput = document.getElementById('file-select');
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#1976d2';
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#282c34';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#282c34';

                        const files = e.dataTransfer.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          if (file.type.startsWith('image/')) {
                            const fileInput = document.getElementById('file-select') as HTMLInputElement;
                            if (fileInput) {
                              const dataTransfer = new DataTransfer();
                              dataTransfer.items.add(file);
                              fileInput.files = dataTransfer.files;
                              fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                          }
                        }
                      }}
                    >
                      <i className="fas fa-cloud-upload-alt fa-3x mb-3" style={{ color: '#282c34' }}></i>
                      <Typography variant="h6" sx={{ color: '#282c34', mb: 1 }}>
                        Click to upload or drag and drop
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666' }}>
                        JPEG, PNG, GIF files are allowed
                      </Typography>
                    </Box>
                  )}


                  {/* Image Manipulation Tools */}
                  {menuIndex === 5 && (
                    <Box sx={{
                      bgcolor: '#f5f5f5',
                      borderRadius: 2,
                      p: 2
                    }}>
                      <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                        Image Tools
                      </Typography>

                      {/* Basic Tools */}
                      <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        mb: 2
                      }}>
                        {/* Copy */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#e8e8e8',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.copySelectedNode();
                            }
                          }}
                        >
                          <i className="fas fa-copy text-xl" style={{ color: '#282c34' }}></i>
                          <Typography variant="caption" sx={{ color: '#282c34' }}>
                            Copy
                          </Typography>
                        </Box>

                        {/* Delete */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#e8e8e8',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.deleteSelectedNode();
                            }
                          }}
                        >
                          <i className="fas fa-trash text-xl" style={{ color: '#282c34' }}></i>
                          <Typography variant="caption" sx={{ color: '#282c34' }}>
                            Delete
                          </Typography>
                        </Box>



                      </Box>
                      <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        mb: 2
                      }}>

                        {/* minus */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#e8e8e8',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            handleDeselect();
                          }}
                        >
                          <i className="fas fa-times text-xl" style={{ color: '#282c34' }}></i>

                          <Typography variant="caption" sx={{ color: '#282c34' }}>
                            Deselect
                          </Typography>
                        </Box>


                        {/* Crop */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#e8e8e8',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (designerRef?.current?.currentStage.selectedNode == undefined) {
                              return;
                            }
                            var newUrl = designerRef.current?.originImageOfStage[designerRef.current.currentStage.selectedNode?.id()];

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
                        >
                          <i className="fas fa-crop text-xl" style={{ color: '#282c34' }}></i>
                          <Typography variant="caption" sx={{ color: '#282c34' }}>
                            Crop
                          </Typography>
                        </Box>

                      </Box>

                      {/* Advanced Controls */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        {/* Width Control */}
                        <Box sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          p: 2
                        }}>
                          <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                            Resize
                          </Typography>

                          {/* Width Control */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1
                            }}>
                              <Typography variant="caption" sx={{ color: '#666666', width: '60px' }}>
                                Width:
                              </Typography>
                              <input
                                type="number"
                                value={resizeWidth || 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                onChange={(e) => {
                                  handleResizeWidthChange(e.target.value ? Number(e.target.value) : undefined)
                                }}
                                className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Width"
                                min="0"
                                max={maxResizeWidth}
                              />
                              <Typography variant="caption" sx={{ color: '#666666' }}>
                                px
                              </Typography>
                            </Box>
                            <input
                              type="range"
                              value={resizeWidth || 0}
                              onChange={(e) => handleResizeWidthChange(Number(e.target.value))}
                              min="0"
                              max={maxResizeWidth}
                              className="w-full"
                              style={{ accentColor: '#1976d2' }}
                            />
                          </Box>

                          {/* Height Control */}
                          <Box>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1
                            }}>
                              <Typography variant="caption" sx={{ color: '#666666', width: '60px' }}>
                                Height:
                              </Typography>
                              <input
                                type="number"
                                value={resizeHeight || 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                onChange={(e) => handleResizeHeightChange(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Height"
                                min="0"
                                max={maxResizeHeight}
                              />
                              <Typography variant="caption" sx={{ color: '#666666' }}>
                                px
                              </Typography>
                            </Box>
                            <input
                              type="range"
                              value={resizeHeight || 0}
                              onChange={(e) => handleResizeHeightChange(Number(e.target.value))}
                              min="0"
                              max={maxResizeHeight}
                              className="w-full"
                              style={{ accentColor: '#1976d2' }}
                            />
                          </Box>
                        </Box>

                        {/* Rotation Control */}
                        <Box sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          p: 2,
                          mb: 2
                        }}>
                          <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                            Rotation
                          </Typography>

                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1
                          }}>
                            <Typography variant="caption" sx={{ color: '#666666', width: '60px' }}>
                              Angle:
                            </Typography>
                            <input
                              type="number"
                              value={Math.round(rotationAngle || 0)}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) => handleRotationChange(e.target.value ? Number(e.target.value) : undefined)}
                              min="0"
                              className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Angle"
                              max="360"
                            />
                            <Typography variant="caption" sx={{ color: '#666666' }}>
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
                            style={{ accentColor: '#1976d2' }}
                          />
                        </Box>

                        {/* Center and Layer Controls */}
                        <Box sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          p: 2
                        }}>
                          <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                            Position & Layering
                          </Typography>

                          {/* Center Controls */}
                          <Box sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 2
                          }}>
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                              }}
                            >
                              <i className="fas fa-arrows-alt-v mr-2"></i>
                              Center Height
                            </Button>
                          </Box>

                          {/* Layering Controls */}
                          <Box sx={{
                            display: 'flex',
                            gap: 2
                          }}>
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
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

              {(menuIndex === 3 || menuIndex === 6) && (
                <Box>
                  <Typography variant="h6" sx={{ color: '#282c34', mb: 2 }}>
                    Add text
                  </Typography>
                  {menuIndex == 3 && (
                    <div className="space-y-6">
                      <div>
                        <textarea
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          id="textInput"
                          rows={3}
                          placeholder="Enter your text here..."
                        ></textarea>
                      </div>

                      <div id="fontColorPickerWrap">
                        <h5 className="text-lg font-medium mb-3">Text Color</h5>
                        <div id="fontColorPicker">
                          <div className="grid grid-cols-10 gap-1">
                            {colors.map((color) => (
                              <div
                                key={color}
                                className="w-7 h-7 rounded-full cursor-pointer transform hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                data-color={color}
                                onClick={() => {
                                  if (designerRef.current) {
                                    designerRef.current.changeTextColor(color);
                                    const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
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
                        <h5 className="text-lg font-medium mb-3">Font Style</h5>
                        <div className="flex justify-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="boldCheck"
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              onChange={(e) => {
                                if (designerRef.current) {
                                  const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
                                  if (textInput) {
                                    textInput.style.fontWeight = e.target.checked ? 'bold' : 'normal';
                                    designerRef.current.changeFontWeight(e.target.checked ? 'bold' : 'normal');
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
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              onChange={(e) => {
                                if (designerRef.current) {
                                  const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
                                  if (textInput) {
                                    textInput.style.fontStyle = e.target.checked ? 'italic' : 'normal';
                                    designerRef.current.changeFontStyle(e.target.checked ? 'italic' : 'normal');
                                  }
                                }
                              }}
                            />
                            <span>Italic</span>
                          </label>
                        </div>
                      </div>

                      <div id="fontFamily">
                        <h5 className="text-lg font-medium mb-3">Font Family</h5>
                        <select
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          id="chooseFontFamily"
                          onChange={(e) => {
                            if (designerRef.current) {
                              designerRef.current.changeFontFamily(e.target.value);
                              const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
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
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          id="submitText"
                          onClick={() => {
                            const text = (document.getElementById('textInput') as HTMLTextAreaElement).value.trim();
                            if (text && designerRef.current) {
                              designerRef.current.addText(text);
                              const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
                              if (textInput) {
                                textInput.value = '';
                              }
                            }
                          }}
                        >
                          Add Text
                        </button>
                      </div>
                    </div>
                  )}
                  {menuIndex === 6 && (
                    <Box sx={{
                      bgcolor: '#f5f5f5',
                      borderRadius: 2,
                      p: 2
                    }}>
                      <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                        Text Tools
                      </Typography>

                      {/* Basic Tools */}
                      <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        mb: 2
                      }}>
                        {/* Copy */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#e8e8e8',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.copySelectedNode();
                            }
                          }}
                        >
                          <i className="fas fa-copy text-xl" style={{ color: '#282c34' }}></i>
                          <Typography variant="caption" sx={{ color: '#282c34' }}>
                            Copy
                          </Typography>
                        </Box>

                        {/* Delete */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#e8e8e8',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.deleteSelectedNode();
                            }
                          }}
                        >
                          <i className="fas fa-trash text-xl" style={{ color: '#282c34' }}></i>
                          <Typography variant="caption" sx={{ color: '#282c34' }}>
                            Delete
                          </Typography>
                        </Box>



                      </Box>
                      <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        mb: 2
                      }}>

                        {/* minus */}
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.5,
                            bgcolor: 'white',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#e8e8e8',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            handleDeselect();
                          }}
                        >
                          <i className="fas fa-times text-xl" style={{ color: '#282c34' }}></i>

                          <Typography variant="caption" sx={{ color: '#282c34' }}>
                            Deselect
                          </Typography>
                        </Box>
                      </Box>

                      {/* Advanced Controls */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        {/* Width Control */}
                        <Box sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          p: 2
                        }}>
                          <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                            Resize
                          </Typography>

                          {/* Width Control */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1
                            }}>
                              <Typography variant="caption" sx={{ color: '#666666', width: '60px' }}>
                                Font Size:
                              </Typography>
                              <input
                                type="number"
                                value={resizeFontSize || 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                onChange={(e) => handleFontSizeChange(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Width"
                                min="0"
                                max={maxResizeFontSize}
                              />
                              <Typography variant="caption" sx={{ color: '#666666' }}>
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
                              style={{ accentColor: '#1976d2' }}
                            />
                          </Box>
                        </Box>

                        {/* Rotation Control */}
                        <Box sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          p: 2,
                          mb: 2
                        }}>
                          <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                            Rotation
                          </Typography>

                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1
                          }}>
                            <Typography variant="caption" sx={{ color: '#666666', width: '60px' }}>
                              Angle:
                            </Typography>
                            <input
                              type="number"
                              value={Math.round(rotationAngle || 0)}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) => handleRotationChange(e.target.value ? Number(e.target.value) : undefined)}
                              className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Angle"
                              max="360"
                              min="0"
                            />
                            <Typography variant="caption" sx={{ color: '#666666' }}>
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
                            style={{ accentColor: '#1976d2' }}
                          />
                        </Box>

                        {/* Center and Layer Controls */}
                        <Box sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          p: 2
                        }}>
                          <Typography variant="subtitle2" sx={{ color: '#282c34', mb: 2 }}>
                            Position & Layering
                          </Typography>

                          {/* Center Controls */}
                          <Box sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 2
                          }}>
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                              }}
                            >
                              <i className="fas fa-arrows-alt-v mr-2"></i>
                              Center Height
                            </Button>
                          </Box>

                          {/* Layering Controls */}
                          <Box sx={{
                            display: 'flex',
                            gap: 2
                          }}>
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
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
                                borderColor: '#282c34',
                                color: '#282c34',
                                '&:hover': {
                                  borderColor: '#1976d2',
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
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

              {(menuIndex === 7) && (
                <Box>
                  <Typography variant="h6" sx={{ color: '#282c34', mb: 2 }}>
                    Preview Image
                  </Typography>

                  <Box
                    sx={{
                      id: 'cropContainer',
                      display: 'inline-block',
                      mb: 3,
                      bgcolor: '#f5f5f5',
                      border: '2px dashed #ccc',
                      maxWidth: 500,       // Giới hạn chiều rộng tối đa
                      maxHeight: 300,      // Giới hạn chiều cao tối đa
                      width: 'fit-content',
                      height: 'fit-content',
                      overflow: 'hidden',
                      mx: 'auto', // căn giữa ngang
                    }}
                    ref={cropContainerRef}
                  >
                    {cropImageUrl ? (
                      <Box sx={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        maxWidth: 500,
                        maxHeight: 300
                      }}>
                        <img
                          src={cropImageUrl}
                          style={{
                            maxWidth: 500,
                            maxHeight: 300,
                            height: 'auto',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />

                        <Rnd
                          size={{ width: frameState.width, height: frameState.height }}
                          position={{ x: frameState.left, y: frameState.top }}
                          bounds="parent"
                          onDrag={(e, d) => {

                            console.log(e, d);
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
                            console.log(e);

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
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 300,
                          height: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography color="text.secondary">No image selected</Typography>
                      </Box>
                    )}
                  </Box>


                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#302c34',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: '#1f1c20',
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation()


                        cropImage();
                        //designerRef.current?.clearBorderNode(designerRef.current?.currentStage);
                      }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              )}


            </Box>
          </Paper>

          <Box
            component="section"
            id="editorImage"
            sx={{
              pl: '650px',
              pr: menuWidth,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 'calc(100vh - 45px)',
            }}
          >
            <Box sx={{ position: 'relative', maxWidth: '600px', mx: 'auto' }}>


              {/* Main Content Area */}
              <Box
                sx={{
                  width: '550px',
                  height: '100%',
                  position: 'relative',
                  ml: '200px',
                }}
              >
                {sort_data.map((item: PrintFaceData, index: number) => {
                  return <Box key={index}>
                    <Box
                      component="img"
                      id={item.code + "Image"}
                      className={index == 0 ? item.code + "Image" : item.code + "Image hidden"}
                      src={item.image}
                      alt=""
                      crossOrigin='anonymous'
                      sx={{
                        height: 'auto',
                        width: 'auto',
                        maxHeight: '80vh',
                      }}
                    />
                    <div id={"preview-" + item.code}></div>
                  </Box>
                })}
              </Box>
            </Box>
          </Box>

          <Paper
            id="leftMenu"
            elevation={3}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: menuWidth,
              maxWidth: '100px',
              backgroundColor: '#743c54',
              py: 1,
              px: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              borderRadius: '0'
            }}
          >
            {sort_data.map((item: PrintFaceData, index: number) => (
              <Box
                key={item.code}
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, marginTop: '10px' }}
              >
                <Box>
                  <Box
                    className={index === 0 ? "thumbnail active" : "thumbnail"}
                    data-view={item.code}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                      cursor: 'pointer',
                      marginBottom: '20px'
                    }}
                  >
                    <Box
                      id={`thumb-${item.code}`}
                      component="img"
                      src={item.image}
                      alt={`${item.code}View`}
                      sx={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        background: 'white',
                        margin: 'auto'
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '15px', textAlign: 'center', color: '#ffffff' }}
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
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#2b2966',
                  },
                  width: '100%',
                  mt: '20px',
                  textTransform: 'none',
                }}
                onClick={async () => {
                  const isLogin = await checkUser();
                  console.log('aaaaaaaaaaaaaaaaaaaaaa', isLogin);
                  if (isLogin == false) {
                    window.location.replace(`/${param.channel}/login`);
                  }
                  setSpinner(true);
                  const json = localStorage.getItem("cart");

                  if (json != null && json !== undefined) {
                    const cartItem = JSON.parse(json) as {  // Ép kiểu trực tiếp ở đây
                      params: any;  // Loại của params có thể thay đổi tuỳ theo nhu cầu
                      selectedVariantId: string;
                      quantity: number;
                    };

                    if (designerRef.current != null) {

                      let metaData = null;
                      let hasObjectInStage = false;
                      if (designerRef.current.stages != null) { }
                      for (const i of designerRef.current.stages) {
                        if (i.layer?.getChildren().length != null && i.layer?.getChildren().length > 0) {
                          hasObjectInStage = true;
                          break;
                        }
                      }
                      if (hasObjectInStage == true) {
                        metaData = await designerRef.current.exportDesignToJson();
                      }
                      var result = false;
                      if (param.typeDesign == 1) {
                        result = (await addItem(cartItem.params, variantId, cartItem.quantity, metaData)) as boolean;
                      }
                      else {
                        result = (await addItem(cartItem.params, variantId, 1, metaData)) as boolean;
                      }
                      if (result === true) {
                        toast.success('Design added to cart successfully');
                      }
                      else {
                        toast.error('An error occurred during processing. Please try again later');
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
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#2b2966',
                  },
                  width: '100%',
                  mt: '20px',
                  textTransform: 'none',
                }}
                onClick={async () => {
                  setSpinner(true);
                  const cartId = localStorage.getItem("cartId");
                  if (cartId != null && cartId != undefined) {
                    if (designerRef.current != null) {
                      const metaData = await designerRef.current.exportDesignToJson();

                      const result = await UpdateDesign(cartId, metaData);
                      if (result == true) {
                        toast.success('Design updated successfully');
                      }
                      else {
                        toast.error('An error occurred during processing. Please try again later');
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
          </Paper>
        </Box>
      </Box>

      <div className="fixed inset-0 z-50 hidden items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}

export default DesignPage;