import { inject, injectable } from 'inversify';
import { IActionHandler, ICommand } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { EnableCreateEdgeToolAction, EnableDefaultToolsAction, EnableDeleteMouseToolAction, EnableMarqueeMouseToolAction } from './actions';
import { DeleteMouseTool } from './delete-tool/delete-mouse-tool';
import { DeleteKeyTool } from './delete-tool/delete-key-tool';
import { MarqueeKeyTool } from './marquee-tool/marquee-key-tool';
import { MarqueeMouseTool } from './marquee-tool/marquee-mouse-tool';
import { EdgeCreateTool } from './edge-create-tool/edge-create-tool';
import { EdgeEditTool } from './edge-edit-tool/edge-edit-tool';

@injectable()
export class ToolManagerActionHandler implements IActionHandler {
    @inject(MarqueeKeyTool)
    private marqueeKeyTool: MarqueeKeyTool;

    @inject(MarqueeMouseTool)
    private marqueeMouseTool: MarqueeMouseTool;

    @inject(DeleteKeyTool)
    private deleteKeyTool: DeleteKeyTool;

    @inject(DeleteMouseTool)
    private deleteMouseTool: DeleteMouseTool;

    @inject(EdgeCreateTool)
    private edgeCreateTool: EdgeCreateTool;

    // @inject(EdgeEditTool)
    // private edgeEditTool: EdgeEditTool;

    handle(action: Action): void | ICommand | Action {
        this.disableAllTools();

        switch (action.kind) {
            case EnableDefaultToolsAction.KIND:
                this.enableDefaultTools();
                break;

            case EnableMarqueeMouseToolAction.KIND:
                this.marqueeMouseTool.enable();
                break;

            case EnableDeleteMouseToolAction.KIND:
                this.deleteMouseTool.enable();
                break;

            case EnableCreateEdgeToolAction.KIND:
                this.edgeCreateTool.enable();
                break;
        }
    }

    private enableDefaultTools() {
        this.marqueeKeyTool.enable();
        this.deleteKeyTool.enable();
        // this.edgeEditTool.enable();
    }

    private disableAllTools() {
        this.marqueeKeyTool.disable();
        this.marqueeMouseTool.disable();

        this.deleteKeyTool.disable();
        this.deleteMouseTool.disable();

        this.edgeCreateTool.disable();
        // this.edgeEditTool.disable();
    }
}