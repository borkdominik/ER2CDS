import { ContainerModule } from 'inversify';
import {
    DrawEditEdgeSourceCommand,
    HideEdgeReconnectHandlesCommand,
    ShowEdgeReconnectHandlesCommand,
    SwitchRoutingModeCommand
} from './actions';
import { configureCommand } from 'sprotty';
import { EdgeEditTool } from './edge-edit-tool';

const EdgeEditToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(EdgeEditTool).toSelf().inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureCommand(context, ShowEdgeReconnectHandlesCommand);
    configureCommand(context, HideEdgeReconnectHandlesCommand);
    configureCommand(context, DrawEditEdgeSourceCommand);
    configureCommand(context, SwitchRoutingModeCommand);
});

export default EdgeEditToolModule;