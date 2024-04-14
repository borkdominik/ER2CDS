import * as vscode from 'vscode';
import { WebviewContainer, createFileUri, getBasename } from 'sprotty-vscode';
import { SprottyDiagramIdentifier } from 'sprotty-vscode-protocol';
import { LspWebviewEndpoint, LspWebviewPanelManager, LspWebviewPanelManagerOptions } from 'sprotty-vscode/lib/lsp';
import { addLspLabelEditActionHandler, addWorkspaceEditActionHandler } from 'sprotty-vscode/lib/lsp/editing';
import { ER2CDSWebviewEndpoint } from './web-view-endpoint';

import path = require('path');

export class ER2CDSWebViewPanelManager extends LspWebviewPanelManager {
    constructor(options: LspWebviewPanelManagerOptions) {
        super(options);
    }

    protected override createEndpoint(identifier: SprottyDiagramIdentifier): LspWebviewEndpoint {
        const webviewContainer = this.createWebview(identifier);
        const participant = this.messenger.registerWebviewPanel(webviewContainer);

        const webview = new ER2CDSWebviewEndpoint({
            languageClient: this.languageClient,
            webviewContainer,
            messenger: this.messenger,
            messageParticipant: participant,
            identifier,
        });

        addWorkspaceEditActionHandler(webview);
        addLspLabelEditActionHandler(webview);

        return webview;
    }

    protected override createWebview(identifier: SprottyDiagramIdentifier): vscode.WebviewPanel {
        const extensionPath = this.options.extensionUri.fsPath;
        return this.createWebviewPanel(identifier, {
            localResourceRoots: [createFileUri(extensionPath, '..', 'webview', 'out')],
            scriptUri: createFileUri(extensionPath, '..', 'webview', 'out', 'webview.js')
        });
    }

    private createWebviewPanel(identifier: SprottyDiagramIdentifier, options: { localResourceRoots: vscode.Uri[], scriptUri: vscode.Uri, cssUri?: vscode.Uri }): vscode.WebviewPanel {
        const title = this.createWebviewTitle(identifier);

        const diagramPanel = vscode.window.createWebviewPanel(
            identifier.diagramType || 'diagram',
            title,
            vscode.ViewColumn.Beside,
            {
                localResourceRoots: options.localResourceRoots,
                enableScripts: true,
                retainContextWhenHidden: true
            });

        diagramPanel.webview.html = this.createWebviewHtml(identifier, diagramPanel, {
            scriptUri: options.scriptUri,
            cssUri: options.cssUri,
            title
        });

        return diagramPanel;
    }

    private createWebviewTitle(identifier: SprottyDiagramIdentifier): string {
        if (identifier.uri) {
            const uri = vscode.Uri.parse(identifier.uri);
            return getBasename(uri);
        } else if (identifier.diagramType) {
            return identifier.diagramType.charAt(0).toUpperCase() + identifier.diagramType.substring(1);
        } else {
            return 'Diagram';
        }
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
                                <script type="module" src="${transformUri(options.scriptUri)}"></script>
                            </body>
                        </html>`;
    }
}
