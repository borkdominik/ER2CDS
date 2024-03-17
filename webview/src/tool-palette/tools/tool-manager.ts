import { inject, injectable } from 'inversify';
import { IActionHandler, ICommand } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { EnableDefaultToolsAction, EnableDeleteMouseToolAction } from './tool-actions';
import { DeleteMouseTool } from './delete-tool/delete-mouse-tool';
import { DeleteKeyTool } from './delete-tool/delete-key-tool';
import { MarqueeKeyTool } from './marquee-tool/marquee-key-tool';
import { MarqueeMouseTool } from './marquee-tool/marquee-mouse-tool';

@injectable()
export class ToolManagerActionHandler implements IActionHandler {
    @inject(MarqueeKeyTool)
    private marqueeKeyTool: DeleteKeyTool;

    @inject(MarqueeMouseTool)
    private marqueeMouseTool: DeleteMouseTool;

    @inject(DeleteKeyTool)
    private deleteKeyTool: DeleteKeyTool;

    @inject(DeleteMouseTool)
    private deleteMouseTool: DeleteMouseTool;

    handle(action: Action): void | ICommand | Action {
        this.disableAllTools();

        switch (action.kind) {
            case EnableDefaultToolsAction.KIND:
                this.enableDefaultTools();
                break;

            case EnableDeleteMouseToolAction.KIND:
                this.deleteMouseTool.enable();
                break;
        }
    }

    private enableDefaultTools() {
        this.marqueeKeyTool.enable();
        this.deleteKeyTool.enable();
    }

    private disableAllTools() {
        this.marqueeKeyTool.disable();
        this.marqueeMouseTool.disable();

        this.deleteKeyTool.disable();
        this.deleteMouseTool.disable();
    }
}