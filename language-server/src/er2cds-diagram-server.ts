import { Action, DiagramServer, DiagramServices, RequestAction, ResponseAction } from 'sprotty-protocol';
import { ER2CDSServices } from './er2cds-module.js';
import { CreateAttributeAction, CreateEdgeAction, CreateElementAction, CreateElementExternalAction, CreateJoinClauseAction, DeleteElementAction, RequestAutoCompleteAction, RequestMarkersAction, RequestPopupConfirmModelAction, UpdateElementPropertyAction } from './actions.js';
import { CreateElementActionHandler } from './handler/CreateElementActionHandler.js';
import { CreateAttributeActionHandler } from './handler/CreateAttributeActionHandler.js';
import { CreateEdgeActionHandler } from './handler/CreateEdgeActionHandler.js';
import { UpdateElementPropertyHandler } from './handler/UpdateElementPropertyHandler.js';
import { DeleteElementActionHandler } from './handler/DeleteElementActionHandler.js';
import { RequestAutoCompleteActionHandler } from './handler/RequestAutoCompleteActionHandler.js';
import { RequestPopupConfirmModelActionHandler } from './handler/RequestPopupConfirmModelActionHandler.js';
import { CreateElementExternalActionHandler } from './handler/CreateElementExternalActionHandler.js';
import { CreateJoinClauseActionHandler } from './handler/CreateJoinClauseActionHandler.js';
import { RequestMarkersActionHandler } from './handler/RequestMarkersActionHandler.js';

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

            case CreateElementExternalAction.KIND:
                new CreateElementExternalActionHandler().handle(action as CreateElementExternalAction, this, this.services);
                break;

            case CreateEdgeAction.KIND:
                new CreateEdgeActionHandler().handle(action as CreateEdgeAction, this, this.services);
                break;

            case CreateAttributeAction.KIND:
                new CreateAttributeActionHandler().handle(action as CreateAttributeAction, this, this.services);
                break;

            case CreateJoinClauseAction.KIND:
                new CreateJoinClauseActionHandler().handle(action as CreateJoinClauseAction, this, this.services);
                break;

            case UpdateElementPropertyAction.KIND:
                new UpdateElementPropertyHandler().handle(action as UpdateElementPropertyAction, this, this.services);
                break;

            case DeleteElementAction.KIND:
                new DeleteElementActionHandler().handle(action as DeleteElementAction, this, this.services);
                break;

            case RequestAutoCompleteAction.KIND:
                new RequestAutoCompleteActionHandler().handle(action as RequestAutoCompleteAction, this, this.services);
                break;

            case RequestPopupConfirmModelAction.KIND:
                new RequestPopupConfirmModelActionHandler().handle(action as RequestPopupConfirmModelAction, this, this.services);
                break;

            case RequestMarkersAction.KIND:
                new RequestMarkersActionHandler().handle(action as RequestMarkersAction, this, this.services);
                break;

        }

        return super.handleAction(action);
    }
}