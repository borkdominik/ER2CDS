
import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol'; 
import { State, StateMachine, Transition } from './generated/ast.js';

export class ER2CDSDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<StateMachine>): SModelRoot {
        const { document } = args;
        const sm = document.parseResult.value;
        return {
            type: 'graph',
            id: sm.name ?? 'root',
            children: [
                ...sm.states.map(s => this.generateNode(s, args)),
                ...sm.states.flatMap(s => s.transitions).map(t => this.generateEdge(t, args))
            ]
        };
    }

    protected generateNode(state: State, { idCache }: GeneratorContext<StateMachine>): SNode {
        const nodeId = idCache.uniqueId(state.name, state);
        return {
            type: 'node',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: state.name
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

    protected generateEdge(transition: Transition, { idCache }: GeneratorContext<StateMachine>): SEdge {
        const sourceId = idCache.getId(transition.$container);
        const targetId = idCache.getId(transition.state?.ref);
        const edgeId = idCache.uniqueId(`${sourceId}:${transition.event?.ref?.name}:${targetId}`, transition);
        return {
            type: 'edge',
            id: edgeId,
            sourceId: sourceId!,
            targetId: targetId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    text: transition.event?.ref?.name
                }
            ]
        };
    }

}