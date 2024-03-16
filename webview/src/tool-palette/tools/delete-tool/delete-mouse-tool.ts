import { injectable } from 'inversify';
import { ICommand, MouseListener, MouseTool, SModelElementImpl, findParentByFeature, isDeletable } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { DeleteElementAction } from '../../../actions';

@injectable()
export class DeleteMouseTool extends MouseTool {
    handle(action: Action): void | Action | ICommand {
        this.enable();
    }

    protected deleteMouseToolListener: DeleteMouseToolListener = new DeleteMouseToolListener();

    enable(): void {
        this.register(this.deleteMouseToolListener);
    }

    disable(): void {
        this.deregister(this.deleteMouseToolListener);
    }
}

@injectable()
export class DeleteMouseToolListener extends MouseListener {
    override mouseUp(target: SModelElementImpl, event: MouseEvent): Action[] {
        const deletableParent = findParentByFeature(target, isDeletable);
        if (deletableParent === undefined) {
            return [];
        }

        const result: Action[] = [];
        result.push(DeleteElementAction.create([deletableParent.id]));

        return result;
    }
}
