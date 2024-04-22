import { ApplyLabelEditAction } from 'sprotty-protocol';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { UpdateElementPropertyAction } from '../actions.js';
import { ApplyLabelEditActionHandler } from './ApplyLabelEditActionHandler.js';

export class UpdateElementPropertyHandler {
    public handle(action: UpdateElementPropertyAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const applyLabelEditAction = ApplyLabelEditAction.create(action.propertyId, action.value);

        return new ApplyLabelEditActionHandler().handle(applyLabelEditAction, server, services);
    }
}