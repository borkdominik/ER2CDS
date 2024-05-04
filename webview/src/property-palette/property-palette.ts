import { injectable, inject, postConstruct } from 'inversify';
import { IActionHandler, TYPES, ActionDispatcher, ICommand, SModelRootImpl, ModelIndexImpl, SLabelImpl, SCompartmentImpl, SModelElementImpl } from 'sprotty';
import { createIcon } from '../tool-palette/tool-palette';
import { createBoolProperty } from './bool/bool.creator';
import { ElementBoolPropertyItem } from './bool/bool.model';
import { createChoiceProperty } from './choice/choice.creator';
import { ElementChoicePropertyItem } from './choice/choice.model';
import { createReferenceProperty } from './reference/reference.creator';
import { ElementReferencePropertyItem } from './reference/reference.model';
import { createTextProperty } from './text/text.creator';
import { ElementTextPropertyItem } from './text/text.model';
import { Action, SelectAction } from 'sprotty-protocol';
import { EditorPanelChild } from '../editor-panel/editor-panel';
import { AutoCompleteValue, CreateAttributeAction, DeleteElementAction, RequestAutoCompleteAction, UpdateElementPropertyAction } from '../actions';
import { DiagramEditorService } from '../services/diagram-editor-service';
import { DATATYPES, EntityNode, RelationshipNode } from '../model';
import { AutoCompleteWidget } from './auto-complete/auto-complete-widget';
import { ElementAutoCompletePropertyItem } from './auto-complete/auto-complete.model';
import { createAutoCompleteProperty } from './auto-complete/auto-complete.creator';

export interface Cache {
    [elementId: string]: {
        [propertyId: string]: any;
    };
}

export interface PropertyPaletteModel {
    elementId: string;
    label?: string;
    items: ElementPropertyItem[];
}

export interface ElementPropertyItem {
    elementId: string;
    propertyId: string;
    type: 'TEXT' | 'BOOL' | 'CHOICE' | 'REFERENCE' | 'AUTO_COMPLETE';
}

export interface CreatedElementProperty {
    element: HTMLElement;
    ui: ElementPropertyUI;
}

export interface ElementPropertyUI {
    enable: () => void;
    disable: () => void;
}


@injectable()
export class PropertyPalette implements IActionHandler, EditorPanelChild {
    static readonly ID = 'property-palette';

    protected palette: PropertyPaletteModel;
    protected lastPalettes: PropertyPaletteModel[] = [];
    protected cache: Cache = {};
    protected activeElementId?: string;
    protected uiElements: ElementPropertyUI[] = [];
    protected containerElement: HTMLElement;
    protected header: HTMLElement;
    protected content: HTMLElement;
    protected root: SModelRootImpl;

    @inject(TYPES.IActionDispatcher)
    protected readonly actionDispatcher: ActionDispatcher;

    @inject(DiagramEditorService)
    protected diagramEditorService: DiagramEditorService;

    @postConstruct()
    protected initialize() {
        this.diagramEditorService.onModelRootChanged(r => this.modelRootChanged(r));
    }

    handle(action: Action): ICommand | Action | void {
        if (action.kind === SelectAction.KIND && (action as SelectAction).selectedElementsIDs && (action as SelectAction).selectedElementsIDs.length > 0) {
            this.refresh((action as SelectAction).selectedElementsIDs[0]);
            this.content.scrollTop = 0;
        }
    }

    modelRootChanged(root: Readonly<SModelRootImpl>): void {
        this.root = root;
        this.refresh();
        this.enable();
    }

    initializeContents(containerElement: HTMLElement): void {
        this.containerElement = containerElement;

        this.initializeHeader();
        this.initializeBody();

        this.refreshUi(this.palette);
    }

    get id(): string {
        return PropertyPalette.ID;
    }

    get tabLabel(): string {
        return 'Properties';
    }

    get class(): string {
        return PropertyPalette.ID;
    }

    protected initializeHeader(): void {
        const header = document.createElement('div');
        header.classList.add(`${PropertyPalette.ID}-header`);

        this.header = header;
        this.containerElement.appendChild(header);
    }

