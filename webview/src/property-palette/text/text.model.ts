import { ElementPropertyItem } from '../property-palette';

export interface ElementTextPropertyItem extends ElementPropertyItem {
    type: typeof ElementTextPropertyItem.TYPE;
    text: string;
    label: string;
}

export namespace ElementTextPropertyItem {
    export const TYPE = 'TEXT';

    export function is(value: ElementPropertyItem): value is ElementTextPropertyItem {
        return value.type === TYPE;
    }
}
