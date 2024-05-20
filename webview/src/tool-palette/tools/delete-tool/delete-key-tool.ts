import { inject, injectable } from 'inversify';
import { KeyListener, SModelElementImpl, isDeletable, isSelectable } from 'sprotty';
import { matchesKeystroke } from 'sprotty/lib/utils/keyboard';
import { Action } from 'sprotty-protocol';
import { DeleteElementAction } from '../../../actions';
import { ER2CDSKeyTool } from '../key-tool';

@injectable()
export class DeleteKeyTool {
    @inject(ER2CDSKeyTool)
    protected keyTool: ER2CDSKeyTool;

    protected deleteKeyListener: DeleteKeyListener = new DeleteKeyListener();

    enable(): void {
        this.keyTool.register(this.deleteKeyListener);
    }

    disable(): void {
        this.keyTool.deregister(this.deleteKeyListener);
    }
}

@injectable()
export class DeleteKeyListener extends KeyListener {
    override keyDown(element: SModelElementImpl, event: KeyboardEvent): Action[] {
        if (matchesKeystroke(event, 'Delete') || matchesKeystroke(event, 'Backspace')) {
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
