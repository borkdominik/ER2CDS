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