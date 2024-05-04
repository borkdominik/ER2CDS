import { window, Uri, commands } from 'vscode';

export const generateCdsCommand = 'er2cds.generate.cds';

export const generateCDSHandler = async () => {
    sendToServer(generateCdsCommand);
};

export const sendToServer = async (command: string, args?: any) => {
    if (command === generateCdsCommand && !args) {
        const activeEditor = window.activeTextEditor;

        if (activeEditor?.document?.languageId === 'er2cds') {
            args = window.activeTextEditor?.document.uri.toString();
        } else {
            window.showErrorMessage('Error! Invalid file');
        }
    }

    const response: string | undefined = await commands.executeCommand(command, args);
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            window.showInformationMessage(response);
        }
    }
};