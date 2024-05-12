import { URI } from 'langium';
import { CreateJoinClauseAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { Attribute, ER2CDS, RelationshipJoinClause } from '../generated/ast.js';
import { synchronizeModelToText } from '../serializer/serializer.js';

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

        const relationship = model.relationships.find(r => r.name === action.elementId);
        if (!relationship)
            return Promise.resolve();

        const newFirstAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: 'SOURCE_ATTRIBUTE',
        }

        const newSecondAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: 'TARGET_ATTRIBUTE'
        }

        const newRelationshipJoinClause: RelationshipJoinClause = {
            $type: 'RelationshipJoinClause',
            $container: relationship,
            firstAttribute: {
                ref: newFirstAttribute,
                $refText: 'SOURCE_ATTRIBUTE'
            },
            secondAttribute: {
                ref: newSecondAttribute,
                $refText: 'TARGET_ATTRIBUTE'
            },
        }

        relationship.joinClauses.push(newRelationshipJoinClause);

        return synchronizeModelToText(model, sourceUri, server, services);
    }
}