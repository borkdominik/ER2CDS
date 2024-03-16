import { injectable } from 'inversify';
import { ActionHandlerRegistry } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from 'sprotty-vscode-webview/lib/lsp/editing';
import { CreateEntityAction, CreateRelationshipAction } from './actions';

@injectable()
export class ER2CDSDiagramServer extends VscodeLspEditDiagramServer {

    public override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(CreateEntityAction.KIND, this);
        registry.register(CreateRelationshipAction.KIND, this);
    }

    public override handleLocally(action: Action): boolean {
        switch (action.kind) {
            case CreateEntityAction.KIND:
                return true;

            case CreateRelationshipAction.KIND:
                return true;

            default:
                return super.handleLocally(action);
        }
    }
}