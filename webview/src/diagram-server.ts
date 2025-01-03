import { injectable } from 'inversify';
import { ActionHandlerRegistry } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from 'sprotty-vscode-webview/lib/lsp/editing';
import { CreateElementAction, DeleteElementAction, CreateEdgeAction, CreateAttributeAction, UpdateElementPropertyAction, RequestAutoCompleteAction, CreateElementExternalAction, RequestPopupConfirmModelAction, CreateJoinClauseAction, RequestMarkersAction, CreateWhereClauseAction, CreateAssociationAction } from './actions';

@injectable()
export class ER2CDSDiagramServer extends VscodeLspEditDiagramServer {

    public override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(CreateElementAction.KIND, this);
        registry.register(CreateElementExternalAction.KIND, this);
        registry.register(CreateEdgeAction.KIND, this);
        registry.register(CreateAttributeAction.KIND, this);
        registry.register(CreateAssociationAction.KIND, this);
        registry.register(CreateWhereClauseAction.KIND, this);
        registry.register(CreateJoinClauseAction.KIND, this);

        registry.register(UpdateElementPropertyAction.KIND, this);
        registry.register(DeleteElementAction.KIND, this);

        registry.register(RequestAutoCompleteAction.KIND, this);
        registry.register(RequestPopupConfirmModelAction.KIND, this);
        registry.register(RequestMarkersAction.KIND, this);
    }

    public override handleLocally(action: Action): boolean {
        switch (action.kind) {
            case CreateElementAction.KIND:
                return true;

            case CreateElementExternalAction.KIND:
                return true;

            case CreateEdgeAction.KIND:
                return true;

            case CreateAttributeAction.KIND:
                return true;

            case CreateAssociationAction.KIND:
                return true;

            case CreateWhereClauseAction.KIND:
                return true;

            case CreateJoinClauseAction.KIND:
                return true;

            case UpdateElementPropertyAction.KIND:
                return true;

            case DeleteElementAction.KIND:
                return true;

            case RequestAutoCompleteAction.KIND:
                return true;

            case RequestPopupConfirmModelAction.KIND:
                return true;

            case RequestMarkersAction.KIND:
                return true;

            default:
                return super.handleLocally(action);
        }
    }
}