import { ContainerModule } from 'inversify';
import { EdgeCreateTool } from './edge-create-tool';
import { configureCommand, configureView } from 'sprotty';
import { DrawCreateEdgeEndCommand, RemoveCreateEdgeEndCommand } from './actions';
import { CreateEdgeEnd } from './edge-create-utils';
import { CreateEdgeEndView } from './views';

const EdgeCreateToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(EdgeCreateTool).toSelf().inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureCommand(context, DrawCreateEdgeEndCommand);
    configureCommand(context, RemoveCreateEdgeEndCommand);

    configureView(context, CreateEdgeEnd.TYPE, CreateEdgeEndView);
});

export default EdgeCreateToolModule;