import { URI } from 'langium';
import { CreateAttributeAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { Attribute, DataType, ER2CDS } from '../generated/ast.js';
import { synchronizeModelToText } from '../serializer/serializer.js';

export class CreateAttributeActionHandler {
    public async handle(action: CreateAttributeAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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
        const entity = model.entities.find(e => e.name === action.elementId);
        if (!entity)
            return Promise.resolve();

        const newAttribute: Attribute = {
            $type: 'Attribute',
            $container: entity,
            name: this.getNewName('Attribute', entity?.name, entity?.attributes),
        };

        const newDatatype: DataType = {
            $type: 'DataType',
            $container: newAttribute,
            type: 'CHAR'
        }

        newAttribute.datatype = newDatatype;
        entity.attributes.push(newAttribute);

        return synchronizeModelToText(model, sourceUri, server, services);
    }

    private getNewName(prefix: string, entityName: string, elements: Attribute[] | undefined): string {
        if (!elements)
            return this.createName(prefix, 0);

        let count = 0;
        for (let i = 0; i < elements.length; i += 1) {
            let name = this.createName(prefix, count);

            if (!elements.some(e => e.name === name))
                return name;

            count += 1
        }

        return this.createName(prefix, count);
    }

    private createName(prefix: string, count: number): string {
        return prefix + count;
    }
}