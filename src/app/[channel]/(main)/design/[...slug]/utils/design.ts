"use client"

import Konva from 'konva';
import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { type PrintFaceData, type DesignInfo/*, UploadDataType*/ } from '../utils/type';
import { uploadImage } from './test';
interface StageConfig {
  stage: Konva.Stage | null;
  layer: Konva.Layer | null;
  selectedNode: Konva.Node | null;
  borderDiv: HTMLDivElement | null;
  //lastPositionNode: { x: number; y: number } | null;
}

class TShirtDesigner {

  public data: PrintFaceData[];
  private productId: string;
  public colorValue: string;
  public variantId: string | null;
  private colorData: Map<string, object>;
  public stages: StageConfig[] = [];

  private currentStage: StageConfig;
  private textColor: string = '#000000';
  private fontWeight: string = 'normal';
  private fontStyle: string = 'normal';
  private fontFamily: string = 'Montserrat';
  private backgroundColor: string = '#ffffff';
  private clipboard: Konva.Node | null = null;
  public onSelectObject: ((hasSelection: boolean) => void) | null = null;
  private menuIndexSetter: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | 4 | 5 | 6>>;
  private resizeWidthSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private resizeHeightSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private rotationAngleSetter: React.Dispatch<React.SetStateAction<number | undefined>>;
  private fontSizeSetter: React.Dispatch<React.SetStateAction<number | undefined>>;

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

