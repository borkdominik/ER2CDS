import { HtmlRoot, PreRenderedElement, SModelIndex, SetPopupModelAction } from 'sprotty-protocol';
import { RequestPopupConfirmModelAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSGlobal, ER2CDSServices } from '../er2cds-module.js';
import { NODE_ENTITY } from '../model.js';
import { Agent } from 'https';
import fetch, { Response } from 'node-fetch';

export interface PopupButton extends PreRenderedElement {
    target: string;
}

export class RequestPopupConfirmModelActionHandler {
    public async handle(action: RequestPopupConfirmModelAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        const element = modelIndex.getById(action.elementId);

        switch (element?.type) {
            case NODE_ENTITY:
                return this.handleCreateEntityPopup(action, server, services);

        }

        return Promise.resolve();
    }

    protected async handleCreateEntityPopup(action: RequestPopupConfirmModelAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        if (!ER2CDSGlobal.sapUrl || !ER2CDSGlobal.sapClient || !ER2CDSGlobal.sapUsername || !ER2CDSGlobal.sapPassword)
            return Promise.resolve();

        const popupId = action.elementId + '-popup';
        const agent = new Agent({ rejectUnauthorized: false });
        const url = encodeURI(ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/Entities(Entity='" + action.elementId + "')?$format=json&sap-client=" + ER2CDSGlobal.sapClient);

        return fetch(
            url,
            {
                agent: agent,
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(ER2CDSGlobal.sapUsername + ':' + ER2CDSGlobal.sapPassword)
                }
            }
        ).then(
            (response: Response) => {
                if (response.ok) {
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
                                                    Load all attributes of entity?
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

                return Promise.resolve();
            }
        ).catch(
            () => Promise.resolve()
        );
    }
}