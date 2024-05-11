import { inject, injectable } from 'inversify';
import { IActionHandler, ICommand } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { EnableCreateAttributeToolAction, EnableCreateEdgeToolAction, EnableCreateJoinClauseToolAction, EnableDefaultToolsAction, EnableDeleteMouseToolAction, EnableMarqueeMouseToolAction } from './actions';
import { DeleteMouseTool } from './delete-tool/delete-mouse-tool';
import { DeleteKeyTool } from './delete-tool/delete-key-tool';
import { MarqueeKeyTool } from './marquee-tool/marquee-key-tool';
import { MarqueeMouseTool } from './marquee-tool/marquee-mouse-tool';
import { EdgeCreateTool } from './edge-create-tool/edge-create-tool';
import { AttributeCreateMouseTool } from './attribute-create-tool/attribute-create-mouse-tool';
import { JoinClauseCreateMouseTool } from './join-clause-create-tool/join-clause-create-mouse-tool';

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

    @inject(AttributeCreateMouseTool)
    private attributeCreateMouseTool: AttributeCreateMouseTool;

    @inject(JoinClauseCreateMouseTool)
    private joinClauseCreateMouseTool: JoinClauseCreateMouseTool;

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

            case EnableCreateAttributeToolAction.KIND:
                this.attributeCreateMouseTool.enable();
                break;

            case EnableCreateJoinClauseToolAction.KIND:
                this.joinClauseCreateMouseTool.enable();
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

        this.edgeCreateTool.disable();

        this.attributeCreateMouseTool.disable();
        this.joinClauseCreateMouseTool.disable();
    }
}