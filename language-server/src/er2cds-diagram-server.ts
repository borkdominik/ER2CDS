import { Action, DiagramServer, DiagramServices, RequestAction, ResponseAction } from 'sprotty-protocol';
import { ER2CDSServices } from './er2cds-module.js';
import { CreateEntityAction, CreateRelationshipAction } from './actions.js';
import { CreateEntityActionHandler } from './handler/CreateEntityActionHandler.js';
import { CreateRelationshipActionHandler } from './handler/CreateRelationshipActionHandler.js';

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
            case CreateEntityAction.KIND:
                new CreateEntityActionHandler().handle(action as CreateEntityAction, this, this.services);

            case CreateRelationshipAction.KIND:
                new CreateRelationshipActionHandler().handle(action as CreateRelationshipAction, this, this.services);
        }

        return super.handleAction(action);
    }
}