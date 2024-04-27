import { window, Uri, commands } from 'vscode';

export const generateCdsCommand = 'er2cds.generate.cds';

export const generateCDSHandler = async () => {
    sendToServer(generateCdsCommand);
};

export const sendToServer = async (command: string, fileUri?: Uri) => {
    if (!fileUri) {
        const activeEditor = window.activeTextEditor;

        if (activeEditor?.document?.languageId === 'er2cds') {
            fileUri = window.activeTextEditor?.document.uri;
        } else {
            window.showErrorMessage('Error! Invalid file');
        }
    }

    const response: string | undefined = await commands.executeCommand(command, fileUri.toString());
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            window.showInformationMessage(response);
        }
    }
};