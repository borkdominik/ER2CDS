import { Action } from 'sprotty-protocol';

export interface EnableToolPaletteAction extends Action {
    kind: typeof EnableToolPaletteAction.KIND;
}
export namespace EnableToolPaletteAction {
    export const KIND = 'enableToolPalette';

    export function create(): EnableToolPaletteAction {
        return { kind: KIND };
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