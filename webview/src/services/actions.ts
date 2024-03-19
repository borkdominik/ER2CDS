import { injectable, inject } from 'inversify';
import { Command, SModelRootImpl, TYPES, CommandExecutionContext, InitializeCanvasBoundsCommand, SChildElementImpl, isSelectable, SModelElementImpl, SParentElementImpl } from 'sprotty';
import { Action, SetModelAction, SelectAction, SelectAllAction, Selectable } from 'sprotty-protocol'
import { DiagramEditorService } from './diagram-editor-service';

@injectable()
export class SetModelCommand extends Command {
    static readonly KIND = SetModelAction.KIND;

    protected oldRoot: SModelRootImpl;
    protected newRoot: SModelRootImpl;

    constructor(
        @inject(TYPES.Action) protected readonly action: SetModelAction,
        @inject(DiagramEditorService) public diagramEditorService: DiagramEditorService
    ) {
        super();
    }

    execute(context: CommandExecutionContext): SModelRootImpl {
        this.oldRoot = context.modelFactory.createRoot(context.root);
        this.newRoot = context.modelFactory.createRoot(this.action.newRoot);

        this.diagramEditorService.modelRootChanged(this.newRoot);
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
        @inject(DiagramEditorService) public diagramEditorService: DiagramEditorService
    ) {
        super();
    }

    execute(context: CommandExecutionContext): SModelRootImpl {
        const model = context.root;

        const selectedElementIds = this.action.selectedElementsIDs.map(id => model.index.getById(id)).filter(e => e !== undefined && isSelectable(e)).map(e => e.id);
        const deselectedElementIds = this.action.deselectedElementsIDs.map(id => model.index.getById(id)).filter(e => e !== undefined && isSelectable(e)).map(e => e.id);

        this.diagramEditorService.updateSelection(model, selectedElementIds, deselectedElementIds);
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
        @inject(DiagramEditorService) public diagramEditorService: DiagramEditorService
    ) {
        super();
    }

    execute(context: CommandExecutionContext): SModelRootImpl {
        const model = context.root;

        const selectableIds = Array.from(model.index.all().filter((element: any): element is SModelElementImpl => isSelectable(element))).map(e => e.id);

        if (this.action.select) {
            this.diagramEditorService.updateSelection(model, selectableIds, []);
        } else {
            this.diagramEditorService.updateSelection(model, [], selectableIds);
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