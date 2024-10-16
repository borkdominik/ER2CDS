import * as vscode from 'vscode';
import fetch, { Response } from 'node-fetch';

export const generateCdsCommand = 'er2cds.generate.cds';
export const addSystemCommand = 'er2cds.add.system';
export const removeSystemCommand = 'er2cds.remove.system';
export const importCdsCommand = 'er2cds.import.cds';

export const generateCDSHandler = async () => {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor?.document?.languageId === 'er2cds') {
        sendToServer(generateCdsCommand, [vscode.window.activeTextEditor?.document.uri.toString()]);
    } else {
        vscode.window.showErrorMessage('Error! Invalid file');
    }
};

export const importCDSHandler = async () => {
    let cds = await vscode.window.showInputBox({ title: 'CDS View Entity' });
    if (!cds)
        return;

    sendToServer(importCdsCommand, [cds, vscode.window.activeTextEditor?.document.uri.toString()]);
};


export const addSystemHandler = async (context: vscode.ExtensionContext) => {
    let sapUrl = await vscode.window.showInputBox(
        {
            title: 'SAP System URL',
            validateInput: async input => {
                if (!input)
                    return null;

                const url = encodeURI(input);
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                return await fetch(
                    url,
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
    const url = encodeURI(sapUrl + 'sap/opu/odata/sap/ZER2CDS/Entities?sap-client=' + sapClient);
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

export const removeSystemHandler = async (context: vscode.ExtensionContext) => {
    await context.secrets.delete('sapUrl');
    await context.secrets.delete('sapClient');
    await context.secrets.delete('sapUsername');
    await context.secrets.delete('sapPassword');

    vscode.window.showInformationMessage('ER2CDS: SAP System successfully removed.');
    sendToServer(removeSystemCommand, []);
};

export const sendToServer = async (command: string, args?: any) => {
    const response: string | undefined = await vscode.commands.executeCommand(command, ...args);
    if (response) {
        if (response.startsWith('Error')) {
            vscode.window.showErrorMessage(response);
        } else {
            vscode.window.showInformationMessage(response);
        }
    }
};