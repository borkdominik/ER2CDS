import { Bounds, Point } from 'sprotty-protocol';

export function left(bounds: Bounds): number {
    return bounds.x;
}

export function center(bounds: Bounds): number {
    return bounds.x + (bounds.width >= 0 ? bounds.width * 0.5 : 0);
}

export function right(bounds: Bounds): number {
    return bounds.x + bounds.width;
}

export function top(bounds: Bounds): number {
    return bounds.y;
}

export function middle(bounds: Bounds): number {
    return bounds.y + (bounds.height >= 0 ? bounds.height * 0.5 : 0);
}

export function bottom(bounds: Bounds): number {
    return bounds.y + bounds.height;
}

export function topLeft(bounds: Bounds): Point {
    return { x: left(bounds), y: top(bounds) };
}

export function topCenter(bounds: Bounds): Point {
    return { x: center(bounds), y: top(bounds) };
}

export function topRight(bounds: Bounds): Point {
    return { x: right(bounds), y: top(bounds) };
}

export function middleLeft(bounds: Bounds): Point {
    return { x: left(bounds), y: middle(bounds) };
}

export function middleCenter(bounds: Bounds): Point {
    return { x: center(bounds), y: middle(bounds) };
}

export function middleRight(bounds: Bounds): Point {
    return { x: right(bounds), y: middle(bounds) };
}

export function bottomLeft(bounds: Bounds): Point {
    return { x: left(bounds), y: bottom(bounds) };
}

export function bottomCenter(bounds: Bounds): Point {
    return { x: center(bounds), y: bottom(bounds) };
}

export function bottomRight(bounds: Bounds): Point {
    return { x: right(bounds), y: bottom(bounds) };
}

export function sortBy(rankFunc: (elem: Bounds) => number, ...points: Bounds[]): Bounds[] {
    return points.sort(compareFunction(rankFunc));
}

export function compareFunction<T>(rankFunc: (elem: T) => number): (left: T, right: T) => number {
    return (elemLeft, elemRight) => rankFunc(elemLeft) - rankFunc(elemRight);
}

export function isAbove(leftBounds: Bounds, rightBounds: Bounds): boolean {
    return top(leftBounds) <= top(rightBounds);
}

export function isBelow(leftBounds: Bounds, rightBounds: Bounds): boolean {
    return top(leftBounds) >= top(rightBounds);
}

export function isBefore(leftBounds: Bounds, rightBounds: Bounds): boolean {
    return left(leftBounds) < left(rightBounds);
}

export function isAfter(leftBounds: Bounds, rightBounds: Bounds): boolean {
    return left(leftBounds) >= left(rightBounds);
}
