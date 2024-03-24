/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { RectangularNodeView, RenderingContext, svg } from 'sprotty';
import { MarqueeNode } from './model';

injectable()
export class MarqueeView extends RectangularNodeView {
    override render(node: MarqueeNode, context: RenderingContext): VNode {
        const graph = (
            <g>
                <rect
                    class-sprotty-node={true}
                    class-marquee={true}
                    x={node.startPoint.x - node.endPoint.x <= 0 ? node.startPoint.x : node.endPoint.x}
                    y={node.startPoint.y - node.endPoint.y <= 0 ? node.startPoint.y : node.endPoint.y}
                    rx={0}
                    ry={0}
                    width={Math.abs(node.startPoint.x - node.endPoint.x)}
                    height={Math.abs(node.startPoint.y - node.endPoint.y)}
                ></rect>
            </g>
        );
        return graph;
    }
}
