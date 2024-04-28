import { AutoCompleteWidget } from '../../auto-complete/auto-complete-widget';
import { ElementPropertyItem } from '../property-palette';

export interface ElementAutoCompletePropertyItem extends ElementPropertyItem {
    type: typeof ElementAutoCompletePropertyItem.TYPE;
    label: string;
    autoComplete: AutoCompleteWidget;
}

export namespace ElementAutoCompletePropertyItem {
    export const TYPE = 'AUTO_COMPLETE';

    export function is(value: ElementPropertyItem): value is ElementAutoCompletePropertyItem {
        return value.type === TYPE;
    }
}
