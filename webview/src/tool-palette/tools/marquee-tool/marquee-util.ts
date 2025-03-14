import { CommandExecutionContext, PointToPointLine, SChildElementImpl, SModelRootImpl } from 'sprotty';
import { Bounds, Point } from 'sprotty-protocol';
import { DrawMarqueeAction } from './actions';

export const MARQUEE = 'marquee';

export class MarqueeUtil {
    protected startPoint: Point;
    protected currentPoint: Point;

    marqueeId(root: SModelRootImpl): string {
        return root.id + '_' + MARQUEE;
    }

    drawMarqueeAction(): DrawMarqueeAction {
        return DrawMarqueeAction.create({ startPoint: this.startPoint, endPoint: this.currentPoint });
    }

    drawMarquee(context: CommandExecutionContext, startPoint: Point, endPoint: Point): void {
        const root = context.root;

        this.removeMarquee(root);

        const marqueeNode = {
            type: MARQUEE,
            id: this.marqueeId(root),
            startPoint: startPoint,
            endPoint: endPoint
        };

        const marquee = context.modelFactory.createElement(marqueeNode);
        root.add(marquee);
    }

    removeMarquee(root: SModelRootImpl): void {
        const marquee = root.index.getById(this.marqueeId(root));
        if (marquee instanceof SChildElementImpl) {
            root.remove(marquee);
        }
    }

    updateStartPoint(position: Point): void {
        this.startPoint = position;
    }

    updateCurrentPoint(position: Point): void {
        this.currentPoint = position;
    }

    isEdgePathMarked(path: string | null): boolean {
        if (!path) {
            return false;
        }
        const points = path
            .split(/M|L/)
            .filter(p => p)
            .map(p => {
                const coord = p.split(',');
                return { x: parseInt(coord[0], 10), y: parseInt(coord[1], 10) };
            });
        return this.isEdgeMarked(points);
    }

    isEdgeMarked(points: Point[]): boolean {
        return this.isEntireEdgeMarked(points);
    }

    isNodeMarked(elementBounds: Bounds): boolean {
        const horizontallyIn =
            this.startPoint.x < this.currentPoint.x
                ? this.isElementBetweenXAxis(elementBounds, this.startPoint.x, this.currentPoint.x)
                : this.isElementBetweenXAxis(elementBounds, this.currentPoint.x, this.startPoint.x);
        const verticallyIn =
            this.startPoint.y < this.currentPoint.y
                ? this.isElementBetweenYAxis(elementBounds, this.startPoint.y, this.currentPoint.y)
                : this.isElementBetweenYAxis(elementBounds, this.currentPoint.y, this.startPoint.y);
        return horizontallyIn && verticallyIn;
    }

    protected isEntireEdgeMarked(points: Point[]): boolean {
        for (let i = 0; i < points.length; i++) {
            if (!this.pointInRect(points[i])) {
                return false;
            }
        }
        return true;
    }

    protected isPartOfEdgeMarked(points: Point[]): boolean {
        for (let i = 0; i < points.length - 1; i++) {
            if (this.isLineMarked(points[i], points[i + 1])) {
                return true;
            }
        }
        return false;
    }

    protected isLineMarked(point1: Point, point2: Point): boolean {
        const line = new PointToPointLine(point1, point2);
        return (
            this.pointInRect(point1) ||
            this.pointInRect(point2) ||
            this.lineIntersect(line, this.startPoint, { x: this.startPoint.x, y: this.currentPoint.y }) ||
            this.lineIntersect(line, this.startPoint, { x: this.currentPoint.x, y: this.startPoint.y }) ||
            this.lineIntersect(line, { x: this.currentPoint.x, y: this.startPoint.y }, this.currentPoint) ||
            this.lineIntersect(line, { x: this.startPoint.x, y: this.currentPoint.y }, this.currentPoint)
        );
    }

    protected lineIntersect(line: PointToPointLine, p1: Point, p2: Point): boolean {
        return line.intersection(new PointToPointLine(p1, p2)) !== undefined;
    }

    protected pointInRect(point: Point): boolean {
        const boolX =
            this.startPoint.x <= this.currentPoint.x
                ? this.isBetween(point.x, this.startPoint.x, this.currentPoint.x)
                : this.isBetween(point.x, this.currentPoint.x, this.startPoint.x);
        const boolY =
            this.startPoint.y <= this.currentPoint.y
                ? this.isBetween(point.y, this.startPoint.y, this.currentPoint.y)
                : this.isBetween(point.y, this.currentPoint.y, this.startPoint.y);
        return boolX && boolY;
    }

    protected isElementBetweenXAxis(elementBounds: Bounds, marqueeLeft: number, marqueeRight: number): boolean {
        const leftEdge = this.isBetween(elementBounds.x, marqueeLeft, marqueeRight);
        const rightEdge = this.isBetween(elementBounds.x + elementBounds.width, marqueeLeft, marqueeRight);

        return leftEdge && rightEdge;
    }

    protected isElementBetweenYAxis(elementBounds: Bounds, marqueeTop: number, marqueeBottom: number): boolean {
        const topEdge = this.isBetween(elementBounds.y, marqueeTop, marqueeBottom);
        const bottomEdge = this.isBetween(elementBounds.y + elementBounds.height, marqueeTop, marqueeBottom);
        return topEdge && bottomEdge;
    }

    protected isBetween(x: number, lower: number, upper: number): boolean {
        return lower <= x && x <= upper;
    }
}