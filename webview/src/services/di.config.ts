import { ContainerModule } from 'inversify';
import { TYPES, configureCommand } from 'sprotty';
import { DiagramEditorService } from './diagram-editor-service';
import { ER2CDSCommandStack } from './command-stack';
import { SelectAllCommand, SelectCommand } from './actions';

const ServicesModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(DiagramEditorService).toSelf().inSingletonScope();

    bind(ER2CDSCommandStack).toSelf().inSingletonScope();
    rebind(TYPES.ICommandStack).to(ER2CDSCommandStack);

    const context = { bind, unbind, isBound, rebind };
    configureCommand(context, SelectCommand);
    configureCommand(context, SelectAllCommand);
});

export default ServicesModule;