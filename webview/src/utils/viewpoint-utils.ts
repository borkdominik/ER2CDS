import { InternalBoundsAware, SChildElementImpl, SModelElementImpl, SModelRootImpl, findParentByFeature, isAlignable, isBoundsAware, isViewport, translateBounds } from 'sprotty';
import { Bounds, Point, Viewport } from 'sprotty-protocol';
import { topLeft, bottomRight } from './geometry-utils';

export function getAbsolutePosition(target: SModelElementImpl, mouseEvent: MouseEvent): Point {
    return getAbsolutePositionByPoint(target, { x: mouseEvent.pageX, y: mouseEvent.pageY });
}

export function getAbsolutePositionByPoint(target: SModelElementImpl, point: Point): Point {
    let xPos = point.x;
    let yPos = point.y;
    const canvasBounds = target.root.canvasBounds;
    xPos -= canvasBounds.x;
    yPos -= canvasBounds.y;

    const viewport: Viewport | undefined = findParentByFeature(target, isViewport);
    const zoom = viewport ? viewport.zoom : 1;
    if (viewport) {
        const scroll: Point = { x: viewport.scroll.x, y: viewport.scroll.y };
        xPos += scroll.x * zoom;
        yPos += scroll.y * zoom;

        xPos /= zoom;
        yPos /= zoom;
    }

    return {
        x: xPos,
        y: yPos
    };
}

export function getViewportBounds(target: SModelElementImpl, bounds: Bounds): Bounds {
    const start = getAbsolutePositionByPoint(target, topLeft(bounds));
    const end = getAbsolutePositionByPoint(target, bottomRight(bounds));
    return { ...start, width: end.x - start.x, height: end.y - start.y };
}

export function toAbsoluteBounds(element: SModelElementImpl & InternalBoundsAware): Bounds {
    const location = isAlignable(element) ? element.alignment : Point.ORIGIN;
    const x = location.x;
    const y = location.y;
    const width = element.bounds.width;
    const height = element.bounds.height;
    return translateBounds({ x, y, width, height }, element, element.root);
}

export function toAbsolutePosition(target: SModelElementImpl & InternalBoundsAware): Point {
    return toAbsoluteBounds(target);
}

export function absoluteToParent(element: (SModelElementImpl & InternalBoundsAware) & SChildElementImpl, absolutePoint: Point): Point {
    if (isBoundsAware(element.parent))
        return absoluteToLocal(element.parent, absolutePoint);

    return absoluteToLocal(element, absolutePoint);
}

export function absoluteToLocal(element: (SModelElementImpl & InternalBoundsAware), absolutePoint: Point): Point {
    const absoluteElementBounds = toAbsoluteBounds(element);
    return { x: absolutePoint.x - absoluteElementBounds.x, y: absolutePoint.y - absoluteElementBounds.y };
}