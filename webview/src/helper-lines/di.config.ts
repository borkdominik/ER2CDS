import { configureModelElement, configureCommand, configureActionHandler } from 'sprotty';
import { DrawHelperLinesCommand, RemoveHelperLinesCommand } from './actions';
import { HELPER_LINE, HelperLine, SELECTION_BOUNDS, SelectionBounds } from './model';
import { HelperLineView, SelectionBoundsView } from './views';
import { ContainerModule } from 'inversify';
import { MoveAction, SetBoundsAction } from 'sprotty-protocol';
import { HelperLineManager } from './helper-lines';

const HelperLineModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, HELPER_LINE, HelperLine, HelperLineView);
    configureModelElement(context, SELECTION_BOUNDS, SelectionBounds, SelectionBoundsView);

    configureCommand(context, DrawHelperLinesCommand);
    configureCommand(context, RemoveHelperLinesCommand);

    configureActionHandler(context, MoveAction.KIND, HelperLineManager);
    configureActionHandler(context, SetBoundsAction.KIND, HelperLineManager);
});

export default HelperLineModule;