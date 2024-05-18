import * as vscode from 'vscode';
import { window, commands } from 'vscode';

export const generateCdsCommand = 'er2cds.generate.cds';
export const addSystemCommand = 'er2cds.add.system';

export const generateCDSHandler = async () => {
    sendToServer(generateCdsCommand);
};

export const addSystemHandler = async (context: vscode.ExtensionContext) => {
    const sapUrl = await vscode.window.showInputBox({ title: 'SAP System URL' });
    if (!sapUrl)
        return;

    await context.secrets.store('sapUrl', sapUrl);

    const sapClient = await vscode.window.showInputBox({ title: 'SAP Client' });
    if (!sapClient)
        return;

    await context.secrets.store('sapClient', sapClient);

    const sapUsername = await vscode.window.showInputBox({ title: 'SAP Username' });
    if (!sapUsername)
        return;

    await context.secrets.store('sapUsername', sapUsername);

    const sapPassword = await vscode.window.showInputBox({ title: 'SAP Password', password: true });
    if (!sapPassword)
        return;

    await context.secrets.store('sapPassword', sapPassword);

    sendToServer(addSystemCommand, [sapUrl, sapClient, sapUsername, sapPassword]);
};

export const sendToServer = async (command: string, args?: any) => {
    if (command === generateCdsCommand && !args) {
        const activeEditor = window.activeTextEditor;

        if (activeEditor?.document?.languageId === 'er2cds') {
            args = [window.activeTextEditor?.document.uri.toString()];
        } else {
            window.showErrorMessage('Error! Invalid file');
        }
    }

    const response: string | undefined = await commands.executeCommand(command, ...args);
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            window.showInformationMessage(response);
        }
    }
};