
import { GeneratorContext, IdCache, LangiumDiagramGenerator } from 'langium-sprotty';
import { SLabel } from 'sprotty-protocol';
import { ER2CDS, Entity, Relationship, RelationshipEntity } from './generated/ast.js';
import { ER2CDSServices } from './er2cds-module.js';
import { AstNode } from 'langium';
import { EDGE, EDGE_INHERITANCE, ER2CDSRoot, Edge, EntityNode, GRAPH, LABEL_BOTTOM, LABEL_BOTTOM_LEFT, LABEL_BOTTOM_RIGHT, LABEL_ENTITY, LABEL_RELATIONSHIP, LABEL_TOP, LABEL_TOP_LEFT, LABEL_TOP_RIGHT, NODE_ENTITY, NODE_RELATIONSHIP, RelationshipNode } from './model.js';

export class ER2CDSDiagramGenerator extends LangiumDiagramGenerator {

    constructor(services: ER2CDSServices) {
        super(services);
    }

    protected generateRoot(args: GeneratorContext<ER2CDS>): ER2CDSRoot {
        const { document } = args;
        const sm = document.parseResult.value;

        const graph: ER2CDSRoot = {
            type: GRAPH,
            id: sm.name ?? 'root',
            name: sm.name,
            children: []
        };

        graph.children?.push(...sm.entities.map(e => this.generateEntity(e, args)));
        graph.children?.push(...sm.entities.map(e => this.generateInheritanceEdges(e, args)).filter((e): e is Edge => !!e));

        sm.relationships.forEach(r => {
            graph.children?.push(this.generateRelationship(r, args));
            graph.children?.push(...this.generateEdges(r, args).flat().filter((e): e is Edge => !!e));
        });

        return graph;
    }

    protected generateEntity(entity: Entity, { idCache }: GeneratorContext<ER2CDS>): EntityNode {
        const entityId = idCache.uniqueId(entity.name, entity);

        return {
            type: NODE_ENTITY,
            id: entityId,
            weak: entity.weak,
            expanded: false,
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

    protected generateRelationship(relationship: Relationship, { idCache }: GeneratorContext<ER2CDS>): RelationshipNode {
        const relationshipId = idCache.uniqueId(relationship.name, relationship);

        return {
            type: NODE_RELATIONSHIP,
            id: relationshipId,
            weak: relationship.weak,
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

    protected generateEdges(relationship: Relationship, { idCache }: GeneratorContext<ER2CDS>): (Edge | undefined)[] {
        let edges: (Edge | undefined)[] = [];

        if (relationship.first && relationship.first.$container) {
            const source = idCache.getId(relationship.first.target.ref)
            const target = idCache.getId(relationship)

            edges.push(this.generateEdge(relationship.first, undefined, source!, target!, idCache));
        }

        if (relationship.second && relationship.second.$container) {
            const source = idCache.getId(relationship);
            const target = idCache.getId(relationship.second.target.ref);

            edges.push(this.generateEdge(relationship.second, undefined, source!, target!, idCache));
        }

        return edges;
    }

    private generateEdge(sourceRelationshipEntity: RelationshipEntity, targetRelationshipEntity: RelationshipEntity | undefined, source: string, target: string, idCache: IdCache<AstNode>): Edge | undefined {
        const relationship = sourceRelationshipEntity.$container;
        const edgeId = idCache.uniqueId(source + ':' + relationship.name + ':' + target, sourceRelationshipEntity);

        return {
            type: EDGE,
            id: edgeId,
            sourceId: source,
            targetId: target,
            cardinality: this.getCardinality(sourceRelationshipEntity),
            children: this.generateLabels(sourceRelationshipEntity, targetRelationshipEntity, edgeId, idCache)
        }
    }

    protected generateLabels(sourceRelationshipEntity: RelationshipEntity, targetRelationshipEntity: RelationshipEntity | undefined, edgeId: string, idCache: IdCache<AstNode>): SLabel[] {
        const typeCardinality = targetRelationshipEntity ? LABEL_TOP_LEFT : LABEL_TOP;
        const typeRole = targetRelationshipEntity ? LABEL_BOTTOM_LEFT : LABEL_BOTTOM;

        let labels: SLabel[] = [];

        labels.push({
            type: typeCardinality,
            id: idCache.uniqueId(edgeId + '.label'),
            text: this.getCardinality(sourceRelationshipEntity)
        });

        labels.push({
            type: typeRole,
            id: idCache.uniqueId(edgeId + '.roleLabel'),
            text: sourceRelationshipEntity.role!
        });

        if (targetRelationshipEntity) {
            const relationship = sourceRelationshipEntity.$container;

            labels.push({
                type: LABEL_TOP,
                id: idCache.uniqueId(edgeId + '.relationName'),
                text: relationship.name
            });

            labels.push({
                type: LABEL_TOP_RIGHT,
                id: idCache.uniqueId(edgeId + '.additionalLabel'),
                text: this.getCardinality(targetRelationshipEntity)
            });

            labels.push({
                type: LABEL_BOTTOM_RIGHT,
                id: idCache.uniqueId(edgeId + '.additionalRoleLabel'),
                text: targetRelationshipEntity.role!
            });
        }

        return labels;
    }

    protected generateInheritanceEdges(entity: Entity, { idCache }: GeneratorContext<ER2CDS>): Edge | undefined {
        const sourceId = idCache.getId(entity);
        const targetId = idCache.getId(entity.extends?.ref);

        if (sourceId && targetId) {
            return {
                type: EDGE_INHERITANCE,
                id: idCache.uniqueId(entity + sourceId + ':extends:' + targetId),
                sourceId: sourceId,
                targetId: targetId,
                children: []
            };
        }

        return;
    }

    protected getCardinality(relationshipEntity: RelationshipEntity): string {
        if (relationshipEntity.cardinality && relationshipEntity.cardinality !== 'none')
            return relationshipEntity.cardinality;

        return ' '
    }
}