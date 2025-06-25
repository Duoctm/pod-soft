"use client"

import Konva from 'konva';
import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { type PrintFaceData, type DesignInfo/*, UploadDataType*/ } from '../utils/type';
import { uploadImageRaw } from './UpdateImage';
import { v4 as uuidv4 } from 'uuid';
import { NodeConfig2, NodeHistory2, addStackHistory2, initialStackHistory2 } from './designHistory2'
interface StageConfig {
  stage: Konva.Stage | null;
  layer: Konva.Layer | null;
  selectedNode: Konva.Node | null;
  borderDiv: HTMLDivElement | null;
  //lastPositionNode: { x: number; y: number } | null;
}
class TShirtDesigner {

  public data: PrintFaceData[];
  public productId: string;
  public colorValue: string;
  public variantId: string | null;
  private colorData: Map<string, object>;
  private sizeIdDefault: string | undefined;
  private variantSizeColorData: Map<string, object> | null;
  public stages: StageConfig[] = [];
  public designType: number;

  public currentStage: StageConfig;
  private textColor: string = '#000000';
  private fontWeight: string = 'normal';
  private fontStyle: string = 'normal';
  private fontFamily: string = 'Montserrat';
  private backgroundColor: string = '#ffffff';
  private clipboard: Konva.Node | null = null;
  public onSelectObject: ((hasSelection: boolean) => void) | null = null;
  private menuIndexSetter: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>>;
  private resizeWidthSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private resizeHeightSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private rotationAngleSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private fontSizeSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private maxResizeWidthSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private maxResizeHeightSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private maxFontSizeSetter: React.Dispatch<React.SetStateAction<number | undefined>>;

  public faceImage: Record<string, string> = {};
  public originImageOfStage: Record<string, string> = {};

  public setMenu() {
    if (this.currentStage.selectedNode != null) {
      if (this.currentStage.selectedNode instanceof Konva.Image) {
        this.menuIndexSetter(5);
      }
      else if (this.currentStage.selectedNode instanceof Konva.Text) {
        this.menuIndexSetter(6);
      }
    }
  }

  public setMenuWithNodeAndStage(node: Konva.Node, stage: StageConfig, menuIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7) {
    this.showBorderNode(node, stage);
    this.menuIndexSetter(menuIndex);
  }

  public getWHROfNode() {
    if (this.currentStage.selectedNode != null) {
      this.resizeWidthSetter(parseInt(Math.abs(this.currentStage.selectedNode.width()).toString()));
      this.resizeHeightSetter(parseInt(Math.abs(this.currentStage.selectedNode.height()).toString()));
      this.rotationAngleSetter(parseInt(Math.abs(this.currentStage.selectedNode.rotation()).toString()));
    }
  }

  public resetWHROfNode() {
    if (this.currentStage.selectedNode != null) {
      this.resizeWidthSetter(0);
      this.resizeHeightSetter(0);
      this.rotationAngleSetter(0);
    }
  }

  public getRSOfNode() {
    if (this.currentStage.selectedNode != null) {
      const node = this.currentStage.selectedNode as Konva.Text;
      this.fontSizeSetter(parseInt(Math.abs(node.fontSize()).toString()));
      this.rotationAngleSetter(parseInt((Math.abs(node.rotation())).toString()));
    }
  }

  public resetRSOfNode() {
    if (this.currentStage.selectedNode != null) {
      this.fontSizeSetter(0);
      this.rotationAngleSetter(0);
    }
  }



  public updateStagePosition(stageConfig: StageConfig, faceData: PrintFaceData, image: HTMLImageElement) {
    if (!stageConfig.stage || !stageConfig.borderDiv) return;

    const imageWidth = image.offsetWidth;
    const imageHeight = image.offsetHeight;
    const imageRect = image.getBoundingClientRect();

    const oldWidth = stageConfig.stage.width();
    const oldHeight = stageConfig.stage.height();
    //console.log('stageConfig cu', oldWidth, oldHeight)

    const stageWidth = imageWidth * faceData.width; //imageWidth * 0.35;
    const stageHeight = imageHeight * faceData.height;//imageHeight * 0.4;
    //console.log('stageConfig moi', stageWidth, stageHeight);
    const stageX = imageRect.left + (faceData.position.x * imageWidth); //imageRect.left + (imageWidth - stageWidth) / 2;
    const stageY = imageRect.top + (faceData.position.y * imageHeight); //imageRect.top + (imageHeight - stageHeight) / 2 - 50;

    // Cập nhật kích thước và vị trí của stage
    stageConfig.stage.width(stageWidth);
    stageConfig.stage.height(stageHeight);

    // Cập nhật vị trí và kích thước của container
    const container = stageConfig.stage.container();
    container.style.position = 'fixed';
    container.style.left = `${stageX}px`;
    container.style.top = `${stageY}px`;
    container.style.transform = `translate3d(0, 0, 0)`; // Thêm GPU acceleration

    // Cập nhật vị trí và kích thước của borderDiv
    stageConfig.borderDiv.style.width = `${stageWidth}px`;
    stageConfig.borderDiv.style.height = `${stageHeight}px`;
    stageConfig.borderDiv.style.left = `${stageX}px`;
    stageConfig.borderDiv.style.top = `${stageY}px`;
    stageConfig.borderDiv.style.transform = `translate3d(0, 0, 0)`; // Thêm GPU acceleration

    // Cập nhật vị trí và kích thước của tất cả các đối tượng trong stage
    if (stageConfig.layer && oldWidth > 0 && oldHeight > 0) {
      // Tính tỷ lệ thay đổi kích thước
      const scaleX = stageWidth / oldWidth;
      const scaleY = stageHeight / oldHeight;

      stageConfig.layer.children.forEach((node) => {
        if (node instanceof Konva.Transformer) return;

        // Lưu vị trí và kích thước tương đối
        const relativeX = node.x() / oldWidth;
        const relativeY = node.y() / oldHeight;



        // Cập nhật vị trí mới dựa trên tỷ lệ

        node.x(relativeX * stageWidth);
        node.y(relativeY * stageHeight);



        // Nếu là text node, điều chỉnh kích thước font
        /*if (node instanceof Konva.Text) {
          node.width(node.width() * scaleX);
          node.height(node.height() * scaleY);
          node.fontSize(node.fontSize() * scaleX)
          node.offsetX(node.width() / 2);
          node.offsetY(node.height() / 2);
        }
        // Nếu là image node, điều chỉnh kích thước
        else*/ if (node instanceof Konva.Image) {
          node.width(node.width() * scaleX);
          node.height(node.height() * scaleY);
          node.offsetX(node.width() / 2);
          node.offsetY(node.height() / 2);
          node.setAttr('rotationOfLastWidth', node.width());
          node.setAttr('rotationOfLastHeight', node.height());
        }

      });

      // Vẽ lại layer
      stageConfig.layer.draw();

    }

    if (stageConfig.selectedNode !== null) {
      this.showBorderNode(stageConfig.selectedNode, stageConfig);
    }
  }

  public updateStagePositions = () => {
    let index = -1;
    for (const item in this.data) {
      if (this.stages[item] == this.currentStage) {
        index = parseInt(item);
        break;
      }
    }
    if (index != -1) {
      const imageDom = document.getElementById(this.data[index].code + "Image") as HTMLImageElement;
      if (imageDom) {
        this.updateStagePosition(this.currentStage, this.data[index], imageDom);
      }
    }
    //}

    // let domImage = document.getElementById(this.data[0].code + "Image") as HTMLImageElement;
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaas', this.stages[0]);
    // this.updateStagePosition(this.stages[0], this.data[0], domImage);


  };

  constructor(data: PrintFaceData[], productId: string, variantId: string | null, colorValue: string, designType: number, colorData: Map<string, object>, sizeIdDefault: string | undefined, variantSizeColorData: Map<string, object> | null,
    menuIndexSetter: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>>,
    resizeWidthSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    resizeHeightSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    rotationAngleSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    fontSizeSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    maxResizeWidthSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    maxResizeHeightSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    maxFontSizeSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
  ) {
    this.data = data;
    this.productId = productId;
    this.colorValue = colorValue;
    this.variantId = variantId;
    this.designType = designType;
    this.colorData = colorData;
    this.sizeIdDefault = sizeIdDefault;
    this.variantSizeColorData = variantSizeColorData;
    this.menuIndexSetter = menuIndexSetter;
    this.resizeWidthSetter = resizeWidthSetter;
    this.resizeHeightSetter = resizeHeightSetter;
    this.rotationAngleSetter = rotationAngleSetter;
    this.fontSizeSetter = fontSizeSetter;
    this.maxResizeWidthSetter = maxResizeWidthSetter;
    this.maxResizeHeightSetter = maxResizeHeightSetter;
    this.maxFontSizeSetter = maxFontSizeSetter;
    for (const item in this.data) {
      this.stages[item] = {
        stage: null,
        layer: null,
        selectedNode: null,
        borderDiv: null
        //lastPositionNode: null
      };
    }
    this.currentStage = this.stages[0];
    this.initializeStages();
    this.initializeGlobalEventListeners();
    initialStackHistory2();
    //this.createNodeHistory()
    //this.initializeObjectFromDesignRelativeInfo();



    // Thêm event listener cho window resize và scroll
    // const updateStagePositions = () => {
    //   for (const item in data) {
    //     const imageDom = document.getElementById(data[item].code+ "Image") as HTMLImageElement;
    //     if (imageDom) {
    //       this.updateStagePosition(this.stages[item], this.data[item], imageDom);
    //     }
    //   }
    // };

    window.addEventListener('resize', () => {
      this.updateStagePositions();
      this.setMenu();
    });
    window.addEventListener('scroll', () => {
      this.updateStagePositions();
      this.setMenu();
    });
  }

