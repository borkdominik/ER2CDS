/** @jsx svg */
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { HelperLine, SelectionBounds } from './model';
import { IViewArgs, RenderingContext, ShapeView, svg } from 'sprotty';

@injectable()
export class HelperLineView extends ShapeView {
    override render(model: Readonly<HelperLine>, context: RenderingContext, args?: IViewArgs): VNode {
        return (
            <g>
                <line
                    data-alignment={model.lineType}
                    x1={model.startPoint.x}
                    y1={model.startPoint.y}
                    x2={model.endPoint.x}
                    y2={model.endPoint.y}
                    class-helper-line={true}
                />
            </g>
        );
    }
}

@injectable()
export class SelectionBoundsView extends ShapeView {
    override render(model: SelectionBounds, context: RenderingContext, args?: IViewArgs | undefined): VNode | undefined {
        if (!this.isVisible(model, context))
            return undefined;

        return (
            <g>
                <rect
                    class-selection-bounds={true}
                    x={0}
                    y={0}
                    width={Math.max(model.size.width, 0)}
                    height={Math.max(model.size.height, 0)}
                />
            </g>
        );
    }
}
