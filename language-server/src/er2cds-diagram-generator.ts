
import { GeneratorContext, IdCache, LangiumDiagramGenerator } from 'langium-sprotty';
import { SCompartment, SLabel } from 'sprotty-protocol';
import { Attribute, ER2CDS, Entity, Relationship, RelationshipEntity } from './generated/ast.js';
import { ER2CDSServices } from './er2cds-module.js';
import { AstNode } from 'langium';
import { LayoutOptions } from 'elkjs';
import {
    ER2CDSRoot, Edge, EntityNode, RelationshipNode,
    GRAPH, NODE_ENTITY, NODE_RELATIONSHIP, EDGE,
    COMP_ATTRIBUTES, COMP_ATTRIBUTES_ROW, COMP_ENTITY_HEADER,
    LABEL_ATTRIBUTE, LABEL_CARDINALITY, LABEL_ENTITY, LABEL_RELATIONSHIP, LABEL_SEPARATOR
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

        return <RelationshipNode>{
            type: NODE_RELATIONSHIP,
            id: relationshipId,
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

            edges.push(this.generateEdge(relationship.first, source!, target!, idCache));
        }

        if (relationship.second && relationship.second.$container) {
            const source = idCache.getId(relationship);
            const target = idCache.getId(relationship.second.target.ref);

            edges.push(this.generateEdge(relationship.second, source!, target!, idCache));
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
                    id: attributeId + '.name',
                    text: attribute.name,
                    type: LABEL_ATTRIBUTE
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
                }
            ]
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