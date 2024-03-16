import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { Range, Position } from 'vscode-languageserver-types';
import { URI } from 'vscode-uri';
import { CreateEntityAction } from '../actions.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { SModelElement } from 'sprotty-protocol';
import { NODE_ENTITY } from '../er2cds-diagram.js';

export class CreateEntityActionHandler {
    public handle(action: CreateEntityAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const textDocument = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri).textDocument;
        if (!textDocument)
            return Promise.resolve();

        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: Range.create(Position.create(textDocument?.lineCount + 1, 0), Position.create(textDocument?.lineCount + 1, 0)),
                        newText: '\n\n' + 'entity' + ' ' + this.getNewName(NODE_ENTITY, 'Entity', server.state.currentRoot.children) + '{ }'
                    }
                ]
            }
        }
        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        server.dispatch(workspaceEditAction);
        return Promise.resolve();
    }

    private getNewName(type: string, prefix: string, elements: SModelElement[] | undefined): string {
        if (!elements)
            return this.createName(prefix, 0);

        let count = 0;
        for (let i = 0; i < elements.length; i += 1) {
            let name = this.createName(prefix, count);

            if (!elements.some(e => e.id === name))
                return name;

            if (elements[i].type === type)
                count += 1
        }

        return this.createName(prefix, count);
    }

    private createName(prefix: string, count: number): string {
        return prefix + count;
    }
}