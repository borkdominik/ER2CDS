import { inject, injectable, multiInject, optional } from 'inversify';
import { EMPTY_ROOT, IActionDispatcher, MouseListener, PopupMouseTool, SModelElementImpl, TYPES } from 'sprotty';
import { PopupButton } from './model';
import { Action, SetPopupModelAction } from 'sprotty-protocol';
import { CreateElementExternalAction } from '../actions';

@injectable()
export class ER2CDSPopupMouseTool extends PopupMouseTool {
    constructor(
        @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher,
        @multiInject(TYPES.PopupMouseListener) @optional() protected override mouseListeners: MouseListener[] = []
    ) {
        mouseListeners.push(new PopupButtonListener(actionDispatcher));
        super(mouseListeners);
    }
}

@injectable()
export class PopupButtonListener extends MouseListener {
    constructor(protected actionDispatcher: IActionDispatcher) {
        super();
    }

    override mouseDown(target: SModelElementImpl, event: MouseEvent): (Action | Promise<Action>)[] {
        if (!(target instanceof PopupButton))
            return [];

        if (target.type === 'button:yes') {
            this.actionDispatcher.dispatch(CreateElementExternalAction.create(target.target));
        }

        const actions: Action[] = [];
        actions.push(SetPopupModelAction.create(EMPTY_ROOT));

        return actions;
    }
}
