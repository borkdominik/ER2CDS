import { DiagramServer } from 'sprotty-protocol';
import { CreateElementAction } from '../actions.js';

export class CreateElementActionHandler {
    public handle(action: CreateElementAction, server: DiagramServer): Promise<void> {

        if (action.elementType === 'entity')
            this.handleCreateEntity(action, server);

        if (action.elementType === 'relationship')
            this.handleCreateRelationship(action, server);

        return Promise.resolve();
    }

    private handleCreateEntity(action: CreateElementAction, server: DiagramServer) {
    }

    private handleCreateRelationship(action: CreateElementAction, server: DiagramServer) {
    }
}