import { CompositeCstNodeImpl, URI, expandToString } from 'langium';
import { SModelIndex } from 'sprotty-protocol';
import { CreateJoinClauseAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { Range, Position } from 'vscode-languageserver-types';
import { ER2CDS } from '../generated/ast.js';

export class CreateJoinClauseActionHandler {
    public async handle(action: CreateJoinClauseAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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

        const relationship = modelIndex.getById(action.elementId);
        if (!relationship)
            return Promise.resolve();

        const childrenNodes = ((model.relationships.find((e) => e.name === relationship?.id)?.$cstNode) as CompositeCstNodeImpl).content;
        const lastChild = childrenNodes[childrenNodes.length - 1];

        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: Range.create(Position.create(lastChild.range.start.line, 0), Position.create(lastChild.range.end.line, lastChild.range.end.character)),
                        newText: expandToString`
                            SOURCE_ATTRIBUTE = TARGET_ATTRIBUTE
                        }`
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        await server.dispatch(workspaceEditAction);

        return Promise.resolve();
    }
}