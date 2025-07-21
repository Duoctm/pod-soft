export interface NodeConfig2 {
    Id: string | null;
    Type: string | null;
    WidthSize: number | null;
    HeightSize: number | null;
    RotationAngle: number | null;
    FontSize: number | null;
    FontFamily: string | null;
    FontWeight: string | null;
    FontStyle: string | null;
    Fill: string | null
    Text: string | null;
    PositionX: number | null;
    PositionY: number | null;
    SrcImg: string | null; //CanvasImageSource | null | undefined; //Id
    indexLayer: number | null; //front back
}

export interface NodeHistory2 {
    StageId: string | null;
    ProductId: string | null;
    ColorId: string | null;
    VariantId: string | null;
    DesignType: number | null;
    Nodes: NodeConfig2[] | null
}


export interface StackHistory2 {
    nodeHistory: NodeHistory2[];
    index: number;
}

export function initialStackHistory2() {
    const stackHistory = localStorage.getItem("stackHistory");
    if (stackHistory) {
        return;
    }
    const stackHistories: StackHistory2 = {
        index: -1,
        nodeHistory: []
    };

    localStorage.setItem("stackHistory", JSON.stringify(stackHistories));
}

export function destroyStackHistory2() {

    localStorage.removeItem("stackHistory");
}


export function addStackHistory2(nodeHistory: NodeHistory2, override?: boolean) {
    const StackHistoriesJsonString = localStorage.getItem("stackHistory");
    let StackHistories = JSON.parse(StackHistoriesJsonString || "") as StackHistory2;
    if (override) {
        StackHistories.nodeHistory = [nodeHistory];
        StackHistories.index = 0;
    }
    else {
        if (StackHistories.index < StackHistories.nodeHistory.length - 1) {
            StackHistories.nodeHistory = StackHistories.nodeHistory.slice(0, StackHistories.index + 1);
        }
        StackHistories.nodeHistory.push(nodeHistory);
        StackHistories.index++;
    }

    let flag = true;
    while (flag) {
        try {
            localStorage.setItem("stackHistory", JSON.stringify(StackHistories));
            flag = false;
        }
        catch (e) {
            if (StackHistories.nodeHistory.length == 0) {
                return;
            }
            StackHistories.nodeHistory.shift();
            StackHistories.index--;
        }
    }
}

export function undoStackHistory2(): NodeHistory2 | null {
    const StackHistoriesJsonString = localStorage.getItem("stackHistory");
    let StackHistories = JSON.parse(StackHistoriesJsonString || "") as StackHistory2;
    if (StackHistories.nodeHistory.length == 0 || StackHistories.index == 0) {
        return null;
    }
    StackHistories.index = StackHistories.index - 1;

    localStorage.setItem("stackHistory", JSON.stringify(StackHistories));
    return StackHistories.nodeHistory[StackHistories.index];
}


export function redoStackHistory2(): NodeHistory2 | null {
    const StackHistoriesJsonString = localStorage.getItem("stackHistory");
    let StackHistories = JSON.parse(StackHistoriesJsonString || "") as StackHistory2;
    if (StackHistories.nodeHistory.length == 0 || StackHistories.index == StackHistories.nodeHistory.length - 1) {
        return null;
    }
    StackHistories.index = StackHistories.index + 1;
    localStorage.setItem("stackHistory", JSON.stringify(StackHistories));
    return StackHistories.nodeHistory[StackHistories.index];
}