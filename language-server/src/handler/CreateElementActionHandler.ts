import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { Range, Position } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { CreateElementAction } from '../actions.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { SModelElement } from 'sprotty-protocol';
import { NODE_ENTITY, NODE_RELATIONSHIP } from '../model.js';

export class CreateElementActionHandler {
    public handle(action: CreateElementAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
        if (!document)
            return Promise.resolve();

        switch (action.elementType) {
            case NODE_ENTITY:
                this.handleCreateEntity(server, sourceUri, document.textDocument);
                break;

            case NODE_RELATIONSHIP:
                this.handleCreateRelationship(server, sourceUri, document.textDocument);
                break;
        }

        return Promise.resolve();
    }

    private handleCreateEntity(server: ER2CDSDiagramServer, sourceUri: URI, textDocument: TextDocument): void {
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
    }

    private handleCreateRelationship(server: ER2CDSDiagramServer, sourceUri: URI, textDocument: TextDocument): void {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: Range.create(Position.create(textDocument?.lineCount + 1, 0), Position.create(textDocument?.lineCount + 1, 0)),
                        newText: '\n\n' + 'relationship' + ' ' + this.getNewName(NODE_RELATIONSHIP, 'Relationship', server.state.currentRoot.children) + '{ }'
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