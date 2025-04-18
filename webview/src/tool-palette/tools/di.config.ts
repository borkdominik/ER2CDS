import { ContainerModule } from 'inversify';
import { configureActionHandler } from 'sprotty';
import { EnableCreateAttributeToolAction, EnableCreateEdgeToolAction, EnableCreateJoinClauseToolAction, EnableDefaultToolsAction, EnableDeleteMouseToolAction, EnableMarqueeMouseToolAction } from './actions';
import { ToolManagerActionHandler } from './tool-manager';
import { ER2CDSKeyTool } from './key-tool';
import { ER2CDSMouseTool } from './mouse-tool';
import { ER2CDSScrollMouseListener } from './scroll-mouse-listener';

const ToolsModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(ER2CDSKeyTool).toSelf().inSingletonScope();
    bind(ER2CDSMouseTool).toSelf().inSingletonScope();
    bind(ER2CDSScrollMouseListener).toSelf().inSingletonScope();

    // rebind to container will be done in addVscodeBindings
    // otherwise binding will be overriden e.g. DisabledKeyTool

    const context = { bind, unbind, isBound, rebind };
    configureActionHandler(context, EnableDefaultToolsAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableMarqueeMouseToolAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableDeleteMouseToolAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableCreateEdgeToolAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableCreateAttributeToolAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableCreateJoinClauseToolAction.KIND, ToolManagerActionHandler);

    configureActionHandler(context, EnableDefaultToolsAction.KIND, ER2CDSScrollMouseListener);
    configureActionHandler(context, EnableMarqueeMouseToolAction.KIND, ER2CDSScrollMouseListener);
});

export default ToolsModule;
