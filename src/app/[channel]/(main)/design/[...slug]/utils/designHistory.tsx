/*export interface NodeHistory {
    WidthSize: number | null;
    HeightSize: number | null;
    RotationAngle: number | null;
    FontSize: number | null;
    FontFamily: string | null;
    FontWeight: string | null;
    FontStyle: string | null;
    Text: string | null;
    PositionX: number | null;
    PositionY: number | null;
    indexImg: string | null;
    indexLayer: string | null
}


export interface StackHistory {
    nodeHistory: NodeHistory[];
    type: string;
    index: number
    id: string;
}

//const StackHistories: StackHistory[] = [];

function addStackHistory(id: string, type: string, nodeHistory: NodeHistory, StackHistories: StackHistory[]) {
    const index = StackHistories.findIndex((item: StackHistory) => item.id === id);
    if (index !== -1) {
        const existing = StackHistories[index];


        if (index !== 0) {
            StackHistories.splice(index, 1);
            StackHistories.unshift(existing);
        }


        if (existing.index !== existing.nodeHistory.length - 1) {
            existing.nodeHistory = existing.nodeHistory.slice(0, existing.index + 1);
        }

        // Thêm node mới và cập nhật chỉ số
        existing.nodeHistory.push(nodeHistory);
        existing.index = existing.nodeHistory.length - 1;

    } else {
        StackHistories.unshift({
            id,
            type,
            nodeHistory: [nodeHistory],
            index: 0
        });
    }
}


function undoStackHistory(StackHistories: StackHistory[]) {
    if (StackHistories.length === 0) {
        return null;
    }
    const existing = StackHistories[0];
    if (existing.index > 0) {
        existing.index -= 1;
    }
    else if (existing.index == 0) {
        //StackHistories.shift();
        existing.index = -1;
        return { type: existing.type, id: existing.id, node: null }
    }
    return { type: existing.type, id: existing.id, node: existing.nodeHistory[existing.index] };
}

function redoStackHistory(StackHistories: StackHistory[]) {
    if (StackHistories.length === 0) {
        return null;
    }

    const existing = StackHistories[0];
    if (existing.index < existing.nodeHistory.length - 1) {
        existing.index += 1;
    }
    return { type: existing.type, id: existing.id, node: existing.nodeHistory[existing.index] };
}



export { addStackHistory, undoStackHistory, redoStackHistory }*/


interface CroptParam {
    LeftScale: number,
    TopScale: number,
    WidthScale: number,
    HeightScale: number
}


export interface NodeHistory {
    Type: string | null;//image text
    Id: string | null;
    Action: string | null;//create update delete
    WidthSize: number | null;
    HeightSize: number | null;
    RotationAngle: number | null;
    FontSize: number | null;
    FontFamily: string | null;
    FontWeight: string | null;
    FontStyle: string | null;
    Text: string | null;
    PositionX: number | null;
    PositionY: number | null;
    indexImg: string | null; //Id
    indexLayer: string | null; //front back
    dependency: string | null;
    CroptParam: CroptParam | null;
}


export interface StackHistory {
    nodeHistory: NodeHistory[];
    index: number;
}

//const StackHistories: StackHistory[] = [];

// function addStackHistory(nodeHistory: NodeHistory, StackHistories: StackHistory) {
//     //const index = StackHistories.findIndex((item: StackHistory) => item.id === id);
//     adHistory(nodeHistory, StackHistories);
//     if (nodeHistory.Action == "create") {
//         const teamNodeHistory: NodeHistory = {
//             Id: nodeHistory.Id,
//             Action: 'update',
//             Type: null,
//             FontFamily: null,
//             FontSize: null,
//             FontStyle: null,
//             FontWeight: null,
//             Text: null,
//             HeightSize: null,
//             WidthSize: null,
//             RotationAngle: null,
//             PositionX: nodeHistory.PositionX,
//             PositionY: nodeHistory.PositionY,
//             indexImg: null,
//             indexLayer: null
//         }
//         adHistory(teamNodeHistory, StackHistories);
//     }
// }


function addStackHistory(nodeHistory: NodeHistory, StackHistories: StackHistory) {
    //const index = StackHistories.findIndex((item: StackHistory) => item.id === id);
    adHistory(nodeHistory, StackHistories);
}

