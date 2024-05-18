
import * as vscode from 'vscode';
import * as path from 'path';
import { registerDefaultCommands, registerTextEditorSync } from 'sprotty-vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import { ER2CDSWebViewPanelManager } from './web-view-panel-manager';
import { Messenger } from 'vscode-messenger';
import { addSystemCommand, addSystemHandler, generateCDSHandler, sendToServer } from './commands';

let languageClient: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
    const openHelp = 'Open Help';
    vscode.window.showInformationMessage('ER2CDS Extension is active.', ...[openHelp])
        .then((selection) => {
            if (selection === openHelp) {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/GallusHuber/er2cds'));
            }
        });

    languageClient = await createLanguageClient(context);

    const webviewPanelManager = new ER2CDSWebViewPanelManager(
        context,
        {
            extensionUri: context.extensionUri,
            languageClient,
            supportedFileExtensions: ['.er2cds'],
            singleton: true,
            messenger: new Messenger({ ignoreHiddenViews: false }),
        }
    );

    registerDefaultCommands(webviewPanelManager, context, { extensionPrefix: 'er2cds' });
    registerTextEditorSync(webviewPanelManager, context);

    context.subscriptions.push(vscode.commands.registerCommand('er2cds.generate.cds.proxy', generateCDSHandler));
    context.subscriptions.push(vscode.commands.registerCommand('er2cds.add.system.proxy', addSystemHandler));

    const sapUrl = await context.secrets.get('sapUrl');
    const sapClient = await context.secrets.get('sapClient');
    const sapUsername = await context.secrets.get('sapUsername');
    const sapPassword = await context.secrets.get('sapPassword');
    if (sapUrl && sapClient && sapUsername && sapPassword) {
        sendToServer(addSystemCommand, [sapUrl, sapClient, sapUsername, sapPassword]);
    }
}

export async function createLanguageClient(context: vscode.ExtensionContext): Promise<LanguageClient> {
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
    await languageClient.start();
    return languageClient;
}

export async function deactivate(): Promise<void> {
    if (languageClient) {
        await languageClient.stop();
    }
}