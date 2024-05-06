import { HtmlRoot, PreRenderedElement, RequestPopupModelAction, SModelIndex, SetPopupModelAction } from 'sprotty-protocol';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { NODE_ENTITY } from '../model.js';

export interface PopupButton extends PreRenderedElement {
    target: string;
}

export class RequestPopupModelActionHandler {
    public async handle(action: RequestPopupModelAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        const element = modelIndex.getById(action.elementId);

        switch (element?.type) {
            case NODE_ENTITY:
                this.handleCreateEntityPopup(action, server, services);

        }

        return Promise.resolve();
    }

    protected handleCreateEntityPopup(action: RequestPopupModelAction, server: ER2CDSDiagramServer, services: ER2CDSServices) {
        const popupId = action.elementId + '-popup';

        const popup = <HtmlRoot>{
            type: 'html',
            id: popupId,
            canvasBounds: action.bounds,
            children: [
                <PreRenderedElement>{
                    type: 'pre-rendered',
                    id: popupId + '-body',
                    children: [],
                    code: `
                            <div class='sprotty-infoBlock'>
                                <div class='popup-header'>
                                    <div class='popup-element-info'>
                                        <vscode-tag class='popup-tag'>Entity</vscode-tag>
                                        Load all attribute of entity?
                                    </div>
                                </div>
                            </div>
                        `
                },
                <PopupButton>{
                    type: 'button:yes',
                    id: popupId + '-button-yes',
                    target: action.elementId,
                    code: `
                            <vscode-button class="popup-button" appearance="primary">
                                Yes
                                <span slot="start" class="codicon codicon-check"></span>
                            </vscode-button>
                        `
                },
                <PopupButton>{
                    type: 'button:no',
                    id: popupId + '-button-no',
                    target: action.elementId,
                    code: `
                            <vscode-button class="popup-button" appearance="secondary">
                                No
                                <span slot="start" class="codicon codicon-close"></span>
                            </vscode-button>
                        `
                }
            ]
        };

        server.dispatch(SetPopupModelAction.create(popup, action.requestId));
    }
}