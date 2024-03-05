/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { Diamond, DiamondNodeView, IViewArgs, PreRenderedView, RectangularNodeView, RenderingContext, SGraphView, SNodeImpl, SPortImpl, svg } from 'sprotty';
import { ER2CDSModel, EntityNode, PopupButton, RelationshipNode } from './model';
import { Point, Hoverable, Selectable } from 'sprotty-protocol';

@injectable()
export class ER2CDSModelView extends SGraphView {
    override render(model: Readonly<ER2CDSModel>, context: RenderingContext): VNode {
        const edgeRouting = this.edgeRouterRegistry.routeAllChildren(model);
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`;

        return <svg class-sprotty-graph={true}>
            <g transform={transform}>{context.renderChildren(model, edgeRouting)}</g>
        </svg>;
    }
}

@injectable()
export class EntityNodeView extends RectangularNodeView {
    override render(node: Readonly<EntityNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context))
            return undefined;

        if (node.weak) {
            return <g>
                <rect class-border-weak={true} x="-5" y="-5" rx="5" ry="5" width={node.bounds.width + 10} height={node.bounds.height + 10} />
                <rect class-sprotty-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected} x="0" y="0" rx="5" ry="5" width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)} />
                {context.renderChildren(node)}
                {(node.children[1] && node.children[1].children.length > 0) ? <path class-comp-separator={true} /> : ""}
            </g>;
        } else {
            return <g>
                <rect class-sprotty-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected} x="0" y="0" rx="5" ry="5" width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)} />
                {context.renderChildren(node)}
                {(node.children[1] && node.children[1].children.length > 0) ? <path class-comp-separator={true} /> : ""}
            </g>;
        }

    }
}

@injectable()
export class RelationshipNodeView extends DiamondNodeView {
    override render(node: Readonly<RelationshipNode & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context))
            return undefined;

        const diamond = new Diamond({ height: Math.max(node.size.height, 0), width: Math.max(node.size.width, 0), x: 0, y: 0 });
        const diamondWeak = new Diamond({ height: Math.max(node.size.height + 10, 0), width: Math.max(node.size.width + 20, 0), x: -10, y: -5 });

        const points = `${diamond.topPoint.x},${diamond.topPoint.y} ${diamond.rightPoint.x},${diamond.rightPoint.y} ${diamond.bottomPoint.x},${diamond.bottomPoint.y} ${diamond.leftPoint.x},${diamond.leftPoint.y}`;
        const pointsWeak = `${diamondWeak.topPoint.x},${diamondWeak.topPoint.y} ${diamondWeak.rightPoint.x},${diamondWeak.rightPoint.y} ${diamondWeak.bottomPoint.x},${diamondWeak.bottomPoint.y} ${diamondWeak.leftPoint.x},${diamondWeak.leftPoint.y}`;

        if (node.weak) {
            return <g>
                <polygon class-border-weak points={pointsWeak} />
                <polygon class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl} class-mouseover={node.hoverFeedback} class-selected={node.selected} points={points} />
                {context.renderChildren(node)}
            </g>;
        } else {
            return <g>
                <polygon class-sprotty-node={node instanceof SNodeImpl} class-sprotty-port={node instanceof SPortImpl} class-mouseover={node.hoverFeedback} class-selected={node.selected} points={points} />
                {context.renderChildren(node)}
            </g>;
        }
    }
}

@injectable()
export class PopupButtonView extends PreRenderedView {
    render(model: Readonly<PopupButton>, context: RenderingContext): VNode | undefined {
        const node = super.render(model, context);
        return node;
    }
}