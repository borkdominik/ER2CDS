import { CommandExecutionContext, InternalBoundsAware, SChildElementImpl, SDanglingAnchorImpl, SModelElementImpl, SModelRootImpl, SRoutableElementImpl, findParentByFeature, isAlignable, isBoundsAware, isConnectable, translateBounds } from 'sprotty';
import { Edge } from '../../../model';
import { Point, Bounds } from 'sprotty-protocol';

export class CreateEdgeEnd extends SDanglingAnchorImpl {
    static readonly TYPE = 'create-edge-end';

    constructor(readonly sourceId: string, public createEdge: SRoutableElementImpl | undefined = undefined, override readonly type: string = CreateEdgeEnd.TYPE) {
        super();
    }
}

export function createEdgeId(root: SModelRootImpl): string {
    return root.id + '_create_edge';
}

export function createEdgeEndId(root: SModelRootImpl): string {
    return root.id + '_create_anchor';
}

export function drawCreateEdge(context: CommandExecutionContext, sourceId: string): void {
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

    const createEdge = context.modelFactory.createElement(new Edge());
    if (isRoutable(createEdge)) {
        edgeEnd.createEdge = createEdge;
        root.add(edgeEnd);
        root.add(createEdge);
    }
}

export function removeDanglingCreateEdge(root: SModelRootImpl): void {
    const createEdge = root.index.getById(createEdgeId(root));
    const createEdgeEnd = root.index.getById(createEdgeEndId(root));

    if (createEdge instanceof SChildElementImpl)
        root.remove(createEdge);

    if (createEdgeEnd instanceof SChildElementImpl)
        root.remove(createEdgeEnd);
}

export function toAbsolutePosition(target: SModelElementImpl & InternalBoundsAware): Point {
    return toAbsoluteBounds(target);
}

export function toAbsoluteBounds(element: SModelElementImpl & InternalBoundsAware): Bounds {
    const location = isAlignable(element) ? element.alignment : Point.ORIGIN;
    const x = location.x;
    const y = location.y;
    const width = element.bounds.width;
    const height = element.bounds.height;
    return translateBounds({ x, y, width, height }, element, element.root);
}

export function isRoutable<T extends SModelElementImpl>(element: T): element is T & SRoutableElementImpl {
    return element instanceof SRoutableElementImpl && (element as any).routingPoints !== undefined;
}