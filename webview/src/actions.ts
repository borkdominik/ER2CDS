import { Action } from 'sprotty-protocol';

export interface CreateElementEditAction extends Action {
    kind: typeof CreateElementEditAction.KIND
    elementType: string
}

export namespace CreateElementEditAction {
    export const KIND = 'createElementEdit';

    export function create(elementType: string): CreateElementEditAction {
        return {
            kind: KIND,
            elementType
        };
    }
}