import { Action } from 'sprotty-protocol';

export interface CreateElementAction extends Action {
    kind: typeof CreateElementAction.KIND,
    elementType: string;
}
export namespace CreateElementAction {
    export const KIND = 'createElementAction';

    export function create(elementType: string): CreateElementAction {
        return {
            kind: KIND,
            elementType: elementType
        };
    }
}

export interface DeleteElementAction extends Action {
    kind: typeof DeleteElementAction.KIND;
    elementIds: string[];
}
export namespace DeleteElementAction {
    export const KIND = 'deleteElementAction';

    export function create(elementIds: string[]): DeleteElementAction {
        return {
            kind: KIND,
            elementIds
        };
    }
}