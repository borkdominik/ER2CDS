import { Action } from 'sprotty-protocol';
import { ElementPropertyItem } from '../property-palette';

export interface ElementReferencePropertyItem extends ElementPropertyItem {
    type: typeof ElementReferencePropertyItem.TYPE;
    label: string;
    references: ElementReferencePropertyItem.Reference[];
    creates: ElementReferencePropertyItem.CreateReference[];
    isOrderable: boolean;
}

export namespace ElementReferencePropertyItem {
    export const TYPE = 'REFERENCE';

    export interface Reference {
        label: string;
        elementId: string;
        isReadonly: boolean;
    }

    export interface CreateReference {
        label: string;
        action: Action;
    }

    export function is(value: ElementPropertyItem): value is ElementReferencePropertyItem {
        return value.type === TYPE;
    }
}
