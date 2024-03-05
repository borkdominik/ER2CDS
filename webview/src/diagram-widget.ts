import { postConstruct, injectable } from 'inversify';
import { VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { DiagramServerProxy, SetUIExtensionVisibilityAction } from 'sprotty';
import { FitToScreenAction } from 'sprotty-protocol';

@injectable()
export class ER2CDSDiagramWidget extends VscodeDiagramWidget {

    constructor() {
        super();
    }

    @postConstruct()
    override initialize(): void {
        super.initialize();
    }

    protected override initializeSprotty(): void {
        if (this.modelSource instanceof DiagramServerProxy)
            this.modelSource.clientId = this.diagramIdentifier.clientId;

        this.requestModel().then(() => this.actionDispatcher.dispatch(FitToScreenAction.create([])));

        this.actionDispatcher.dispatch(SetUIExtensionVisibilityAction.create({ extensionId: "toolbar-overlay", visible: true }));
    }
}
