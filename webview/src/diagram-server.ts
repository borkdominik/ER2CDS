import { injectable } from 'inversify';
import { ActionHandlerRegistry } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from 'sprotty-vscode-webview/lib/lsp/editing';
import { CreateElementEditAction } from './actions';

@injectable()
export class ER2CDSDiagramServer extends VscodeLspEditDiagramServer {

    public override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(CreateElementEditAction.KIND, this);
    }

    public override handleLocally(action: Action): boolean {
        switch (action.kind) {
            case CreateElementEditAction.KIND:
                this.forwardToServer(action);
                return true;

            default:
                return super.handleLocally(action);
        }
    }
}