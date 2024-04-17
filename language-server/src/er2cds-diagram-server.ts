import { Action, ApplyLabelEditAction, DiagramServer, DiagramServices, RequestAction, ResponseAction } from 'sprotty-protocol';
import { ER2CDSServices } from './er2cds-module.js';
import { CreateAttributeAction, CreateEdgeAction, CreateElementAction, DeleteElementAction } from './actions.js';
import { CreateElementActionHandler } from './handler/CreateElementActionHandler.js';
import { DeleteElementActionHandler } from './handler/DeleteElementActionHandler.js';
import { CreateEdgeActionHandler } from './handler/CreateEdgeActionHandler.js';
import { ApplyLabelEditActionHandler } from './handler/ApplyLabelEditActionHandler.js';
import { CreateAttributeActionHandler } from './handler/CreateAttributeActionHandler.js';

export class ER2CDSDiagramServer extends DiagramServer {
    private services: ER2CDSServices;

    constructor(dispatch: <A extends Action>(action: A) => Promise<void>, services: ER2CDSServices) {
        super(dispatch, services.diagram as DiagramServices);

        this.services = services;
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
                new CreateElementActionHandler().handle(action as CreateElementAction, this, this.services);
                break;

            case CreateEdgeAction.KIND:
                new CreateEdgeActionHandler().handle(action as CreateEdgeAction, this, this.services);
                break;

            case CreateAttributeAction.KIND:
                new CreateAttributeActionHandler().handle(action as CreateAttributeAction, this, this.services);

            case DeleteElementAction.KIND:
                new DeleteElementActionHandler().handle(action as DeleteElementAction, this, this.services);
                break;

            case ApplyLabelEditAction.KIND:
                new ApplyLabelEditActionHandler().handle(action as ApplyLabelEditAction, this, this.services);
                break;
        }

        return super.handleAction(action);
    }
}