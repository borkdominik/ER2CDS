import { ContainerModule } from 'inversify';
import { KeyTool, MouseTool, configureActionHandler } from 'sprotty';
import { EnableDefaultToolsAction, EnableDeleteMouseToolAction, EnableMarqueeMouseToolAction } from './actions';
import { ToolManagerActionHandler } from './tool-manager';
import { ER2CDSKeyTool } from './key-tool';
import { ER2CDSMouseTool } from './mouse-tool';

const ToolsModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(ER2CDSKeyTool).toSelf().inSingletonScope();
    rebind(KeyTool).toService(ER2CDSKeyTool);

    bind(ER2CDSMouseTool).toSelf().inSingletonScope();
    rebind(MouseTool).toService(ER2CDSMouseTool);

    const context = { bind, unbind, isBound, rebind };
    configureActionHandler(context, EnableDefaultToolsAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableMarqueeMouseToolAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableDeleteMouseToolAction.KIND, ToolManagerActionHandler);
});

export default ToolsModule;
