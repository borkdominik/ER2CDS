import { RequestAction, ResponseAction, generateRequestId } from "sprotty-protocol";

export interface RequestAutoCompleteAction extends RequestAction<SetAutoCompleteAction> {
    kind: typeof RequestAutoCompleteAction.KIND,
    elementId: string;
}
export namespace RequestAutoCompleteAction {
    export const KIND = 'requestAutoComplete';

    export function create(elementId: string): RequestAutoCompleteAction {
        return {
            kind: KIND,
            requestId: generateRequestId(),
            elementId: elementId
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