    protected initializeBody(): void {
        const content = document.createElement('div');
        content.classList.add(`${PropertyPalette.ID}-content`);

        this.content = content;
        this.containerElement.appendChild(content);
    }

    protected refresh(elementId?: string): PropertyPaletteModel {
        this.activeElementId = elementId ?? this.activeElementId;

        const modelIndex = new ModelIndexImpl();
        modelIndex.add(this.diagramEditorService.getModelRoot());

        const element = modelIndex.getById(this.activeElementId);

        const propertyPaletteItems = [];

        // Entity
        if (element instanceof EntityNode) {
            this.initializeEntityPropertyPaletteItems(element, propertyPaletteItems);
        }

        // Relationship
        if (element instanceof RelationshipNode) {
            this.initializeRelationshipPropertyPaletteItems(element, propertyPaletteItems);
        }

        // Attributes
        if (element instanceof SCompartmentImpl && element.parent && (element.parent as SCompartmentImpl).parent && (element.parent as SCompartmentImpl).parent instanceof EntityNode) {
            this.initializeAttributesPropertyPaletteItems(element, propertyPaletteItems);
        }

        this.palette = <PropertyPaletteModel>{
            elementId: this.activeElementId,
            label: this.activeElementId,
            items: propertyPaletteItems
        };

        if (!this.palette) {
            if (this.cache[this.palette.elementId] === undefined) {
                this.cache = {};
                this.cache[this.palette.elementId] = {};
            }
        } else {
            this.cache = {};
        }

        this.refreshUi(this.palette);

        return this.palette;
    }

    protected refreshUi(palette?: PropertyPaletteModel): void {
        if (this.containerElement === undefined)
            return;

        this.header.innerHTML = '';
        this.content.innerHTML = '';

        if (palette === undefined) {
            setTextPlaceholder(this.header, 'Properties not available.');
        } else {
            this.refreshHeader(palette);
            this.refreshContent(palette.items);
        }
    }

    protected refreshHeader(palette: PropertyPaletteModel): void {
        if (palette.label !== undefined) {
            const breadcrumbs = document.createElement('span');
            breadcrumbs.classList.add('property-palette-breadcrumbs');

            const lastPalettes = this.lastPalettes;

            if (lastPalettes.length > 0) {
                const backButton = document.createElement('button');
                backButton.classList.add('property-palette-back');
                backButton.appendChild(createIcon('chevron-left'));
                backButton.addEventListener('click', async () => {
                    const returnTo = lastPalettes.pop();
                    this.refresh(returnTo?.elementId);
                });

                this.header.appendChild(backButton);

                const items = Array.from(new Set([lastPalettes[0], lastPalettes[lastPalettes.length - 1]]));
                if (items.length === 1) {
                    breadcrumbs.textContent = `${items[0].label} > `;
                } else {
                    breadcrumbs.textContent = `${items[0].label} > ... > ${items[1].label} > `;
                }
            }

            breadcrumbs.textContent = `${breadcrumbs.textContent}${palette.label}`;

            this.header.appendChild(breadcrumbs);
        }
    }

