import { inject, injectable, postConstruct } from 'inversify';
import { CommandStack, ILogger, ModelIndexImpl, SModelElementImpl, SModelRootImpl, TYPES, isSelectable } from 'sprotty';
import { Emitter, Event, } from 'vscode-jsonrpc';

@injectable()
export class DiagramEditorService {
    protected root: SModelRootImpl;

    protected modelIndex?: ModelIndexImpl;
    protected prevModelIndex?: ModelIndexImpl;

    protected selectedElementIDs: Set<string> = new Set();

    protected onModelRootChangedEmitter = new Emitter<Readonly<SModelRootImpl>>();

    @inject(TYPES.ILogger)
    protected logger: ILogger;

    @postConstruct()
    protected initialize() {
        this.onModelRootChanged(r => this.modelRootChanged(r));
    }

    notifyModelRootChanged(root: Readonly<SModelRootImpl>, notifier: object): void {
        if (!(notifier instanceof CommandStack)) {
            throw new Error('Invalid model root change notification. Notifier is not an instance of `CommandStack`.');
        }

        this.root = root;
        this.onModelRootChangedEmitter.fire(root);
    }

    getModelRoot(): Readonly<SModelRootImpl> {
        return this.root;
    }

    get onModelRootChanged(): Event<Readonly<SModelRootImpl>> {
        return this.onModelRootChangedEmitter.event;
    }

    updateSelection(newRoot: Readonly<SModelRootImpl>, select: string[], deselect: string[]): void {
        if (newRoot === undefined && select.length === 0 && deselect.length === 0) {
            return;
        }

        const prevRoot = this.root;
        if (prevRoot) {
            this.prevModelIndex = new ModelIndexImpl();
            this.prevModelIndex.add(prevRoot);
        }


        this.root = newRoot;
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

                if (this.prevModelIndex?.getById(id))
                    deselectedElementIDs.add(id);
            }
        }
    }

    modelRootChanged(root: Readonly<SModelRootImpl>): void {
        this.updateSelection(root, [], []);
    }

    getSelectedElements(): Readonly<SModelElementImpl>[] {
        return !this.root ? [] : Array.from(this.selectedElementIDs).map(id => this.modelIndex.getById(id)).filter(e => e !== undefined && isSelectable(e));
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