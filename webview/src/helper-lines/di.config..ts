import { configureModelElement, configureCommand, TYPES, configureActionHandler } from 'sprotty';
import { DrawHelperLinesCommand, RemoveHelperLinesCommand } from './actions';
import { HELPER_LINE, HelperLine, SELECTION_BOUNDS, SelectionBounds } from './model';
import { HelperLineView, SelectionBoundsView } from './view';
import { ContainerModule } from 'inversify';

const HelperLineModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, HELPER_LINE, HelperLine, HelperLineView);
    configureModelElement(context, SELECTION_BOUNDS, SelectionBounds, SelectionBoundsView);

    configureCommand(context, DrawHelperLinesCommand);
    configureCommand(context, RemoveHelperLinesCommand);
});

export default HelperLineModule;