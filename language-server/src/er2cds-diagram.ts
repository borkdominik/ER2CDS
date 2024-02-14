
import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol';
import { ER2CDS, Entity, Relationship } from './generated/ast.js';

export class ER2CDSDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<ER2CDS>): SModelRoot {
        const { document } = args;
        const sm = document.parseResult.value;
        return {
            type: 'graph',
            id: sm.name ?? 'root',
            children: [
                ...sm.entities.map(e => this.generateNode(e, args)),
                ...sm.relationships.map(r => this.generateEdge(r, args))
            ]
        };
    }

    protected generateNode(entity: Entity, { idCache }: GeneratorContext<ER2CDS>): SNode {
        const nodeId = idCache.uniqueId(entity.name, entity);

        return {
            type: 'node',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: entity.name
                },
                <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
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

    protected generateEdge(relationship: Relationship, { idCache }: GeneratorContext<ER2CDS>): SEdge {
        const firstId = idCache.getId(relationship.first);
        const secondId = idCache.getId(relationship.second);
        const edgeId = idCache.uniqueId(`${firstId}:${relationship.first?.target.ref?.name}:${secondId}:${relationship.second?.target.ref?.name}`, relationship);

        return {
            type: 'edge',
            id: edgeId,
            sourceId: firstId!,
            targetId: secondId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    text: relationship.name
                }
            ]
        };
    }

}