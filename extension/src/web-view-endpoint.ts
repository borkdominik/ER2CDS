import * as vscode from 'vscode';
import { isActionMessage, SelectAction } from 'sprotty-protocol';
import { LspWebviewEndpoint, LspWebviewEndpointOptions } from 'sprotty-vscode/lib/lsp';
import { Action } from 'sprotty-protocol';
import { CreateElementExternalAction, RequestAutoCompleteAction } from './actions';

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

                case CreateElementExternalAction.KIND:
                case RequestAutoCompleteAction.KIND:
                    message.action = await this.extendActionWithSecrets(message.action);
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

    protected async extendActionWithSecrets(action: any): Promise<Action> {
        action.sapUrl = await this.context.secrets.get('sapUrl');
        action.sapClient = await this.context.secrets.get('sapClient');
        action.sapUsername = await this.context.secrets.get('sapUsername');
        action.sapPassword = await this.context.secrets.get('sapPassword');

        return Promise.resolve(action);
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
