import { ApplyLabelEditAction } from 'sprotty-protocol';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { UpdateElementPropertyAction } from '../actions.js';
import { ApplyLabelEditActionHandler } from './ApplyLabelEditActionHandler.js';
import { CompositeCstNode, URI } from 'langium';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { ER2CDS } from '../generated/ast.js';

export class UpdateElementPropertyHandler {
    public handle(action: UpdateElementPropertyAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        switch (action.propertyId) {
            case 'type':
                return this.handleTypeEdit(action, server, services);

            default:
                const applyLabelEditAction = ApplyLabelEditAction.create(action.propertyId, action.value);
                return new ApplyLabelEditActionHandler().handle(applyLabelEditAction, server, services);

        }
    }

    private handleTypeEdit(action: UpdateElementPropertyAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
        if (!document)
            return Promise.resolve();

        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const model = document.parseResult.value as ER2CDS;

        model.entities.filter(e => e.name === entityId).map(e => e.attributes.forEach(a => {
            if (a.name === attributeId && (a.$cstNode as CompositeCstNode).content.length > 3) {
                const range = (a.$cstNode as CompositeCstNode).content[3].range;

                const workspaceEditAction: WorkspaceEditAction = {
                    kind: WorkspaceEditAction.KIND,
                    workspaceEdit: {
                        changes: {
                            [sourceUri.toString()]: [
                                {
                                    range: range,
                                    newText: action.value
                                }
                            ]
                        }
                    }

                }

                server.dispatch(workspaceEditAction);
            }
        }));

        return Promise.resolve();
    }
}