import { URI } from 'langium';
import { DeleteElementAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { SModelIndex } from 'sprotty-protocol';
import { ER2CDS } from '../generated/ast.js';
import { COMP_ATTRIBUTE, COMP_JOIN_CLAUSE, EDGE, Edge, NODE_ENTITY, NODE_RELATIONSHIP } from '../model.js';
import { synchronizeModelToText } from '../serializer/serializer.js';


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
                    model.entities = model.entities.filter(e => e.name !== id);
                }

                if (element?.type === NODE_RELATIONSHIP) {
                    model.relationships = model.relationships.filter(r => r.name !== id);
                }

                if (element?.type === EDGE) {
                    const edge = element as Edge;

                    model.relationships = model.relationships.filter(r =>
                        (r.source?.target.$refText !== edge.sourceId && r.source?.target.$refText !== edge.targetId) &&
                        (r.target?.target.$refText !== edge.sourceId && r.target?.target.$refText !== edge.targetId)
                    );
                }

                if (element?.type === COMP_ATTRIBUTE) {
                    const split = element.id.split('.');
                    const entityId = split[0];
                    const attributeId = split[1];

                    model.entities.filter(e => e.name === entityId).map(e => {
                        e.attributes = e.attributes.filter(a => a.name !== attributeId)
                    });
                }

                if (element?.type === COMP_JOIN_CLAUSE) {
                    const split = element.id.split('.');
                    const relationshipId = split[0];
                    const firstJoinClauseAttributeId = split[1];
                    const secondJoinClauseAttributeId = split[2];

                    model.relationships.filter(e => e.name === relationshipId).map(e => {
                        e.joinClauses = e.joinClauses.filter(jc => jc.firstAttribute.$refText !== firstJoinClauseAttributeId || jc.secondAttribute.$refText !== secondJoinClauseAttributeId);
                    });
                }
            });
        }

        return synchronizeModelToText(model, sourceUri, server, services);
    }
}