import { inject, injectable } from 'inversify';
import { AbstractUIExtension, IActionHandler, ICommand, codiconCSSClasses, ActionDispatcher, SModelRootImpl, TYPES } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { matchesKeystroke } from 'sprotty/lib/utils/keyboard';
import { ToolPaletteItem } from './tool-palette-item';
import { EnableToolsAction, EnableDefaultToolsAction } from './tool-palette-actions';
import { CreateEntityAction, CreateRelationshipAction } from '../actions';

const CLICKED_CSS_CLASS = 'clicked';
const SEARCH_ICON_ID = 'search';
const PALETTE_ICON_ID = 'symbol-color';
const CHEVRON_DOWN_ICON_ID = 'chevron-right';
const PALETTE_HEIGHT = '500px';

@injectable()
export class ToolPalette extends AbstractUIExtension implements IActionHandler {
    public static readonly ID = 'tool-palette';

    private paletteItems: ToolPaletteItem[] = [];
    private paletteItemsCopy: ToolPaletteItem[] = [];

    private bodyDiv?: HTMLElement;

    private lastActiveButton?: HTMLElement;
    private defaultToolsButton: HTMLElement;

    private searchField: HTMLInputElement;

    @inject(TYPES.IActionDispatcher)
    private actionDispatcher: ActionDispatcher;

    id(): string {
        return ToolPalette.ID;
    }

    containerClass(): string {
        return ToolPalette.ID;
    }

    show(root: Readonly<SModelRootImpl>, ...contextElementIds: string[]): void {
        super.show(root, ...contextElementIds);
    }

    hide(): void {
        super.hide();
    }

    handle(action: Action): ICommand | Action | void {
        this.changeActiveButton();
    }

    protected initializeContents(containerElement: HTMLElement): void {
        this.createToolPaletteHeader();

        this.initializeToolPaletteItems();
        this.createToolPaletteBody();

        this.lastActiveButton = this.defaultToolsButton;
        containerElement.setAttribute('aria-label', 'Tool-Palette');
    }

    private createToolPaletteHeader(): void {
        this.addMinimizePaletteButton();

        const headerCompartment = document.createElement('div');
        headerCompartment.classList.add('tool-palette-header');
        headerCompartment.append(this.createHeaderTitle());
        headerCompartment.appendChild(this.createHeaderTools());
        headerCompartment.appendChild((this.searchField = this.createHeaderSearchField()));

        this.containerElement.appendChild(headerCompartment);
    }

    private addMinimizePaletteButton(): void {
        const baseDiv = document.getElementById(this.options.baseDiv);
        const minPaletteDiv = document.createElement('div');

        minPaletteDiv.classList.add('minimize-palette-button');
        this.containerElement.classList.add('collapsible-palette');

        if (baseDiv) {
            const insertedDiv = baseDiv.insertBefore(minPaletteDiv, baseDiv.firstChild);
            const minimizeIcon = createIcon(CHEVRON_DOWN_ICON_ID);

            this.updateMinimizePaletteButtonTooltip(minPaletteDiv);
            minimizeIcon.onclick = _event => {
                if (this.isPaletteMaximized()) {
                    this.containerElement.style.maxHeight = '0px';
                } else {
                    this.containerElement.style.maxHeight = PALETTE_HEIGHT;
                }
                this.updateMinimizePaletteButtonTooltip(minPaletteDiv);
                changeCodiconClass(minimizeIcon, PALETTE_ICON_ID);
                changeCodiconClass(minimizeIcon, CHEVRON_DOWN_ICON_ID);
            };

            insertedDiv.appendChild(minimizeIcon);
        }
    }

    private updateMinimizePaletteButtonTooltip(button: HTMLDivElement): void {
        if (this.isPaletteMaximized()) {
            button.title = 'Minimize palette';
        } else {
            button.title = 'Maximize palette';
        }
    }

    private isPaletteMaximized(): boolean {
        return this.containerElement && this.containerElement.style.maxHeight !== '0px';
    }

    private createHeaderTitle(): HTMLElement {
        const header = document.createElement('div');
        header.classList.add('header-icon');
        header.appendChild(createIcon(PALETTE_ICON_ID));
        header.insertAdjacentText('beforeend', 'Palette');
        return header;
    }

    private createHeaderTools(): HTMLElement {
        const headerTools = document.createElement('div');
        headerTools.classList.add('header-tools');

        this.defaultToolsButton = this.createDefaultToolButton();
        headerTools.appendChild(this.defaultToolsButton);

        // const deleteToolButton = this.createMouseDeleteToolButton();
        // headerTools.appendChild(deleteToolButton);

        // const marqueeToolButton = this.createMarqueeToolButton();
        // headerTools.appendChild(marqueeToolButton);

        // const validateActionButton = this.createValidateButton();
        // headerTools.appendChild(validateActionButton);

        const searchIcon = this.createSearchButton();
        headerTools.appendChild(searchIcon);

        return headerTools;
    }

