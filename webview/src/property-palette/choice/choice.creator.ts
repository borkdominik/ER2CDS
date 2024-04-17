import { CreatedElementProperty } from '../property-palette';
import { ElementChoicePropertyItem } from './choice.model';

export interface ChoicePropertyEvents {
    onChange?: (item: ElementChoicePropertyItem, input: HTMLSelectElement, event: Event) => void;
}

export function createChoiceProperty(propertyItem: ElementChoicePropertyItem, events: ChoicePropertyEvents): CreatedElementProperty {
    const div = document.createElement('div');
    div.classList.add('property-item', 'property-choice-item');

    const label = document.createElement('label');
    label.classList.add('property-item-label');
    label.textContent = propertyItem.label;
    div.appendChild(label);

    const select = document.createElement('select');

    propertyItem.choices.forEach(choice => {
        const option = document.createElement('option');

        option.text = choice.label;
        option.value = choice.value;

        if (option.value === propertyItem.choice) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    select.addEventListener('change', ev => {
        events.onChange?.(propertyItem, select, ev);
    });
    div.appendChild(select);

    return {
        element: div,
        ui: {
            disable: () => {
                select.disabled = true;
            },
            enable: () => {
                select.disabled = false;
            }
        }
    };
}
