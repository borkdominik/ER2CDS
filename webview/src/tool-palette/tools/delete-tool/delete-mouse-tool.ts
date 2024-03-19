import { inject, injectable } from 'inversify';
import { MouseListener, SModelElementImpl, findParentByFeature, isDeletable } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { DeleteElementAction } from '../../../actions';
import { ER2CDSMouseTool } from '../mouse-tool';

@injectable()
export class DeleteMouseTool {
    @inject(ER2CDSMouseTool)
    protected mouseTool: ER2CDSMouseTool;

    protected deleteMouseToolListener: DeleteMouseToolListener = new DeleteMouseToolListener();

    enable(): void {
        this.mouseTool.register(this.deleteMouseToolListener);
    }

    disable(): void {
        this.mouseTool.deregister(this.deleteMouseToolListener);
    }
}

@injectable()
export class DeleteMouseToolListener extends MouseListener {
    override mouseUp(target: SModelElementImpl, event: MouseEvent): Action[] {
        const deletableParent = findParentByFeature(target, isDeletable);
        if (deletableParent === undefined) {
            return [];
        }

        const result: Action[] = [];
        result.push(DeleteElementAction.create([deletableParent.id]));

        return result;
    }
}