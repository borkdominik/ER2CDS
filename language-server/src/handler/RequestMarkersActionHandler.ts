import { URI } from 'langium';
import { RequestMarkersAction, SetMarkersAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { createMarkersForDocument } from '../validation/validation.js';

export class RequestMarkersActionHandler {
    public async handle(action: RequestMarkersAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
        if (!document)
            return Promise.resolve();

        const markers = createMarkersForDocument(document);

        if (markers) {
            server.dispatch(SetMarkersAction.create(markers, { responseId: action.requestId }));
        } else {
            return server.dispatch(SetMarkersAction.create([], { responseId: action.requestId }));
        }
    }
}