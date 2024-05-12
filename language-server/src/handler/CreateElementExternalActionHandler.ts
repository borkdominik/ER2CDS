import fetch from 'node-fetch';
import { URI } from 'vscode-uri';
import { CreateElementExternalAction } from '../actions.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { Agent } from 'https';
import { SapAttribute } from '../model-external.js';
import { Attribute, DataType, ER2CDS, Entity } from '../generated/ast.js';
import { synchronizeModelToText } from '../serializer/serializer.js';

export class CreateElementExternalActionHandler {
    public async handle(action: CreateElementExternalAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
        if (!document)
            return Promise.resolve();

        const model = document.parseResult.value as ER2CDS;

        const newEntity = await this.getAttributes(action).then((attributes: SapAttribute[]) => {
            const newEntity: Entity = {
                $type: 'Entity',
                $container: model,
                name: action.elementId,
                attributes: []
            }

            const newAttributes = attributes.map(a => {
                const newAttribute: Attribute = {
                    $type: 'Attribute',
                    $container: newEntity,
                    name: a.Attribute,
                };

                const newDatatype: DataType = {
                    $type: 'DataType',
                    $container: newAttribute,
                    type: a.Datatype
                };

                newAttribute.datatype = newDatatype;
                return newAttribute;
            });

            newEntity.attributes = newAttributes;
            return newEntity;
        });

        model.entities.push(newEntity);

        return synchronizeModelToText(model, sourceUri, server, services);
    }

    protected async getAttributes(action: CreateElementExternalAction): Promise<SapAttribute[]> {
        const agent = new Agent({ rejectUnauthorized: false });
        let url = action.sapUrl + "sap/opu/odata/sap/ZER2CDS/Attributes?$filter=Entity eq '" + action.elementId + "'&$format=json&sap-client=" + action.sapClient;

        if (!url)
            return Promise.resolve([]);

        let response;
        const attriutes: SapAttribute[] = [];

        while (true) {
            response = await fetch(
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
            );

            attriutes.push(...response.d.results);

            if (response.d.__next) {
                url = response.d.__next;
            } else {
                break;
            }
        }

        return Promise.resolve(attriutes);
    }
}