
import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SLabel, SModelRoot, SNode } from 'sprotty-protocol';
import { ER2CDS, Entity, Relationship } from './generated/ast.js';
import { ER2CDSServices } from './er2cds-module.js';

export const GRAPH = 'graph';

export const NODE_ENTITY = 'node:entity';
export const NODE_RELATIONSHIP = 'node:relationship';

export const LABEL_ENTITY = 'label:entity';
export const LABEL_RELATIONSHIP = 'label:relationship';

export class ER2CDSDiagramGenerator extends LangiumDiagramGenerator {

    constructor(services: ER2CDSServices) {
        super(services);
    }

    protected generateRoot(args: GeneratorContext<ER2CDS>): SModelRoot {
        const { document } = args;
        const sm = document.parseResult.value;
        return {
            type: GRAPH,
            id: sm.name ?? 'root',
            children: [
                ...sm.entities.map(e => this.generateEntity(e, args)),
                ...sm.relationships.map(r => this.generateRelationship(r, args))
            ]
        };
    }

    protected generateEntity(entity: Entity, { idCache }: GeneratorContext<ER2CDS>): SNode {
        const entityId = idCache.uniqueId(entity.name, entity);

        return {
            type: NODE_ENTITY,
            id: entityId,
            children: [
                <SLabel>{
                    type: LABEL_ENTITY,
                    id: idCache.uniqueId(entityId + '.label'),
                    text: entity.name
                }
            ],
            layout: 'stack',
            layoutOptions: {
                paddingTop: 10.0,
                paddingBottom: 10.0,
                paddingLeft: 10.0,
                paddingRight: 10.0
            }
        };
    }

    protected generateRelationship(relationship: Relationship, { idCache }: GeneratorContext<ER2CDS>): SNode {
        const relationshipId = idCache.uniqueId(relationship.name, relationship);

        return {
            type: NODE_RELATIONSHIP,
            id: relationshipId,
            children: [
                <SLabel>{
                    type: LABEL_RELATIONSHIP,
                    id: idCache.uniqueId(relationshipId + '.label'),
                    text: relationship.name
                }
            ],
            layout: 'stack',
            layoutOptions: {
                paddingTop: 10.0,
                paddingBottom: 10.0,
                paddingLeft: 10.0,
                paddingRight: 10.0
            }
        };
    }
}