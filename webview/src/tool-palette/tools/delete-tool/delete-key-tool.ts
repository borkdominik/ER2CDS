import { injectable } from 'inversify';
import { KeyTool, KeyListener, SModelElementImpl, isDeletable, isSelectable } from 'sprotty';
import { matchesKeystroke } from 'sprotty/lib/utils/keyboard';
import { Action } from 'sprotty-protocol';
import { DeleteElementAction } from '../../../actions';

@injectable()
export class DeleteKeyTool extends KeyTool {
    protected deleteKeyListener: DeleteKeyListener = new DeleteKeyListener();

    enable(): void {
        this.register(this.deleteKeyListener);
    }

    disable(): void {
        this.deregister(this.deleteKeyListener);
    }
}

@injectable()
export class DeleteKeyListener extends KeyListener {
    override keyDown(element: SModelElementImpl, event: KeyboardEvent): Action[] {
        if (matchesKeystroke(event, 'Delete')) {
            const deleteElementIds = Array.from(
                element.root.index
                    .all()
                    .filter(e => isDeletable(e) && isSelectable(e) && e.selected)
                    .filter(e => e.id !== e.root.id)
                    .map(e => e.id)
            );

            if (deleteElementIds.length > 0) {
                return [DeleteElementAction.create(deleteElementIds)];
            }
        }

        return [];
    }
}
