import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { KeyListener, KeyTool, SModelElementImpl, SModelRootImpl } from 'sprotty';

@injectable()
export class ER2CDSKeyTool extends KeyTool {
    override keyDown(element: SModelRootImpl, event: KeyboardEvent): void {
        console.log("KEYDOWN");
        super.keyDown(element, event);
    }
}