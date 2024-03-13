import { Action, DiagramServer, DiagramServices, RequestAction, ResponseAction } from 'sprotty-protocol';
import { CreateElementAction } from './actions.js';
import { CreateElementActionHandler } from './handler/CreateElementActionHandler.js';

export class ER2CDSDiagramServer extends DiagramServer {
    constructor(dispatch: <A extends Action>(action: A) => Promise<void>, services: DiagramServices) {
        super(dispatch, services);
    }

    public override accept(action: Action): Promise<void> {
        return super.accept(action);
    }

    public override request<Res extends ResponseAction>(action: RequestAction<Res>): Promise<Res> {
        return super.request(action);
    }

    protected override handleAction(action: Action): Promise<void> {
        switch (action.kind) {
            case CreateElementAction.KIND:
                new CreateElementActionHandler().handle(action as CreateElementAction, this);
        }

        return super.handleAction(action);
    }
}