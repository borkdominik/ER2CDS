import { Action } from 'sprotty-protocol';

export interface CreateEntityAction extends Action {
    kind: typeof CreateEntityAction.KIND
}
export namespace CreateEntityAction {
    export const KIND = 'createEntityAction';

    export function create(): CreateEntityAction {
        return {
            kind: KIND
        };
    }
}

export interface CreateRelationshipAction extends Action {
    kind: typeof CreateRelationshipAction.KIND
}
export namespace CreateRelationshipAction {
    export const KIND = 'createRelationshipAction';

    export function create(): CreateRelationshipAction {
        return {
            kind: KIND
        };
    }
}