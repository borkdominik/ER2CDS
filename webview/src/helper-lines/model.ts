import { SChildElementImpl, SModelElementImpl, SShapeElementImpl } from 'sprotty';
import { Point, Bounds } from 'sprotty-protocol';
import { v4 as uuid } from 'uuid';

export const HelperLineType = {
    Left: 'left',
    Right: 'right',
    Center: 'center',
    Top: 'top',
    Bottom: 'bottom',
    Middle: 'middle',
    LeftRight: 'left-right',
    RightLeft: 'right-left',
    BottomTop: 'bottom-top',
    TopBottom: 'top-bottom'
} as const;

export type HelperLineType = (typeof HelperLineType)[keyof typeof HelperLineType] | string;

export const HELPER_LINE = 'helper-line';
export class HelperLine extends SChildElementImpl {
    constructor(readonly startPoint = Point.ORIGIN, readonly endPoint = Point.ORIGIN, readonly lineType: HelperLineType = HelperLineType.Left) {
        super();

        this.id = uuid();
        this.type = HELPER_LINE;
    }

    get isLeft(): boolean {
        return this.lineType === HelperLineType.Left || this.lineType === HelperLineType.LeftRight;
    }

    get isRight(): boolean {
        return this.lineType === HelperLineType.Right || this.lineType === HelperLineType.RightLeft;
    }

    get isTop(): boolean {
        return this.lineType === HelperLineType.Top || this.lineType === HelperLineType.TopBottom;
    }

    get isBottom(): boolean {
        return this.lineType === HelperLineType.Bottom || this.lineType === HelperLineType.BottomTop;
    }

    get isMiddle(): boolean {
        return this.lineType === HelperLineType.Middle;
    }

    get isCenter(): boolean {
        return this.lineType === HelperLineType.Center;
    }
}

export function isHelperLine(element: SModelElementImpl): element is HelperLine {
    return element.type === HELPER_LINE;
}

export const SELECTION_BOUNDS = 'selection-bounds';
export class SelectionBounds extends SShapeElementImpl {
    constructor(bounds?: Bounds) {
        super();

        this.id = uuid();
        this.type = SELECTION_BOUNDS;

        if (bounds)
            this.bounds = bounds;
    }
}

export function isSelectionBounds(element: SModelElementImpl): element is SelectionBounds {
    return element.type === SELECTION_BOUNDS;
}

export const Direction = {
    Left: 'left',
    Right: 'right',
    Up: 'up',
    Down: 'down'
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export enum ResizeHandleLocation {
    TopLeft = 'top-left',
    TopRight = 'top-right',
    BottomLeft = 'bottom-left',
    BottomRight = 'bottom-right'
}

export function getDirectionOf(point: Point): Direction[] {
    const directions: Direction[] = [];
    if (point.x < 0) {
        directions.push(Direction.Left);
    } else if (point.x > 0) {
        directions.push(Direction.Right);
    }
    if (point.y < 0) {
        directions.push(Direction.Up);
    } else if (point.y > 0) {
        directions.push(Direction.Down);
    }
    return directions;
}

export function getDirectionFrom(resize?: ResizeHandleLocation): Direction[] {
    if (resize === ResizeHandleLocation.TopLeft) {
        return [Direction.Up, Direction.Left];
    }
    if (resize === ResizeHandleLocation.TopRight) {
        return [Direction.Up, Direction.Right];
    }
    if (resize === ResizeHandleLocation.BottomLeft) {
        return [Direction.Down, Direction.Left];
    }
    if (resize === ResizeHandleLocation.BottomRight) {
        return [Direction.Down, Direction.Right];
    }
    return [];
}