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

export interface RequestAutoCompleteAction extends RequestAction<SetAutoCompleteAction> {
    kind: typeof RequestAutoCompleteAction.KIND,
    elementId: string;
    search: string;
    sapUrl: string;
    sapClient: string;
    sapUsername: string;
    sapPassword: string;
}
export namespace RequestAutoCompleteAction {
    export const KIND = 'requestAutoComplete';

    export function create(elementId: string, search: string, sapUrl: string, sapClient: string, sapUsername: string, sapPassword: string): RequestAutoCompleteAction {
        return {
            kind: KIND,
            requestId: generateRequestId(),
            elementId: elementId,
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