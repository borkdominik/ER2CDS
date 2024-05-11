import { Action, RequestAction, ResponseAction, generateRequestId } from 'sprotty-protocol';

export interface CreateElementExternalAction extends Action {
    kind: typeof CreateElementExternalAction.KIND,
    elementId: string;
    sapUrl: string;
    sapClient: string;
    sapUsername: string;
    sapPassword: string;
}
export namespace CreateElementExternalAction {
    export const KIND = 'createElementExternalAction';

    export function create(elementId: string, sapUrl: string, sapClient: string, sapUsername: string, sapPassword: string): CreateElementExternalAction {
        return {
            kind: KIND,
            elementId: elementId,
            sapUrl: sapUrl,
            sapClient: sapClient,
            sapUsername: sapUsername,
            sapPassword: sapPassword
        };
    }
}

export interface UpdateElementPropertyAction extends Action {
    kind: typeof UpdateElementPropertyAction.KIND,
    elementId: string,
    propertyId: string,
    value: string,
    sapUrl: string;
    sapClient: string;
    sapUsername: string;
    sapPassword: string;
}
export namespace UpdateElementPropertyAction {
    export const KIND = 'updateElementProperty';

    export function create(elementId: string, propertyId: string, value: string, sapUrl: string, sapClient: string, sapUsername: string, sapPassword: string): UpdateElementPropertyAction {
        return {
            kind: KIND,
            elementId: elementId,
            propertyId: propertyId,
            value: value,
            sapUrl: sapUrl,
            sapClient: sapClient,
            sapUsername: sapUsername,
            sapPassword: sapPassword
        };
    }
}

export interface RequestAutoCompleteAction extends RequestAction<SetAutoCompleteAction> {
    kind: typeof RequestAutoCompleteAction.KIND,
    elementId: string;
    type: string;
    search: string;
    sapUrl: string;
    sapClient: string;
    sapUsername: string;
    sapPassword: string;
}
export namespace RequestAutoCompleteAction {
    export const KIND = 'requestAutoComplete';

    export function create(elementId: string, type: string, search: string, sapUrl: string, sapClient: string, sapUsername: string, sapPassword: string): RequestAutoCompleteAction {
        return {
            kind: KIND,
            requestId: generateRequestId(),
            elementId: elementId,
            type: type,
            search: search,
            sapUrl: sapUrl,
            sapClient: sapClient,
            sapUsername: sapUsername,
            sapPassword: sapPassword
        };
    }
}

export interface AutoCompleteValue {
    label: string;
}
export interface SetAutoCompleteAction extends ResponseAction {
    kind: typeof SetAutoCompleteAction.KIND,
    elementId: string,
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