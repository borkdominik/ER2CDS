import { ContainerModule } from 'inversify';
import { configureCommand } from 'sprotty';
import { SelectAllCommand, SelectCommand, DiagramEditorService, SetModelCommand } from './diagram-editor-service';

const ServicesModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(DiagramEditorService).toSelf().inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureCommand(context, SetModelCommand);
    configureCommand(context, SelectCommand);
    configureCommand(context, SelectAllCommand);
});

export default ServicesModule;