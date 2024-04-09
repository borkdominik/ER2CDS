import { EdgeRouterRegistry, InternalBoundsAware, ModelIndexImpl, RoutedPoint, SModelElementImpl, SRoutableElementImpl, SRoutingHandleImpl, getAbsoluteBounds, getZoom } from "sprotty";
import { FluentIterable } from "sprotty/lib/utils/iterable";
import { Selectable, Point } from 'sprotty-protocol';

export type ModelFilterPredicate<T> = (modelElement: SModelElementImpl) => modelElement is SModelElementImpl & T;

export type SelectableBoundsAware = SModelElementImpl & InternalBoundsAware & Selectable;
export type BoundsAwareModelElement = SModelElementImpl & InternalBoundsAware;

export function forEachElement<T>(index: ModelIndexImpl, predicate: ModelFilterPredicate<T>, runnable: (modelElement: SModelElementImpl & T) => void): void {
    filter(index, predicate).forEach(runnable);
}

export function getMatchingElements<T>(index: ModelIndexImpl, predicate: ModelFilterPredicate<T>): (SModelElementImpl & T)[] {
    return Array.from(filter(index, predicate));
}

export function filter<T>(index: ModelIndexImpl, predicate: ModelFilterPredicate<T>): FluentIterable<SModelElementImpl & T> {
    return index.all().filter(predicate) as FluentIterable<SModelElementImpl & T>;
}

export function isVisibleOnCanvas(model: BoundsAwareModelElement): boolean {
    const modelBounds = getAbsoluteBounds(model);
    const canvasBounds = model.root.canvasBounds;
    return (
        modelBounds.x <= canvasBounds.width &&
        modelBounds.x + modelBounds.width >= 0 &&
        modelBounds.y <= canvasBounds.height &&
        modelBounds.y + modelBounds.height >= 0
    );
}

export function distinctAdd<T>(array: T[], ...values: T[]): void {
    values.forEach(value => {
        if (!array.includes(value)) {
            array.push(value);
        }
    });
}

export function isRoutingHandle(element: SModelElementImpl | undefined): element is SRoutingHandleImpl {
    return element !== undefined && element instanceof SRoutingHandleImpl;
}

export function calculateDeltaBetweenPoints(target: Point, source: Point, element: SModelElementImpl): Point {
    const delta = Point.subtract(target, source);
    const zoom = getZoom(element);
    const adaptedDelta = { x: delta.x / zoom, y: delta.y / zoom };
    return adaptedDelta;
}

export const ALL_ROUTING_POINTS = undefined;
export const ROUTING_POINT_KINDS = ['linear', 'bezier-junction'];

export interface ElementAndRoutingPoints {
    elementId: string;
    newRoutingPoints?: Point[];
}

export function calcElementAndRoutingPoints(element: SRoutableElementImpl, routerRegistry?: EdgeRouterRegistry): ElementAndRoutingPoints {
    const newRoutingPoints = routerRegistry ? calcRoute(element, routerRegistry, ROUTING_POINT_KINDS) : element.routingPoints;
    return { elementId: element.id, newRoutingPoints };
}

export function calcRoute(element: SRoutableElementImpl, routerRegistry: EdgeRouterRegistry, pointKinds: string[] | undefined = ALL_ROUTING_POINTS, tolerance = Number.EPSILON): RoutedPoint[] | undefined {
    const route = routerRegistry.get(element.routerKind).route(element);
    const calculatedRoute: RoutedPoint[] = [];
    for (const point of route) {
        // only include points we are actually interested in
        if (pointKinds && !pointKinds.includes(point.kind)) {
            continue;
        }
        // check if we are a duplicate based on coordinates in the already calculated route
        if (
            ROUTING_POINT_KINDS.includes(point.kind) &&
            calculatedRoute.find(calculatedPoint => Point.maxDistance(point, calculatedPoint) < tolerance)
        ) {
            continue;
        }
        calculatedRoute.push(point);
    }
    return calculatedRoute;
}