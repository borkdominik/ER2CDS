import { inject, injectable } from 'inversify';
import { CommandStack, ICommand, SModelRootImpl, SetModelCommand, UpdateModelCommand } from 'sprotty';
import { DiagramEditorService } from './diagram-editor-service';

@injectable()
export class ER2CDSCommandStack extends CommandStack {
    @inject(DiagramEditorService)
    protected diagramEditorService: DiagramEditorService;

    override execute(command: ICommand): Promise<SModelRootImpl> {
        const result = super.execute(command);

        if (command instanceof SetModelCommand || command instanceof UpdateModelCommand)
            result.then(root => this.diagramEditorService.modelRootChanged(root));

        return result;
    }
}