    protected refreshContent(items: ElementPropertyItem[]): void {
        this.content.innerHTML = '';
        this.uiElements = [];

        if (items !== undefined && items.length > 0) {
            for (const propertyItem of items) {
                let created: CreatedElementProperty | undefined = undefined;

                if (ElementTextPropertyItem.is(propertyItem)) {
                    created = createTextProperty(propertyItem, {
                        onBlur: async (item, input) => {
                            await this.update(item.elementId, item.propertyId, input.value);

                            if (item.label === 'Name') {
                                if (item.elementId === item.text) {
                                    this.activeElementId = input.value;
                                } else {
                                    this.activeElementId = item.elementId;
                                }

                                this.lastPalettes = [];
                            }
                        },
                        onEnter: async (item, input) => {
                            await this.update(item.elementId, item.propertyId, input.value);

                            if (item.label === 'Name') {
                                if (item.elementId === item.text) {
                                    this.activeElementId = input.value;
                                } else {
                                    this.activeElementId = item.elementId;
                                }

                                this.lastPalettes = [];
                            }
                        }
                    });
                } else if (ElementAutoCompletePropertyItem.is(propertyItem)) {
                    created = createAutoCompleteProperty(propertyItem, this.root);

                } else if (ElementBoolPropertyItem.is(propertyItem)) {
                    created = createBoolProperty(propertyItem, {
                        onChange: (item, input) => {
                            this.update(item.elementId, item.propertyId, input.checked + '');
                        }
                    });
                } else if (ElementChoicePropertyItem.is(propertyItem)) {
                    created = createChoiceProperty(propertyItem, {
                        onChange: (item, input) => {
                            this.update(item.elementId, item.propertyId, input.value);
                        }
                    });
                } else if (ElementReferencePropertyItem.is(propertyItem)) {
                    created = createReferenceProperty(
                        propertyItem,
                        {
                            onCreate: async (item, create) => {
                                this.disable();
                                await this.actionDispatcher.dispatch(create.action);
                                this.enable();
                            },
                            onDelete: async (item, selectedReferences) => {
                                if (selectedReferences.length > 0) {
                                    this.disable();
                                    await this.actionDispatcher.dispatch(DeleteElementAction.create(selectedReferences.map(r => r.reference.elementId)));
                                    this.enable();
                                }
                            },
                            onNavigate: async (item, reference) => {
                                this.lastPalettes.push(this.palette!);
                                this.refresh(reference.elementId);
                                this.content.scrollTop = 0;
                            },
                            onMove: async (item, selectedReferences, direction, state) => {
                                const updates: {
                                    oldPosition: number;
                                    newPosition: number;
                                }[] = [];

                                selectedReferences.forEach(r => {
                                    updates.push({
                                        oldPosition: r.originIndex,
                                        newPosition: direction === 'UP' ? --r.originIndex : ++r.originIndex
                                    });
                                });

                                if (selectedReferences.length > 0) {
                                    this.cache[item.elementId][item.propertyId] = state;
                                    this.update(item.elementId, `${item.propertyId}_ORDER`, JSON.stringify(updates));
                                }
                            }
                        },
                        this.cache[propertyItem.elementId]?.[propertyItem.propertyId]
                    );
                }

                if (created !== undefined) {
                    this.content.appendChild(created.element);
                    this.uiElements.push(created.ui);
                }
            }
        } else {
            setTextPlaceholder(this.content, 'No properties provided.');
        }
    }

    protected disable(): void {
        this.uiElements.forEach(element => element.disable());
    }

    protected enable(): void {
        this.uiElements.forEach(element => element.enable());
    }

    protected initializeEntityPropertyPaletteItems(element: SModelElementImpl, propertyPaletteItems: ElementPropertyItem[]) {
        const entity = element as EntityNode;

        const nameAutoComplete = new AutoCompleteWidget(
            { provideValues: input => this.retrieveSuggestionsEntity(entity.id, entity.children[0].id, input) },
            { executeFromValue: input => this.executeFromSuggestionEntity(entity.id, entity.children[0].id, input) },
            { executeFromTextOnlyInput: input => this.executeFromTextOnlyInputEntity(entity.id, entity.children[0].id, input) }
        );

        const entityNamePaletteItem = <ElementAutoCompletePropertyItem>{
            type: ElementAutoCompletePropertyItem.TYPE,
            elementId: entity.id,
            propertyId: entity.children[0].id,
            label: 'Name',
            value: (entity.children[0].children[0] as SLabelImpl).text,
            autoComplete: nameAutoComplete
        };
        propertyPaletteItems.push(entityNamePaletteItem);

        const entityAttributesPaletteItems = <ElementReferencePropertyItem>{
            type: ElementReferencePropertyItem.TYPE,
            elementId: entity.id,
            isOrderable: false,
            label: 'Attributes',
            references: entity.children[1].children.map(c => ({ elementId: c.id, label: c.id, isReadonly: false }) as ElementReferencePropertyItem.Reference),
            creates: [({ label: 'Create Attribute', action: CreateAttributeAction.create(entity.id) }) as ElementReferencePropertyItem.CreateReference]
        }
        propertyPaletteItems.push(entityAttributesPaletteItems);
    }

