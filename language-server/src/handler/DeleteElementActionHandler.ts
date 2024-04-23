import { URI } from 'langium';
import { DeleteElementAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { SModelIndex } from 'sprotty-protocol';
import { ER2CDS } from '../generated/ast.js';
import { Range } from 'vscode-languageserver'
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { COMP_ATTRIBUTES_ROW, EDGE, Edge, NODE_ENTITY, NODE_RELATIONSHIP } from '../model.js';


export class DeleteElementActionHandler {
    public handle(action: DeleteElementAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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

        if (action.elementIds) {
            action.elementIds.forEach(id => {
                const element = modelIndex.getById(id);

                if (element?.type === NODE_ENTITY) {
                    model.entities.forEach((e) => {
                        if (e.name === element?.id && e.$cstNode?.range)
                            server.dispatch(this.createWorkspaceEditDeleteAction(sourceUri, e.$cstNode?.range));
                    });
                }

                if (element?.type === NODE_RELATIONSHIP) {
                    model.relationships.forEach((r) => {
                        if (r.name === element?.id && r.$cstNode?.range)
                            server.dispatch(this.createWorkspaceEditDeleteAction(sourceUri, r.$cstNode?.range));
                    });
                }

                if (element?.type === EDGE) {
                    const edge = element as Edge;

                    model.relationships.forEach((r) => {
                        if (r.name === edge.sourceId || r.name === edge.targetId) {
                            if ((r.first?.target.$refText === edge.sourceId || r.first?.target.$refText === edge.targetId) && r.first?.$cstNode?.range)
                                server.dispatch(this.createWorkspaceEditDeleteAction(sourceUri, r.first.$cstNode?.range));

                            if ((r.second?.target.$refText === edge.sourceId || r.second?.target.$refText === edge.targetId) && r.second.$cstNode?.range)
                                server.dispatch(this.createWorkspaceEditDeleteAction(sourceUri, r.second.$cstNode?.range));
                        }
                    });
                }

                if (element?.type === COMP_ATTRIBUTES_ROW) {
                    const split = element.id.split('.');
                    const entityId = split[0];
                    const attributeId = split[1];

                    model.entities.filter(e => e.name === entityId).map(e => e.attributes.forEach(a => {
                        if (a.name === attributeId && a.$cstNode?.range)
                            server.dispatch(this.createWorkspaceEditDeleteAction(sourceUri, a.$cstNode?.range));
                    }));
                }
            });
        }

        return Promise.resolve();
    }

    private createWorkspaceEditDeleteAction(sourceUri: URI, range: Range): WorkspaceEditAction {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: range,
                        newText: ''
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        return workspaceEditAction;
    }
}