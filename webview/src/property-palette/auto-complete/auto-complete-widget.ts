import { AutocompleteResult, AutocompleteSettings } from 'autocompleter';
import { SModelRootImpl, codiconCSSClasses } from 'sprotty';
import { toArray } from 'lodash';
import { matchesKeystroke } from 'sprotty/lib/utils/keyboard';
import { AutoCompleteValue } from '../../actions';
import configureAutocomplete from 'autocompleter';


export interface ValueProvider {
    provideValues(input: string): Promise<AutoCompleteValue[]>;
}

export interface ValueSubmitHandler {
    executeFromValue(input: AutoCompleteValue): void;
}

export interface TextSubmitHandler {
    executeFromTextOnlyInput(input: string): void;
}

export interface AutoCompleteWidgetOptions {
    visibleValuesChanged?: (values: AutoCompleteValue[]) => void;
    selectedValueChanged?: (value?: AutoCompleteValue) => void;
}

export class AutoCompleteWidget {
    protected loadingIndicatorClasses = codiconCSSClasses('loading', false, true, ['loading']);

    protected containerElement: HTMLElement;
    protected inputElement: HTMLInputElement;
    protected loadingIndicator: HTMLSpanElement;
    protected autoCompleteResult: AutocompleteResult;
    protected contextActions?: AutoCompleteValue[];
    protected previousContent?: string;

    readonly autoValueSettings = {
        noValuesMessage: 'No values available',
        valuesClass: 'auto-complete-values',
        debounceWaitMs: 50,
        showOnFocus: true
    };

    constructor(
        public valueProvider: ValueProvider,
        public valueSubmitHandler: ValueSubmitHandler,
        public textSubmitHandler: TextSubmitHandler,
        protected options?: AutoCompleteWidgetOptions
    ) { }

    initialize(containerElement: HTMLElement): void {
        this.containerElement = containerElement;
        this.inputElement = this.createInputElement();
        this.containerElement.appendChild(this.inputElement);
    }

    open(root: Readonly<SModelRootImpl>, ...contextElementIds: string[]): void {
        this.contextActions = undefined;
        this.autoCompleteResult = configureAutocomplete(this.autocompleteSettings(root));
        this.previousContent = this.inputElement.value;
        this.inputElement.setSelectionRange(0, this.inputElement.value.length);
        this.inputElement.focus();
    }

    get inputField(): HTMLInputElement {
        return this.inputElement;
    }

    protected createInputElement(): HTMLInputElement {
        const inputElement = document.createElement('input');
        inputElement.spellcheck = false;
        inputElement.autocapitalize = 'false';
        inputElement.autocomplete = 'off';
        inputElement.addEventListener('keydown', event => this.handleKeyDown(event));

        return inputElement;
    }

    protected handleKeyDown(event: KeyboardEvent): void {
        if (matchesKeystroke(event, 'Enter') && !this.isInputElementChanged() && this.isValueAvailable()) {
            return;
        }
        if (!matchesKeystroke(event, 'Enter') || this.isValueAvailable()) {
            return;
        }
        if (this.textSubmitHandler) {
            this.executeFromTextOnlyInput();
        }
    }

    protected isInputElementChanged(): boolean {
        return this.inputElement.value !== this.previousContent;
    }

    protected autocompleteSettings(root: Readonly<SModelRootImpl>): AutocompleteSettings<AutoCompleteValue> {
        return {
            input: this.inputElement,
            emptyMsg: this.autoValueSettings.noValuesMessage,
            className: this.autoValueSettings.valuesClass,
            showOnFocus: this.autoValueSettings.showOnFocus,
            debounceWaitMs: this.autoValueSettings.debounceWaitMs,
            minLength: -1,
            fetch: (text: string, update: (items: AutoCompleteValue[]) => void) => this.updateValues(update, text, root),
            onSelect: (item: AutoCompleteValue) => this.onSelect(item),
            render: (item: AutoCompleteValue, currentValue: string): HTMLDivElement | undefined => this.renderValues(item, currentValue),
            customize: (input, inputRect, container, maxHeight) => {
                this.customizeInputElement(input, inputRect, container, maxHeight);
            }
        };
    }

    protected customizeInputElement(input: HTMLInputElement | HTMLTextAreaElement, inputRect: DOMRect, container: HTMLDivElement, maxHeight: number): void {
        container.style.position = 'fixed';

        if (this.containerElement) {
            this.containerElement.appendChild(container);

            if (this.options && this.options.selectedValueChanged) {
                const selectedElement = container.querySelector('.selected');

                if (selectedElement !== null && selectedElement !== undefined) {
                    const index = Array.from(container.children).indexOf(selectedElement);
                    this.options.selectedValueChanged(this.contextActions?.[index]);
                } else {
                    this.options.selectedValueChanged(undefined);
                }
            }
        }
    }

    protected updateValues(update: (items: AutoCompleteValue[]) => void, text: string, root: Readonly<SModelRootImpl>, ...contextElementIds: string[]): void {
        this.onLoading();

        this.doUpdateValues(text, root)
            .then(actions => {
                this.contextActions = this.filterActions(text, actions);
                update(this.contextActions);
                this.options?.visibleValuesChanged?.(this.contextActions);
                this.onLoaded('success');
            })
            .catch(reason => {
                this.onLoaded('error');
            });
    }

    protected onLoading(): void {
        if (this.loadingIndicator && this.containerElement.contains(this.loadingIndicator))
            return;

        this.loadingIndicator = document.createElement('span');
        this.loadingIndicator.classList.add(...this.loadingIndicatorClasses);
        this.containerElement.appendChild(this.loadingIndicator);
    }

    protected doUpdateValues(text: string, root: Readonly<SModelRootImpl>, ...contextElementIds: string[]): Promise<AutoCompleteValue[]> {
        return this.valueProvider.provideValues(text);
    }

    protected onLoaded(_success: 'success' | 'error'): void {
        if (this.containerElement.contains(this.loadingIndicator))
            this.containerElement.removeChild(this.loadingIndicator);

        this.previousContent = this.inputElement.value;
    }

    protected renderValues(item: AutoCompleteValue, value: string): HTMLDivElement {
        const itemElement = document.createElement('div');
        const wordMatcher = this.escapeForRegExp(value).split(' ').join('|');
        const regex = new RegExp(wordMatcher, 'gi');

        itemElement.innerHTML += item.label.replace(regex, match => '<em>' + match + '</em>').replace(/ /g, '&nbsp;');
        return itemElement;
    }

    protected escapeForRegExp(value: string): string {
        return value.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }

    protected renderIcon(itemElement: HTMLDivElement, icon: string): void {
        itemElement.innerHTML += `<span class='icon ${icon}'></span>`;
    }

    protected filterActions(filterText: string, actions: AutoCompleteValue[]): AutoCompleteValue[] {
        return toArray(
            actions.filter(action => {
                const label = action.label.toLowerCase();
                const searchWords = filterText.split(' ');
                return searchWords.every(word => label.indexOf(word.toLowerCase()) !== -1);
            })
        );
    }

    protected onSelect(item: AutoCompleteValue): void {
        this.executeFromValue(item);
    }

    protected isValueAvailable(): boolean | undefined {
        return this.contextActions && this.contextActions.length > 0;
    }

    protected executeFromValue(input: AutoCompleteValue): void {
        this.valueSubmitHandler.executeFromValue(input);
    }

    protected executeFromTextOnlyInput(): void {
        if (this.textSubmitHandler) {
            this.textSubmitHandler.executeFromTextOnlyInput(this.inputElement.value);
        }
    }
}