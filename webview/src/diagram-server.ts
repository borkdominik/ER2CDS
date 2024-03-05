import { injectable } from "inversify";
import { ActionHandlerRegistry } from "sprotty";
import { Action } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from "sprotty-vscode-webview/lib/lsp/editing";
import { CreateElementEditAction } from "./actions";

@injectable()
export class ER2CDSDiagramServer extends VscodeLspEditDiagramServer {

    override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(CreateElementEditAction.KIND, this);
    }

    override handleLocally(action: Action): boolean {
        switch (action.kind) {
            case CreateElementEditAction.KIND:
                return true;

            default:
                return super.handleLocally(action);
        }
    }
}