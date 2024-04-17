import { CreatedElementProperty } from '../property-palette';
import { ElementBoolPropertyItem } from './bool.model';

export interface BoolPropertyEvents {
    onChange?: (item: ElementBoolPropertyItem, input: HTMLInputElement, event: Event) => void;
}

export function createBoolProperty(propertyItem: ElementBoolPropertyItem, events: BoolPropertyEvents): CreatedElementProperty {
    const div = document.createElement('div');
    div.classList.add('property-item', 'property-bool-item');

    const label = document.createElement('label');
    label.classList.add('property-item-label');
    label.textContent = propertyItem.label;
    div.appendChild(label);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = propertyItem.value;
    input.addEventListener('change', ev => {
        events.onChange?.(propertyItem, input, ev);
    });
    div.appendChild(input);

    return {
        element: div,
        ui: {
            disable: () => {
                input.disabled = true;
            },
            enable: () => {
                input.disabled = false;
            }
        }
    };
}
