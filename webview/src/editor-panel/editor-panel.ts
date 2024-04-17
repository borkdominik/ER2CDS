import { AbstractUIExtension, ActionDispatcher, codiconCSSClasses, IActionHandler, ICommand, SetUIExtensionVisibilityAction, TYPES } from 'sprotty';
import { inject, injectable } from 'inversify';
import { Action } from 'sprotty-protocol';
import { EnableEditorPanelAction } from './actions';
import { PropertyPalette } from '../property-palette/property-palette';

export interface EditorPanelChild {
    id: string;
    tabLabel: string;
    class: string;
    prepare?: () => Promise<void>;
    initializeContents: (containerElement: HTMLElement) => void;
}

@injectable()
export class EditorPanel extends AbstractUIExtension implements IActionHandler {
    static readonly ID = 'editor-panel';

    @inject(TYPES.IActionDispatcher)
    protected readonly actionDispatcher: ActionDispatcher;

    @inject(PropertyPalette)
    protected readonly propertyPalette: PropertyPalette;

    protected header: HTMLElement;
    protected body: HTMLElement;
    protected collapseButton: HTMLButtonElement;

    get isCollapsed(): boolean {
        return this.body.style.display === 'none';
    }

    id(): string {
        return EditorPanel.ID;
    }

    containerClass(): string {
        return EditorPanel.ID;
    }

    handle(action: Action): ICommand | Action | void {
        console.log(action);
        if (action.kind === EnableEditorPanelAction.KIND) {
            this.actionDispatcher.dispatch(SetUIExtensionVisibilityAction.create({ extensionId: EditorPanel.ID, visible: true }));
        }
    }

    toggle(): void {
        if (this.isCollapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    collapse(): void {
        if (!this.isCollapsed) {
            this.body.style.display = 'none';
            this.collapseButton.firstElementChild?.classList.remove('codicon-chevron-down');
            this.collapseButton.firstElementChild?.classList.add('codicon-chevron-up');
        }
    }

    expand(): void {
        if (this.isCollapsed) {
            this.body.style.display = 'flex';
            this.collapseButton.firstElementChild?.classList.add('codicon-chevron-down');
            this.collapseButton.firstElementChild?.classList.remove('codicon-chevron-up');
        }
    }

    protected initializeContents(containerElement: HTMLElement): void {
        console.log("INIT CONTENTS");

        containerElement.tabIndex = 0;

        this.initializeHeader();
        this.initializeBody();

        this.collapse();
    }

    protected initializeHeader(): void {
        const header = document.createElement('div');
        header.classList.add(`${EditorPanel.ID}-header`);
        header.addEventListener('click', event => {
            event.stopPropagation();
            this.toggle();
        });


        const tab = document.createElement('div');
        tab.classList.add(`${EditorPanel.ID}-tab-header`, 'active');
        tab.innerText = this.propertyPalette.tabLabel;
        tab.addEventListener('click', event => {
            event.stopPropagation();
        });

        header.appendChild(tab);


        const collapse = document.createElement('button');
        collapse.classList.add(`${EditorPanel.ID}-collapse`);
        collapse.appendChild(createIcon('chevron-down'));
        collapse.addEventListener('click', event => {
            event.stopPropagation();
            this.toggle();
        });
        header.appendChild(collapse);

        this.header = header;
        this.collapseButton = collapse;
        this.containerElement.appendChild(header);
    }

    protected initializeBody(): void {
        const body = document.createElement('div');
        body.classList.add(`${EditorPanel.ID}-body`);

        this.body = body;
        this.containerElement.appendChild(body);

        this.initializeChild(this.propertyPalette);
    }

    protected async initializeChild(child: EditorPanelChild): Promise<void> {
        this.body.innerHTML = '';

        const content = document.createElement('div');
        content.classList.add(`${EditorPanel.ID}-content`, child.class);

        await child.prepare?.();
        child.initializeContents(content);

        this.body.appendChild(content);
    }
}

function createIcon(codiconId: string): HTMLElement {
    const icon = document.createElement('i');
    icon.classList.add(...codiconCSSClasses(codiconId));
    return icon;
}