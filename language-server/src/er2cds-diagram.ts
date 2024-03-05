
import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SLabel, SModelRoot, SNode } from 'sprotty-protocol';
import { ER2CDS, Entity, Relationship } from './generated/ast.js';

export class ER2CDSDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<ER2CDS>): SModelRoot {
        const { document } = args;
        const sm = document.parseResult.value;
        return {
            type: 'graph',
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
            type: 'node:entity',
            id: entityId,
            children: [
                <SLabel>{
                    type: 'label:entity',
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
            type: 'node:relationship',
            id: relationshipId,
            children: [
                <SLabel>{
                    type: 'label:relationship',
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