    private createDefaultToolButton(): HTMLElement {
        const button = createIcon('inspect');
        button.id = 'btn_default_tools';
        button.title = 'Enable selection tool';
        button.onclick = this.onClickStaticToolButton(button);
        button.ariaLabel = button.title;
        button.tabIndex = 1;
        return button;
    }

    private onClickStaticToolButton(button: HTMLElement, toolId?: string) {
        return (_ev: MouseEvent) => {
            const action = toolId ? EnableToolsAction.create([toolId]) : EnableDefaultToolsAction.create();
            this.actionDispatcher.dispatch(action);
            this.changeActiveButton(button);
            button.focus();
        };
    }

    private createHeaderSearchField(): HTMLInputElement {
        const searchField = document.createElement('input');
        searchField.classList.add('search-input');
        searchField.id = this.containerElement.id + '_search_field';
        searchField.type = 'text';
        searchField.placeholder = ' Search...';
        searchField.style.display = 'none';
        searchField.onkeyup = () => this.requestFilterUpdate(this.searchField.value);
        searchField.onkeydown = ev => this.clearOnEscape(ev);
        return searchField;
    }

    private createSearchButton(): HTMLElement {
        const searchIcon = createIcon(SEARCH_ICON_ID);
        searchIcon.onclick = _ev => {
            const searchField = document.getElementById(this.containerElement.id + '_search_field');
            if (searchField) {
                if (searchField.style.display === 'none') {
                    searchField.style.display = '';
                    searchField.focus();
                } else {
                    searchField.style.display = 'none';
                }
            }
        };
        searchIcon.classList.add('search-icon');
        searchIcon.title = 'Filter palette entries';
        searchIcon.ariaLabel = searchIcon.title;
        searchIcon.tabIndex = 1;
        return searchIcon;
    }


    // protected createMouseDeleteToolButton(): HTMLElement {
    //     const deleteToolButton = createIcon('chrome-close');
    //     deleteToolButton.title = 'Enable deletion tool';
    //     deleteToolButton.onclick = this.onClickStaticToolButton(deleteToolButton, MouseDeleteTool.ID);
    //     deleteToolButton.ariaLabel = deleteToolButton.title;
    //     deleteToolButton.tabIndex = 1;

    //     return deleteToolButton;
    // }

    // protected createMarqueeToolButton(): HTMLElement {
    //     const marqueeToolButton = createIcon('screen-full');
    //     marqueeToolButton.title = 'Enable marquee tool';
    //     marqueeToolButton.onclick = this.onClickStaticToolButton(marqueeToolButton, MarqueeMouseTool.ID);
    //     marqueeToolButton.ariaLabel = marqueeToolButton.title;
    //     marqueeToolButton.tabIndex = 1;

    //     return marqueeToolButton;
    // }

    // protected createValidateButton(): HTMLElement {
    //     const validateActionButton = createIcon('pass');
    //     validateActionButton.title = 'Validate model';
    //     validateActionButton.onclick = _event => {
    //         const modelIds: string[] = [this.modelRootId];
    //         this.actionDispatcher.dispatch(RequestMarkersAction.create(modelIds, { reason: MarkersReason.BATCH }));
    //         validateActionButton.focus();
    //     };

    //     validateActionButton.ariaLabel = validateActionButton.title;
    //     validateActionButton.tabIndex = 1;
    //     return validateActionButton;
    // }

    private initializeToolPaletteItems(): void {
        this.paletteItems = [];

        const nodeGroup: ToolPaletteItem = {
            id: 'tool-palette-nodes',
            label: 'Nodes',
            sortString: 'nodes',
            icon: 'symbol-property',
            children: [],
            actions: []
        }

        const addEntityItem: ToolPaletteItem = {
            id: 'tool-palette-add-entity',
            label: 'Add Entity',
            sortString: 'add-entity',
            icon: '',
            actions: [CreateEntityAction.create()]
        }
        nodeGroup.children.push(addEntityItem);

        const addRelationshipItem: ToolPaletteItem = {
            id: 'tool-palette-add-relationship',
            label: 'Add Relationship',
            sortString: 'add-relationship',
            icon: '',
            actions: [CreateRelationshipAction.create()]
        }
        nodeGroup.children.push(addRelationshipItem);

        this.paletteItems.push(nodeGroup);
    }

