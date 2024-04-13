
import { GeneratorContext, IdCache, LangiumDiagramGenerator } from 'langium-sprotty';
import { SCompartment, SLabel } from 'sprotty-protocol';
import { Attribute, ER2CDS, Entity, Relationship, RelationshipEntity } from './generated/ast.js';
import { ER2CDSServices } from './er2cds-module.js';
import { AstNode } from 'langium';
import { COMP_ATTRIBUTES, COMP_ATTRIBUTES_ROW, COMP_ENTITY_HEADER, EDGE, EDGE_INHERITANCE, ER2CDSRoot, Edge, EntityNode, GRAPH, LABEL_BOTTOM, LABEL_BOTTOM_LEFT, LABEL_BOTTOM_RIGHT, LABEL_DERIVED, LABEL_ENTITY, LABEL_KEY, LABEL_PARTIAL_KEY, LABEL_RELATIONSHIP, LABEL_TEXT, LABEL_TOP, LABEL_TOP_LEFT, LABEL_TOP_RIGHT, LABEL_VISIBILITY, NODE_ENTITY, NODE_RELATIONSHIP, RelationshipNode } from './model.js';
import { LayoutOptions } from 'elkjs';

export class ER2CDSDiagramGenerator extends LangiumDiagramGenerator {

    constructor(protected services: ER2CDSServices) {
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

        if (sm.relationships) {
            sm.relationships.forEach(r => {
                graph.children?.push(this.generateRelationship(r, args));
                graph.children?.push(...this.generateEdges(r, args).flat().filter((e): e is Edge => !!e));
            });
        }

        return graph;
    }

    protected generateEntity(entity: Entity, { idCache, state }: GeneratorContext<ER2CDS>): EntityNode {
        const entityId = idCache.uniqueId(entity.name, entity);

        const node = <EntityNode>{
            type: NODE_ENTITY,
            id: entityId,
            weak: entity.weak,
            layout: 'vbox',
            layoutOptions: {
                VGap: 10.0,
            },
            children: []
        };

        const headerCompartment = <SCompartment>{
            type: COMP_ENTITY_HEADER,
            id: idCache.uniqueId(entityId + '.header-comp'),
            layout: 'hbox',
            children: [
                <SLabel>{
                    type: LABEL_ENTITY,
                    id: idCache.uniqueId(entityId + '.label'),
                    text: entity.name
                }
            ]
        };
        node.children?.push(headerCompartment);

        const attributesCompartment = <SCompartment>{
            type: COMP_ATTRIBUTES,
            id: entityId + '.attributes',
            layout: 'vbox',
            layoutOptions: <LayoutOptions>{
                HAlign: 'left',
                VGap: '1.0'
            },
            children: entity.attributes.map(a => this.generateAttributeLabels(a, entityId, idCache))
        };
        node.children?.push(attributesCompartment);

        return node;
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
            layout: 'vbox',
            layoutOptions: {
                paddingFactor: 2.0
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

    protected getCardinality(relationshipEntity: RelationshipEntity): string {
        if (relationshipEntity.cardinality && relationshipEntity.cardinality !== 'none')
            return relationshipEntity.cardinality;

        return ' '
    }

    protected generateAttributeLabels(attribute: Attribute, entityId: string, idCache: IdCache<AstNode>): SCompartment {
        const attributeId = idCache.uniqueId(entityId + '.' + attribute.name, attribute);
        const labelType = this.getAttributeLabelType(attribute);

        return <SCompartment>{
            type: COMP_ATTRIBUTES_ROW,
            id: attributeId,
            layout: 'hbox',
            layoutOptions: <LayoutOptions>{
                VAlign: 'middle',
                HGap: '5.0'
            },
            children: [
                <SLabel>{
                    id: attributeId + '.visibility',
                    text: attribute.visibility,
                    type: LABEL_VISIBILITY
                },
                <SLabel>{
                    id: attributeId + '.name',
                    text: attribute.name,
                    type: labelType
                },
                <SLabel>{
                    id: attributeId + '.datatype',
                    text: this.getAttributeDatatypeString(attribute),
                    type: labelType
                }
            ]
        }
    }

    protected getAttributeLabelType(attribute: Attribute): string {
        switch (attribute.type) {
            case 'key':
                return LABEL_KEY;

            case 'partial-key':
                return LABEL_PARTIAL_KEY;

            case 'derived':
                return LABEL_DERIVED;

            default:
                return LABEL_TEXT;
        }
    }

    protected getAttributeDatatypeString(attribute: Attribute) {
        if (attribute.datatype) {
            if (attribute.datatype?.size && attribute.datatype?.d) {
                return attribute.datatype?.type + '(' + attribute.datatype?.size + ', ' + attribute.datatype?.d + ')';

            } else if (attribute.datatype.size && !attribute.datatype.d) {
                return attribute.datatype.type + '(' + attribute.datatype.size + ')';

            }

            return attribute.datatype.type;
        }

        return ' ';
    }
}