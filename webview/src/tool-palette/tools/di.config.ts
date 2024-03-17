import { ContainerModule } from 'inversify';
import { configureActionHandler } from 'sprotty';
import { EnableDefaultToolsAction, EnableDeleteMouseToolAction, EnableMarqueeMouseToolAction } from './tool-actions';
import { ToolManagerActionHandler } from './tool-manager';

const ToolsModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };
    configureActionHandler(context, EnableDefaultToolsAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableMarqueeMouseToolAction.KIND, ToolManagerActionHandler);
    configureActionHandler(context, EnableDeleteMouseToolAction.KIND, ToolManagerActionHandler);
});

export default ToolsModule;
