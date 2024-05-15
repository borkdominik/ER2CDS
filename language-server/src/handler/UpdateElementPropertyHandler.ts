import fetch from 'node-fetch';
import { SModelIndex } from 'sprotty-protocol';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSGlobal, ER2CDSServices } from '../er2cds-module.js';
import { UpdateElementPropertyAction } from '../actions.js';
import { URI } from 'langium';
import { Attribute, AttributeType, CardinalityType, ER2CDS } from '../generated/ast.js';
import { Agent } from 'https';
import { SapAttribute } from '../model-external.js';
import { synchronizeModelToText } from '../serializer/serializer.js';

export class UpdateElementPropertyHandler {
    public async handle(action: UpdateElementPropertyAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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

        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        switch (action.propertyId) {
            case 'entity-name':
                await this.handleEntityNameEdit(action, model);
                break;

            case 'relationship-name':
                await this.handleRelationshipNameEdit(action, model);
                break;

            case 'attribute-name':
                await this.handleAttributeNameEdit(action, model);
                break;

            case 'attribute-datatype':
                await this.handleAttributeDatatypeEdit(action, model);
                break;

            case 'attribute-type':
                await this.handleAttributeTypeEdit(action, model);
                break;

            case 'source-join-table':
                await this.handleSourceJoinTableEdit(action, model);
                break;

            case 'source-join-table-cardinality':
                await this.handleSourceJoinTableCardinalityEdit(action, model);
                break;

            case 'target-join-table':
                await this.handleTargetJoinTableEdit(action, model);
                break;

            case 'target-join-table-cardinality':
                await this.handleTargetJoinTableCardinalityEdit(action, model);
                break;

            case 'join-order':
                await this.handleJoinOrderEdit(action, model);
                break;

            case 'first-join-clause-attribute-name':
                await this.handleFirstJoinClauseAttributeEdit(action, model);
                break;

            case 'second-join-clause-attribute-name':
                await this.handleSecondJoinClauseAttributeEdit(action, model);
                break;
        }

        return synchronizeModelToText(model, sourceUri, server, services);
    }

    protected async handleEntityNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const entity = model.entities.find(e => e.name === action.elementId);

        if (!entity)
            return Promise.resolve();

        entity.name = action.value;
    }

    protected async handleRelationshipNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);

        if (!relationship)
            return Promise.resolve();

        relationship.name = action.value;
    }

    protected async handleAttributeNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const agent = new Agent({ rejectUnauthorized: false });
        const url = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/Attributes(Entity='" + entityId + "',Attribute='" + action.value + "')?$format=json&sap-client=" + ER2CDSGlobal.sapClient;

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
            (response: any) => response.json()
        ).then(
            (response: any) => {
                const sapAttribute: SapAttribute = response.d;
                const entity = model.entities.find(e => e.name === entityId);
                const attribute = entity?.attributes.find(a => a.name === attributeId);

                if (!attribute)
                    return;

                attribute.name = sapAttribute.Attribute;
                attribute.datatype = {
                    $type: 'DataType',
                    $container: attribute,
                    type: sapAttribute.Datatype
                }
            }
        ).catch(
            (error: any) => {
                const entity = model.entities.find(e => e.name === entityId);
                const attribute = entity?.attributes.find(a => a.name === attributeId);

                if (!attribute)
                    return;

                attribute.name = action.value;
            }
        );
    }

    protected async handleAttributeDatatypeEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const attribute = entity?.attributes.find(a => a.name === attributeId);

        if (!attribute)
            return Promise.resolve();

        attribute.datatype = {
            $type: 'DataType',
            $container: attribute,
            type: action.value
        }
    }

    protected async handleAttributeTypeEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const attribute = entity?.attributes.find(a => a.name === attributeId);

        if (!attribute)
            return Promise.resolve();

        attribute.type = action.value as AttributeType;
    }

    protected async handleSourceJoinTableEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);
        const source = model.entities.find(e => e.name === action.value);

        if (!relationship || !source)
            return Promise.resolve();

        relationship.source = {
            $type: 'RelationshipEntity',
            $container: relationship,
            target: {
                ref: source,
                $refText: source.name
            }
        };
    }

    protected async handleSourceJoinTableCardinalityEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);

        if (relationship && relationship?.source)
            relationship.source.cardinality = action.value as CardinalityType;
    }

    protected async handleTargetJoinTableEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);
        const target = model.entities.find(e => e.name === action.value);

        if (!relationship || !target)
            return Promise.resolve();

        relationship.target = {
            $type: 'RelationshipEntity',
            $container: relationship,
            target: {
                ref: target,
                $refText: target.name
            }
        };
    }

    protected async handleTargetJoinTableCardinalityEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);

        if (relationship && relationship?.target)
            relationship.target.cardinality = action.value as CardinalityType;
    }

    protected async handleJoinOrderEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);

        if (!relationship)
            return Promise.resolve();

        relationship.joinOrder = Number.parseInt(action.value);
    }

    protected async handleFirstJoinClauseAttributeEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const relationshipId = split[0];
        const firstJoinClauseAttributeId = split[1];

        const relationship = model.relationships.find(r => r.name === relationshipId);
        const attribute = relationship?.joinClauses.find(jc => jc.firstAttribute.$refText === firstJoinClauseAttributeId);

        if (!relationship || !attribute)
            return Promise.resolve();

        const newAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: action.value
        }

        attribute.firstAttribute = {
            ref: newAttribute,
            $refText: action.value
        }
    }

    protected async handleSecondJoinClauseAttributeEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const relationshipId = split[0];
        const secondJoinClauseAttributeId = split[2];

        const relationship = model.relationships.find(r => r.name === relationshipId);
        const attribute = relationship?.joinClauses.find(jc => jc.secondAttribute.$refText === secondJoinClauseAttributeId);

        if (!relationship || !attribute)
            return Promise.resolve();

        const newAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: action.value
        }

        attribute.secondAttribute = {
            ref: newAttribute,
            $refText: action.value
        }
    }
}