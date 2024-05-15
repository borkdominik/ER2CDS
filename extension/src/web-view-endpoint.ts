import * as vscode from 'vscode';
import { isActionMessage, SelectAction } from 'sprotty-protocol';
import { LspWebviewEndpoint, LspWebviewEndpointOptions } from 'sprotty-vscode/lib/lsp';

export class ER2CDSWebviewEndpoint extends LspWebviewEndpoint {
    protected context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, options: LspWebviewEndpointOptions) {
        super(options);
        this.context = context;
    }

    async receiveAction(message: any): Promise<void> {
        if (isActionMessage(message)) {
            switch (message.action.kind) {
                case SelectAction.KIND:
                    this.handleSelectAction(message.action as SelectAction);
                    break;
            }
        }

        return super.receiveAction(message);
    }

    protected handleSelectAction(action: SelectAction): void {
        const uriString = this.deserializeUriOfDiagramIdentifier();

        if (uriString !== '') {
            this.languageClient.sendNotification('diagram/selected', {
                label: action.selectedElementsIDs[0],
                uri: uriString,
            });
        }
    }

    protected deserializeUriOfDiagramIdentifier(): string {
        if (this.diagramIdentifier) {
            let uriString = this.diagramIdentifier.uri.toString();
            const match = uriString.match(/file:\/\/\/([a-z]):/i);

            if (match)
                uriString = 'file:///' + match[1] + '%3A' + uriString.substring(match[0].length);

            return uriString;
        }

        return '';
    }
}