    private createToolPaletteBody(): void {
        const bodyDiv = document.createElement('div');
        bodyDiv.classList.add('tool-palette-body');

        let tabIndex = 0;
        this.paletteItems.sort(compare).forEach(item => {
            if (item.children) {
                const group = createToolGroup(item);
                item.children.sort(compare).forEach(child => group.appendChild(this.createToolButton(child, tabIndex++)));
                bodyDiv.appendChild(group);
            } else {
                bodyDiv.appendChild(this.createToolButton(item, tabIndex++));
            }
        });

        // Remove existing body to refresh filtered entries
        if (this.bodyDiv) {
            this.containerElement.removeChild(this.bodyDiv);
        }

        this.containerElement.appendChild(bodyDiv);
        this.bodyDiv = bodyDiv;
    }

    private createToolButton(item: ToolPaletteItem, index: number): HTMLElement {
        const button = document.createElement('div');
        button.tabIndex = index;
        button.classList.add('tool-button');
        if (item.icon) {
            button.appendChild(createIcon(item.icon));
        }
        button.insertAdjacentText('beforeend', item.label);
        button.onclick = this.onClickCreateToolButton(button, item);
        button.onkeydown = ev => this.clearOnEscape(ev);
        return button;
    }

    private onClickCreateToolButton(button: HTMLElement, item: ToolPaletteItem) {
        return (_ev: MouseEvent) => {
            this.actionDispatcher.dispatchAll(item.actions);
            this.changeActiveButton(button);
            button.focus();
        };
    }

    private changeActiveButton(button?: HTMLElement): void {
        if (this.lastActiveButton) {
            this.lastActiveButton.classList.remove(CLICKED_CSS_CLASS);
        }
        if (button) {
            button.classList.add(CLICKED_CSS_CLASS);
            this.lastActiveButton = button;
        } else if (this.defaultToolsButton) {
            this.defaultToolsButton.classList.add(CLICKED_CSS_CLASS);
            this.lastActiveButton = this.defaultToolsButton;
        }
    }

    private clearOnEscape(event: KeyboardEvent): void {
        if (matchesKeystroke(event, 'Escape')) {
            this.searchField.value = '';
            this.requestFilterUpdate('');
        }
    }

    private requestFilterUpdate(filter: string): void {
        // Initialize the copy if it's empty
        if (this.paletteItemsCopy.length === 0) {
            // Creating deep copy
            this.paletteItemsCopy = JSON.parse(JSON.stringify(this.paletteItems));
        }

        // Reset the paletteItems before searching
        this.paletteItems = JSON.parse(JSON.stringify(this.paletteItemsCopy));

        if (filter !== '') {
            // Filter the entries
            const filteredPaletteItems: ToolPaletteItem[] = [];
            for (const itemGroup of this.paletteItems) {
                if (itemGroup.children) {
                    // Fetch the labels according to the filter
                    const matchingChildren = itemGroup.children.filter(child => child.label.toLowerCase().includes(filter.toLowerCase()));
                    // Add the itemgroup containing the correct entries
                    if (matchingChildren.length > 0) {
                        // Clear existing children
                        itemGroup.children.splice(0, itemGroup.children.length);
                        // Push the matching children
                        matchingChildren.forEach(child => itemGroup.children!.push(child));
                        filteredPaletteItems.push(itemGroup);
                    }
                }
            }

            this.paletteItems = filteredPaletteItems;
        }

        this.createToolPaletteBody();
    }
}

export function compare(a: ToolPaletteItem, b: ToolPaletteItem): number {
    const sortStringBased = a.sortString.localeCompare(b.sortString);
    if (sortStringBased !== 0) {
        return sortStringBased;
    }
    return a.label.localeCompare(b.label);
}

export function createIcon(codiconId: string): HTMLElement {
    const icon = document.createElement('i');
    icon.classList.add(...codiconCSSClasses(codiconId));
    return icon;
}

export function createToolGroup(item: ToolPaletteItem): HTMLElement {
    const group = document.createElement('div');
    group.classList.add('tool-group');
    group.id = item.id;

    const header = document.createElement('div');
    header.classList.add('group-header');

    if (item.icon) {
        header.appendChild(createIcon(item.icon));
    }

    header.insertAdjacentText('beforeend', item.label);
    header.ondblclick = _ev => {
        const css = 'collapsed';
        changeCSSClass(group, css);
        Array.from(group.children).forEach(child => changeCSSClass(child, css));
        window!.getSelection()!.removeAllRanges();
    };

    group.appendChild(header);
    return group;
}

export function changeCSSClass(element: Element, css: string): void {
    // eslint-disable-next-line chai-friendly/no-unused-expressions
    element.classList.contains(css) ? element.classList.remove(css) : element.classList.add(css);
}

export function changeCodiconClass(element: Element, codiconId: string): void {
    // eslint-disable-next-line chai-friendly/no-unused-expressions
    element.classList.contains(codiconCSSClasses(codiconId)[1])
        ? element.classList.remove(codiconCSSClasses(codiconId)[1])
        : element.classList.add(codiconCSSClasses(codiconId)[1]);
}