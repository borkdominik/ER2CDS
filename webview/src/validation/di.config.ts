import { ContainerModule } from 'inversify';
import { configureActionHandler, configureCommand } from 'sprotty';
import { SetMarkersAction } from '../actions';
import { SetMarkersActionHandler } from './validation';
import { ApplyMarkersCommand, DeleteMarkersCommand } from './actions';

const ValidationModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };

    configureCommand(context, ApplyMarkersCommand);
    configureCommand(context, DeleteMarkersCommand);

    configureActionHandler(context, SetMarkersAction.KIND, SetMarkersActionHandler);
});

export default ValidationModule;