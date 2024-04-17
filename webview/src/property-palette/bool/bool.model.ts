import { ElementPropertyItem } from '../property-palette';

export interface ElementBoolPropertyItem extends ElementPropertyItem {
    type: typeof ElementBoolPropertyItem.TYPE;
    value: boolean;
    label: string;
}

export namespace ElementBoolPropertyItem {
    export const TYPE = 'BOOL';

    export function is(value: ElementPropertyItem): value is ElementBoolPropertyItem {
        return value.type === TYPE;
    }
}
