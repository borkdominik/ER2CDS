import { injectable, inject, postConstruct } from 'inversify';
import { IActionHandler, TYPES, ActionDispatcher, ICommand, SModelRootImpl, ModelIndexImpl, SLabelImpl, SCompartmentImpl, SChildElementImpl } from 'sprotty';
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
import { CreateAttributeAction, DeleteElementAction, UpdateElementPropertyAction } from '../actions';
import { DiagramEditorService } from '../services/diagram-editor-service';
import { DATATYPES, EntityNode } from '../model';

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
    type: 'TEXT' | 'BOOL' | 'CHOICE' | 'REFERENCE';
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
            const entity = element as EntityNode;

            if (entity.children.length > 0) {
                const entityNamePaletteItem = <ElementTextPropertyItem>{
                    type: ElementTextPropertyItem.TYPE,
                    elementId: entity.id,
                    propertyId: entity.children[0].id,
                    label: 'Name',
                    text: (entity.children[0].children[0] as SLabelImpl).text
                }

                propertyPaletteItems.push(entityNamePaletteItem);
            }

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

        // Attributes
        if (element instanceof SCompartmentImpl && element.parent && (element.parent as SCompartmentImpl).parent && (element.parent as SCompartmentImpl).parent instanceof EntityNode) {
            const entity = (element.parent as SCompartmentImpl).parent as EntityNode;

            if (element.children.length > 1) {
                const entityAttributePaletteItem = <ElementTextPropertyItem>{
                    type: ElementTextPropertyItem.TYPE,
                    elementId: entity.id,
                    propertyId: element.children[0].id,
                    label: 'Name',
                    text: (element.children[0] as SLabelImpl).text
                }

                propertyPaletteItems.push(entityAttributePaletteItem);

                const entityAttributeDatatypePaletteItem = <ElementChoicePropertyItem>{
                    type: ElementChoicePropertyItem.TYPE,
                    elementId: entity.id,
                    propertyId: element.children[2].id,
                    label: 'Datatype',
                    choice: (element.children[2] as SLabelImpl).text,
                    choices: DATATYPES
                }

                propertyPaletteItems.push(entityAttributeDatatypePaletteItem);

                // const entityAttributeTypePaletteItem = <ElementChoicePropertyItem>{
                //     type: ElementChoicePropertyItem.TYPE,
                //     elementId: element.id,
                //     propertyId: element.children[3].id,
                //     label: 'Type',
                //     choice: (element.children[3] as SLabelImpl).text,
                //     choices: ATTRIBUTE_TYPES
                // }

                // propertyPaletteItems.push(entityAttributeTypePaletteItem);
            }
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
            console.log(this.lastPalettes);

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

                            if (item.elementId + '.header-comp' === item.propertyId) {
                                this.activeElementId = input.value;
                            } else {
                                this.activeElementId = item.elementId;
                                this.lastPalettes = [];
                            }
                        },
                        onEnter: async (item, input) => {
                            await this.update(item.elementId, item.propertyId, input.value);

                            if (item.elementId + '.header-comp' === item.propertyId) {
                                this.activeElementId = input.value;
                            } else {
                                this.activeElementId = item.elementId;
                                this.lastPalettes = [];
                            }
                        }
                    });
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

    protected async update(elementId: string, propertyId: string, value: string): Promise<void> {
        this.disable();

        return this.actionDispatcher.dispatch(UpdateElementPropertyAction.create(elementId, propertyId, value));
    }

    protected disable(): void {
        this.uiElements.forEach(element => element.disable());
    }

    protected enable(): void {
        this.uiElements.forEach(element => element.enable());
    }
}

function setTextPlaceholder(container: HTMLElement, text: string): void {
    const div = document.createElement('div');

    div.textContent = text;

    container.innerHTML = '';
    container.appendChild(div);
}
