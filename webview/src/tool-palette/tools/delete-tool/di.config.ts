import { ContainerModule } from 'inversify';
import { DeleteKeyTool } from './delete-key-tool';
import { DeleteMouseTool } from './delete-mouse-tool';

const DeleteToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(DeleteKeyTool).toSelf().inSingletonScope();
    bind(DeleteMouseTool).toSelf().inSingletonScope();
});

export default DeleteToolModule;