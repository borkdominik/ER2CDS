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

export interface CreateEdgeAction extends Action {
    kind: typeof CreateEdgeAction.KIND;
    sourceElementId: string;
    targetElementId: string;
}
export namespace CreateEdgeAction {
    export const KIND = 'createEdge';

    export function create(options: { sourceElementId: string; targetElementId: string; }): CreateEdgeAction {
        return {
            kind: KIND,
            ...options
        };
    }
}