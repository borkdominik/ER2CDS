import { URI } from 'vscode-uri';
import { CreateElementAction } from '../actions.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { NODE_ENTITY, NODE_RELATIONSHIP } from '../model.js';
import { ER2CDS, Entity, Relationship } from '../generated/ast.js';
import { synchronizeModelToText } from '../serializer/serializer.js';

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

        const model = document.parseResult.value as ER2CDS;

        switch (action.elementType) {
            case NODE_ENTITY:
                const newEntity: Entity = {
                    $type: 'Entity',
                    $container: model,
                    name: this.getNewEntityName('Entity', model.entities),
                    attributes: []
                }

                model.entities.push(newEntity);

                break;

            case NODE_RELATIONSHIP:
                const newRelationship: Relationship = {
                    $type: 'Relationship',
                    $container: model,
                    name: this.getNewRelationshipName('Relationship', model.relationships),
                    joinClauses: []
                }

                model.relationships.push(newRelationship);

                break;
        }

        return synchronizeModelToText(model, sourceUri, server, services);
    }

    private getNewEntityName(prefix: string, elements: Entity[] | undefined): string {
        if (!elements)
            return this.createName(prefix, 0);

        let count = 0;
        for (let i = 0; i < elements.length; i += 1) {
            let name = this.createName(prefix, count);

            if (!elements.some(e => e.name === name))
                return name;

            count += 1
        }

        return this.createName(prefix, count);
    }


    private getNewRelationshipName(prefix: string, elements: Relationship[] | undefined): string {
        if (!elements)
            return this.createName(prefix, 0);

        let count = 0;
        for (let i = 0; i < elements.length; i += 1) {
            let name = this.createName(prefix, count);

            if (!elements.some(e => e.name === name))
                return name;

            count += 1
        }

        return this.createName(prefix, count);
    }

    private createName(prefix: string, count: number): string {
        return prefix + count;
    }
}