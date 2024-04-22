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

export interface CreateAttributeAction extends Action {
    kind: typeof CreateAttributeAction.KIND;
    elementId: string;
}
export namespace CreateAttributeAction {
    export const KIND = 'createAttribute';

    export function create(elementId: string): CreateAttributeAction {
        return {
            kind: KIND,
            elementId
        };
    }
}

export interface UpdateElementPropertyAction extends Action {
    kind: typeof UpdateElementPropertyAction.KIND,
    elementId: string,
    propertyId: string,
    value: string
}
export namespace UpdateElementPropertyAction {
    export const KIND = 'updateElementProperty';

    export function create(elementId: string, propertyId: string, value: string): UpdateElementPropertyAction {
        return {
            kind: KIND,
            elementId: elementId,
            propertyId: propertyId,
            value: value
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