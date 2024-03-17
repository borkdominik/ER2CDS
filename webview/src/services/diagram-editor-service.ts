import { inject, injectable } from 'inversify';
import { Command, CommandExecutionContext, ILogger, ModelIndexImpl, SModelElementImpl, SModelRootImpl, TYPES, isSelectable, SParentElementImpl, SChildElementImpl, InitializeCanvasBoundsCommand } from 'sprotty';
import { Action, SetModelAction, SelectAction, SelectAllAction, Selectable } from 'sprotty-protocol'

@injectable()
export class DiagramEditorService {
    protected root: SModelRootImpl;
    protected modelIndex: ModelIndexImpl;
    protected selectedElementIDs: Set<string> = new Set();

    @inject(TYPES.ILogger)
    protected logger: ILogger;

    modelRootChanged(root: Readonly<SModelRootImpl>): void {
        this.updateSelection(root, [], []);
    }

    updateSelection(newRoot: Readonly<SModelRootImpl>, select: string[], deselect: string[]): void {
        if (newRoot === undefined && select.length === 0 && deselect.length === 0) {
            return;
        }

        const prevRoot = this.root;
        const prevSelectedElementIDs = new Set(this.selectedElementIDs);

        this.root = newRoot;

        const prevModelIndex = new ModelIndexImpl();
        prevModelIndex.add(prevRoot);

        this.modelIndex = new ModelIndexImpl();
        this.modelIndex.add(this.root);

        // We only select elements that are not part of the deselection
        const toSelect = [...select].filter(selectId => deselect.indexOf(selectId) === -1);

        // We only need to deselect elements that are not part of the selection
        // If an element is part of both the select and deselect, it's state is not changed
        const toDeselect = [...deselect].filter(deselectId => select.indexOf(deselectId) === -1 && this.selectedElementIDs.has(deselectId));

        toDeselect.forEach(toDeselectId => this.selectedElementIDs.delete(toDeselectId));
        toSelect.forEach(toSelectId => this.selectedElementIDs.add(toSelectId));

        // check if the newly or previously selected elements still exist in the updated root
        const deselectedElementIDs = new Set(toDeselect);
        for (const id of this.selectedElementIDs) {
            const element = this.modelIndex.getById(id);
            if (element === undefined) {
                this.selectedElementIDs.delete(id);

                if (prevModelIndex.getById(id))
                    deselectedElementIDs.add(id);
            }
        }
    }

    getModelRoot(): Readonly<SModelRootImpl> {
        return this.root;
    }

    getSelectedElements(): Readonly<SModelElementImpl>[] {
        return Array.from(this.selectedElementIDs).map(id => this.modelIndex.getById(id)).filter(e => e !== undefined && isSelectable(e));
    }

    getSelectedElementIDs(): string[] {
        return [...this.selectedElementIDs];
    }

    hasSelectedElements(): boolean {
        return this.selectedElementIDs.size > 0;
    }

    isSingleSelection(): boolean {
        return this.selectedElementIDs.size === 1;
    }

    isMultiSelection(): boolean {
        return this.selectedElementIDs.size > 1;
    }
}

@injectable()
export class SetModelCommand extends Command {
    static readonly KIND = SetModelAction.KIND;

    protected oldRoot: SModelRootImpl;
    protected newRoot: SModelRootImpl;

    constructor(
        @inject(TYPES.Action) protected readonly action: SetModelAction,
        @inject(DiagramEditorService) public selectionService: DiagramEditorService
    ) {
        super();
    }

    execute(context: CommandExecutionContext): SModelRootImpl {
        this.oldRoot = context.modelFactory.createRoot(context.root);
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot);

        this.selectionService.modelRootChanged(this.newRoot);
        return this.newRoot;
    }

    undo(context: CommandExecutionContext): SModelRootImpl {
        return this.oldRoot;
    }

    redo(context: CommandExecutionContext): SModelRootImpl {
        return this.newRoot;
    }

    get blockUntil(): (action: Action) => boolean {
        return action => action.kind === InitializeCanvasBoundsCommand.KIND;
    }
}

@injectable()
export class SelectCommand extends Command {
    static readonly KIND = SelectAction.KIND;

    protected selected: (SChildElementImpl & Selectable)[] = [];
    protected deselected: (SChildElementImpl & Selectable)[] = [];

    constructor(
        @inject(TYPES.Action) protected readonly action: SelectAction,
        @inject(DiagramEditorService) public selectionService: DiagramEditorService
    ) {
        super();
    }

    execute(context: CommandExecutionContext): SModelRootImpl {
        const model = context.root;

        const selectedElementIds = this.action.selectedElementsIDs.map(id => model.index.getById(id)).filter(e => e !== undefined && isSelectable(e)).map(e => e.id);
        const deselectedElementIds = this.action.deselectedElementsIDs.map(id => model.index.getById(id)).filter(e => e !== undefined && isSelectable(e)).map(e => e.id);

        this.selectionService.updateSelection(model, selectedElementIds, deselectedElementIds);
        return model;
    }

    undo(context: CommandExecutionContext): SModelRootImpl {
        for (const element of this.selected) {
            element.selected = false;
        }
        for (const element of this.deselected) {
            element.selected = true;
        }
        return context.root;
    }

    redo(context: CommandExecutionContext): SModelRootImpl {
        for (const element of this.deselected) {
            element.selected = false;
        }
        for (const element of this.selected) {
            element.selected = true;
        }
        return context.root;
    }
}

@injectable()
export class SelectAllCommand extends Command {
    static readonly KIND = SelectAllAction.KIND;

    protected previousSelection: Map<string, boolean> = new Map<string, boolean>();

    constructor(
        @inject(TYPES.Action) public action: SelectAllAction,
        @inject(DiagramEditorService) public selectionService: DiagramEditorService
    ) {
        super();
    }

    execute(context: CommandExecutionContext): SModelRootImpl {
        const model = context.root;

        const selectableIds = Array.from(model.index.all().filter((element: any): element is SModelElementImpl => isSelectable(element))).map(e => e.id);

        if (this.action.select) {
            this.selectionService.updateSelection(model, selectableIds, []);
        } else {
            this.selectionService.updateSelection(model, [], selectableIds);
        }

        return model;
    }

    undo(context: CommandExecutionContext): SModelRootImpl {
        const index = context.root.index;
        Object.keys(this.previousSelection).forEach(id => {
            const element = index.getById(id);
            if (element !== undefined && isSelectable(element))
                element.selected = this.previousSelection[id];
        });
        return context.root;
    }

    redo(context: CommandExecutionContext): SModelRootImpl {
        this.selectAll(context.root, this.action.select);
        return context.root;
    }

    protected selectAll(element: SParentElementImpl, newState: boolean): void {
        if (isSelectable(element)) {
            this.previousSelection[element.id] = element.selected;
            element.selected = newState;
        }
        for (const child of element.children) {
            this.selectAll(child, newState);
        }
    }
}