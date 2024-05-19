/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { Diamond, DiamondNodeView, IViewArgs, PolylineEdgeView, RectangularNodeView, RenderingContext, SGraphView, SNodeImpl, SPortImpl, setAttr, svg } from 'sprotty';
import { ER2CDSRoot, Edge, EntityNode, RelationshipNode } from './model';

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

        return (
            <g>
                <rect class-sprotty-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected} x='0' y='0' rx='5' ry='5' width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)} />
                {context.renderChildren(node)}
                {(node.children[1] && node.children[1].children.length > 0) ? <path class-comp-separator={true} d={rhombStr} /> : ''}
            </g>
        );

    }
}

@injectable()
export class RelationshipNodeView extends DiamondNodeView {
    override render(node: Readonly<RelationshipNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context))
            return undefined;

        const diamond = new Diamond({ height: Math.max(node.size.height, 0), width: Math.max(node.size.width, 0), x: 0, y: 0 });
        const points = `${diamond.topPoint.x},${diamond.topPoint.y} ${diamond.rightPoint.x},${diamond.rightPoint.y} ${diamond.bottomPoint.x},${diamond.bottomPoint.y} ${diamond.leftPoint.x},${diamond.leftPoint.y}`;
        return (
            <g>
                <polygon class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl} class-mouseover={node.hoverFeedback} class-selected={node.selected} points={points} />
                {context.renderChildren(node)}
            </g>
        );
    }
}

@injectable()
export class EdgeView extends PolylineEdgeView {
    override render(edge: Readonly<Edge>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        const route = this.edgeRouterRegistry.route(edge, args);
        if (route.length === 0) {
            return this.renderDanglingEdge('Cannot compute route', edge, context);
        }

        if (route.some(p => !p.x || !p.y)) {
            return undefined;
        }

        if (!this.isVisible(edge, route, context)) {
            if (edge.children.length === 0) {
                return undefined;
            }

            // The children of an edge are not necessarily inside the bounding box of the route,
            // so we need to render a group to ensure the children have a chance to be rendered.
            return <g>{context.renderChildren(edge, { route })}</g>;
        }


        return (
            <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionals(edge, route, context)}
                {context.renderChildren(edge, { route })}
            </g>
        );
    }
}