function adHistory(nodeHistory: NodeHistory, StackHistories: StackHistory) {
    //const index = StackHistories.findIndex((item: StackHistory) => item.id === id);
    if (nodeHistory.Action == "create" || nodeHistory.Action == "delete") {
        const teamNodeHistory: NodeHistory = {
            Id: nodeHistory.Id,
            Action: 'update',
            Type: null,
            FontFamily: null,
            FontSize: null,
            FontStyle: null,
            FontWeight: null,
            Text: null,
            HeightSize: null,
            WidthSize: null,
            RotationAngle: 0,
            PositionX: nodeHistory.PositionX,
            PositionY: nodeHistory.PositionY,
            indexImg: null,
            indexLayer: null,
            dependency: null,
            CroptParam: null
        }
        adHistory(teamNodeHistory, StackHistories);
    }

    if (StackHistories.index < StackHistories.nodeHistory.length - 1) {
        StackHistories.nodeHistory = StackHistories.nodeHistory.slice(0, StackHistories.index + 1);
    }
    StackHistories.nodeHistory.push(nodeHistory);
    StackHistories.index++;
    if (nodeHistory.Action == "create" || nodeHistory.Action == "delete") {
        if (nodeHistory.Action == "create") {
            const teamNodeHistory: NodeHistory = {
                Id: nodeHistory.Id,
                Action: 'update',
                Type: null,
                FontFamily: null,
                FontSize: null,
                FontStyle: null,
                FontWeight: null,
                Text: null,
                HeightSize: null,
                WidthSize: null,
                RotationAngle: 0,
                PositionX: nodeHistory.PositionX,
                PositionY: nodeHistory.PositionY,
                indexImg: null,
                indexLayer: null,
                dependency: "create",
                CroptParam: null
            }
            adHistory(teamNodeHistory, StackHistories);
        }
        else if (nodeHistory.Action == "delete") {
            const teamNodeHistory: NodeHistory = {
                Id: nodeHistory.Id,
                Action: 'update',
                Type: null,
                FontFamily: null,
                FontSize: null,
                FontStyle: null,
                FontWeight: null,
                Text: null,
                HeightSize: null,
                WidthSize: null,
                RotationAngle: 0,
                PositionX: nodeHistory.PositionX,
                PositionY: nodeHistory.PositionY,
                indexImg: null,
                indexLayer: null,
                dependency: "delete",
                CroptParam: null
            }
            adHistory(teamNodeHistory, StackHistories);
        }
    }
    //console.log('checkk', StackHistories);
}

// function undoStackHistory(StackHistories: StackHistory): NodeHistory | null {
//     if (StackHistories.nodeHistory.length == 0 || StackHistories.index == 0) {
//         return null;
//     }
//     if (StackHistories.nodeHistory[StackHistories.index].Action != 'delete') {
//         StackHistories.index--;
//     }
//     StackHistories.index--;
//     return StackHistories.nodeHistory[StackHistories.index];
// }

// function redoStackHistory(StackHistories: StackHistory): NodeHistory | null {
//     if (StackHistories.nodeHistory.length == 0 || StackHistories.index == StackHistories.nodeHistory.length - 1) {
//         if (StackHistories.nodeHistory.length == 0) {
//             return null;
//         }
//         else if (StackHistories.index == StackHistories.nodeHistory.length - 1) {
//             return StackHistories.nodeHistory[StackHistories.index];
//         }
//     }
//     let result = StackHistories.nodeHistory[StackHistories.index];
//     if (StackHistories.nodeHistory[StackHistories.index].Action == "create") {
//         StackHistories.index += 2;
//     }
//     else {
//         StackHistories.index++;
//     }
//     return result;
// }



function undoStackHistory(StackHistories: StackHistory): NodeHistory | null {
    if (StackHistories.nodeHistory.length == 0 || StackHistories.index == 0) {
        return null;
    }
    StackHistories.index--;
    return StackHistories.nodeHistory[StackHistories.index];
}

function redoStackHistory(StackHistories: StackHistory): NodeHistory | null {
    if (StackHistories.nodeHistory.length == 0 || StackHistories.index == StackHistories.nodeHistory.length - 1) {
        return null;
    }
    StackHistories.index++;
    let result = StackHistories.nodeHistory[StackHistories.index];
    if (result.dependency == "create") {
        result = StackHistories.nodeHistory[StackHistories.index - 1];
        return result;
    }
    else if (result.dependency == "delete") {
        result = StackHistories.nodeHistory[StackHistories.index - 1];
        return result;
    }
    else {
        return result;
    }
}



export { addStackHistory, undoStackHistory, redoStackHistory }