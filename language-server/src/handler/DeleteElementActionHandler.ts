import { URI } from 'langium';
import { DeleteElementAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { SModelIndex } from 'sprotty-protocol';

export class DeleteElementActionHandler {
    public handle(action: DeleteElementAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const textDocument = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri).textDocument;
        if (!textDocument)
            return Promise.resolve();

        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        action.elementIds.forEach(id => {
            const element = modelIndex.getById(id);
            
            //TODO: delete element
        });

        return Promise.resolve();
    }
}