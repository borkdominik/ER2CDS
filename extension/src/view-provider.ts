import * as vscode from 'vscode';
import * as path from 'path';
import { WebviewContainer, WebviewEndpoint } from 'sprotty-vscode';
import { SprottyDiagramIdentifier } from 'sprotty-vscode-protocol';
import {  LspSprottyViewProvider } from 'sprotty-vscode/lib/lsp';

export class ER2CDSSprottyViewProvider extends LspSprottyViewProvider {
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
                            <script type="module" src="${transformUri(options.scriptUri)}"></script>
                        </body>
                    </html>`;
    }

    private createFileUri(...segments: string[]): vscode.Uri {
        return vscode.Uri.file(path.join(...segments));
    }
}
