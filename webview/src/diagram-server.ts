import { injectable } from 'inversify';
import { ActionHandlerRegistry } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from 'sprotty-vscode-webview/lib/lsp/editing';
import { CreateElementAction, DeleteElementAction } from './actions';

@injectable()
export class ER2CDSDiagramServer extends VscodeLspEditDiagramServer {

    public override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(CreateElementAction.KIND, this);
        registry.register(DeleteElementAction.KIND, this);
    }

    public override handleLocally(action: Action): boolean {
        switch (action.kind) {
            case CreateElementAction.KIND:
                return true;

            case DeleteElementAction.KIND:
                return true;

            default:
                return super.handleLocally(action);
        }
    }
}