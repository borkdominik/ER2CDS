
import { GeneratorContext, IdCache, LangiumDiagramGenerator } from 'langium-sprotty';
import { SCompartment, SLabel } from 'sprotty-protocol';
import { Attribute, ER2CDS, Entity, Relationship, RelationshipJoinClause, RelationshipEntity } from './generated/ast.js';
import { ER2CDSServices } from './er2cds-module.js';
import { AstNode } from 'langium';
import { LayoutOptions } from 'elkjs';
import {
    ER2CDSRoot, Edge, EntityNode, RelationshipNode,
    GRAPH, NODE_ENTITY, NODE_RELATIONSHIP, EDGE,
    COMP_ATTRIBUTES, COMP_ATTRIBUTE, COMP_ENTITY_HEADER,
    LABEL_ATTRIBUTE, LABEL_CARDINALITY, LABEL_ENTITY, LABEL_RELATIONSHIP, LABEL_SEPARATOR,
    LABEL_ATTRIBUTE_KEY,
    COMP_JOIN_TABLE,
    COMP_JOIN_CLAUSE,
    COMP_JOIN_CLAUSES,
    LABEL_JOIN_TABLE,
    LABEL_JOIN_ORDER,
    LABEL_ATTRIBUTE_NO_OUT,
    LABEL_RELATIONSHIP_ASSOCIATION,
    LABEL_RELATIONSHIP_ASSOCIATION_TO_PARENT,
    LABEL_RELATIONSHIP_COMPOSITION,
    LABEL_ENTITY_ALIAS
} from './model.js';

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

        if (sm.relationships) {
            sm.relationships.forEach(r => {
                graph.children?.push(this.generateRelationship(r, args));
                graph.children?.push(...this.generateEdges(r, args).flat().filter((e): e is Edge => !!e));
            });
        }

        return graph;
    }

    protected generateEntity(entity: Entity, { idCache }: GeneratorContext<ER2CDS>): EntityNode {
        const entityId = idCache.uniqueId(entity.name, entity);

        const node = <EntityNode>{
            type: NODE_ENTITY,
            id: entityId,
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
                },
                <SLabel>{
                    type: LABEL_ENTITY_ALIAS,
                    id: idCache.uniqueId(entity + '.alias'),
                    text: entity.alias
                }
            ]
        };
        node.children?.push(headerCompartment);

        const attributesCompartment = <SCompartment>{
            type: COMP_ATTRIBUTES,
            id: idCache.uniqueId(entityId + '.attributes'),
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

        let relationshipTypeLabel;
        switch (relationship.type) {
            case 'association':
                relationshipTypeLabel = LABEL_RELATIONSHIP_ASSOCIATION;
                break;

            case 'association-to-parent':
                relationshipTypeLabel = LABEL_RELATIONSHIP_ASSOCIATION_TO_PARENT;
                break;

            case 'composition':
                relationshipTypeLabel = LABEL_RELATIONSHIP_COMPOSITION;
                break;

            default:
                relationshipTypeLabel = LABEL_RELATIONSHIP;
        }

        const node = <RelationshipNode>{
            type: NODE_RELATIONSHIP,
            id: relationshipId,
            children: [
                <SLabel>{
                    type: relationshipTypeLabel,
                    id: idCache.uniqueId(relationshipId + '.label'),
                    text: relationship.name
                }
            ],
            layout: 'vbox',
            layoutOptions: {
                paddingFactor: 2.0
            }
        };

        const joinTableCompartment = <SCompartment>{
            type: COMP_JOIN_TABLE,
            id: idCache.uniqueId(relationshipId + '.join-table-comp'),
            children: [
                <SLabel>{
                    type: LABEL_JOIN_TABLE,
                    id: idCache.uniqueId(relationshipId + '.source-join-table-label'),
                    text: relationship.source?.target.$refText
                },
                <SLabel>{
                    type: LABEL_JOIN_TABLE,
                    id: idCache.uniqueId(relationshipId + '.target-join-table-label'),
                    text: relationship.target?.target.$refText
                },
                <SLabel>{
                    type: LABEL_JOIN_ORDER,
                    id: idCache.uniqueId(relationshipId + '.join-order-label'),
                    text: relationship.joinOrder?.toString()
                }
            ]
        };
        node.children?.push(joinTableCompartment);

        const joinClauseCompartment = <SCompartment>{
            type: COMP_JOIN_CLAUSES,
            id: idCache.uniqueId(relationshipId + '.join-clause-comp'),
            children: relationship.joinClauses.map(jc => this.generateJoinClauseLabels(jc, relationshipId, idCache))
        }
        node.children?.push(joinClauseCompartment);

        return node;
    }

    protected generateEdges(relationship: Relationship, { idCache }: GeneratorContext<ER2CDS>): (Edge | undefined)[] {
        let edges: (Edge | undefined)[] = [];

        if (relationship.source && relationship.source.$container) {
            const source = idCache.getId(relationship.source.target.ref)
            const target = idCache.getId(relationship)

            edges.push(this.generateEdge(relationship.source, source!, target!, idCache));
        }

        if (relationship.target && relationship.target.$container) {
            const source = idCache.getId(relationship);
            const target = idCache.getId(relationship.target.target.ref);

            edges.push(this.generateEdge(relationship.target, source!, target!, idCache));
        }

        return edges;
    }

    private generateEdge(relationshipEntity: RelationshipEntity, source: string, target: string, idCache: IdCache<AstNode>): Edge | undefined {
        const relationship = relationshipEntity.$container;
        const edgeId = idCache.uniqueId(source + ':' + relationship.name + ':' + target, relationshipEntity);

        return <Edge>{
            type: EDGE,
            id: edgeId,
            sourceId: source,
            targetId: target,
            cardinality: this.getCardinality(relationshipEntity),
            children: [
                <SLabel>{
                    type: LABEL_CARDINALITY,
                    id: idCache.uniqueId(edgeId + '.label'),
                    text: this.getCardinality(relationshipEntity)
                }
            ]
        }
    }

    protected getCardinality(relationshipEntity: RelationshipEntity): string {
        if (relationshipEntity.cardinality)
            return relationshipEntity.cardinality;

        return ' '
    }

    protected generateAttributeLabels(attribute: Attribute, entityId: string, idCache: IdCache<AstNode>): SCompartment {
        const attributeId = idCache.uniqueId(entityId + '.' + attribute.name, attribute);

        let attributeType = LABEL_ATTRIBUTE;
        if (attribute.type === 'key') {
            attributeType = LABEL_ATTRIBUTE_KEY;
        } else if (attribute.type === 'no-out') {
            attributeType = LABEL_ATTRIBUTE_NO_OUT;
        }

        return <SCompartment>{
            type: COMP_ATTRIBUTE,
            id: attributeId,
            layout: 'hbox',
            layoutOptions: <LayoutOptions>{
                VAlign: 'middle',
                HGap: '5.0'
            },
            children: [
                <SLabel>{
                    id: attributeId + '.label',
                    text: attribute.name,
                    type: attributeType
                },
                <SLabel>{
                    id: attributeId + '.separator',
                    text: ':',
                    type: LABEL_SEPARATOR
                },
                <SLabel>{
                    id: attributeId + '.datatype',
                    text: this.getAttributeDatatypeString(attribute),
                    type: LABEL_ATTRIBUTE
                },
                <SLabel>{
                    id: attributeId + '.alias',
                    text: attribute.alias,
                    type: LABEL_ATTRIBUTE
                }
            ]
        };
    }

    protected getAttributeDatatypeString(attribute: Attribute) {
        if (attribute.datatype) {
            return attribute.datatype.type;
        }

        return ' ';
    }

    protected generateJoinClauseLabels(relationshipJoinClause: RelationshipJoinClause, relationshipId: string, idCache: IdCache<AstNode>): SCompartment {
        const attributeId = idCache.uniqueId(relationshipId + '.' + relationshipJoinClause.firstAttribute?.$refText + '.' + relationshipJoinClause.secondAttribute?.$refText, relationshipJoinClause);

        return <SCompartment>{
            type: COMP_JOIN_CLAUSE,
            id: attributeId,
            children: [
                <SLabel>{
                    id: attributeId + '.join-clause-first-label',
                    text: relationshipJoinClause.firstAttribute?.$refText,
                    type: LABEL_ATTRIBUTE
                },
                <SLabel>{
                    id: attributeId + '.join-clause-second-label',
                    text: relationshipJoinClause.secondAttribute?.$refText,
                    type: LABEL_ATTRIBUTE
                }
            ]
        };
    }
}