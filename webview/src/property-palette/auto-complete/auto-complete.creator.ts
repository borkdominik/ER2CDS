import { SModelRootImpl } from 'sprotty';
import { CreatedElementProperty } from '../property-palette';
import { ElementAutoCompletePropertyItem } from './auto-complete.model';

export function createAutoCompleteProperty(autoCompleteItem: ElementAutoCompletePropertyItem, root: SModelRootImpl): CreatedElementProperty {
    const div = document.createElement('div');
    div.classList.add('property-item', 'property-autocomplete-item');

    const label = document.createElement('label');
    label.classList.add('property-item-label');
    label.textContent = autoCompleteItem.label;
    div.appendChild(label);

    autoCompleteItem.autoComplete.initialize(div);
    autoCompleteItem.autoComplete.inputField.classList.add('property-item-full');

    if (autoCompleteItem.value)
        autoCompleteItem.autoComplete.inputField.value = autoCompleteItem.value;

    autoCompleteItem.autoComplete.open(root);

    return {
        element: div,
        ui: {
            disable: () => {
                autoCompleteItem.autoComplete.inputField.disabled = true;
            },
            enable: () => {
                autoCompleteItem.autoComplete.inputField.disabled = false;
            }
        }
    };
}
