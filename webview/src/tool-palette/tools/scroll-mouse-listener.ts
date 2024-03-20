import { injectable } from 'inversify';
import { IActionHandler, ICommand, SModelElementImpl, ScrollMouseListener } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { EnableDefaultToolsAction, EnableMarqueeMouseToolAction } from './actions';

@injectable()
export class ER2CDSScrollMouseListener extends ScrollMouseListener implements IActionHandler {
    protected preventScrolling = false;

    handle(action: Action): void | Action | ICommand {
        if (action.kind === EnableMarqueeMouseToolAction.KIND) {
            this.preventScrolling = true;
        } else if (action.kind === EnableDefaultToolsAction.KIND) {
            this.preventScrolling = false;
        }
    }

    override mouseDown(target: SModelElementImpl, event: MouseEvent): (Action | Promise<Action>)[] {
        if (this.preventScrolling)
            return [];

        return super.mouseDown(target, event);
    }
}
