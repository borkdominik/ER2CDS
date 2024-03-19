import { boundsFeature, RectangularNode } from 'sprotty';
import { Point } from 'sprotty-protocol';

export class MarqueeNode extends RectangularNode {
    static override readonly DEFAULT_FEATURES = [boundsFeature];
    startPoint: Point;
    endPoint: Point;
}