import { ContainerModule } from 'inversify';
import { TYPES, configureCommand } from 'sprotty';
import { DiagramEditorService } from './diagram-editor-service';
import { ER2CDSCommandStack } from './command-stack';
import { SelectAllCommand, SelectCommand } from './actions';
import { bindLazyInjector } from './lazy-injector';

const ServicesModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };

    bindLazyInjector(context);

    bind(DiagramEditorService).toSelf().inSingletonScope();

    bind(ER2CDSCommandStack).toSelf().inSingletonScope();
    rebind(TYPES.ICommandStack).to(ER2CDSCommandStack);

    configureCommand(context, SelectCommand);
    configureCommand(context, SelectAllCommand);
});

export default ServicesModule;