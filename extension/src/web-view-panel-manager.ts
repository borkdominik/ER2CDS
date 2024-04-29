import * as vscode from 'vscode';
import { WebviewContainer, createFileUri, getBasename } from 'sprotty-vscode';
import { SprottyDiagramIdentifier } from 'sprotty-vscode-protocol';
import { LspWebviewEndpoint, LspWebviewPanelManager, LspWebviewPanelManagerOptions } from 'sprotty-vscode/lib/lsp';
import { ER2CDSWebviewEndpoint } from './web-view-endpoint';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { convertWorkspaceEdit } from 'sprotty-vscode/lib/lsp/lsp-utils';

import path = require('path');

export class ER2CDSWebViewPanelManager extends LspWebviewPanelManager {
    protected context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, options: LspWebviewPanelManagerOptions) {
        super(options);
        this.context = context;
    }

    protected override createEndpoint(identifier: SprottyDiagramIdentifier): LspWebviewEndpoint {
        const webviewContainer = this.createWebview(identifier);
        const participant = this.messenger.registerWebviewPanel(webviewContainer);

        const webview = new ER2CDSWebviewEndpoint(
            this.context,
            {
                languageClient: this.languageClient,
                webviewContainer,
                messenger: this.messenger,
                messageParticipant: participant,
                identifier,
            }
        );

        webview.addActionHandler(WorkspaceEditAction.KIND, this.handleWorkspaceEditAction);

        return webview;
    }

    protected override createWebview(identifier: SprottyDiagramIdentifier): vscode.WebviewPanel {
        const extensionPath = this.options.extensionUri.fsPath;
        return this.createWebviewPanel(identifier, {
            localResourceRoots: [createFileUri(extensionPath, '..', 'webview', 'out')],
            scriptUri: createFileUri(extensionPath, '..', 'webview', 'out', 'webview.js')
        });
    }

    protected async handleWorkspaceEditAction(action: WorkspaceEditAction) {
        await vscode.workspace.applyEdit(convertWorkspaceEdit(action.workspaceEdit));

        const changes = action.workspaceEdit.changes;
        if (changes) {
            for (const uri in changes) {
                await vscode.workspace.save(vscode.Uri.parse(uri));
            }
        }
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
