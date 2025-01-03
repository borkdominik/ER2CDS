import { URI } from 'langium';
import { CreateWhereClauseAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { Attribute, EntityWhereClause, ER2CDS } from '../generated/ast.js';
import { synchronizeModelToText } from '../serializer/serializer.js';

export class CreateWhereClauseActionHandler {
    public async handle(action: CreateWhereClauseAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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

        const entity = model.entities.find(r => r.name === action.elementId);
        if (!entity)
            return Promise.resolve();

        const newAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: 'ATTRIBUTE'
        }

        const newEntityWhereClause: EntityWhereClause = {
            $type: 'EntityWhereClause',
            $container: entity,
            attribute: {
                ref: newAttribute,
                $refText: 'ATTRIBUTE'
            },
            fixValue: `''`,
            comparison: '='
        }

        entity.whereClauses.push(newEntityWhereClause);

        return synchronizeModelToText(model, sourceUri, server, services);
    }
}