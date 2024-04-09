import { CommandExecutionContext, RoutingHandleKind, SModelElementImpl, SRoutableElementImpl, SRoutingHandleImpl, edgeInProgressID, edgeInProgressTargetHandleID, findParentByFeature, isBoundsAware, isConnectable } from "sprotty";
import { CreateEdgeEnd, createEdgeEndId, createEdgeId, isRoutable } from "../edge-create-tool/edge-create-utils";

const ROUTING_HANDLE_SOURCE_INDEX = -2;

export const reconnectFeature = Symbol('reconnectFeature');

export interface Reconnectable { }

export function isReconnectable(element: SModelElementImpl): element is SRoutingHandleImpl & Reconnectable {
    return element instanceof SRoutableElementImpl && element.hasFeature(reconnectFeature);
}

export function isSourceRoutingHandle(edge: SRoutableElementImpl, routingHandle: SRoutingHandleImpl): boolean {
    return routingHandle.pointIndex === ROUTING_HANDLE_SOURCE_INDEX;
}

export function isTargetRoutingHandle(edge: SRoutableElementImpl, routingHandle: SRoutingHandleImpl): boolean {
    return routingHandle.pointIndex === edge.routingPoints.length;
}

export function isReconnectHandle(element: SModelElementImpl | undefined): element is SRoutingHandleImpl {
    return element !== undefined && element instanceof SRoutingHandleImpl;
}

export function addReconnectHandles(element: SRoutableElementImpl): void {
    removeReconnectHandles(element);
    createReconnectHandle(element, 'source', ROUTING_HANDLE_SOURCE_INDEX);
    createReconnectHandle(element, 'target', element.routingPoints.length);
}

export function removeReconnectHandles(element: SRoutableElementImpl): void {
    element.removeAll(child => child instanceof SRoutingHandleImpl);
}

export function createReconnectHandle(edge: SRoutableElementImpl, kind: RoutingHandleKind, routingPointIndex: number): SRoutingHandleImpl {
    const handle = new SRoutingHandleImpl();
    handle.kind = kind;
    handle.pointIndex = routingPointIndex;
    handle.type = 'routing-point';

    if (kind === 'target' && edge.id === edgeInProgressID)
        handle.id = edgeInProgressTargetHandleID;

    edge.add(handle);
    return handle;
}

export function drawEditEdgeSource(context: CommandExecutionContext, targetId: string): void {
    const root = context.root;
    const targetChild = root.index.getById(targetId);
    if (!targetChild) {
        return;
    }

    const target = findParentByFeature(targetChild, isConnectable);
    if (!target || !isBoundsAware(target)) {
        return;
    }

    const edgeEnd = new CreateEdgeEnd(target.id);
    edgeEnd.id = createEdgeEndId(root);
    edgeEnd.position = { x: target.bounds.x, y: target.bounds.y };

    const feedbackEdgeSchema = {
        type: 'edge',
        id: createEdgeId(root),
        sourceId: edgeEnd.id,
        targetId: target.id,
        opacity: 0.3
    };

    const createEdge = context.modelFactory.createElement(feedbackEdgeSchema);
    if (isRoutable(createEdge)) {
        edgeEnd.createEdge = createEdge;
        root.add(edgeEnd);
        root.add(createEdge);
    }
}