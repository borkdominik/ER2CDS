import { ContainerModule } from 'inversify';
import { KeyTool, MouseTool, configureActionHandler } from 'sprotty';
import { EnableDeleteMouseToolAction } from '../tool-palette-actions';
import { ToolManagerActionHandler } from './tool-manager';
import { DeleteKeyTool } from './delete-tool/delete-key-tool';
import { DeleteMouseTool } from './delete-tool/delete-mouse-tool';

const ToolsModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(DeleteKeyTool).toSelf().inSingletonScope();
    rebind(KeyTool).toService(DeleteKeyTool);

    bind(DeleteMouseTool).toSelf().inSingletonScope();
    rebind(MouseTool).toService(DeleteMouseTool);

    const context = { bind, unbind, isBound, rebind };
    configureActionHandler(context, EnableDeleteMouseToolAction.KIND, ToolManagerActionHandler);
});

export default ToolsModule;