  private initializeStages() {
    const doms: HTMLImageElement[] = [];
    for (const item in this.data) {
      this.faceImage[this.data[item].code] = "";
      const imageDom = document.getElementById(this.data[item].code + "Image") as HTMLImageElement;
      if (imageDom) {
        doms.push(imageDom);
      }
    }

    const initStages = () => {

      if (doms.length > 0) {

        doms.forEach((_, index) => {
          this.setupStage(this.stages[index], this.data[index], doms[index], 'preview-' + this.data[index].code, this.data[index].code);
          if (index === 0) {
            this.stages[index].stage!.container().style.display = 'block';
            this.currentStage = this.stages[index];
            //console.log('currentStage', this.currentStage.borderDiv?.style.x, this.currentStage.borderDiv?.style.y);
            this.maxResizeWidthSetter(parseInt(this.stages[index].stage!.width().toString()));
            this.maxResizeHeightSetter(parseInt(this.stages[index].stage!.height().toString()));
            this.maxFontSizeSetter(parseInt(this.stages[index].stage!.width().toString()));
          }
          else {
            this.stages[index].stage!.container().style.display = 'none';
          }



        })

      }
    };

    let imagesLoaded = 0;
    const onImageLoad = () => {
      imagesLoaded++;

      if (imagesLoaded === 2) {
        initStages();
      }
    };
    doms.forEach((_, index) => {
      if (doms[index].complete) {
        onImageLoad();
      } else {
        doms[index].onload = onImageLoad;
      }
    })
  }

