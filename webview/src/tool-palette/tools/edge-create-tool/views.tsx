/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { SModelElementImpl, svg, RenderingContext, ShapeView } from 'sprotty';
import { Point } from 'sprotty-protocol';

injectable()
export class CreateEdgeEndView extends ShapeView {
    render(model: Readonly<SModelElementImpl>, context: RenderingContext): VNode {
        const position: Point = (model as any).position ?? Point.ORIGIN;
        return <g x={position.x} y={position.y} />;
    }
}