  public getWHROfNode() {
    if (this.currentStage.selectedNode != null) {
      this.resizeWidthSetter(parseInt(this.currentStage.selectedNode.width().toString()));
      this.resizeHeightSetter(parseInt(this.currentStage.selectedNode.height().toString()));
      this.rotationAngleSetter(parseInt(this.currentStage.selectedNode.rotation().toString()));
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
      this.fontSizeSetter(node.fontSize());
      this.rotationAngleSetter(this.currentStage.selectedNode.rotation());
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
        if (node instanceof Konva.Text) {
          // const nodeWidth = node.width();
          // const nodeHeight = node.height();
          node.width(node.width() * scaleX);
          node.height(node.height() * scaleY);
          node.fontSize(node.fontSize() * scaleX)
          node.offsetX(node.width() / 2);
          node.offsetY(node.height() / 2);

          //   if (typeof nodeWidth === 'number') {
          //     node.scaleX(nodeWidth * scaleX);
          //     node.scaleY(nodeHeight * scaleY);
          //     node.offsetX(node.width()/2);
          //     node.offsetY(node.height()/2);
          //  }
        }
        // Nếu là image node, điều chỉnh kích thước
        else if (node instanceof Konva.Image) {
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

  constructor(data: PrintFaceData[], productId: string, variantId: string | null, colorValue: string, colorData: Map<string, object>,
    menuIndexSetter: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | 4 | 5 | 6>>,
    resizeWidthSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    resizeHeightSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    rotationAngleSetter: React.Dispatch<React.SetStateAction<number | undefined>>,
    fontSizeSetter: React.Dispatch<React.SetStateAction<number | undefined>>
  ) {
    this.data = data;
    this.productId = productId;
    this.colorValue = colorValue;
    this.variantId = variantId;
    this.colorData = colorData;
    this.menuIndexSetter = menuIndexSetter;
    this.resizeWidthSetter = resizeWidthSetter;
    this.resizeHeightSetter = resizeHeightSetter;
    this.rotationAngleSetter = rotationAngleSetter;
    this.fontSizeSetter = fontSizeSetter;
    for (const item in this.data) {
      this.stages[item] = {
        stage: null,
        layer: null,
        selectedNode: null,
        borderDiv: null,
        //lastPositionNode: null
      };
    }
    this.currentStage = this.stages[0];
    this.initializeStages();
    this.initializeGlobalEventListeners();



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
    }, true);
  }

  private initializeStages() {
    const doms: HTMLImageElement[] = [];
    for (const item in this.data) {
      const imageDom = document.getElementById(this.data[item].code + "Image") as HTMLImageElement;
      if (imageDom) {
        doms.push(imageDom);
      }
    }

    const initStages = () => {

      if (doms.length > 0) {

        doms.forEach((item, index) => {
          console.log(item);
          this.setupStage(this.stages[index], this.data[index], doms[index], 'preview-' + this.data[index].code);
          if (index === 0) {
            this.stages[index].stage!.container().style.display = 'block';
            this.currentStage = this.stages[index];
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
    doms.forEach((item, index) => {
      console.log(item);
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
      //this.clearBorderNode(this.currentStage);
    });

    // Handle keyboard shortcuts for deletion only
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteSelectedNode(/*this.currentStage*/);
      }
    });
  }

  private setupStage(stageConfig: StageConfig, faceData: PrintFaceData, image: HTMLImageElement, containerId: string) {
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

  public switchToStage(side: string) {
    this.clearBorderNode(this.currentStage);

    if (this.currentStage.stage) {
      const currentContainer = this.currentStage.stage.container();
      currentContainer.style.display = 'none';
      currentContainer.style.zIndex = '0';
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

  }

  private clearBorderNode(stageConfig: StageConfig) {
    if (stageConfig.selectedNode != null) {
      this.menuIndexSetter(0);
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



    clone.draggable(true);
    stageConfig.layer!.add(clone);
    stageConfig.layer!.draw();


    this.showBorderNode(clone, stageConfig);
    if (this.onSelectObject) this.onSelectObject(true);


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

    resizeIcon.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
      const stage = stageConfig.stage!;
      const layer = stageConfig.layer!;
      const startX = e.clientX;
      const startY = e.clientY;
      const initialWidth = node.width();
      const initialHeight = node.height();

      stageConfig.borderDiv!.style.display = 'block';

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const clone = node.clone();
        clone.width(initialWidth + deltaX);
        clone.height(initialHeight + deltaY);
        const cloneBounds = clone.getClientRect();
        if (node instanceof Konva.Image) {
          if (cloneBounds.x >= stage.x() && cloneBounds.x + cloneBounds.width <= stage.width() && cloneBounds.y >= stage.y() && cloneBounds.y + cloneBounds.height <= stage.height()) {
            node.width(initialWidth + deltaX);
            node.height(initialHeight + deltaY);
            this.getWHROfNode();
          }
        }
        else if (node instanceof Konva.Text) {
          if (cloneBounds.x >= stage.x() && cloneBounds.x + cloneBounds.width <= stage.width() && cloneBounds.y >= stage.y() && cloneBounds.y + cloneBounds.height <= stage.height()) {
            if (startX < moveEvent.clientX) {
              node.fontSize(node.fontSize() + 1);
            }
            else {
              node.fontSize(node.fontSize() - 1);
            }
            this.getRSOfNode();

          }
        }

        node.offsetX(node.width() / 2);
        node.offsetY(node.height() / 2);
        node.setAttr('rotationOfLastWidth', node.width());
        node.setAttr('rotationOfLastHeight', node.height());
        updateBorderDiv();
        layer.draw();
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        rotateIcon.style.pointerEvents = 'none';
        resizeIcon.style.pointerEvents = 'none';

        stageConfig.borderDiv!.style.pointerEvents = 'none';
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    const rotateIcon = createIconWrapper('fas fa-redo', {}, (/*e*/) => {
      // e.stopPropagation();
      // node.rotation(node.rotation() + 15);
      // node.fire('transform');
      // updateBorderDiv();
      // stageConfig.layer!.draw();
    });


    rotateIcon.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
      const stage = stageConfig.stage!;
      const rect = stage.container().getBoundingClientRect();

      // Tâm của node (trên màn hình)
      const centerX = rect.left + node.x();
      const centerY = rect.top + node.y();

      // Góc giữa chuột và tâm khi bắt đầu
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const initialRotation = node.rotation();

      stageConfig.borderDiv!.style.display = 'block';

      const onMouseMove = (moveEvent: MouseEvent) => {
        const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
        const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);

        const newRotation = initialRotation + deltaAngle;
        node.rotation(newRotation);



        // const scale = parseFloat(node.getAttr('rotationOfLastHeight')) / parseFloat(node.getAttr('rotationOfLastWidth'));

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
        updateBorderDiv();
        stageConfig.layer!.draw();

        rotateIcon.style.transform = `rotate(${newRotation}deg)`;
        if (node instanceof Konva.Text) {
          this.getRSOfNode();
        }
        else if (node instanceof Konva.Image) {
          this.getWHROfNode();
        }

      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        rotateIcon.style.pointerEvents = 'none';
        resizeIcon.style.pointerEvents = 'none';

        stageConfig.borderDiv!.style.pointerEvents = 'none';

        node.setAttr('rotationOfLastWidth', node.width());
        node.setAttr('rotationOfLastHeight', node.height());
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
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

    // // Lắng nghe xoay để update border và icon
    // node.on('transform', () => {
    //   updateBorderDiv();
    // });

    // Append icons
    rectDiv.appendChild(deleteIcon);
    rectDiv.appendChild(copyIcon);
    rectDiv.appendChild(resizeIcon);
    rectDiv.appendChild(rotateIcon);

    updateBorderDiv();
  }

  private showBorderNode(node: Konva.Node, stageConfig: StageConfig) {
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

    layer.on('dragend', () => {
      if (stageConfig.borderDiv) {
        stageConfig.borderDiv.style.display = 'none';
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
        if (this.onSelectObject) {
          this.onSelectObject(false);
        }
        if (this.currentStage.borderDiv) {
          this.currentStage.borderDiv.style.display = 'none';
        }
        this.clearBorderNode(this.currentStage);
        this.resetWHROfNode();
        this.resetRSOfNode();
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

    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLCanvasElement) || !target.closest('.konvajs-content')) {

        if (this.onSelectObject) {
          this.onSelectObject(false);
        }
        if (this.currentStage.borderDiv) {
          this.currentStage.borderDiv.style.display = 'none';
        }
        this.clearBorderNode(this.currentStage);
        this.resetWHROfNode();
        this.resetRSOfNode();
      }
    });
  }

  public deleteSelectedNode(/*stageConfig: StageConfig*/) {
    const stageConfig = this.currentStage;
    if (stageConfig.selectedNode) {
      stageConfig.selectedNode.destroy();
      this.clearBorderNode(stageConfig);
      stageConfig.layer!.batchDraw();
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
    // Cập nhật kích thước stage trước khi thêm hình ảnh
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
        this.showBorderNode(imgNode, this.currentStage);
        this.menuIndexSetter(5);
        this.getWHROfNode();
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
    this.clearBorderNode(this.currentStage);
    //const stageWidth = this.currentStage.stage!.width();
    //const stageHeight = this.currentStage.stage!.height();
    const textNode = new Konva.Text({
      text: text,
      x: this.currentStage.stage.width() / 2,
      y: this.currentStage.stage.height() / 2,
      fontSize: 20,
      draggable: true,
      fill: this.textColor,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      align: 'center',
      padding: 5,
    });

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
    this.showBorderNode(textNode, this.currentStage);
    this.menuIndexSetter(6);
    this.getRSOfNode();
  }

  public changeTextColor(color: string) {
    this.textColor = color;
  }

  public changeFontStyle(style: string) {
    switch (style) {
      case 'bold':
        this.fontWeight = 'bold';
        this.fontStyle = 'normal';
        break;
      case 'italic':
        this.fontWeight = 'normal';
        this.fontStyle = 'italic';
        break;
      case 'bold-italic':
        this.fontWeight = 'bold';
        this.fontStyle = 'italic';
        break;
      default:
        this.fontWeight = 'normal';
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


  public async exportDesignToJson(): Promise<string> {
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
              let cloudinary_url = "";
              if (/^data:image\/[a-zA-Z]+;base64,/.test(imageElement.src)) {
                const file = this.base64ToFile(imageElement.src, 'image.png');
                try {
                  console.log('chay toi day');
                  //const formData = new FormData();
                  //formData.append('file', file);
                  const response = await uploadImage(JSON.stringify({ file: file }));
                  if (response != undefined) {
                    cloudinary_url = response.file.cloudinary_url ?? "";
                  }
                }
                catch (error) {
                  console.log('loi vo day', error);
                }
              }
              else {
                cloudinary_url = imageElement.src;
              }

              design.push({
                type: 'image',
                src: cloudinary_url,
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
                cloud_url: cloudinary_url, // Optional: add uploaded URL
              });
            } catch (error) {
              console.log("Upload failed:", error);
            }
          } else if (node instanceof Konva.Text) {
            design.push({
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

        //const stageBase64 = await this.exportStage(this.stages[item], imageDom, this.data[item].code);

        //console.log('dang debug ne', stageBase64);


        //const file = this.base64ToFile(stageBase64, 'image.png');
        //const response = await uploadImage(file);
        //designOfStage.final_image_url = response.file.cloudinary_url;
        designOfStage.designs = await getStageInfo(this.stages[item]);
        designs.push(designOfStage);
      } catch (error) {
        console.log('co loi ne', error);
      }
    }



    const designInfo: DesignInfo = {
      productId: this.productId,
      colorValue: this.colorValue,
      variantId: this.variantId,
      colorData: Object.fromEntries(this.colorData),
      faces: this.data,
      backgroundColor: this.backgroundColor,
      designs: designs,
    };

    return JSON.stringify(designInfo, null, 2);
  }

  public exportStage = async (stageConfig: StageConfig, image: HTMLImageElement, side: string): Promise<string> => {
    if (!stageConfig.stage || !stageConfig.layer) return '';


    for (const item in this.data) {
      const stageContainerDom = document.getElementById('preview-' + this.data[item].code) as HTMLImageElement;
      const imageDom = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
      if (side == this.data[item].code) {
        imageDom.style.display = 'block';
        if (stageContainerDom) stageContainerDom.style.display = 'block';
      }
      else {
        imageDom.style.display = 'none';
        if (stageContainerDom) stageContainerDom.style.display = 'none';
      }
    }

    const tempCanvas = document.createElement('canvas');
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

  public async exportImages(type: 'image' | 'json' = 'image') {
    if (type === 'json') {

      const jsonContent = await this.exportDesignToJson();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'DesignForYou.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }


    const downloadImage = (dataURL: string, filename: string) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    for (const item in this.data) {
      const imageDom = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
      const itemDataURL = await this.exportStage(this.stages[item], imageDom, this.data[item].code);
      if (itemDataURL) {
        downloadImage(itemDataURL, this.data[item].name + '.png');
      }
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
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = (obj as any).src;
            });

            const imgNode = new Konva.Image({
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




            stageConfig.layer.add(imgNode);
          } else if ((obj as any).type == 'text') {
            const textNode = new Konva.Text({
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

            stageConfig.layer.add(textNode);
          }
        }


        stageConfig.layer.draw();
      };

      for (const item in this.data) {

        const imageDom = document.getElementById(this.data[item].code + 'Image') as HTMLImageElement;
        if (imageDom) {
          this.updateStagePosition(this.stages[item], this.data[item], imageDom);
        }
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
    }
  }
  public setHeightCenterPosition() {
    if (this.currentStage.selectedNode != null) {
      const node = this.currentStage.selectedNode;
      if (this.currentStage.stage != null) {
        node.y(this.currentStage.stage.height() / 2);
      }
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
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
      node.setAttr('rotationOfLastWidth', node.width());
      node.setAttr('rotationOfLastHeight', node.height());
      this.setNodeBoder(node, this.currentStage);
      this.currentStage.layer!.draw();
    }
  }

  public setRSOfNode(instance: number | null) {
    if (this.currentStage.selectedNode != null) {
      const node = this.currentStage.selectedNode;
      const clone = node.clone();
      if (instance != null) {
        clone.fontSize(instance);
      }
      const cloneBounds = clone.getClientRect();
      if (node instanceof Konva.Text) {
        if (cloneBounds.x >= this.currentStage.stage!.x() && cloneBounds.x + cloneBounds.width <= this.currentStage.stage!.width() && cloneBounds.y >= this.currentStage.stage!.y() && cloneBounds.y + cloneBounds.height <= this.currentStage.stage!.height()) {
          node.fontSize(instance);
        }
      }
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
      node.setAttr('rotationOfLastWidth', node.width());
      node.setAttr('rotationOfLastHeight', node.height());
      this.setNodeBoder(node, this.currentStage);
      this.currentStage.layer!.draw();
    }
  }

  public setROfNodeheight(newRotation: number) {
    if (this.currentStage.selectedNode != null) {
      const node = this.currentStage.selectedNode;
      const stage = this.currentStage.stage as Konva.Stage;
      node.rotation(newRotation);



      // const scale = parseFloat(node.getAttr('rotationOfLastHeight')) / parseFloat(node.getAttr('rotationOfLastWidth'));

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
      this.setNodeBoder(node, this.currentStage);
      this.currentStage.layer!.draw();

      //rotateIcon.style.transform = `rotate(${newRotation}deg)`;
    }
  }
}

export default TShirtDesigner; 