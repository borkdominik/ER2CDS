import { Action } from 'sprotty-protocol';

export interface EnableEditorPanelAction extends Action {
    kind: typeof EnableEditorPanelAction.KIND;
}
export namespace EnableEditorPanelAction {
    export const KIND = 'enableEditorPanel';

    export function create(): EnableEditorPanelAction {
        return { kind: KIND };
    }
}