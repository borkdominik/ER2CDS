/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { svg, RenderingContext, IView } from 'sprotty';
import { Point } from 'sprotty-protocol';
import { CreateEdgeEnd } from './edge-create-utils';

@injectable()
export class CreateEdgeEndView implements IView {
    render(model: Readonly<CreateEdgeEnd>, context: RenderingContext): VNode {
        const position: Point = model.position ?? Point.ORIGIN;

        return (
            <g x={position.x} y={position.y} />
        );
    }
}
