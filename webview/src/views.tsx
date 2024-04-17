/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { Diamond, DiamondNodeView, IViewArgs, PolylineEdgeView, RectangularNodeView, RenderingContext, SEdgeImpl, SGraphView, SNodeImpl, SPortImpl, setAttr, svg } from 'sprotty';
import { ER2CDSRoot, Edge, EntityNode, RelationshipNode } from './model';
import { Point, toDegrees } from 'sprotty-protocol';

@injectable()
export class ER2CDSRootView extends SGraphView {
    override render(model: Readonly<ER2CDSRoot>, context: RenderingContext): VNode {
        const edgeRouting = this.edgeRouterRegistry.routeAllChildren(model);
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`;

        const rootNode = <svg class-sprotty-graph={true}>
            <g transform={transform}>
                {context.renderChildren(model, { edgeRouting })}
            </g>
        </svg>;

        setAttr(rootNode, 'tabindex', -1); // make root div focus-able
        return rootNode;
    }
}

@injectable()
export class EntityNodeView extends RectangularNodeView {
    override render(node: Readonly<EntityNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context))
            return undefined;

        const height = 35;
        const rhombStr = 'M 0,' + height + '  L ' + node.bounds.width + ',' + height;

        if (node.weak) {
            return (
                <g>
                    <rect class-border-weak={true} x='-5' y='-5' rx='5' ry='5' width={node.bounds.width + 10} height={node.bounds.height + 10} />
                    <rect class-sprotty-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected} x='0' y='0' rx='5' ry='5' width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)} />
                    {context.renderChildren(node)}
                    {(node.children[1] && node.children[1].children.length > 0) ? <path class-comp-separator={true} d={rhombStr} /> : ''}
                </g>
            );
        } else {
            return (
                <g>
                    <rect class-sprotty-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected} x='0' y='0' rx='5' ry='5' width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)} />
                    {context.renderChildren(node)}
                    {(node.children[1] && node.children[1].children.length > 0) ? <path class-comp-separator={true} d={rhombStr} /> : ''}
                </g>
            );
        }
    }
}

@injectable()
export class RelationshipNodeView extends DiamondNodeView {
    override render(node: Readonly<RelationshipNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context))
            return undefined;

        const diamond = new Diamond({ height: Math.max(node.size.height, 0), width: Math.max(node.size.width, 0), x: 0, y: 0 });
        const diamondWeak = new Diamond({ height: Math.max(node.size.height + 10, 0), width: Math.max(node.size.width + 20, 0), x: -10, y: -5 });

        const points = `${diamond.topPoint.x},${diamond.topPoint.y} ${diamond.rightPoint.x},${diamond.rightPoint.y} ${diamond.bottomPoint.x},${diamond.bottomPoint.y} ${diamond.leftPoint.x},${diamond.leftPoint.y}`;
        const pointsWeak = `${diamondWeak.topPoint.x},${diamondWeak.topPoint.y} ${diamondWeak.rightPoint.x},${diamondWeak.rightPoint.y} ${diamondWeak.bottomPoint.x},${diamondWeak.bottomPoint.y} ${diamondWeak.leftPoint.x},${diamondWeak.leftPoint.y}`;

        if (node.weak) {
            return (
                <g>
                    <polygon class-border-weak points={pointsWeak} />
                    <polygon class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl} class-mouseover={node.hoverFeedback} class-selected={node.selected} points={points} />
                    {context.renderChildren(node)}
                </g>
            );
        } else {
            return (
                <g>
                    <polygon class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl} class-mouseover={node.hoverFeedback} class-selected={node.selected} points={points} />
                    {context.renderChildren(node)}
                </g>
            );
        }
    }
}

@injectable()
export class EdgeView extends PolylineEdgeView {
    override render(edge: Readonly<Edge>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        const route = this.edgeRouterRegistry.route(edge, args);
        if (route.length === 0) {
            return this.renderDanglingEdge('Cannot compute route', edge, context);
        }
        if (!this.isVisible(edge, route, context)) {
            if (edge.children.length === 0) {
                return undefined;
            }
            // The children of an edge are not necessarily inside the bounding box of the route,
            // so we need to render a group to ensure the children have a chance to be rendered.
            return <g>{context.renderChildren(edge, { route })}</g>;
        }

        return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
            {this.renderLine(edge, route, context, args)}
            {this.renderAdditionals(edge, route, context)}
            {context.renderChildren(edge, { route })}
        </g>;
    }
}

@injectable()
export class EdgeInheritanceView extends PolylineEdgeView {
    override renderAdditionals(edge: SEdgeImpl, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];

        return (
            <path class-sprotty-edge-arrow={true} d='M 6,-3 L 0,0 L 6,3 Z'
                transform={`rotate(${this.angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`} />
        );
    }

    private angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}