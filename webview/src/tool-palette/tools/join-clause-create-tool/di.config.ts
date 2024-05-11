import { ContainerModule } from 'inversify';
import { JoinClauseCreateMouseTool } from './join-clause-create-mouse-tool';

const JoinClauseToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(JoinClauseCreateMouseTool).toSelf().inSingletonScope();
});

export default JoinClauseToolModule;