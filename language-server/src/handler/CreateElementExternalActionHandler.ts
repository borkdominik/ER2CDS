import { URI } from 'vscode-uri';
import { CreateElementExternalAction } from '../actions.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { Agent } from 'https';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { Range } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { EntityNode } from '../model.js';
import fetch from 'node-fetch';
import { SModelIndex } from 'sprotty-protocol';
import { expandToString } from 'langium';
import { SapAttribute } from '../model-external.js';
import { ER2CDS } from '../generated/ast.js';

export class CreateElementExternalActionHandler {
    public handle(action: CreateElementExternalAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
        if (!document)
            return Promise.resolve();

        const model = document.parseResult.value as ER2CDS;

        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        const entity = modelIndex.getById(action.elementId);
        if (!entity)
            return Promise.resolve();

        const range = model.entities.find(e => e.name === entity.id)?.$cstNode?.range;
        if (!range)
            return Promise.resolve();

        this.getAttributes(action).then((attributes: SapAttribute[]) => {
            this.createEntity(entity, attributes, range, server, sourceUri, document.textDocument);
        });

        return Promise.resolve();
    }

    protected createEntity(entity: EntityNode, attributes: SapAttribute[], range: Range, server: ER2CDSDiagramServer, sourceUri: URI, textDocument: TextDocument) {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: range,
                        newText: expandToString`\n
                        entity ${entity.id} {
                            ${attributes.map(a => this.createAttribute(a)).join('\n')}
                        }
                        `
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        server.dispatch(workspaceEditAction);
    }

    protected createAttribute(attribute: SapAttribute): string {
        return expandToString`${attribute.Attribute} : ${attribute.Datatype}`;
    }

    protected async getAttributes(action: CreateElementExternalAction): Promise<SapAttribute[]> {
        const agent = new Agent({ rejectUnauthorized: false });
        let url = action.sapUrl + "sap/opu/odata/sap/ZER2CDS/Attributes?$filter=Entity eq '" + action.elementId + "'&$format=json&sap-client=" + action.sapClient;

        if (!url)
            return Promise.resolve([]);

        let response;
        const attriutes: SapAttribute[] = [];

        while (true) {
            response = await fetch(
                url,
                {
                    agent: agent,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic ' + btoa(action.sapUsername + ':' + action.sapPassword)
                    }
                }
            ).then(
                (response: any) => response.json()
            );

            attriutes.push(...response.d.results);

            if (response.d.__next) {
                url = response.d.__next;
            } else {
                break;
            }
        }

        return Promise.resolve(attriutes);
    }
}