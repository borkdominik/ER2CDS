import fetch from 'node-fetch';
import { SModelIndex } from 'sprotty-protocol';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSGlobal, ER2CDSServices } from '../er2cds-module.js';
import { UpdateElementPropertyAction } from '../actions.js';
import { URI } from 'langium';
import { Attribute, AttributeType, CardinalityType, ComparisonType, ER2CDS, RelationshipType } from '../generated/ast.js';
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
            case 'name':
                await this.handleNameEdit(action, model);
                break;

            case 'entity-name':
                await this.handleEntityNameEdit(action, model);
                break;

            case 'entity-alias':
                await this.handleEntityAliasEdit(action, model);
                break;

            case 'entity-type':
                await this.handleEntityNoExposeEdit(action, model);
                break;

            case 'relationship-name':
                await this.handleRelationshipNameEdit(action, model);
                break;

            case 'relationship-type':
                await this.handleRelationshipTypeEdit(action, model);
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

            case 'attribute-alias':
                await this.handleAttributeAliasEdit(action, model);
                break;

            case 'association-name':
                await this.handleAssociationNameEdit(action, model);
                break;

            case 'association-alias':
                await this.handleAssociationAliasEdit(action, model);
                break;

            case 'where-clause-attribute-name':
                await this.handleWhereClauseAttributeNameEdit(action, model);
                break;

            case 'where-clause-value':
                await this.handleWhereClauseValueEdit(action, model);
                break;

            case 'where-clause-comparison':
                await this.handleWhereClauseComparisonEdit(action, model);
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

            case 'join-clause-comparison':
                await this.handleJoinClauseComparisonEdit(action, model);
                break;

        }

        return synchronizeModelToText(model, sourceUri, server, services);
    }

    protected async handleNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        model.name = action.value;
    }

    protected async handleEntityNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const entity = model.entities.find(e => e.name === action.elementId);

        if (!entity)
            return Promise.resolve();

        entity.name = action.value;
    }

    protected async handleEntityAliasEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const entity = model.entities.find(e => e.name === action.elementId);

        if (!entity)
            return Promise.resolve();

        entity.alias = action.value;
    }

    protected async handleEntityNoExposeEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const entity = model.entities.find(e => e.name === action.elementId);

        if (!entity)
            return Promise.resolve();

        if (entity.type === 'no-expose') {
            entity.type = undefined;
        } else {
            entity.type = 'no-expose';
        }
    }

    protected async handleRelationshipNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);

        if (!relationship)
            return Promise.resolve();

        relationship.name = action.value;
    }

    protected async handleRelationshipTypeEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const relationship = model.relationships.find(r => r.name === action.elementId);

        if (!relationship)
            return Promise.resolve();

        relationship.type = action.value as RelationshipType;
    }

    protected async handleAttributeNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const agent = new Agent({ rejectUnauthorized: false });

        const entity = encodeURI(entityId).replaceAll('/', '%2F');
        const attribute = encodeURI(action.value).replaceAll('/', '%2F');
        const url = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/Attributes(Entity='" + entity + "',Attribute='" + attribute + "')?$format=json&sap-client=" + ER2CDSGlobal.sapClient;

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

    protected async handleAttributeAliasEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const attribute = entity?.attributes.find(a => a.name === attributeId);

        if (!attribute)
            return Promise.resolve();

        attribute.alias = action.value;
    }

    protected async handleAssociationNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const associationId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const association = entity?.associations.find(a => a.name === associationId);

        if (!association)
            return Promise.resolve();

        association.name = action.value;
    }

    protected async handleAssociationAliasEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const associationId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const association = entity?.associations.find(a => a.name === associationId);

        if (!association)
            return Promise.resolve();

        association.alias = action.value;
    }

    protected async handleWhereClauseAttributeNameEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const whereClause = entity?.whereClauses.find(wc => wc.attribute.$refText === attributeId);

        if (!entity || !whereClause)
            return Promise.resolve();

        const newAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: action.value
        }

        whereClause.attribute = {
            ref: newAttribute,
            $refText: action.value
        }
    }

    protected async handleWhereClauseValueEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const whereClause = entity?.whereClauses.find(wc => wc.attribute.$refText === attributeId);

        if (!entity || !whereClause)
            return Promise.resolve();

        whereClause.fixValue = action.value;
    }

    protected async handleWhereClauseComparisonEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const entity = model.entities.find(e => e.name === entityId);
        const whereClause = entity?.whereClauses.find(wc => wc.attribute.$refText === attributeId);

        if (!entity || !whereClause)
            return Promise.resolve();

        whereClause.comparison = action.value as ComparisonType;
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
        const joinClause = relationship?.joinClauses.find(jc => jc.firstAttribute.$refText === firstJoinClauseAttributeId);

        if (!relationship || !joinClause)
            return Promise.resolve();

        const newAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: action.value
        }

        joinClause.firstAttribute = {
            ref: newAttribute,
            $refText: action.value
        }
    }

    protected async handleSecondJoinClauseAttributeEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const relationshipId = split[0];
        const secondJoinClauseAttributeId = split[2];

        const relationship = model.relationships.find(r => r.name === relationshipId);
        const joinClause = relationship?.joinClauses.find(jc => jc.secondAttribute.$refText === secondJoinClauseAttributeId);

        if (!relationship || !joinClause)
            return Promise.resolve();

        const newAttribute: Attribute = {
            $type: 'Attribute',
            $container: null!,
            name: action.value
        }

        joinClause.secondAttribute = {
            ref: newAttribute,
            $refText: action.value
        }
    }

    protected async handleJoinClauseComparisonEdit(action: UpdateElementPropertyAction, model: ER2CDS): Promise<void> {
        const split = action.elementId.split('.');
        const relationshipId = split[0];
        const firstJoinClauseAttributeId = split[1];
        const secondJoinClauseAttributeId = split[2];

        const relationship = model.relationships.find(r => r.name === relationshipId);
        const joinClause = relationship?.joinClauses.find(jc => jc.firstAttribute.$refText === firstJoinClauseAttributeId && jc.secondAttribute.$refText === secondJoinClauseAttributeId);

        if (!relationship || !joinClause)
            return Promise.resolve();

        joinClause.comparison = action.value as ComparisonType;
    }
}