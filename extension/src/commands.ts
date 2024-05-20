import * as vscode from 'vscode';
import fetch, { Response } from 'node-fetch';

export const generateCdsCommand = 'er2cds.generate.cds';
export const addSystemCommand = 'er2cds.add.system';

export const generateCDSHandler = async () => {
    sendToServer(generateCdsCommand);
};

export const addSystemHandler = async (context: vscode.ExtensionContext) => {
    let sapUrl = await vscode.window.showInputBox(
        {
            title: 'SAP System URL',
            validateInput: async input => {
                if (!input)
                    return null;

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                return await fetch(
                    input,
                    {
                        method: 'GET',
                        headers: {}
                    }
                ).then(
                    () => Promise.resolve(null)
                ).catch(
                    () => Promise.resolve('ER2CDS: Could not connect to SAP System.')
                );
            }
        }
    );

    if (!sapUrl)
        return;

    if (sapUrl[sapUrl.length - 1] !== '/') {
        sapUrl = sapUrl + '/';
    }

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

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const url = sapUrl + 'sap/opu/odata/sap/ZER2CDS/Entities?sap-client=' + sapClient;
    const errorMessage = await fetch(
        url,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(sapUsername + ':' + sapPassword)
            }
        }
    ).then(
        (response: Response) => {
            if (response.ok) {
                return Promise.resolve(undefined);

            } else {
                if (response.status === 401) {
                    return Promise.resolve('ER2CDS: Authorization failed. Please check SAP credentials.');
                }

                if (response.status === 403) {
                    return Promise.resolve('ER2CDS: Service ER2CDS does not exist on SAP System.');
                }

                return Promise.resolve('ER2CDS: Error while connecting to service. Please check ER2CDS service component.');
            }
        }
    ).catch(
        (error: any) => Promise.resolve('ER2CDS: Could not connect to SAP System.')
    );

    if (!errorMessage) {
        vscode.window.showInformationMessage('ER2CDS: SAP System successfully added.');
        sendToServer(addSystemCommand, [sapUrl, sapClient, sapUsername, sapPassword]);
    } else {
        vscode.window.showErrorMessage(errorMessage);
    }
};

export const sendToServer = async (command: string, args?: any) => {
    if (command === generateCdsCommand && !args) {
        const activeEditor = vscode.window.activeTextEditor;

        if (activeEditor?.document?.languageId === 'er2cds') {
            args = [vscode.window.activeTextEditor?.document.uri.toString()];
        } else {
            vscode.window.showErrorMessage('Error! Invalid file');
        }
    }

    const response: string | undefined = await vscode.commands.executeCommand(command, ...args);
    if (response) {
        if (response.startsWith('Error')) {
            vscode.window.showErrorMessage(response);
        } else {
            vscode.window.showInformationMessage(response);
        }
    }
};