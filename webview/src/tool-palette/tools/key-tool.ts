import { injectable } from 'inversify';
import { KeyTool, SModelRootImpl } from 'sprotty';

@injectable()
export class ER2CDSKeyTool extends KeyTool {
    override keyDown(element: SModelRootImpl, event: KeyboardEvent): void {
        super.keyDown(element, event);
    }
}