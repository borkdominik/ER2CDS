import { ContainerModule } from 'inversify';
import { KeyTool, MouseTool } from 'sprotty';
import { DeleteKeyTool } from './delete-key-tool';
import { DeleteMouseTool } from './delete-mouse-tool';

const DeleteToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(DeleteKeyTool).toSelf().inSingletonScope();
    rebind(KeyTool).toService(DeleteKeyTool);

    bind(DeleteMouseTool).toSelf().inSingletonScope();
    rebind(MouseTool).toService(DeleteMouseTool);
});

export default DeleteToolModule;