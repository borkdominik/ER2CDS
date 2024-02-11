import * as vscode from 'vscode';
import * as path from 'path';
import { ActionMessage } from 'sprotty-protocol';
import { SprottyViewProvider, SprottyViewProviderOptions, WebviewContainer, WebviewEndpoint } from 'sprotty-vscode';
import { SprottyDiagramIdentifier } from 'sprotty-vscode-protocol';
import { acceptMessageType, openInTextEditorMessageType, openInTextEditor, didCloseMessageType, LspWebviewEndpoint } from 'sprotty-vscode/lib/lsp';
import { LanguageClient } from 'vscode-languageclient/node';

export interface ER2CDSSprottyViewProviderOptions extends SprottyViewProviderOptions {
    languageClient: LanguageClient
}

export class ER2CDSSprottyViewProvider extends SprottyViewProvider {
    constructor(options: ER2CDSSprottyViewProviderOptions) {
        super(options);
        options.languageClient.onNotification(acceptMessageType, message => this.acceptFromLanguageServer(message));
        options.languageClient.onNotification(openInTextEditorMessageType, message => openInTextEditor(message));
    }

    get languageClient(): LanguageClient {
        return (this.options as ER2CDSSprottyViewProviderOptions).languageClient;
    }

    protected override createEndpoint(webviewContainer: vscode.WebviewView, identifier?: SprottyDiagramIdentifier): WebviewEndpoint {
        const participant = this.messenger.registerWebviewView(webviewContainer);
        return new LspWebviewEndpoint({
            languageClient: this.languageClient,
            webviewContainer,
            messenger: this.messenger,
            messageParticipant: participant,
            identifier
        });
    }

    protected override didCloseWebview(endpoint: WebviewEndpoint): void {
        super.didCloseWebview(endpoint);
        try {
            this.languageClient.sendNotification(didCloseMessageType, endpoint.diagramIdentifier?.clientId);
        } catch (err) {
            // Ignore the error and proceed
        }
    }

    protected acceptFromLanguageServer(message: ActionMessage): void {
        if (this.endpoint) {
            this.endpoint.sendAction(message);
        }
    }

    protected override configureWebview(webviewView: vscode.WebviewView, endpoint: WebviewEndpoint, cancelToken: vscode.CancellationToken): Promise<void> | void {
        const extensionPath = this.options.extensionUri.fsPath;
        webviewView.webview.options = {
            localResourceRoots: [this.createFileUri(extensionPath, '..', 'webview', 'out')],
            enableScripts: true
        };

        let identifier = endpoint.diagramIdentifier;
        if (!identifier) {
            // Create a preliminary diagram identifier to fill the webview's HTML content
            identifier = { clientId: this.clientId, diagramType: this.options.viewType, uri: '' };
        }

        const scriptUri = this.createFileUri(extensionPath, '..', 'webview', 'out', 'webview.js');
        webviewView.webview.html = this.createWebviewHtml(identifier, webviewView, { scriptUri });
    }

    private createWebviewHtml(identifier: SprottyDiagramIdentifier, container: WebviewContainer,
        options: { scriptUri: vscode.Uri, cssUri?: vscode.Uri, title?: string }): string {
        const transformUri = (uri: vscode.Uri) => container.webview.asWebviewUri(uri).toString();
        return `<!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, height=device-height">
                            ${options.title ? `<title>${options.title}</title>` : ''}
                            ${options.cssUri ? `<link rel="stylesheet" type="text/css" href="${transformUri(options.cssUri)}" />` : ''}
                        </head>
                        <body>
                            <div id="${identifier.clientId}_container" style="height: 100%;"></div>
                            <script src="${transformUri(options.scriptUri)}"></script>
                        </body>
                    </html>`;
    }

    private createFileUri(...segments: string[]): vscode.Uri {
        return vscode.Uri.file(path.join(...segments));
    }
}
