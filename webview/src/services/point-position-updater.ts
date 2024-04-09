import { ISnapper, SModelElementImpl } from "sprotty";
import { Point } from "sprotty-protocol";
import { Direction, getDirectionOf } from "../helper-lines/model";
import { calculateDeltaBetweenPoints } from "../utils/model-utils";

export type Writable<T> = { -readonly [P in keyof T]: Writable<T[P]> };

export type AnyObject = object;
export namespace AnyObject {
    export function is(object: unknown): object is AnyObject {
        return object !== null && typeof object === 'object';
    }
}

export class PointPositionUpdater {
    protected positionSnapper: ISnapper;
    protected lastDragPosition?: Point;
    protected positionDelta: Writable<Point> = { x: 0, y: 0 };

    constructor(snapper?: ISnapper) {
        this.positionSnapper = snapper;
    }

    public updateLastDragPosition(mousePosition: Point): void;
    public updateLastDragPosition(mouseEvent: MouseEvent): void;
    public updateLastDragPosition(first: Point | MouseEvent): void {
        this.lastDragPosition = this.isMouseEvent(first) ? { x: first.pageX, y: first.pageY } : first;
    }

    public isLastDragPositionUndefined(): boolean {
        return this.lastDragPosition === undefined;
    }

    public resetPosition(): void {
        this.lastDragPosition = undefined;
        this.positionDelta = { x: 0, y: 0 };
    }

    public updatePosition(target: SModelElementImpl, mousePosition: Point, useSnap: boolean, direction?: Direction[]): Point | undefined;
    public updatePosition(target: SModelElementImpl, mouseEvent: MouseEvent, direction?: Direction[]): Point | undefined;
    public updatePosition(
        target: SModelElementImpl,
        second: Point | MouseEvent,
        third?: boolean | Direction[],
        fourth?: Direction[]
    ): Point | undefined {
        if (!this.lastDragPosition) {
            return undefined;
        }
        const mousePosition = this.isMouseEvent(second) ? { x: second.pageX, y: second.pageY } : second;
        const shouldSnap = typeof third === 'boolean' ? third : !(second as MouseEvent).shiftKey;
        const direction = typeof third !== 'boolean' ? third : fourth;

        // calculate update to last drag position
        const deltaToLastPosition = calculateDeltaBetweenPoints(mousePosition, this.lastDragPosition, target);
        this.lastDragPosition = mousePosition;
        if (Point.equals(deltaToLastPosition, Point.ORIGIN)) {
            return undefined;
        }

        // accumulate position delta with latest delta
        this.positionDelta.x += deltaToLastPosition.x;
        this.positionDelta.y += deltaToLastPosition.y;

        const directions = direction ?? getDirectionOf(this.positionDelta);

        // only send update if the position actually changes
        // otherwise accumulate delta until we get to an update
        const positionUpdate = this.snapDelta(this.positionDelta, target, shouldSnap, directions);
        if (Point.equals(positionUpdate, Point.ORIGIN)) {
            return undefined;
        }
        // we update our position so we update our delta by the snapped position
        this.positionDelta.x -= positionUpdate.x;
        this.positionDelta.y -= positionUpdate.y;
        return positionUpdate;
    }

    public snapPosition(position: Point, element: SModelElementImpl, isSnap: boolean = true): Point {
        return isSnap && this.positionSnapper ? this.positionSnapper.snap(position, element) : { x: position.x, y: position.y };
    }

    protected snapDelta(positionDelta: Point, element: SModelElementImpl, isSnap: boolean, directions: Direction[]): Point {
        const delta: Writable<Point> = this.snapPosition(positionDelta, element, isSnap);

        return delta;
    }

    protected isMouseEvent(object: unknown): object is MouseEvent {
        return AnyObject.is(object) && this.hasNumberProp(object, 'pageX') && this.hasNumberProp(object, 'pageY');
    }

    protected hasNumberProp(object: AnyObject, propertyKey: string, optional = false): boolean {
        const property = (object as any)[propertyKey];
        return property !== undefined ? typeof property === 'number' : optional;
    }
}