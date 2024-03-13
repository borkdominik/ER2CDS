import { Action } from 'sprotty-protocol';

export interface EnableToolsAction extends Action {
    kind: typeof EnableToolsAction.KIND;
    toolIds: string[];
}
export namespace EnableToolsAction {
    export const KIND = 'enableTools';

    export function create(toolIds: string[]): EnableToolsAction {
        return {
            kind: KIND,
            toolIds
        };
    }
}

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

export interface EnableToolPaletteAction extends Action {
    kind: typeof EnableToolPaletteAction.KIND;
}
export namespace EnableToolPaletteAction {
    export const KIND = 'enableToolPalette';

    export function create(): EnableToolPaletteAction {
        return { kind: KIND };
    }
}