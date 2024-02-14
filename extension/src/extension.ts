
import * as vscode from 'vscode';
import * as path from 'path';
import { registerDefaultCommands } from 'sprotty-vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import { ER2CDSSprottyViewProvider } from './view-provider';

let languageClient: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    const openHelp = 'Open Help';
    vscode.window.showInformationMessage('ER2CDS Extension is active.', ...[openHelp])
        .then((selection) => {
            if (selection === openHelp) {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/GallusHuber/er2cds'));
            }
        });

    languageClient = createLanguageClient(context);

    const webviewViewProvider = new ER2CDSSprottyViewProvider({
        extensionUri: context.extensionUri,
        viewType: 'er2cds',
        languageClient,
        supportedFileExtensions: ['.er2cds']
    });

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('er2cds', webviewViewProvider, {
            webviewOptions: { retainContextWhenHidden: true }
        })
    );
    registerDefaultCommands(webviewViewProvider, context, { extensionPrefix: 'er2cds' });
}

function createLanguageClient(context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('..', 'language-server', 'out', 'server.cjs'));

    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.er2cds');
    context.subscriptions.push(fileSystemWatcher);

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'plaintext' }],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher
        }
    };

    // Create the language client and start the client.
    const languageClient = new LanguageClient(
        'er2cds',
        'er2cds',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    languageClient.start();
    return languageClient;
}

export async function deactivate(): Promise<void> {
    if (languageClient) {
        await languageClient.stop();
    }
}