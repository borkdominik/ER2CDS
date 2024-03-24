import { AnchorComputerRegistry, MouseListener, PolylineEdgeRouter, SConnectableElementImpl, SModelElementImpl, findChildrenAtPosition, findParentByFeature, isBoundsAware, isConnectable } from 'sprotty';
import { Action, Point, Bounds } from 'sprotty-protocol';
import { absoluteToParent, getAbsolutePosition, toAbsoluteBounds } from '../../../utils/viewpoint-utils';
import { createEdgeEndId, CreateEdgeEnd } from './edge-create-utils';
import { DrawHelperLinesAction } from '../../../helper-lines/actions';
import { DEFAULT_HELPER_LINE_OPTIONS } from '../../../helper-lines/helper-lines';

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

            if (Point.euclideanDistance(anchor, edgeEnd.position) > 1) {
                // const elementIds = [edge.id, endAtMousePosition.id];
                // return [DrawHelperLinesAction.create({ elementIds, ...DEFAULT_HELPER_LINE_OPTIONS })];
            }

        } else {
            // const elementIds = [edge.id, edgeEnd.id];
            // return [DrawHelperLinesAction.create({ elementIds, ...DEFAULT_HELPER_LINE_OPTIONS })];
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