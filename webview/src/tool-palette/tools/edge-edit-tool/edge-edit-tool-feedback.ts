import { AnchorComputerRegistry, MouseListener, findChildrenAtPosition, isConnectable, isBoundsAware, PolylineEdgeRouter, findParentByFeature, EdgeRouterRegistry, ElementMove, isSelected, SModelElementImpl, SConnectableElementImpl, SRoutingHandleImpl, ISnapper, IActionDispatcher } from "sprotty";
import { getAbsolutePosition, toAbsoluteBounds } from "../../../utils/viewpoint-utils";
import { CreateEdgeEnd, createEdgeEndId, isRoutable } from "../edge-create-tool/edge-create-utils";
import { EdgeCreateEndMovingMouseListener } from "../edge-create-tool/edge-create-end-listener";
import { SwitchRoutingModeAction } from "./actions";
import { Action, MoveAction, Bounds, Point } from 'sprotty-protocol';
import { isRoutingHandle } from "../../../utils/model-utils";
import { PointPositionUpdater } from "../../../services/point-position-updater";

export class EditEdgeTargetMovingMouseListener extends EdgeCreateEndMovingMouseListener {
    constructor(protected anchorRegistry: AnchorComputerRegistry, protected actionDispatcher: IActionDispatcher) {
        super(anchorRegistry, actionDispatcher);
    }
}

export class EditEdgeSourceMovingMouseListener extends MouseListener {
    constructor(protected anchorRegistry: AnchorComputerRegistry, protected actionDispatcher: IActionDispatcher) {
        super();
    }

    override mouseMove(target: SModelElementImpl, event: MouseEvent): Action[] {
        const root = target.root;
        const edgeEnd = root.index.getById(createEdgeEndId(root));

        if (!(edgeEnd instanceof CreateEdgeEnd) || !edgeEnd.createEdge) {
            return [];
        }

        const edge = edgeEnd.createEdge;
        const position = getAbsolutePosition(edgeEnd, event);

        const endAtMousePosition = findChildrenAtPosition(target.root, position).find(
            element => isConnectable(element) && element.canConnect(edge, 'source')
        );

        if (endAtMousePosition instanceof SConnectableElementImpl && edge.target && isBoundsAware(edge.target)) {
            const anchor = this.computeAbsoluteAnchor(endAtMousePosition, Bounds.center(edge.target.bounds));
            if (Point.euclideanDistance(anchor, edgeEnd.position) > 1) {
                this.actionDispatcher.dispatch(MoveAction.create([{ elementId: edgeEnd.id, toPosition: anchor }], { animate: false }));
            }
        } else {
            this.actionDispatcher.dispatch(MoveAction.create([{ elementId: edgeEnd.id, toPosition: position }], { animate: false }));
        }

        return [];
    }

    protected computeAbsoluteAnchor(element: SConnectableElementImpl, referencePoint: Point, offset?: number): Point {
        const anchorComputer = this.anchorRegistry.get(PolylineEdgeRouter.KIND, element.anchorKind);
        let anchor = anchorComputer.getAnchor(element, referencePoint, offset);

        // The anchor is computed in the local coordinate system of the element.
        // If the element is a nested child element we have to add the absolute position of its parent to the anchor.
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

export class EditEdgeRouteMovingMouseListener extends MouseListener {
    protected pointPositionUpdater: PointPositionUpdater;

    constructor(protected positionSnapper: ISnapper, protected edgeRouterRegistry?: EdgeRouterRegistry) {
        super();
        this.pointPositionUpdater = new PointPositionUpdater(positionSnapper);
    }

    override mouseDown(target: SModelElementImpl, event: MouseEvent): Action[] {
        const result: Action[] = [];

        if (event.button === 0) {
            const routingHandle = findParentByFeature(target, isRoutingHandle);

            if (routingHandle !== undefined) {
                result.push(SwitchRoutingModeAction.create({ elementsToActivate: [target.id] }));
                this.pointPositionUpdater.updateLastDragPosition(event);
            } else {
                this.pointPositionUpdater.resetPosition();
            }
        }

        return result;
    }

    override mouseMove(target: SModelElementImpl, event: MouseEvent): Action[] {
        const result: Action[] = [];
        if (event.buttons === 0) {
            return this.mouseUp(target, event);
        }

        const positionUpdate = this.pointPositionUpdater.updatePosition(target, event);
        if (positionUpdate) {
            const moveActions = this.handleMoveOnClient(target, positionUpdate, !event.shiftKey);
            result.push(...moveActions);
        }

        return result;
    }

    protected handleMoveOnClient(target: SModelElementImpl, positionUpdate: Point, isSnap: boolean): Action[] {
        const handleMoves: ElementMove[] = [];

        target.root.index
            .all()
            .filter(element => isSelected(element))
            .forEach(element => {
                if (isRoutingHandle(element)) {
                    const elementMove = this.toElementMove(element, positionUpdate, isSnap);
                    if (elementMove) {
                        handleMoves.push(elementMove);
                    }
                }
            });

        if (handleMoves.length > 0) {
            return [MoveAction.create(handleMoves, { animate: false })];
        }

        return [];
    }

    protected toElementMove(element: SRoutingHandleImpl, positionDelta: Point, isSnap: boolean): ElementMove | undefined {
        const point = this.getHandlePosition(element);

        if (point !== undefined) {
            const snappedPoint = this.getSnappedHandlePosition(element, point, isSnap);
            return {
                elementId: element.id,
                fromPosition: point,
                toPosition: {
                    x: snappedPoint.x + positionDelta.x,
                    y: snappedPoint.y + positionDelta.y
                }
            };
        }

        return undefined;
    }

    protected getSnappedHandlePosition(element: SRoutingHandleImpl, point: Point, isSnap: boolean): Point {
        return this.pointPositionUpdater?.snapPosition(point, element, isSnap);
    }

    protected getHandlePosition(handle: SRoutingHandleImpl): Point | undefined {
        if (this.edgeRouterRegistry) {
            const parent = handle.parent;

            if (!isRoutable(parent)) {
                return undefined;
            }

            const router = this.edgeRouterRegistry.get(parent.routerKind);
            const route = router.route(parent);

            return router.getHandlePosition(parent, route, handle);
        }

        return undefined;
    }

    override mouseUp(_target: SModelElementImpl, _event: MouseEvent): Action[] {
        this.pointPositionUpdater.resetPosition();
        return [];
    }
}
