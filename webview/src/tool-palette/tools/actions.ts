import { Action } from 'sprotty-protocol';

export interface EnableDefaultToolsAction extends Action {
    kind: typeof EnableDefaultToolsAction.KIND;
}
export namespace EnableDefaultToolsAction {
    export const KIND = 'enableDefaultTools';

    export function create(): EnableDefaultToolsAction {
        return {
            kind: KIND
        };
    }
}

export interface EnableMarqueeMouseToolAction extends Action {
    kind: typeof EnableMarqueeMouseToolAction.KIND;
}
export namespace EnableMarqueeMouseToolAction {
    export const KIND = 'enableMarqueeMouseTool';

    export function create(): EnableMarqueeMouseToolAction {
        return {
            kind: KIND
        };
    }
}

export interface EnableDeleteMouseToolAction extends Action {
    kind: typeof EnableDeleteMouseToolAction.KIND;
}
export namespace EnableDeleteMouseToolAction {
    export const KIND = 'enableDeleteMouseTool';

    export function create(): EnableDeleteMouseToolAction {
        return {
            kind: KIND
        };
    }
}

export interface EnableCreateEdgeToolAction extends Action {
    kind: typeof EnableCreateEdgeToolAction.KIND;
}
export namespace EnableCreateEdgeToolAction {
    export const KIND = 'enableCreateEdgeTool';

    export function create(): EnableCreateEdgeToolAction {
        return {
            kind: KIND
        };
    }
}