    protected initializeRelationshipPropertyPaletteItems(element: SModelElementImpl, propertyPaletteItems: ElementPropertyItem[]) {
        const relationship = element as RelationshipNode;

        const relationshipNamePaletteItem = <ElementTextPropertyItem>{
            type: ElementTextPropertyItem.TYPE,
            elementId: relationship.id,
            propertyId: relationship.children[0].id,
            label: 'Name',
            text: (relationship.children[0] as SLabelImpl).text
        }
        propertyPaletteItems.push(relationshipNamePaletteItem);
    }

    protected initializeAttributesPropertyPaletteItems(element: SCompartmentImpl, propertyPaletteItems: ElementPropertyItem[]) {
        const entity = (element.parent as SCompartmentImpl).parent as EntityNode;

        if (element.children.length > 1) {
            const nameAutoComplete = new AutoCompleteWidget(
                { provideValues: input => this.retrieveSuggestionsAttribute(entity.id, element.children[0].id, input) },
                { executeFromValue: input => this.executeFromSuggestionAttribute(entity.id, element.children[0].id, input) },
                { executeFromTextOnlyInput: input => this.executeFromTextOnlyInputAttribute(entity.id, element.children[0].id, input) }
            );

            const entityAttributeNamePaletteItem = <ElementAutoCompletePropertyItem>{
                type: ElementAutoCompletePropertyItem.TYPE,
                elementId: entity.id,
                propertyId: element.children[0].id,
                label: 'Name',
                value: (element.children[0] as SLabelImpl).text,
                autoComplete: nameAutoComplete
            };
            propertyPaletteItems.push(entityAttributeNamePaletteItem);

            const entityAttributeDatatypePaletteItem = <ElementChoicePropertyItem>{
                type: ElementChoicePropertyItem.TYPE,
                elementId: entity.id,
                propertyId: element.children[2].id,
                label: 'Datatype',
                choice: (element.children[2] as SLabelImpl).text,
                choices: DATATYPES
            }
            propertyPaletteItems.push(entityAttributeDatatypePaletteItem);
        }
    }

    protected async update(elementId: string, propertyId: string, value: string): Promise<void> {
        this.disable();

        return this.actionDispatcher.dispatch(UpdateElementPropertyAction.create(elementId, propertyId, value));
    }

    protected async retrieveSuggestionsEntity(elementId: string, propertyId: string, input: string): Promise<AutoCompleteValue[]> {
        const response = await this.actionDispatcher.request(RequestAutoCompleteAction.create(elementId, input));
        return response.values;
    }

    protected executeFromSuggestionEntity(elementId: string, propertyId: string, input: AutoCompleteValue): void {
        this.update(elementId, propertyId, input.label);

        this.activeElementId = input.label;
        this.lastPalettes = [];
    }

    protected executeFromTextOnlyInputEntity(elementId: string, propertyId: string, input: string): void {
        this.update(elementId, propertyId, input);

        this.activeElementId = input;
        this.lastPalettes = [];
    }

    protected async retrieveSuggestionsAttribute(elementId: string, propertyId: string, input: string): Promise<AutoCompleteValue[]> {
        const attributeId = propertyId.substring(0, propertyId.lastIndexOf('.'));
        const response = await this.actionDispatcher.request(RequestAutoCompleteAction.create(attributeId, input));
        return response.values;
    }

    protected executeFromSuggestionAttribute(elementId: string, propertyId: string, input: AutoCompleteValue): void {
        this.update(elementId, propertyId, input.label);

        this.activeElementId = elementId;
        this.lastPalettes = [];
    }

    protected executeFromTextOnlyInputAttribute(elementId: string, propertyId: string, input: string): void {
        this.update(elementId, propertyId, input);

        this.activeElementId = elementId;
        this.lastPalettes = [];
    }
}

function setTextPlaceholder(container: HTMLElement, text: string): void {
    const div = document.createElement('div');

    div.textContent = text;

    container.innerHTML = '';
    container.appendChild(div);
}
