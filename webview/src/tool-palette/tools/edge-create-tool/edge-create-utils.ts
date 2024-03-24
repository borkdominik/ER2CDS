import { CommandExecutionContext, SChildElementImpl, SDanglingAnchorImpl, SModelElementImpl, SModelRootImpl, SRoutableElementImpl, findParentByFeature, isBoundsAware, isConnectable } from 'sprotty';
import { EDGE } from '../../../model';
import { toAbsolutePosition } from '../../../utils/viewpoint-utils';
import { SEdge } from 'sprotty-protocol';

export class CreateEdgeEnd extends SDanglingAnchorImpl {
    static readonly TYPE = 'create-edge-end';

    constructor(readonly sourceId: string, public createEdge: SRoutableElementImpl | undefined = undefined, override readonly type: string = CreateEdgeEnd.TYPE) {
        super();
    }
}

export function createEdgeId(root: SModelRootImpl): string {
    return root.id + '_create_edge_end_edge';
}

export function createEdgeEndId(root: SModelRootImpl): string {
    return root.id + '_create_edge_end_anchor';
}

export const defaultFeedbackEdgeSchema: Partial<SEdge> = {
    cssClasses: ['feedback-edge'],
    opacity: 0.3
};

export function drawCreateEdgeEnd(context: CommandExecutionContext, sourceId: string): void {
    const root = context.root;
    const sourceChild = root.index.getById(sourceId);

    if (!sourceChild)
        return;

    const source = findParentByFeature(sourceChild, isConnectable);
    if (!source || !isBoundsAware(source))
        return;

    const edgeEnd = new CreateEdgeEnd(source.id);
    edgeEnd.id = createEdgeEndId(root);
    edgeEnd.position = toAbsolutePosition(source);

    const edgeSchema: SEdge = {
        id: createEdgeId(root),
        type: EDGE,
        sourceId: source.id,
        targetId: edgeEnd.id,
        ...defaultFeedbackEdgeSchema
    };

    const createEdge = context.modelFactory.createElement(edgeSchema);

    if (isRoutable(createEdge)) {
        edgeEnd.createEdge = createEdge;
        root.add(edgeEnd);
        root.add(createEdge);
    }
}

export function removeDanglingCreateEdgeEnd(root: SModelRootImpl): void {
    const createEdge = root.index.getById(createEdgeId(root));
    const createEdgeEnd = root.index.getById(createEdgeEndId(root));

    if (createEdge instanceof SChildElementImpl)
        root.remove(createEdge);

    if (createEdgeEnd instanceof SChildElementImpl)
        root.remove(createEdgeEnd);
}

export function isRoutable<T extends SModelElementImpl>(element: T): element is T & SRoutableElementImpl {
    return element instanceof SRoutableElementImpl && (element as any).routingPoints !== undefined;
}