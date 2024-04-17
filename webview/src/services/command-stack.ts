import { injectable, multiInject, inject } from 'inversify';
import { CommandStack, ICommand, SModelRootImpl, SetModelCommand, UpdateModelCommand } from 'sprotty';
import { DiagramEditorService } from './diagram-editor-service';
import { LazyInjector } from './lazy-injector';

@injectable()
export class ER2CDSCommandStack extends CommandStack {
    @inject(LazyInjector)
    protected lazyInjector: LazyInjector;

    override execute(command: ICommand): Promise<SModelRootImpl> {
        const result = super.execute(command);

        if (command instanceof SetModelCommand || command instanceof UpdateModelCommand)
            result.then(root => this.diagramEditor.notifyModelRootChanged(root, this));

        return result;
    }

    get diagramEditor(): DiagramEditorService {
        return this.lazyInjector.get(DiagramEditorService);
    }
}

