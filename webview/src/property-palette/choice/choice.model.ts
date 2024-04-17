import { ElementPropertyItem } from '../property-palette';

export interface ElementChoicePropertyItem extends ElementPropertyItem {
    type: typeof ElementChoicePropertyItem.TYPE;
    choices: {
        label: string;
        value: string;
    }[];
    choice: string;
    label: string;
}

export namespace ElementChoicePropertyItem {
    export const TYPE = 'CHOICE';

    export function is(value: ElementPropertyItem): value is ElementChoicePropertyItem {
        return value.type === TYPE;
    }
}
