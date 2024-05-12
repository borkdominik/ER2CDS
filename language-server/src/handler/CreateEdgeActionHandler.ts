import { URI } from 'vscode-uri';
import { ER2CDSServices } from '../er2cds-module.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { CreateEdgeAction } from '../actions.js';
import { ER2CDS } from '../generated/ast.js';
import { synchronizeModelToText } from '../serializer/serializer.js';

export class CreateEdgeActionHandler {
    public handle(action: CreateEdgeAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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

        let relationship = model.relationships.find(r => r.name === action.sourceElementId);
        let entity = model.entities.find(e => e.name === action.targetElementId);
        if (!relationship) {
            relationship = model.relationships.find(r => r.name === action.targetElementId);
            entity = model.entities.find(e => e.name === action.sourceElementId);
        }

        if (!relationship || !entity)
            return Promise.resolve();

        if (relationship.name === action.sourceElementId) {
            relationship.target = {
                $type: 'RelationshipEntity',
                $container: relationship,
                target:
                {
                    ref: entity,
                    $refText: entity.name
                }
            }
        } else {
            relationship.source = {
                $type: 'RelationshipEntity',
                $container: relationship,
                target:
                {
                    ref: entity,
                    $refText: entity.name
                }
            }
        }

        return synchronizeModelToText(model, sourceUri, server, services);
    }
}