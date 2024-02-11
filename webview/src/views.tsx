/** @jsx svg */
import { svg } from 'sprotty/lib/lib/jsx';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { IView, RenderingContext, SButtonImpl, SNodeImpl } from 'sprotty';

@injectable()
export class PaletteButtonView implements IView {
    render(button: SButtonImpl, context: RenderingContext): VNode {
        return <div>{button.id}</div>;
    }
}