import { Action, RequestAction, ResponseAction, generateRequestId, Bounds, SetPopupModelAction } from 'sprotty-protocol';

export interface CreateElementAction extends Action {
    kind: typeof CreateElementAction.KIND;
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

export interface CreateElementExternalAction extends Action {
    kind: typeof CreateElementExternalAction.KIND;
    elementId: string;
}
export namespace CreateElementExternalAction {
    export const KIND = 'createElementExternalAction';

    export function create(elementId: string): CreateElementExternalAction {
        return {
            kind: KIND,
            elementId: elementId
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

export interface CreateAssociationAction extends Action {
    kind: typeof CreateAssociationAction.KIND;
    elementId: string;
}
export namespace CreateAssociationAction {
    export const KIND = 'createAssociation';

    export function create(elementId: string): CreateAssociationAction {
        return {
            kind: KIND,
            elementId
        };
    }
}

export interface CreateWhereClauseAction extends Action {
    kind: typeof CreateWhereClauseAction.KIND;
    elementId: string;
}
export namespace CreateWhereClauseAction {
    export const KIND = 'createWhereClause';

    export function create(elementId: string): CreateWhereClauseAction {
        return {
            kind: KIND,
            elementId
        };
    }
}

export interface CreateJoinClauseAction extends Action {
    kind: typeof CreateJoinClauseAction.KIND;
    elementId: string;
}
export namespace CreateJoinClauseAction {
    export const KIND = 'createJoinClause';

    export function create(elementId: string): CreateJoinClauseAction {
        return {
            kind: KIND,
            elementId
        };
    }
}

export interface UpdateElementPropertyAction extends Action {
    kind: typeof UpdateElementPropertyAction.KIND;
    elementId: string;
    propertyId: string;
    value: string;
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

export interface RequestAutoCompleteAction extends RequestAction<SetAutoCompleteAction> {
    kind: typeof RequestAutoCompleteAction.KIND;
    elementId: string;
    type: string;
    search: string;
}
export namespace RequestAutoCompleteAction {
    export const KIND = 'requestAutoComplete';

    export function create(elementId: string, type: string, search: string): RequestAutoCompleteAction {
        return {
            kind: KIND,
            requestId: generateRequestId(),
            elementId: elementId,
            type: type,
            search: search
        };
    }
}

export interface AutoCompleteValue {
    label: string;
}
export interface SetAutoCompleteAction extends ResponseAction {
    kind: typeof SetAutoCompleteAction.KIND;
    elementId: string;
    values: AutoCompleteValue[];
}
export namespace SetAutoCompleteAction {
    export const KIND = 'setAutoComplete';

    export function create(elementId: string, values: AutoCompleteValue[]): SetAutoCompleteAction {
        return {
            kind: KIND,
            responseId: '',
            elementId: elementId,
            values: values
        };
    }
}

export interface RequestPopupConfirmModelAction extends RequestAction<SetPopupModelAction> {
    kind: typeof RequestPopupConfirmModelAction.KIND;
    elementId: string;
    bounds: Bounds;
}
export namespace RequestPopupConfirmModelAction {
    export const KIND = 'requestPopupConfirmModel';

    export function create(options: { elementId: string, bounds: Bounds }): RequestPopupConfirmModelAction {
        return {
            kind: KIND,
            elementId: options.elementId,
            bounds: options.bounds,
            requestId: generateRequestId()
        };
    }
}

export interface RequestMarkersAction extends RequestAction<SetMarkersAction> {
    kind: typeof RequestMarkersAction.KIND;
}
export namespace RequestMarkersAction {
    export const KIND = 'requestMarkers';

    export function create(options: { requestId?: string } = {}): RequestMarkersAction {
        return {
            kind: KIND,
            requestId: '',
            ...options
        };
    }
}

export namespace MarkerKind {
    export const INFO = 'info';
    export const WARNING = 'warning';
    export const ERROR = 'error';
}
export interface Marker {
    readonly elementId: string;
    readonly kind: string;
    readonly description: string;
}
export interface SetMarkersAction extends ResponseAction {
    kind: typeof SetMarkersAction.KIND;
    readonly markers: Marker[];
}
export namespace SetMarkersAction {
    export const KIND = 'setMarkers';

    export function create(markers: Marker[], options: { responseId?: string; reason?: string } = {}): SetMarkersAction {
        return {
            kind: KIND,
            responseId: '',
            markers,
            ...options
        };
    }
}