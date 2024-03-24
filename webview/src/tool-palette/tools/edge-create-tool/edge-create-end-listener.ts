import { AnchorComputerRegistry, InternalBoundsAware, MouseListener, PolylineEdgeRouter, SChildElementImpl, SConnectableElementImpl, SModelElementImpl, findChildrenAtPosition, findParentByFeature, isBoundsAware, isConnectable } from 'sprotty';
import { Action, Point, Bounds, MoveAction } from 'sprotty-protocol';
import { getAbsolutePosition } from '../marquee-tool/marquee-util';
import { createEdgeEndId, CreateEdgeEnd, toAbsoluteBounds } from './edge-create-utils';

export class EdgeCreateEndMovingMouseListener extends MouseListener {
    constructor(protected anchorRegistry: AnchorComputerRegistry) {
        super();
    }

    override mouseMove(target: SModelElementImpl, event: MouseEvent): Action[] {
        const root = target.root;
        const edgeEnd = root.index.getById(createEdgeEndId(root));

        if (!(edgeEnd instanceof CreateEdgeEnd) || !edgeEnd.createEdge)
            return [];

        const edge = edgeEnd.createEdge;
        const position = getAbsolutePosition(edgeEnd, event);
        const endAtMousePosition = findChildrenAtPosition(target.root, position).reverse().find(element => isConnectable(element) && element.canConnect(edge, 'target'));

        if (endAtMousePosition instanceof SConnectableElementImpl && edge.source && isBoundsAware(edge.source)) {
            const anchor = this.computeAbsoluteAnchor(endAtMousePosition, Bounds.center(toAbsoluteBounds(edge.source)));

            if (Point.euclideanDistance(anchor, edgeEnd.position) > 1)
                MoveAction.create([{ elementId: edgeEnd.id, toPosition: anchor }], { animate: false });

        } else {
            MoveAction.create([{ elementId: edgeEnd.id, toPosition: position }], { animate: false })
        }

        return [];
    }

    protected computeAbsoluteAnchor(element: SConnectableElementImpl, absoluteReferencePoint: Point, offset?: number): Point {
        const referencePointInParent = absoluteToParent(element, absoluteReferencePoint);
        const anchorComputer = this.anchorRegistry.get(PolylineEdgeRouter.KIND, element.anchorKind);

        let anchor = anchorComputer.getAnchor(element, referencePointInParent, offset);

        if (element.parent !== element.root) {
            const parent = findParentByFeature(element.parent, isBoundsAware);

            if (parent) {
                const absoluteParentPosition = toAbsoluteBounds(parent);
                anchor = Point.add(absoluteParentPosition, anchor);
            }
        }

        return anchor;
    }
}

export function absoluteToParent(element: SModelElementImpl & InternalBoundsAware & SChildElementImpl, absolutePoint: Point): Point {
    if (isBoundsAware(element.parent))
        return absoluteToLocal(element.parent, absolutePoint);

    return absoluteToLocal(element, absolutePoint);
}

export function absoluteToLocal(element: SModelElementImpl & InternalBoundsAware, absolutePoint: Point): Point {
    const absoluteElementBounds = toAbsoluteBounds(element);
    return { x: absolutePoint.x - absoluteElementBounds.x, y: absolutePoint.y - absoluteElementBounds.y };
}