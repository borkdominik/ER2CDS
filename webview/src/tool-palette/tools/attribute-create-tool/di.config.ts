import { ContainerModule } from 'inversify';
import { AttributeCreateMouseTool } from './attribute-create-mouse-tool';

const AttributeToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(AttributeCreateMouseTool).toSelf().inSingletonScope();
});

export default AttributeToolModule;