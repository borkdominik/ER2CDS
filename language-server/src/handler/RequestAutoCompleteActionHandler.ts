import { RequestAutoCompleteAction, SetAutoCompleteAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { SModelIndex } from 'sprotty-protocol';
import { COMP_ATTRIBUTES_ROW, NODE_ENTITY } from '../model.js';
import { Agent } from 'https';
import fetch from 'node-fetch';

export class RequestAutoCompleteActionHandler {
    public async handle(action: RequestAutoCompleteAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        if (!action.sapUrl || !action.sapClient || !action.sapUsername || !action.sapPassword)
            return this.resolveEmpty(action, server);

        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        const element = modelIndex.getById(action.elementId);

        if (element?.type === NODE_ENTITY) {
            return this.handleRequestAutoCompleteEntity(action, server, services);

        } else if (element?.type === COMP_ATTRIBUTES_ROW) {
            return this.handleRequestAutoCompleteAttribute(action, server, services);

        }

        return Promise.resolve();
    }

    protected handleRequestAutoCompleteEntity(action: RequestAutoCompleteAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const agent = new Agent({ rejectUnauthorized: false });
        const url = action.sapUrl + "sap/opu/odata/sap/ZER2CDS/Entities?$filter=startswith(Entity,'" + action.search + "')&$top=20&$format=json&sap-client=" + action.sapClient;

        if (!url)
            return this.resolveEmpty(action, server);

        fetch(
            url,
            {
                agent: agent,
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(action.sapUsername + ':' + action.sapPassword)
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
                        values: response.d.results.map((r: any) => { return { label: r.Entity } })
                    }
                );
            }
        );

        return Promise.resolve();
    }

    protected handleRequestAutoCompleteAttribute(action: RequestAutoCompleteAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const agent = new Agent({ rejectUnauthorized: false });
        const entity = action.elementId.split('.')[0];
        const url = action.sapUrl + "sap/opu/odata/sap/ZER2CDS/Fields?$filter=Entity eq '" + entity + "' and startswith(Field,'" + action.search + "')&$top=20&$format=json&sap-client=" + action.sapClient;

        if (!url)
            return this.resolveEmpty(action, server);

        fetch(
            url,
            {
                agent: agent,
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(action.sapUsername + ':' + action.sapPassword)
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
                        values: response.d.results.map((r: any) => { return { label: r.Field } })
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