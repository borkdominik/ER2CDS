/** @jsx svg */
import { VNode } from "snabbdom";
import { RenderingContext, PreRenderedView } from 'sprotty';
import { injectable } from 'inversify';
import { PopupButton } from "./model";

@injectable()
export class PopupButtonView extends PreRenderedView {
    override render(model: Readonly<PopupButton>, context: RenderingContext): VNode | undefined {
        return super.render(model, context);
    }
}