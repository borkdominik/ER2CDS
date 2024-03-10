import { Action, DiagramServer, DiagramServices, RequestAction, ResponseAction } from 'sprotty-protocol';

export class ER2CDSDiagramServer extends DiagramServer {
    constructor(dispatch: <A extends Action>(action: A) => Promise<void>, services: DiagramServices) {
        super(dispatch, services);
    }

    public override accept(action: Action): Promise<void> {
        return super.accept(action);
    }

    public override request<Res extends ResponseAction>(action: RequestAction<Res>): Promise<Res> {
        return super.request(action);
    }
}