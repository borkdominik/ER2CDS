import { inject, injectable } from 'inversify';
import { IActionHandler, ICommand } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { EnableDeleteMouseToolAction } from '../tool-palette-actions';
import { DeleteMouseTool } from './delete-tool/delete-mouse-tool';
import { DeleteKeyTool } from './delete-tool/delete-key-tool';

@injectable()
export class ToolManagerActionHandler implements IActionHandler {

    @inject(DeleteKeyTool)
    private deleteKeyTool: DeleteKeyTool;

    @inject(DeleteMouseTool)
    private deleteMouseTool: DeleteMouseTool;

    handle(action: Action): void | ICommand | Action {
        this.disableAllTools();
        this.enableDefaultTools();

        switch (action.kind) {
            case EnableDeleteMouseToolAction.KIND:
                this.deleteMouseTool.enable();
                break;
        }
    }

    private enableDefaultTools() {
        this.deleteKeyTool.enable();
    }

    private disableAllTools() {
        this.deleteKeyTool.disable();
        this.deleteMouseTool.disable();
    }
}