  private initializeGlobalEventListeners() {
    // Handle color selection
    $('#colorDrawer').on('click', '.color-option', (e) => {
      const color = $(e.currentTarget).data('color');
      this.changeBackgroundColor(color);
    });

    // Handle file upload
    $('#file-select').on('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleImageUpload(file);
      }
    });

    // Handle rotation
    $('#rotate').on('click', () => {
      if (this.currentStage.selectedNode) {
        this.currentStage.selectedNode.rotate(90);
        this.currentStage.layer!.batchDraw();
      }
    });

    // Handle deletion
    $('#delete').on('click', () => {
      this.deleteSelectedNode(/*this.currentStage*/);
      // this.clearBorderNode(this.currentStage);
      // this.menuIndexSetter(0);
    });

  }

  private setupStage(stageConfig: StageConfig, faceData: PrintFaceData, image: HTMLImageElement, containerId: string, side: string) {

    const imageWidth = image.offsetWidth;
    const imageHeight = image.offsetHeight;
    const imageRect = image.getBoundingClientRect();

    const stageWidth = imageWidth * faceData.width; //imageWidth * 0.35;
    const stageHeight = imageHeight * faceData.height;//imageHeight * 0.4;
    const stageX = imageRect.left + (faceData.position.x * imageWidth); //imageRect.left + (imageWidth - stageWidth) / 2;
    const stageY = imageRect.top + (faceData.position.y * imageHeight); //imageRect.top + (imageHeight - stageHeight) / 2 - 50;

    const borderDiv = document.createElement('div');
    borderDiv.style.width = `${stageWidth}px`;
    borderDiv.style.height = `${stageHeight}px`;
    borderDiv.style.position = 'fixed';
    borderDiv.style.left = `${stageX}px`;
    borderDiv.style.top = `${stageY}px`;
    borderDiv.style.border = '1px dashed black';
    borderDiv.style.pointerEvents = 'none';
    borderDiv.style.display = 'none';
    document.body.appendChild(borderDiv);
    stageConfig.borderDiv = borderDiv;

    const previewContainer = document.getElementById(containerId);
    if (previewContainer) {
      previewContainer.style.position = 'fixed';
      previewContainer.style.left = `${stageX}px`;
      previewContainer.style.top = `${stageY}px`;
      previewContainer.style.zIndex = '1';
      previewContainer.style.pointerEvents = 'auto';
    }

    // Khởi tạo stage
    stageConfig.stage = new Konva.Stage({
      id: side,
      container: containerId,
      width: stageWidth,
      height: stageHeight,
    });

    stageConfig.layer = new Konva.Layer();
    stageConfig.stage.add(stageConfig.layer);

    // stageConfig.lastPositionNode = {
    //   x: -1,
    //   y: -1
    // }

    this.initializeStageEventListeners(stageConfig);

    stageConfig.layer.draw();

  }

  public switchToStage(side: string, isAddHistory?: boolean) {
    this.clearBorderNode(this.currentStage);
    this.menuIndexSetter(0);

    if (this.currentStage.stage) {
      const currentContainer = this.currentStage.stage.container();
      currentContainer.style.display = 'none';
      currentContainer.style.zIndex = '0';
      this.maxResizeWidthSetter(parseInt(this.currentStage.stage!.width().toString()));
      this.maxResizeHeightSetter(parseInt(this.currentStage.stage!.height().toString()));
      this.maxFontSizeSetter(parseInt(this.currentStage.stage!.width().toString()));
    }
    if (this.currentStage.borderDiv) {
      this.currentStage.borderDiv.style.display = 'none';
    }
    this.currentStage.selectedNode = null;

    for (const item in this.data) {
      const domImage = document.getElementById(this.data[item].code + "Image") as HTMLImageElement;
      if (this.data[item].code === side) {
        this.currentStage = this.stages[item];
        if (domImage) {
          this.updateStagePosition(this.currentStage, this.data[item], domImage);

        }
        if (this.currentStage.stage) {
          const container = this.currentStage.stage.container();
          container.style.display = 'block';
          container.style.zIndex = '1';
          container.style.pointerEvents = 'auto';

          if (this.currentStage.layer) {
            this.currentStage.layer.draw();
          }
        }
        domImage.style.display = 'block';
        domImage.style.zIndex = '0';
      }
      else {
        domImage.style.display = 'none';
        domImage.style.zIndex = '0';
      }
    }

    // Reset selection state
    if (this.onSelectObject) {
      this.onSelectObject(false);
    }

    if (isAddHistory) {
      this.createNodeHistory();
    }

  }

  public clearBorderNode(stageConfig: StageConfig) {
    if (stageConfig.selectedNode != null) {
      //this.menuIndexSetter(0);
      stageConfig.selectedNode = null;
    }
    // stageConfig.lastPositionNode = {
    //   x: -1,
    //   y: -1
    // }
    document.querySelectorAll('.border-node').forEach(el => el.remove());
  }

  public copySelectedNode() {
    const node = this.currentStage.selectedNode as Konva.Node;
    const stageConfig = this.currentStage;
    if (node == null) {
      return;
    }
    const clone = node.clone();

    if ((node.x() + node.offsetX() + 10) < stageConfig.stage!.width()) {
      clone.x(node.x() + 10);
    }
    else if ((node.x() + node.offsetX() - 10) > 0) {
      clone.x(node.x() - 10);
    }

    if ((node.y() + node.offsetY() + 10) < stageConfig.stage!.height()) {
      clone.y(node.y() + 10);
    }
    else if ((node.y() + node.offsetY() - 10) > 0) {
      clone.y(node.y() - 10);
    }


    clone.id(uuidv4());





    clone.draggable(true);
    stageConfig.layer!.add(clone);
    stageConfig.layer!.draw();
    clone.dragBoundFunc(function (pos: any) {
      const stage = clone.getStage();
      const stageWidth = stage!.width();
      const stageHeight = stage!.height();

      const tempNode = clone.clone();
      tempNode.position(pos);
      const bounds = tempNode.getClientRect();

      let newX = pos.x;
      let newY = pos.y;

      if (bounds.x < 0) {
        newX = pos.x - bounds.x;
      }
      if (bounds.x + bounds.width > stageWidth) {
        newX = pos.x - (bounds.x + bounds.width - stageWidth);
      }
      if (bounds.y < 0) {
        newY = pos.y - bounds.y;
      }
      if (bounds.y + bounds.height > stageHeight) {
        newY = pos.y - (bounds.y + bounds.height - stageHeight);
      }

      return { x: newX, y: newY };
    });


    clone.on('dragend', () => {
      this.createNodeHistory();
    });

    //this.showBorderNode(clone, stageConfig);
    if (node instanceof Konva.Image) {
      this.setMenuWithNodeAndStage(clone, this.currentStage, 5);
    }
    else if (node instanceof Konva.Text) {
      this.setMenuWithNodeAndStage(clone, this.currentStage, 6);
    }
    if (this.onSelectObject) this.onSelectObject(true);
    this.createNodeHistory();
  }

  public trimTextToFitStageWidth(textNode: Konva.Text, stage: Konva.Stage) {
    let text = textNode.text();
    let fontSize = textNode.fontSize();

    while (textNode.width() > stage.width() && fontSize > 10) {
      fontSize -= 1;
      textNode.fontSize(fontSize);
    }

    while (textNode.width() > stage.width() && text.length > 0) {
      text = text.slice(0, -1);
      textNode.text(text);
    }
  }



  private setNodeBoder(node: Konva.Node, stageConfig: StageConfig) {
    this.clearBorderNode(stageConfig);
    stageConfig.selectedNode = node;

    const stageContainer = stageConfig.stage!.container();
    const rectDiv = document.createElement('div');
    document.body.appendChild(rectDiv);

    const rotatePoint = (px: number, py: number, cx: number, cy: number, angle: number) => {
      const radians = (Math.PI / 180) * angle;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const dx = px - cx;
      const dy = py - cy;
      const x = dx * cos - dy * sin + cx;
      const y = dx * sin + dy * cos + cy;
      return { x, y };
    };

    const createIconWrapper = (iconClass: string, positionStyle: Partial<CSSStyleDeclaration>, onClick: (e: MouseEvent) => void): HTMLElement => {
      const wrapper = document.createElement('div');
      Object.assign(wrapper.style, {
        position: 'absolute',
        width: '24px',
        height: '24px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto', // Có thể chuyển sang 'none' sau khi mousedown xong
        userSelect: 'none',
        zIndex: '11',
        ...positionStyle
      });


      const icon = document.createElement('i');
      icon.className = iconClass;
      icon.style.fontSize = '12px';
      icon.style.color = '#444';

      wrapper.appendChild(icon);
      wrapper.onclick = onClick;

      return wrapper;
    };

    const deleteIcon = createIconWrapper('fas fa-times', { left: '-22px', top: '-22px' }, (e) => {
      e.stopPropagation();
      this.deleteSelectedNode(/*stageConfig*/);
      // this.clearBorderNode(stageConfig);
    });

    const copyIcon = createIconWrapper('fas fa-copy', { left: '-22px', bottom: '-22px' }, (e) => {
      e.stopPropagation();
      this.copySelectedNode();
    });

    const resizeIcon = createIconWrapper('fas fa-arrows-alt-h', { right: '-22px', bottom: '-22px' }, () => { });
    resizeIcon.firstElementChild!.setAttribute('style', 'transform: rotate(45deg); font-size: 12px; color: #444;');

    const getPoint = (e: MouseEvent | TouchEvent) => {
      if (e instanceof TouchEvent) {
        const touch = e.touches[0] || e.changedTouches[0];
        return { x: touch.clientX, y: touch.clientY };
      } else {
        return { x: e.clientX, y: e.clientY };
      }
    };

    const handleResizeStart = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();

      rotateIcon.style.display = 'none';
      const stage = stageConfig.stage!;
      const layer = stageConfig.layer!;
      const { x: startX, y: startY } = getPoint(e);
      const initialWidth = node.width();
      const initialHeight = node.height();

      const noRotated = Math.abs(node.rotation()) <= 1 || Math.abs(node.rotation()) >= 359;

      if (noRotated) {
        node.offsetX(0);
        node.offsetY(0);
        node.x(node.x() - initialWidth / 2);
        node.y(node.y() - initialHeight / 2);
      }

      stageConfig.borderDiv!.style.display = 'block';

      const handleResizeMove = (moveEvent: MouseEvent | TouchEvent) => {
        moveEvent.preventDefault();
        const { x, y } = getPoint(moveEvent);
        const deltaX = x - startX;
        const deltaY = y - startY;

        if (node instanceof Konva.Text) {
          const scale = (node.width() + deltaX / 16) / node.width();
          const clone = node.clone();
          clone.fontSize(node.fontSize() * scale);

          const cloneBounds = clone.getClientRect();
          if (
            cloneBounds.x >= 0 &&
            cloneBounds.x + cloneBounds.width <= stage.width() &&
            cloneBounds.y >= 0 &&
            cloneBounds.y + cloneBounds.height <= stage.height() &&
            clone.fontSize() >= 10
          ) {
            node.fontSize(clone.fontSize());
            this.getRSOfNode();
            updateBorderDiv();
          }
        }

        if (node instanceof Konva.Image) {
          const clone = node.clone();
          clone.width(initialWidth + deltaX);
          clone.height(initialHeight + deltaY);
          const cloneBounds = clone.getClientRect();

          if (
            cloneBounds.x >= 0 &&
            cloneBounds.x + cloneBounds.width <= stage.width() &&
            cloneBounds.y >= 0 &&
            cloneBounds.y + cloneBounds.height <= stage.height()
          ) {
            node.width(initialWidth + deltaX);
            node.height(initialHeight + deltaY);
          }
          this.getWHROfNode();
        }

        if (!noRotated) {
          node.offsetX(node.width() / 2);
          node.offsetY(node.height() / 2);
        }

        node.setAttr('rotationOfLastWidth', node.width());
        node.setAttr('rotationOfLastHeight', node.height());
        updateBorderDiv();
        layer.draw();
      };

      const handleResizeEnd = () => {
        if (noRotated) {
          node.x(node.x() + node.width() / 2);
          node.y(node.y() + node.height() / 2);
          node.offsetX(node.width() / 2);
          node.offsetY(node.height() / 2);
        }

        rotateIcon.style.display = 'block';

        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResizeMove);
        window.removeEventListener('touchend', handleResizeEnd);

        rotateIcon.style.pointerEvents = 'none';
        resizeIcon.style.pointerEvents = 'none';
        stageConfig.borderDiv!.style.pointerEvents = 'none';

        if (node instanceof Konva.Image) {
          this.setMenuWithNodeAndStage(node, this.currentStage, 5);
        } else if (node instanceof Konva.Text) {
          this.setMenuWithNodeAndStage(node, this.currentStage, 6);
        }

        this.createNodeHistory();
      };

      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove, { passive: false });
      window.addEventListener('touchend', handleResizeEnd);
    };

    // Gắn sự kiện chuột và cảm ứng
    resizeIcon.addEventListener('mousedown', handleResizeStart);
    resizeIcon.addEventListener('touchstart', handleResizeStart, { passive: false });


    const rotateIcon = createIconWrapper('fas fa-redo', {}, (/*e*/) => {
      // e.stopPropagation();
      // node.rotation(node.rotation() + 15);
      // node.fire('transform');
      // updateBorderDiv();
      // stageConfig.layer!.draw();
    });

    const updateBorderDiv = () => {
      const bounds = node.getClientRect();
      const rotation = node.rotation();
      const stageRect = stageContainer.getBoundingClientRect();

      rectDiv.className = 'border-node';
      rectDiv.style.position = 'fixed';
      rectDiv.style.border = '2px dashed black';
      rectDiv.style.pointerEvents = 'none';
      rectDiv.style.zIndex = '10';
      rectDiv.style.left = `${bounds.x + stageRect.x}px`;
      rectDiv.style.top = `${bounds.y + stageRect.y}px`;
      rectDiv.style.width = `${bounds.width}px`;
      rectDiv.style.height = `${bounds.height}px`;

      // Tính vị trí icon xoay
      const centerX = node.x();
      const centerY = node.y();
      const iconOffsetX = node.x() - rotateIcon.offsetWidth / 2;
      const iconOffsetY = node.y() - 100;
      const { x: iconX, y: iconY } = rotatePoint(
        iconOffsetX,
        iconOffsetY,
        centerX,
        centerY,
        rotation
      );

      rotateIcon.style.position = 'fixed';
      rotateIcon.style.left = `${iconX + stageRect.x}px`;
      rotateIcon.style.top = `${iconY + stageRect.y}px`;
      rotateIcon.style.transform = `rotate(${rotation}deg)`;
    };


    const handleRotateStart = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const stage = stageConfig.stage!;
      const rect = stage.container().getBoundingClientRect();

      const centerX = rect.left + node.x();
      const centerY = rect.top + node.y();

      const { x: startX, y: startY } = getPoint(e);
      const startAngle = Math.atan2(startY - centerY, startX - centerX);
      const initialRotation = node.rotation();

      stageConfig.borderDiv!.style.display = 'block';

      const handleRotateMove = (moveEvent: MouseEvent | TouchEvent) => {
        moveEvent.preventDefault();
        const { x, y } = getPoint(moveEvent);
        const currentAngle = Math.atan2(y - centerY, x - centerX);
        const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);

        const newRotation = initialRotation + deltaAngle;
        node.rotation(newRotation);
        rotateIcon.style.transform = `rotate(${newRotation}deg)`;

        if (node instanceof Konva.Text) {
          updateBorderDiv();
          this.getRSOfNode();
          return;
        }

        const bounds = node.getClientRect();
        const defaultWidth = parseFloat(node.getAttr('rotationOfLastWidth'));
        const defaultHeight = parseFloat(node.getAttr('rotationOfLastHeight'));
        const tempNode = node.clone();
        tempNode.width(defaultWidth);
        tempNode.height(defaultHeight);
        const tempBounds = tempNode.getClientRect();

        if (
          tempBounds.x >= stage.x() &&
          tempBounds.x + tempBounds.width <= stage.width() &&
          tempBounds.y >= stage.y() &&
          tempBounds.y + tempBounds.height <= stage.height()
        ) {
          node.width(defaultWidth);
          node.height(defaultHeight);
        } else {
          if (bounds.x < 0) {
            const scale = node.x() / (node.x() - bounds.x);
            node.width(node.width() * scale);
            node.height(node.height() * scale);
          }
          if (bounds.x + bounds.width > stage.width()) {
            const excessWidth = (bounds.x + bounds.width) - stage.width();
            const scale = (bounds.width - excessWidth) / bounds.width;
            node.width(node.width() * scale);
            node.height(node.height() * scale);
          }
          if (bounds.y < 0) {
            const scale = node.y() / (node.y() - bounds.y);
            node.width(node.width() * scale);
            node.height(node.height() * scale);
          }
          if (bounds.y + bounds.height > stage.height()) {
            const excessHeight = (bounds.y + bounds.height) - stage.height();
            const scale = (bounds.height - excessHeight) / bounds.height;
            node.width(node.width() * scale);
            node.height(node.height() * scale);
          }
        }

        node.offsetX(node.width() / 2);
        node.offsetY(node.height() / 2);
        updateBorderDiv();
        stageConfig.layer!.draw();

        if (node instanceof Konva.Image) {
          this.getWHROfNode();
        }
      };

      const handleRotateEnd = () => {
        window.removeEventListener('mousemove', handleRotateMove);
        window.removeEventListener('mouseup', handleRotateEnd);
        window.removeEventListener('touchmove', handleRotateMove);
        window.removeEventListener('touchend', handleRotateEnd);

        rotateIcon.style.pointerEvents = 'none';
        resizeIcon.style.pointerEvents = 'none';
        stageConfig.borderDiv!.style.pointerEvents = 'none';

        node.setAttr('rotationOfLastWidth', node.width());
        node.setAttr('rotationOfLastHeight', node.height());


        this.createNodeHistory();

      };

      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateEnd);
      window.addEventListener('touchmove', handleRotateMove, { passive: false });
      window.addEventListener('touchend', handleRotateEnd);
    };
    // Gắn sự kiện cho chuột và cảm ứng
    rotateIcon.addEventListener('mousedown', handleRotateStart);
    rotateIcon.addEventListener('touchstart', handleRotateStart, { passive: false });

    rectDiv.appendChild(deleteIcon);
    rectDiv.appendChild(copyIcon);
    rectDiv.appendChild(resizeIcon);
    rectDiv.appendChild(rotateIcon);

    updateBorderDiv();
  }

  public showBorderNode(node: Konva.Node, stageConfig: StageConfig) {
    //stageConfig.lastPositionNode = { x: node.x(), y: node.y() };
    this.setNodeBoder(node, stageConfig);

    //return rectDiv;
  }


  private initializeStageEventListeners(stageConfig: StageConfig) {
    if (!stageConfig.stage || !stageConfig.layer) return;

    const stage = stageConfig.stage;
    const layer = stageConfig.layer;

    // Xử lý drag events
    layer.on('dragstart', () => {
      if (stageConfig.borderDiv) {
        stageConfig.borderDiv.style.display = 'block';
      }
    });

    layer.on('dragend', (e) => {
      if (stageConfig.borderDiv) {
        const node = e.target;
        //stageConfig.borderDiv.style.display = 'none';

        if (node instanceof Konva.Image) {
          this.setMenuWithNodeAndStage(node, this.currentStage, 5);
        }
        else if (node instanceof Konva.Text) {
          this.setMenuWithNodeAndStage(node, this.currentStage, 6);
        }
      }

    });

    layer.on('dragmove', (e) => {
      const node = e.target;
      node.setAttr('lastPositionX', node.x());
      node.setAttr('lastPositionY', node.y());
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
      this.showBorderNode(node, stageConfig);

      this.setMenu();
    });

    stage.on('click tap', (e) => {

      if (e.target === stage) {



      } else {
        const clickedNode = e.target;
        this.showBorderNode(clickedNode, stageConfig);
        if (this.onSelectObject) {
          this.onSelectObject(true);
        }
        this.setMenu();
        if (e.target instanceof Konva.Text) {
          this.getRSOfNode();
        }
        else if (e.target instanceof Konva.Image) {
          this.getWHROfNode();
        }
      }
    });
  }

  public deleteSelectedNode(/*stageConfig: StageConfig*/) {
    const stageConfig = this.currentStage;
    if (stageConfig.selectedNode) {
      // if (stageConfig.selectedNode instanceof Konva.Image) {
      //   this.handleAddHistory({ node: stageConfig.selectedNode, action: "delete" })
      // }

      stageConfig.selectedNode.destroy();
      this.clearBorderNode(stageConfig);
      if (this.currentStage.borderDiv) {
        this.currentStage.borderDiv.style.display = "none";
      }

      stageConfig.layer!.batchDraw();

      this.clearBorderNode(this.currentStage);

      this.menuIndexSetter(0);
      this.createNodeHistory()
    }
  }

  public changeBackgroundColor(color: string) {
    this.backgroundColor = color;
    for (const item in this.data) {
      $('#' + this.data[item].code + 'Image').css('background-color', color);
    }
  }

  private handleImageUpload(file: File) {
    if (!this.currentStage.stage || !this.currentStage.layer) {
      console.error('Current stage or layer is not initialized');
      return;
    }
    this.clearBorderNode(this.currentStage);

    let image = null;
    let indexItem = -1.0;
    for (const item in this.data) {
      if (this.currentStage == this.stages[item]) {
        image = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
        indexItem = parseFloat(item);
      }
    }
    if (image) {
      this.updateStagePosition(this.currentStage, this.data[indexItem], image);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const originImage = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Đảm bảo stage có kích thước hợp lệ
        const stageWidth = this.currentStage.stage!.width();
        const stageHeight = this.currentStage.stage!.height();

        if (stageWidth <= 0 || stageHeight <= 0) {
          console.error('Invalid stage dimensions:', stageWidth, stageHeight);
          return;
        }

        const maxWidth = stageWidth * 0.8;
        const maxHeight = stageHeight * 0.8;

        let scale = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        }

        const x = stageWidth / 2;
        const y = stageHeight / 2;

        const imgNode = new Konva.Image({
          id: uuidv4(),
          image: img,
          x: x,
          y: y,
          width: img.width * scale,
          height: img.height * scale,
          draggable: true,

        });

        imgNode.offsetX(imgNode.width() / 2);
        imgNode.offsetY(imgNode.height() / 2);

        imgNode.setAttr('rotationOfLastWidth', imgNode.width());
        imgNode.setAttr('rotationOfLastHeight', imgNode.height());//lastPositionNode

        imgNode.setAttr('lastPositionX', imgNode.x());
        imgNode.setAttr('lastPositionY', imgNode.y());

        imgNode.dragBoundFunc(function (pos) {
          const stage = imgNode.getStage();
          //console.log('stage', stage);
          const stageWidth = stage!.width();
          const stageHeight = stage!.height();

          const tempNode = imgNode.clone();
          tempNode.position(pos);
          const bounds = tempNode.getClientRect();

          let newX = pos.x;
          let newY = pos.y;

          if (bounds.x < 0) {
            newX = pos.x - bounds.x;
          }
          if (bounds.x + bounds.width > stageWidth) {
            newX = pos.x - (bounds.x + bounds.width - stageWidth);
          }
          if (bounds.y < 0) {
            newY = pos.y - bounds.y;
          }
          if (bounds.y + bounds.height > stageHeight) {
            newY = pos.y - (bounds.y + bounds.height - stageHeight);
          }



          return { x: newX, y: newY };
        });



        this.currentStage.layer!.add(imgNode);
        this.currentStage.layer!.draw();
        this.originImageOfStage[imgNode.id()] = originImage;
        //this.showBorderNode(imgNode, this.currentStage);
        //this.menuIndexSetter(5);
        this.setMenuWithNodeAndStage(imgNode, this.currentStage, 5);
        this.getWHROfNode();

        this.createNodeHistory();

        imgNode.on('dragend', () => {
          this.createNodeHistory();
        });

        this.clearBorderNode(this.currentStage);

        //console.log('currentStage', this.currentStage.borderDiv?.style.x, this.currentStage.borderDiv?.style.y);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  public addText(text: string) {
    if (!this.currentStage.stage || !this.currentStage.layer) {
      console.error('Current stage or layer is not initialized');
      return;
    }
    this.updateStagePositions();
    this.clearBorderNode(this.currentStage);
    //const stageWidth = this.currentStage.stage!.width();
    //const stageHeight = this.currentStage.stage!.height();
    var fontStyle = "";
    //console.log(this.fontStyle, this.fontWeight);
    if (this.fontWeight === 'bold') {
      fontStyle += "700";
      if (this.fontStyle != 'normal') {
        fontStyle += " " + this.fontStyle;
      }
    }
    else {
      fontStyle = this.fontStyle;
    }

    //console.log(fontStyle);
    const textNode = new Konva.Text({
      id: uuidv4(),
      text: text,
      x: this.currentStage.stage.width() / 2,
      y: this.currentStage.stage.height() / 2,
      fontSize: 20,
      draggable: true,
      fill: this.textColor,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontStyle: fontStyle, //+ this.fontWeight === 'bold' ? " 700" : "",//this.fontStyle,,//'700 italic',
      align: 'center',
      padding: 5,
    });

    this.trimTextToFitStageWidth(textNode, this.currentStage.stage);

    // Căn giữa text node
    textNode.offsetX(textNode.width() / 2);
    textNode.offsetY(textNode.height() / 2);

    textNode.setAttr('rotationOfLastWidth', textNode.width());
    textNode.setAttr('rotationOfLastHeight', textNode.height());

    textNode.setAttr('lastPositionX', textNode.x());
    textNode.setAttr('lastPositionY', textNode.y());

    textNode.dragBoundFunc(function (pos) {
      const stage = textNode.getStage();
      const stageWidth = stage!.width();
      const stageHeight = stage!.height();

      const tempNode = textNode.clone();
      tempNode.position(pos);
      const bounds = tempNode.getClientRect();

      let newX = pos.x;
      let newY = pos.y;

      if (bounds.x < 0) {
        newX = pos.x - bounds.x;
      }
      if (bounds.x + bounds.width > stageWidth) {
        newX = pos.x - (bounds.x + bounds.width - stageWidth);
      }
      if (bounds.y < 0) {
        newY = pos.y - bounds.y;
      }
      if (bounds.y + bounds.height > stageHeight) {
        newY = pos.y - (bounds.y + bounds.height - stageHeight);
      }

      return { x: newX, y: newY };
    });

    this.currentStage.layer.add(textNode);
    this.currentStage.layer.draw();
    //this.showBorderNode(textNode, this.currentStage);
    //this.menuIndexSetter(6);
    this.setMenuWithNodeAndStage(textNode, this.currentStage, 6);
    this.getRSOfNode();
    //console.log('currentStage', textNode.fontSize(), textNode.width(), textNode.height());

    textNode.on('dragend', () => {
      this.createNodeHistory();
    });
    this.clearBorderNode(this.currentStage);

    this.createNodeHistory();

  }

  public changeTextColor(color: string) {
    this.textColor = color;

  }

  public changeTextColorInStage(color: string) {
    if (this.currentStage.selectedNode instanceof Konva.Node) {
      const node = this.currentStage.selectedNode as Konva.Text;
      node.fill(color);

      this.createNodeHistory();
    }
  }

  public changeFontFamilyInsStage(style: string) {
    if (this.currentStage.selectedNode instanceof Konva.Node) {
      //alert('ola');
      const node = this.currentStage.selectedNode as Konva.Text;
      node.fontFamily(style);
      //node.fontSize(20);

      this.createNodeHistory();
    }
  }

  public changeFontWeightInsStage(bold: boolean) {
    if (this.currentStage.selectedNode instanceof Konva.Node) {
      const node = this.currentStage.selectedNode as Konva.Text;
      if (bold) {
        if (node.fontStyle().includes("italic")) {
          node.fontStyle("bold italic");
        }
        else {
          node.fontStyle("bold");
        }
      }
      else {
        if (node.fontStyle().includes("italic")) {
          node.fontStyle("italic")
        }
        else {
          node.fontStyle("normal");
        }
      }

      //node.fontSize(20);
      this.createNodeHistory();
    }
  }

  public changeFontStyleInsStage(italic: boolean) {
    if (this.currentStage.selectedNode instanceof Konva.Node) {
      const node = this.currentStage.selectedNode as Konva.Text;

      if (italic) {
        if (node.fontStyle().includes("bold")) {
          node.fontStyle("bold italic");
        }
        else {
          node.fontStyle("italic");
        }
      }
      else {
        if (node.fontStyle().includes("bold")) {
          node.fontStyle("bold")
        }
        else {
          node.fontStyle("normal");
        }
      }

      this.createNodeHistory();
    }
  }


  public changeFontStyle(style: string) {
    switch (style) {
      case 'italic':
        this.fontStyle = 'italic';
        break;
      case 'normal':
        this.fontStyle = 'normal';
        break;
    }

    if (this.currentStage.selectedNode instanceof Konva.Text) {
      this.currentStage.selectedNode.fontStyle(this.fontStyle);
      this.currentStage.selectedNode.attrs.fontWeight = this.fontWeight;
      this.currentStage.layer?.draw();
    }
  }

  public changeFontFamily(fontFamily: string) {
    this.fontFamily = fontFamily;
  }

  public changeFontWeight(fontWeight: string) {
    this.fontWeight = fontWeight;
    //console.log(this.fontWeight)
  }

  public imageElementToFile(image: HTMLImageElement, fileName = 'image.png'): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      ctx.drawImage(image, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], fileName, { type: blob.type });
          resolve(file);
        } else {
          reject(new Error('Failed to convert image to Blob'));
        }
      }, 'image/png');
    });
  }


  public base64ToFile(base64: string, fileName: string): File {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';

    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new File([u8arr], fileName, { type: mime });
  }


  public async exportRelativeDesignToJson(): Promise<object> {
    //console.log('exportRelativeDesignToJson');
    const getStageInfo = async (stageConfig: StageConfig) => {
      const design: any[] = [];
      let priorityIndex = 0;
      if (stageConfig.layer) {
        for (const node of stageConfig.layer.children) {
          priorityIndex++;
          if (node instanceof Konva.Image) {
            const imageElement = node.image() as HTMLImageElement;

            design.push({
              id: node.id(),
              type: 'image',
              src: imageElement.src,
              x: node.x(),
              y: node.y(),
              offset_x: node.offsetX(),
              offset_y: node.offsetY(),
              actual_x: node.x() - node.offsetX(),
              actual_y: node.y() - node.offsetY(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              width: node.width(),
              height: node.height(),
              priority_index: priorityIndex,
              cloud_url: imageElement.src, // Optional: add uploaded URL
            });
          } else if (node instanceof Konva.Text) {
            design.push({
              id: node.id(),
              type: 'text',
              text: node.text(),
              x: node.x(),
              y: node.y(),
              offset_x: node.offsetX(),
              offset_y: node.offsetY(),
              actual_x: node.x() - node.offsetX(),
              actual_y: node.y() - node.offsetY(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              fontFamily: node.fontFamily(),
              fontSize: node.fontSize(),
              fontStyle: node.fontStyle(),
              fontWeight: node.attrs.fontWeight || 'normal',
              fill: node.fill(),
              align: node.align(),
              priority_index: priorityIndex
            });
          }
        }
      }
      return design;
    };

    const designs: any[] = [];
    for (const item in this.stages) {
      try {
        const designOfStage = {
          code: this.data[item].code,
          designs: [] as any[],
        };
        const imageDom = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
        imageDom.crossOrigin = 'anonymous';
        designOfStage.designs = await getStageInfo(this.stages[item]);
        designs.push(designOfStage);
      } catch (error) {
        console.log(error);
      }
    }

    return designs;
  }


  public async exportDesignToJson(): Promise<object> {
    const getStageInfo = async (stageConfig: StageConfig) => {
      const design: any[] = [];
      let priorityIndex = 0;
      if (stageConfig.layer) {
        for (const node of stageConfig.layer.children) {
          priorityIndex++;
          if (node instanceof Konva.Image) {
            const imageElement = node.image() as HTMLImageElement;
            //console.log('debug nua ne hehe', imageElement.src); 
            //imageElement.crossOrigin = 'anonymous';


            try {
              let file_url = "";
              if (/^data:image\/[a-zA-Z]+;base64,/.test(imageElement.src)) {

                const file = this.base64ToFile(imageElement.src, 'image.png');

                try {
                  const formData = new FormData();
                  formData.append('file', file);


                  const response = await uploadImageRaw(formData);
                  file_url = (response as { file?: { file_url?: string } }).file?.file_url ?? "";
                }
                catch (error) {
                  console.log(error);
                }
              }
              else {
                file_url = imageElement.src;
              }
              //console.log('cloudinary_url', cloudinary_url);
              design.push({
                id: node.id(),
                type: 'image',
                src: file_url,
                x: node.x(),
                y: node.y(),
                offset_x: node.offsetX(),
                offset_y: node.offsetY(),
                actual_x: node.x() - node.offsetX(),
                actual_y: node.y() - node.offsetY(),
                rotation: node.rotation(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                width: node.width(),
                height: node.height(),
                priority_index: priorityIndex,
                cloud_url: file_url, // Optional: add uploaded URL
              });
            } catch (error) {
              console.log("Upload failed:", error);
            }
          } else if (node instanceof Konva.Text) {
            design.push({
              id: node.id(),
              type: 'text',
              text: node.text(),
              x: node.x(),
              y: node.y(),
              offset_x: node.offsetX(),
              offset_y: node.offsetY(),
              actual_x: node.x() - node.offsetX(),
              actual_y: node.y() - node.offsetY(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              fontFamily: node.fontFamily(),
              fontSize: node.fontSize(),
              fontStyle: node.fontStyle(),
              fontWeight: node.attrs.fontWeight || 'normal',
              fill: node.fill(),
              align: node.align(),
              priority_index: priorityIndex
            });
          }
        }
      }
      return design;
    };

    const designs: any[] = [];
    for (const item in this.stages) {
      try {
        const designOfStage = {
          final_image_url: "",
          designs: [] as any[],
        };
        const imageDom = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
        imageDom.crossOrigin = 'anonymous';


        if (this.stages[item] == this.currentStage) {
          //if (this.currentStage.stage?.getChildren() > 0) {
          const stageBase64 = await this.exportStage(this.stages[item], imageDom);
          const file = this.base64ToFile(stageBase64, 'image.png');

          const formData = new FormData();
          formData.append('file', file);
          const response = await uploadImageRaw(formData);
          designOfStage.final_image_url = (response as { file?: { file_url?: string } }).file?.file_url ?? "";
          // }
          // else {
          //   designOfStage.final_image_url = this.data[item].image;
          // }
        }
        else {
          if (this.faceImage[this.data[item].code] != "" && this.faceImage[this.data[item].code] != null) {
            const stageBase64 = this.faceImage[this.data[item].code];
            const file = this.base64ToFile(stageBase64, 'image.png');

            const formData = new FormData();
            formData.append('file', file);
            const response = await uploadImageRaw(formData);
            designOfStage.final_image_url = (response as { file?: { file_url?: string } }).file?.file_url ?? "";
          }
          else {
            designOfStage.final_image_url = this.data[item].image;
          }

        }

        designOfStage.designs = await getStageInfo(this.stages[item]);
        designs.push(designOfStage);
      } catch (error) {
        console.log(error);
      }
    }



    const designInfo: DesignInfo = {
      productId: this.productId,
      colorValue: this.colorValue,
      variantId: this.variantId,
      colorData: Object.fromEntries(this.colorData),
      sizeIdDefault: this.sizeIdDefault,
      variantSizeColorData: this.variantSizeColorData != null ? Object.fromEntries(this.variantSizeColorData) : null,
      faces: this.data,
      backgroundColor: this.backgroundColor,
      designs: designs,
    };

    return designInfo;
  }
  public exportStage = async (stageConfig: StageConfig, image: HTMLImageElement): Promise<string> => {
    if (!stageConfig.stage || !stageConfig.layer) return '';
    const tempCanvas = document.createElement('canvas');
    //tempCanvas.cors = "anonymous";
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';

    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.globalCompositeOperation = 'source-over';

    const scaleX = image.naturalWidth / image.offsetWidth;
    const scaleY = image.naturalHeight / image.offsetHeight;

    const stageWidth = stageConfig.stage.width();
    const stageHeight = stageConfig.stage.height();
    const stageRect = stageConfig.stage.container().getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    const offsetX = (stageRect.left - imageRect.left) * scaleX;
    const offsetY = (stageRect.top - imageRect.top) * scaleY;

    const stageCanvas = document.createElement('canvas');
    // stageCanvas.width = 1000; 
    // stageCanvas.height = 1000;
    stageCanvas.width = stageWidth;
    stageCanvas.height = stageHeight;
    const stageCtx = stageCanvas.getContext('2d');
    // if (stageCtx) {
    //   stageCtx.fillStyle = 'green';
    //   stageCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    // }
    if (!stageCtx) return '';

    // const scale = Math.min(1000 / stageWidth, 1000 / stageHeight);
    const scale = 1;
    stageCtx.scale(scale, scale);

    const nodes = Array.from(stageConfig.layer.children);
    for (const node of nodes) {
      if (node instanceof Konva.Transformer) continue;

      if (node instanceof Konva.Text) {
        stageCtx.save();

        // Thiết lập font như Konva
        stageCtx.font = `${node.fontStyle()} ${node.attrs.fontWeight || 'normal'} ${node.fontSize()}px ${node.fontFamily()}`;
        stageCtx.fillStyle = node.fill() as string;
        stageCtx.textAlign = node.align() as CanvasTextAlign;
        stageCtx.textBaseline = 'middle'; // Cho căn theo chiều dọc giống Konva (giữa baseline)

        const x = node.x();
        const y = node.y();
        //const offsetX = node.offsetX();
        //const offsetY = node.offsetY();

        stageCtx.translate(x, y);
        stageCtx.rotate(node.rotation() * Math.PI / 180);
        stageCtx.scale(node.scaleX(), node.scaleY());

        // Vẽ chữ tại tâm
        stageCtx.fillText(node.text(), 0, 0);

        stageCtx.restore();

      } else if (node instanceof Konva.Image) {
        const nodeImage = node.image();
        if (nodeImage) {
          const x = node.x();
          const y = node.y();
          const rotation = node.rotation();
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const width = node.width();
          const height = node.height();
          const offsetX = node.offsetX();
          const offsetY = node.offsetY();

          stageCtx.save();

          // Dịch gốc tọa độ về vị trí của node
          stageCtx.translate(x, y);

          // Xoay theo góc node (đổi sang radian)
          stageCtx.rotate((rotation * Math.PI) / 180);

          // Scale node
          stageCtx.scale(scaleX, scaleY);

          // Vẽ ảnh, trừ offset để căn theo tâm
          stageCtx.drawImage(
            nodeImage,
            -offsetX,
            -offsetY,
            width,
            height
          );
          stageCtx.restore();
        }
      }
    }

    if (nodes.length > 0) {
      const finalWidth = stageWidth * scale;
      const finalHeight = stageHeight * scale;

      ctx.drawImage(
        stageCanvas,
        0, 0, finalWidth, finalHeight,
        offsetX, offsetY, stageWidth * scaleX, stageHeight * scaleY
      );
    }

    return tempCanvas.toDataURL('image/png');
  };

  public async importDesignFromChangeProduct(/*jsonContent: string*//*designs: object[][]*/ jsonContent: any) {
    const designs: object[][] = [];
    const codes = new Map<number, string>();
    let index = -1;
    for (const design of jsonContent as []) {
      index++;
      designs[index] = (design as any).designs;
      codes.set(index, (design as any).code);
    }
    try {
      // const designInfo: DesignInfo = JSON.parse(jsonContent) as DesignInfo;
      // console.log(designInfo);

      //this.changeBackgroundColor(designInfo.backgroundColor);


      const importToStage = async (stageConfig: StageConfig, data: object[]) => {
        if (!stageConfig.stage || !stageConfig.layer) {
          console.error('Stage or layer not initialized');
          return;
        }

        const nodes = stageConfig.layer.children.slice();
        nodes.forEach(node => {
          if (!(node instanceof Konva.Transformer)) {
            node.destroy();
          }
        });
        const sortedDesign = data.sort((a, b) => {
          return (a as any).priority_index - (b as any).priority_index;
        });
        for (const obj of sortedDesign) {
          if ((obj as any).type == 'image') {
            const img = new Image();
            var originImage = "";
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              originImage = (obj as any).src;
              img.src = (obj as any).src;
            });

            const imgNode = new Konva.Image({
              id: (obj as any).id,
              image: img,
              x: (obj as any).x,
              y: (obj as any).y,
              width: (obj as any).width,
              height: (obj as any).height,
              rotation: (obj as any).rotation,
              scaleX: (obj as any).scaleX,
              scaleY: (obj as any).scaleY,
              offsetX: (obj as any).offset_x,
              offsetY: (obj as any).offset_y,
              draggable: true,
            });

            imgNode.setAttr('lastPositionX', imgNode.x());
            imgNode.setAttr('lastPositionY', imgNode.y());
            imgNode.setAttr('rotationOfLastWidth', imgNode.width());
            imgNode.setAttr('rotationOfLastHeight', imgNode.height());
            //const stage = stageConfig.stage as Konva.Stage;
            imgNode.dragBoundFunc(function (pos) {
              const stage = imgNode.getStage();
              const stageWidth = stage!.width();
              const stageHeight = stage!.height();

              const tempNode = imgNode.clone();
              tempNode.position(pos);
              const bounds = tempNode.getClientRect();

              let newX = pos.x;
              let newY = pos.y;

              if (bounds.x < 0) {
                newX = pos.x - bounds.x;
              }
              if (bounds.x + bounds.width > stageWidth) {
                newX = pos.x - (bounds.x + bounds.width - stageWidth);
              }
              if (bounds.y < 0) {
                newY = pos.y - bounds.y;
              }
              if (bounds.y + bounds.height > stageHeight) {
                newY = pos.y - (bounds.y + bounds.height - stageHeight);
              }

              return { x: newX, y: newY };
            });


            imgNode.on('dragend', () => {
              this.createNodeHistory();
            });

            stageConfig.layer.add(imgNode);
            this.originImageOfStage[imgNode.id()] = originImage;
          } else if ((obj as any).type == 'text') {
            const textNode = new Konva.Text({
              id: (obj as any).id,
              text: (obj as any).text,
              x: (obj as any).x,
              y: (obj as any).y,
              rotation: (obj as any).rotation,
              scaleX: (obj as any).scaleX,
              scaleY: (obj as any).scaleY,
              fontFamily: (obj as any).fontFamily,
              fontSize: (obj as any).fontSize,
              fontStyle: (obj as any).fontStyle,
              fontWeight: (obj as any).fontWeight,
              fill: (obj as any).fill,
              align: (obj as any).align,
              offsetX: (obj as any).offset_x,
              offsetY: (obj as any).offset_y,
              draggable: true,
            });

            textNode.setAttr('lastPositionX', textNode.x());
            textNode.setAttr('lastPositionY', textNode.y());
            textNode.setAttr('rotationOfLastWidth', textNode.width());
            textNode.setAttr('rotationOfLastHeight', textNode.height());

            //const stageWidth = stageConfig.stage.width();
            //const stageHeight = stageConfig.stage.height();

            textNode.dragBoundFunc(function (pos) {
              const stage = textNode.getStage();
              const stageWidth = stage!.width();
              const stageHeight = stage!.height();

              const tempNode = textNode.clone();
              tempNode.position(pos);
              const bounds = tempNode.getClientRect();

              let newX = pos.x;
              let newY = pos.y;

              if (bounds.x < 0) {
                newX = pos.x - bounds.x;
              }
              if (bounds.x + bounds.width > stageWidth) {
                newX = pos.x - (bounds.x + bounds.width - stageWidth);
              }
              if (bounds.y < 0) {
                newY = pos.y - bounds.y;
              }
              if (bounds.y + bounds.height > stageHeight) {
                newY = pos.y - (bounds.y + bounds.height - stageHeight);
              }


              return { x: newX, y: newY };
            });

            textNode.on('dragend', () => {
              this.createNodeHistory();
            });

            stageConfig.layer.add(textNode);
          }
        }


        stageConfig.layer.draw();
      };

      console.log('importDesignFromJson', designs, codes);

      for (const item in this.data) {
        //console.log('bbbbbbbbbbbbbbbbbbbbbb', this.data[item].code, codes.get(Number(item)));
        for (const [, value] of codes) {
          //console.log('aaaaaaaaaaaaaaaaaaaaa', this.data[item].code == codes.get(Number(key)));
          if (this.data[item].code == value) {
            //console.log('importDesignFromJson222222222222', item);
            const imageDom = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
            if (imageDom) {
              this.updateStagePosition(this.stages[item], this.data[item], imageDom);
            }
            //console.log('importDesignFromJson', this.stages[item]);
            await importToStage(this.stages[item], designs[item]);
            break;
          }
        }
      }

      for (const item in this.data) {
        if (this.stages[item] == this.currentStage) {
          this.switchToStage(this.data[item].code)
        }
      }

    } catch (error) {
      console.error('Error importing design:', error);
      throw new Error('Invalid design file format');
    }
  }

  public async importDesignFromJson(/*jsonContent: string*/designs: object[][]) {

    try {
      // const designInfo: DesignInfo = JSON.parse(jsonContent) as DesignInfo;
      // console.log(designInfo);

      //this.changeBackgroundColor(designInfo.backgroundColor);


      const importToStage = async (stageConfig: StageConfig, data: object[]) => {
        if (!stageConfig.stage || !stageConfig.layer) {
          console.error('Stage or layer not initialized');
          return;
        }

        const nodes = stageConfig.layer.children.slice();
        nodes.forEach(node => {
          if (!(node instanceof Konva.Transformer)) {
            node.destroy();
          }
        });
        const sortedDesign = data.sort((a, b) => {
          return (a as any).priority_index - (b as any).priority_index;
        });
        for (const obj of sortedDesign) {
          if ((obj as any).type == 'image') {
            const img = new Image();
            var originImage = "";
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              originImage = (obj as any).src;
              img.src = (obj as any).src;
            });

            const imgNode = new Konva.Image({
              id: (obj as any).id,
              image: img,
              x: (obj as any).x,
              y: (obj as any).y,
              width: (obj as any).width,
              height: (obj as any).height,
              rotation: (obj as any).rotation,
              scaleX: (obj as any).scaleX,
              scaleY: (obj as any).scaleY,
              offsetX: (obj as any).offset_x,
              offsetY: (obj as any).offset_y,
              draggable: true,
            });

            imgNode.setAttr('lastPositionX', imgNode.x());
            imgNode.setAttr('lastPositionY', imgNode.y());
            imgNode.setAttr('rotationOfLastWidth', imgNode.width());
            imgNode.setAttr('rotationOfLastHeight', imgNode.height());
            //const stage = stageConfig.stage as Konva.Stage;
            imgNode.dragBoundFunc(function (pos) {
              const stage = imgNode.getStage();
              const stageWidth = stage!.width();
              const stageHeight = stage!.height();

              const tempNode = imgNode.clone();
              tempNode.position(pos);
              const bounds = tempNode.getClientRect();

              let newX = pos.x;
              let newY = pos.y;

              if (bounds.x < 0) {
                newX = pos.x - bounds.x;
              }
              if (bounds.x + bounds.width > stageWidth) {
                newX = pos.x - (bounds.x + bounds.width - stageWidth);
              }
              if (bounds.y < 0) {
                newY = pos.y - bounds.y;
              }
              if (bounds.y + bounds.height > stageHeight) {
                newY = pos.y - (bounds.y + bounds.height - stageHeight);
              }

              return { x: newX, y: newY };
            });

            imgNode.on('dragend', () => {
              this.createNodeHistory();
            });


            stageConfig.layer.add(imgNode);
            this.originImageOfStage[imgNode.id()] = originImage;
          } else if ((obj as any).type == 'text') {
            const textNode = new Konva.Text({
              id: (obj as any).id,
              text: (obj as any).text,
              x: (obj as any).x,
              y: (obj as any).y,
              rotation: (obj as any).rotation,
              scaleX: (obj as any).scaleX,
              scaleY: (obj as any).scaleY,
              fontFamily: (obj as any).fontFamily,
              fontSize: (obj as any).fontSize,
              fontStyle: (obj as any).fontStyle,
              fontWeight: (obj as any).fontWeight,
              fill: (obj as any).fill,
              align: (obj as any).align,
              offsetX: (obj as any).offset_x,
              offsetY: (obj as any).offset_y,
              draggable: true,
            });

            textNode.setAttr('lastPositionX', textNode.x());
            textNode.setAttr('lastPositionY', textNode.y());
            textNode.setAttr('rotationOfLastWidth', textNode.width());
            textNode.setAttr('rotationOfLastHeight', textNode.height());

            //const stageWidth = stageConfig.stage.width();
            //const stageHeight = stageConfig.stage.height();

            textNode.dragBoundFunc(function (pos) {
              const stage = textNode.getStage();
              const stageWidth = stage!.width();
              const stageHeight = stage!.height();

              const tempNode = textNode.clone();
              tempNode.position(pos);
              const bounds = tempNode.getClientRect();

              let newX = pos.x;
              let newY = pos.y;

              if (bounds.x < 0) {
                newX = pos.x - bounds.x;
              }
              if (bounds.x + bounds.width > stageWidth) {
                newX = pos.x - (bounds.x + bounds.width - stageWidth);
              }
              if (bounds.y < 0) {
                newY = pos.y - bounds.y;
              }
              if (bounds.y + bounds.height > stageHeight) {
                newY = pos.y - (bounds.y + bounds.height - stageHeight);
              }

              return { x: newX, y: newY };
            });

            textNode.on('dragend', () => {
              this.createNodeHistory();
            });

            stageConfig.layer.add(textNode);
          }
        }


        stageConfig.layer.draw();
      };

      for (const item in this.data) {
        //console.log('importDesignFromJson', item);
        const imageDom = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
        if (imageDom) {
          this.updateStagePosition(this.stages[item], this.data[item], imageDom);
        }
        console.log('importDesignFromJson', this.stages[item]);
        await importToStage(this.stages[item], designs[item]);
      }

      for (const item in this.data) {
        if (this.stages[item] == this.currentStage) {
          this.switchToStage(this.data[item].code)
        }
      }



    } catch (error) {
      console.error('Error importing design:', error);
      throw new Error('Invalid design file format');
    }
  }

  // public copySelectedNode() {
  //   if (!this.currentStage.selectedNode) return;

  //   this.clipboard = this.currentStage.selectedNode.clone();

  // }

  public pasteNode() {
    if (!this.clipboard || !this.currentStage.layer) return;

    const clone = this.clipboard.clone();

    clone.x(clone.x() + 20);
    clone.y(clone.y() + 20);

    clone.draggable(true);

    this.currentStage.layer.add(clone);
    this.currentStage.layer.draw();


  }

  public setWidthCenterPosition() {
    if (this.currentStage.selectedNode != null) {
      const node = this.currentStage.selectedNode;
      if (this.currentStage.stage != null) {
        node.x(this.currentStage.stage.width() / 2);
      }
      this.showBorderNode(this.currentStage.selectedNode, this.currentStage);
    }
  }

  public setHeightCenterPosition() {
    if (this.currentStage.selectedNode != null) {
      const node = this.currentStage.selectedNode;
      if (this.currentStage.stage != null) {
        node.y(this.currentStage.stage.height() / 2);
      }
      this.showBorderNode(this.currentStage.selectedNode, this.currentStage);

    }
  }

  public bringToFrontNode() {
    if (this.currentStage.selectedNode != null && this.currentStage.layer != null) {

      const nodeChildrend = this.currentStage.layer.getChildren();
      if (nodeChildrend.length <= 1) {
        return;
      }
      const node = this.currentStage.selectedNode;
      let index = -1;
      for (const item in nodeChildrend) {
        if (nodeChildrend[item] == node) {
          index = Number(item);
          break;
        }
      }
      if (index == nodeChildrend.length - 1) {
        return;
      }
      if (index > -1 && index < nodeChildrend.length) {
        const temp = nodeChildrend[index + 1];
        nodeChildrend[index + 1] = nodeChildrend[index];
        nodeChildrend[index] = temp;

        this.currentStage.layer.removeChildren();
        nodeChildrend.forEach(newNode => this.currentStage.layer?.add(newNode));

      }
    }
  }

  public sendToBackNode() {
    if (this.currentStage.selectedNode != null && this.currentStage.layer != null) {
      const nodeChildrend = this.currentStage.layer.getChildren();
      if (nodeChildrend.length <= 1) {
        return;
      }
      const node = this.currentStage.selectedNode;
      let index = -1;
      for (const item in nodeChildrend) {
        if (nodeChildrend[item] == node) {
          index = Number(item);
          break;
        }
      }
      if (index == 0) {
        return;
      }
      if (index > -1 && index < nodeChildrend.length) {
        const temp = nodeChildrend[index - 1];
        nodeChildrend[index - 1] = nodeChildrend[index];
        nodeChildrend[index] = temp;

        this.currentStage.layer.removeChildren();
        nodeChildrend.forEach(newNode => this.currentStage.layer?.add(newNode));

      }
    }
  }

  public setWHOfNode(width: number | null, height: number | null) {
    if (this.currentStage.selectedNode != null) {

      const node = this.currentStage.selectedNode;

      const noRotated = Math.abs(node.rotation()) <= 1 || Math.abs(node.rotation()) >= 359;

      if (noRotated) {
        node.offsetX(0);
        node.offsetY(0);
        node.x(node.x() - node.width() / 2);
        node.y(node.y() - node.height() / 2);
      }
      const clone = node.clone();
      if (width != null) {
        clone.width(width);
      }
      if (height != null) {
        clone.height(height);
      }
      const cloneBounds = clone.getClientRect();
      if (node instanceof Konva.Image) {
        if (cloneBounds.x >= this.currentStage.stage!.x() && cloneBounds.x + cloneBounds.width <= this.currentStage.stage!.width() && cloneBounds.y >= this.currentStage.stage!.y() && cloneBounds.y + cloneBounds.height <= this.currentStage.stage!.height()) {
          node.width(clone.width());
          node.height(clone.height());
        }
      }
      if (noRotated) {
        node.x(node.x() + node.width() / 2);
        node.y(node.y() + node.height() / 2);
      }

      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);

      node.setAttr('rotationOfLastWidth', node.width());
      node.setAttr('rotationOfLastHeight', node.height());
      //this.setNodeBoder(node, this.currentStage);

      this.setMenuWithNodeAndStage(node, this.currentStage, 5);
      this.currentStage.layer!.draw();

      this.createNodeHistory();
    }
  }

  public setRSOfNode(instance: number | null) {

    if (this.currentStage.selectedNode != null) {
      var node = this.currentStage.selectedNode;
      node.offsetX(0);
      node.offsetY(0);
      node.x(node.x() - node.width() / 2);
      node.y(node.y() - node.height() / 2);
      const clone = node.clone();
      if (instance != null) {
        clone.fontSize(instance);
      }
      const cloneBounds = clone.getClientRect();
      if (node instanceof Konva.Text) {
        if (cloneBounds.x >= this.currentStage.stage!.x() && cloneBounds.x + cloneBounds.width <= this.currentStage.stage!.width() && cloneBounds.y >= this.currentStage.stage!.y() && cloneBounds.y + cloneBounds.height <= this.currentStage.stage!.height() && clone.fontSize() > 10) {
          node.fontSize(instance);
        }
      }



      node.x(node.x() + node.width() / 2);
      node.y(node.y() + node.height() / 2);
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
      node.setAttr('rotationOfLastWidth', node.width());
      node.setAttr('rotationOfLastHeight', node.height());




      this.setMenuWithNodeAndStage(node, this.currentStage, 6);

      this.currentStage.layer!.draw();
      //this.resetRSOfNode();
      this.getRSOfNode();


      this.createNodeHistory();
    }
  }

  public setROfNodeheight(newRotation: number) {
    if (this.currentStage.selectedNode != null) {
      const node = this.currentStage.selectedNode;
      const stage = this.currentStage.stage as Konva.Stage;
      node.rotation(newRotation);
      if (node instanceof Konva.Text) {
        this.setMenuWithNodeAndStage(node, this.currentStage, 6);
        return;
      }

      const bounds = node.getClientRect();
      const defaultWidth = parseFloat(node.getAttr('rotationOfLastWidth'));
      const defaultHeight = parseFloat(node.getAttr('rotationOfLastHeight'));
      const tempNode = node.clone();
      tempNode.width(defaultWidth);
      tempNode.height(defaultHeight);
      const tempBounds = tempNode.getClientRect();
      if (tempBounds.x >= stage.x() && tempBounds.x + tempBounds.width <= stage.width() && tempBounds.y >= stage.y() && tempBounds.y + tempBounds.height <= stage.height()) {
        node.width(defaultWidth);
        node.height(defaultHeight);
      }
      else {
        if (bounds.x < 0) {
          const scale = node.x() / (node.x() - bounds.x)
          node.width(node.width() * scale);
          node.height(node.height() * scale);
        }

        if (bounds.x + bounds.width > stage.width()) {
          // Tính khoảng cách dư thừa giữa phần bên phải của node và stage
          const excessWidth = (bounds.x + bounds.width) - stage.width();

          // Tính tỷ lệ thu nhỏ để node nằm vừa trong stage
          const scale = (bounds.width - excessWidth) / bounds.width;

          // Áp dụng scale để thay đổi kích thước node
          node.width(node.width() * scale);
          node.height(node.height() * scale);
        }

        if (bounds.y < 0) {
          // Tính tỷ lệ thu nhỏ cho chiều dọc
          const scale = node.y() / (node.y() - bounds.y);

          // Áp dụng scale cho chiều rộng và chiều cao của node
          node.width(node.width() * scale);
          node.height(node.height() * scale);
        }

        // Kiểm tra nếu phần dưới của node vượt quá chiều cao của stage
        if (bounds.y + bounds.height > stage.height()) {
          // Tính khoảng cách dư thừa giữa phần dưới của node và stage
          const excessHeight = (bounds.y + bounds.height) - stage.height();

          // Tính tỷ lệ thu nhỏ cho chiều dọc
          const scale = (bounds.height - excessHeight) / bounds.height;

          // Áp dụng scale cho chiều rộng và chiều cao của node
          node.width(node.width() * scale);
          node.height(node.height() * scale);
        }
      }


      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
      if (node instanceof Konva.Image) {
        this.setMenuWithNodeAndStage(node, this.currentStage, 5);
      }
      //this.setNodeBoder(node, this.currentStage);
      this.currentStage.layer!.draw();

      //rotateIcon.style.transform = `rotate(${newRotation}deg)`;

      this.createNodeHistory();
    }
  }


  /*public updateHisoryStatus2(satus: NodeHistory2) {
    if (satus.StageId) {
      this.switchToStage(satus.StageId);
    }

    if (satus.ColorId != this.colorValue) {

    }


    if (this.currentStage.layer) {
      this.currentStage.layer.destroyChildren();
      this.currentStage.layer.draw();
    }
    if (satus.Nodes && satus.Nodes.length > 0) {
      for (const node of satus.Nodes) {
        if (node.Type == "text") {
          if (!this.currentStage.stage || !this.currentStage.layer) {
            console.error('Current stage or layer is not initialized');
            return;
          }
          this.updateStagePositions();
          this.clearBorderNode(this.currentStage);

          const textNode = new Konva.Text({
            id: node.Id || "",
            text: node.Text || "",
            x: node.PositionX || 0,
            y: node.PositionY || 0,
            fontSize: node.FontSize || 0,
            draggable: true,
            fill: node.Fill || "",
            fontFamily: node.FontFamily || "",
            fontStyle: node.FontStyle || "",
            align: 'center',
            padding: 5,
            rotation: node.RotationAngle || 0
          });

          this.trimTextToFitStageWidth(textNode, this.currentStage.stage);

          // Căn giữa text node
          textNode.offsetX(textNode.width() / 2);
          textNode.offsetY(textNode.height() / 2);

          textNode.setAttr('rotationOfLastWidth', textNode.width());
          textNode.setAttr('rotationOfLastHeight', textNode.height());

          textNode.setAttr('lastPositionX', textNode.x());
          textNode.setAttr('lastPositionY', textNode.y());

          textNode.dragBoundFunc(function (pos) {
            const stage = textNode.getStage();
            const stageWidth = stage!.width();
            const stageHeight = stage!.height();

            const tempNode = textNode.clone();
            tempNode.position(pos);
            const bounds = tempNode.getClientRect();

            let newX = pos.x;
            let newY = pos.y;

            if (bounds.x < 0) {
              newX = pos.x - bounds.x;
            }
            if (bounds.x + bounds.width > stageWidth) {
              newX = pos.x - (bounds.x + bounds.width - stageWidth);
            }
            if (bounds.y < 0) {
              newY = pos.y - bounds.y;
            }
            if (bounds.y + bounds.height > stageHeight) {
              newY = pos.y - (bounds.y + bounds.height - stageHeight);
            }

            return { x: newX, y: newY };
          });

          this.currentStage.layer.add(textNode);
          this.currentStage.layer.draw();
          //this.showBorderNode(textNode, this.currentStage);
          //this.menuIndexSetter(6);
          this.setMenuWithNodeAndStage(textNode, this.currentStage, 6);
          this.getRSOfNode();
          //console.log('currentStage', textNode.fontSize(), textNode.width(), textNode.height());

          textNode.on('dragend', () => {
            this.createNodeHistory();
          });
        }
        else if (node.Type == "image") {
          //console.log('nodeeeeeeeeeeeeeeeeeee', node);
          if (!this.currentStage.stage || !this.currentStage.layer) {
            console.error('Current stage or layer is not initialized');
            return;
          }
          this.updateStagePositions();
          this.clearBorderNode(this.currentStage);
          const image = new Image();
          if (node.SrcImg) {
            image.src = node.SrcImg;
          }
          const imgNode = new Konva.Image({
            id: node.Id || "",
            image: image,
            x: node.PositionX || 0,
            y: node.PositionY || 0,
            width: node.WidthSize || 0,
            height: node.HeightSize || 0,
            draggable: true,
            rotation: node.RotationAngle || 0
          });

          imgNode.offsetX(imgNode.width() / 2);
          imgNode.offsetY(imgNode.height() / 2);

          imgNode.setAttr('rotationOfLastWidth', imgNode.width());
          imgNode.setAttr('rotationOfLastHeight', imgNode.height());//lastPositionNode

          imgNode.setAttr('lastPositionX', imgNode.x());
          imgNode.setAttr('lastPositionY', imgNode.y());

          imgNode.dragBoundFunc(function (pos) {
            const stage = imgNode.getStage();
            //console.log('stage', stage);
            const stageWidth = stage!.width();
            const stageHeight = stage!.height();

            const tempNode = imgNode.clone();
            tempNode.position(pos);
            const bounds = tempNode.getClientRect();

            let newX = pos.x;
            let newY = pos.y;

            if (bounds.x < 0) {
              newX = pos.x - bounds.x;
            }
            if (bounds.x + bounds.width > stageWidth) {
              newX = pos.x - (bounds.x + bounds.width - stageWidth);
            }
            if (bounds.y < 0) {
              newY = pos.y - bounds.y;
            }
            if (bounds.y + bounds.height > stageHeight) {
              newY = pos.y - (bounds.y + bounds.height - stageHeight);
            }



            return { x: newX, y: newY };
          });



          this.currentStage.layer!.add(imgNode);
          this.currentStage.layer!.draw();

          //this.showBorderNode(imgNode, this.currentStage);
          //this.menuIndexSetter(5);
          this.setMenuWithNodeAndStage(imgNode, this.currentStage, 5);
          this.getWHROfNode();

          imgNode.on('dragend', () => {
            this.createNodeHistory();
          });

        }
      }
    }
  }*/

  private getListNodeInStage() {
    if (this.currentStage == null || this.currentStage.layer == null)
      return;
    const Nodes: NodeConfig2[] = [];

    this.currentStage.layer.getChildren().forEach((child, index) => {


      if (child instanceof Konva.Text) {
        const node = child as Konva.Text;
        Nodes.push({
          Id: node.id(),
          Type: "text",
          Fill: node.fill() as string,
          PositionX: node.x(),
          PositionY: node.y(),
          RotationAngle: node.rotation(),
          indexLayer: index,
          FontFamily: node.fontFamily(),
          FontSize: node.fontSize(),
          FontStyle: node.fontStyle(),
          FontWeight: null,
          Text: node.text(),
          HeightSize: null,
          WidthSize: null,
          SrcImg: null,
        });
      }
      else if (child instanceof Konva.Image) {
        const node = child as Konva.Image;
        const imageElement = node.image() as HTMLImageElement;
        Nodes.push({
          Id: node.id(),
          Type: "image",
          Fill: null,
          PositionX: node.x(),
          PositionY: node.y(),
          RotationAngle: node.rotation(),
          indexLayer: index,
          FontFamily: null,
          FontSize: null,
          FontStyle: null,
          FontWeight: null,
          Text: null,
          HeightSize: node.height(),
          WidthSize: node.width(),
          SrcImg: imageElement.src
        });

      }
    });
    return Nodes;
  }

  public createNodeHistory(override?: boolean) {
    const nodeHistory: NodeHistory2 = {
      ColorId: this.colorValue,
      ProductId: this.productId,
      StageId: this.currentStage.stage?.id() || "",
      VariantId: this.variantId,
      DesignType: this.designType,
      Nodes: this.getListNodeInStage() || []
    }

    addStackHistory2(nodeHistory, override);
  }
}

export default TShirtDesigner; 