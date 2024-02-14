/** @jsx svg */
import { svg } from 'sprotty/lib/lib/jsx';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { IView, RenderingContext, SButtonImpl, SNodeImpl, SPortImpl } from 'sprotty';

@injectable()
export class PaletteButtonView implements IView {
    render(button: SButtonImpl, context: RenderingContext): VNode {
        return <div>{button.id}</div>;
    }
}

@injectable()
export class TriangleButtonView implements IView {
    render(model: SPortImpl, context: RenderingContext): VNode {
        return <path class-sprotty-button={true} d='M 0,0 L 8,4 L 0,8 Z' />;
    }
}