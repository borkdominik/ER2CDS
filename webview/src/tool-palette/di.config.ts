import { ContainerModule } from 'inversify';
import { ToolPalette } from './tool-palette';
import { TYPES, configureActionHandler } from 'sprotty';
import { EnableToolPaletteAction } from './actions';
import { EnableDefaultToolsAction, EnableMarqueeMouseToolAction } from './tools/actions';

const ToolPaletteModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(ToolPalette).toSelf().inSingletonScope();
    bind(TYPES.IUIExtension).toService(ToolPalette);

    const context = { bind, unbind, isBound, rebind };

    configureActionHandler(context, EnableToolPaletteAction.KIND, ToolPalette);
    configureActionHandler(context, EnableDefaultToolsAction.KIND, ToolPalette);
    configureActionHandler(context, EnableMarqueeMouseToolAction.KIND, ToolPalette);
});

export default ToolPaletteModule;