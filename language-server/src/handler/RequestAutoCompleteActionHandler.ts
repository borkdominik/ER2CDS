import fetch from 'node-fetch';
import { RequestAutoCompleteAction, SetAutoCompleteAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSGlobal, ER2CDSServices } from '../er2cds-module.js';
import { SModelIndex } from 'sprotty-protocol';
import { COMP_ATTRIBUTE, NODE_ENTITY } from '../model.js';
import { Agent } from 'https';
import { SapAttribute, SapEntity } from '../model-external.js';

export class RequestAutoCompleteActionHandler {
    public async handle(action: RequestAutoCompleteAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        if (!ER2CDSGlobal.sapUrl || !ER2CDSGlobal.sapClient || !ER2CDSGlobal.sapUsername || !ER2CDSGlobal.sapPassword)
            return this.resolveEmpty(action, server);

        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        if (action.type === NODE_ENTITY) {
            return this.handleRequestAutoCompleteEntity(action, server, services);
        } else if (action.type === COMP_ATTRIBUTE) {
            return this.handleRequestAutoCompleteAttribute(action, server, services);
        }

        return this.resolveEmpty(action, server);
    }

    protected handleRequestAutoCompleteEntity(action: RequestAutoCompleteAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const agent = new Agent({ rejectUnauthorized: false });
        const url = encodeURI(ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/Entities?$filter=startswith(Entity,'" + action.search + "')&$format=json&sap-client=" + ER2CDSGlobal.sapClient);

        if (!url)
            return this.resolveEmpty(action, server);

        fetch(
            url,
            {
                agent: agent,
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(ER2CDSGlobal.sapUsername + ':' + ER2CDSGlobal.sapPassword)
                }
            }
        ).then(
            (response: any) => response.json()
        ).then(
            (response: any) => {
                server.dispatch(
                    {
                        kind: SetAutoCompleteAction.KIND,
                        responseId: action.requestId,
                        elementId: action.elementId,
                        values: response.d.results.map((r: SapEntity) => { return { label: r.Entity } })
                    }
                );
            }
        ).catch(
            (error: any) => this.resolveEmpty(action, server)
        );

        return Promise.resolve();
    }

    protected handleRequestAutoCompleteAttribute(action: RequestAutoCompleteAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const agent = new Agent({ rejectUnauthorized: false });
        const entity = action.elementId.split('.')[0];
        const url = encodeURI(ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/Attributes?$filter=Entity eq '" + entity + "' and startswith(Attribute,'" + action.search + "')&$format=json&sap-client=" + ER2CDSGlobal.sapClient);

        if (!url)
            return this.resolveEmpty(action, server);

        fetch(
            url,
            {
                agent: agent,
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(ER2CDSGlobal.sapUsername + ':' + ER2CDSGlobal.sapPassword)
                }
            }
        ).then(
            (response: any) => response.json()
        ).then(
            (response: any) => {
                server.dispatch(
                    {
                        kind: SetAutoCompleteAction.KIND,
                        responseId: action.requestId,
                        elementId: action.elementId,
                        values: response.d.results.map((r: SapAttribute) => { return { label: r.Attribute } })
                    }
                );
            }
        );

        return Promise.resolve();
    }

    protected resolveEmpty(action: RequestAutoCompleteAction, server: ER2CDSDiagramServer): Promise<void> {
        server.dispatch(
            {
                kind: SetAutoCompleteAction.KIND,
                responseId: action.requestId,
                elementId: action.elementId,
                values: []
            }
        );

        return Promise.resolve();
    }
}