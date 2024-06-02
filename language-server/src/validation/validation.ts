import { LangiumDocument, type ValidationAcceptor, type ValidationChecks } from 'langium';
import { Attribute, DataType, ER2CDS, ER2CDSAstType, Entity, Relationship, RelationshipEntity, RelationshipJoinClause } from '../generated/ast.js';
import { ER2CDSGlobal, type ER2CDSServices } from '../er2cds-module.js';
import { Marker, MarkerKind } from '../actions.js';
import { Range } from 'vscode-languageserver-types';
import { Agent } from 'https';
import fetch, { Response } from 'node-fetch';
import { DATATYPES } from '../model.js';

export function registerValidationChecks(services: ER2CDSServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ER2CDSValidator;

    const checks: ValidationChecks<ER2CDSAstType> = {
        ER2CDS: validator.checkER2CDS,
        Entity: validator.checkEntity,
        Attribute: validator.checkAttribute,
        DataType: validator.checkDataType,
        Relationship: validator.checkRelationship,
        RelationshipEntity: validator.checkRelationshipEntity,
        RelationshipJoinClause: validator.checkRelationshipJoinClause
    };

    registry.register(checks, validator);
}

export function createMarkersForDocument(document: LangiumDocument): Marker[] | undefined {
    return document.diagnostics?.map(diagnostic => {
        const model = document.parseResult.value as ER2CDS;
        const elementId = findElementIdByRange(model, diagnostic.range);

        let kind: string;
        switch (diagnostic.severity) {
            case 1:
                kind = MarkerKind.ERROR;
                break;

            case 2:
                kind = MarkerKind.WARNING;
                break;

            case 3:
                kind = MarkerKind.INFO;
                break;

            default:
                kind = MarkerKind.INFO;
                break;
        }

        return <Marker>{
            kind: kind,
            elementId: elementId,
            description: diagnostic.message,
        }
    });
}

export function findElementIdByRange(model: ER2CDS, range: Range): string | undefined {
    let elementId: string | undefined;

    elementId = model.entities.find(e => isInRange(e.$cstNode?.range, range))?.name;
    if (elementId)
        return elementId;

    elementId = model.relationships.find(r => isInRange(r.$cstNode?.range, range))?.name;
    if (elementId)
        return elementId;

    return undefined;
}

export function isInRange(outer: Range | undefined, inner: Range | undefined): boolean {
    if (!outer || !inner)
        return false;

    return outer.start.line <= inner.start.line && outer.end.line >= inner.end.line;
}

export class ER2CDSValidator {
    constructor(protected services: ER2CDSServices) { }

    async checkER2CDS(er2cds: ER2CDS, accept: ValidationAcceptor): Promise<void> {
        if (!er2cds.name) {
            accept('error', 'Name for ER2CDS missing', { node: er2cds, property: 'name' });
        }
    }

    async checkEntity(entity: Entity, accept: ValidationAcceptor): Promise<void> {
        const agent = new Agent({ rejectUnauthorized: false });

        const entityName = encodeURI(entity.name).replaceAll('/', '%2F');
        const url = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/Entities(Entity='" + entityName + "')?$format=json&sap-client=" + ER2CDSGlobal.sapClient;

        if (!entity.name) {
            accept('error', `Name for Entity missing`, { node: entity, property: 'name' });
        }

        await fetch(
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
                if (response.status === 404) {
                    accept('error', `Entity ${entity.name} does not exists`, { node: entity, property: 'name' });
                }
            }
        ).catch(
            () => Promise.resolve()
        );

        if (!entity.attributes || entity.attributes.length <= 0) {
            accept('warning', `Entity ${entity.name} has no attributes`, { node: entity, property: 'attributes' });
        }
    }

    async checkAttribute(attribute: Attribute, accept: ValidationAcceptor): Promise<void> {
        const entity = attribute.$container;

        const agent = new Agent({ rejectUnauthorized: false });

        const entityName = encodeURI(entity.name).replaceAll('/', '%2F');
        const attributeName = encodeURI(attribute.name).replaceAll('/', '%2F');
        const url = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/Attributes(Entity='" + entityName + "',Attribute='" + attributeName + "')?$format=json&sap-client=" + ER2CDSGlobal.sapClient;

        if (!attribute.name) {
            accept('error', `Name for Attribute missing`, { node: attribute, property: 'name' });
        }

        if (!attribute.datatype) {
            accept('error', `Datatype for Attribute ${attribute.name} missing`, { node: attribute, property: 'datatype' });
        }

        if (attribute.name !== 'MANDT') {
            await fetch(
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
                    if (response.status === 404)
                        accept('error', `Attribute ${attribute.name} does not exists on Entity ${entity.name}`, { node: attribute, property: 'name' });
                }
            ).catch(
                () => Promise.resolve()
            );
        }
    }

    async checkDataType(datatype: DataType, accept: ValidationAcceptor): Promise<void> {
        if (!DATATYPES.some(d => datatype.type === d.value)) {
            accept('error', `Datatype ${datatype.type} invalid`, { node: datatype, property: 'type' });
        }
    }

    async checkRelationship(relationship: Relationship, accept: ValidationAcceptor): Promise<void> {
        if (!relationship.name) {
            accept('error', `Name for Relationship missing`, { node: relationship, property: 'name' });
        }

        if (!relationship.source) {
            accept('error', `Source for Relationship ${relationship.name} missing`, { node: relationship, property: 'source' });
        }

        if (!relationship.target) {
            accept('error', `Target for Relationship ${relationship.name} missing`, { node: relationship, property: 'target' });
        }

        if (relationship.type !== 'composition') {
            if (!relationship.joinClauses || relationship.joinClauses.length <= 0) {
                accept('error', `Relationship ${relationship.name} has no join clauses`, { node: relationship, property: 'joinClauses' });
            }
        }

        if (!relationship.type) {
            if (!relationship.joinOrder) {
                accept('warning', `Join order for Relationship ${relationship.name} missing`, { node: relationship, property: 'joinOrder' });
            }
        }
    }

    async checkRelationshipEntity(relationshipEntity: RelationshipEntity, accept: ValidationAcceptor): Promise<void> {
        if (relationshipEntity.target.$refText && !relationshipEntity.target.ref) {
            accept('error', `Entity ${relationshipEntity.target.$refText} does not exists`, { node: relationshipEntity, property: 'target' });
        }

        if (!relationshipEntity.cardinality) {
            accept('warning', `Cardinality for ${relationshipEntity.target.$refText} missing`, { node: relationshipEntity, property: 'target' });
        }
    }

    async checkRelationshipJoinClause(relationshipJoinClause: RelationshipJoinClause, accept: ValidationAcceptor): Promise<void> {
        if (!relationshipJoinClause.firstAttribute) {
            accept('error', `First attribute missing`, { node: relationshipJoinClause, property: 'firstAttribute' });
        }

        if (!relationshipJoinClause.secondAttribute) {
            accept('error', `Second attribute missing`, { node: relationshipJoinClause, property: 'secondAttribute' });
        }

        if (relationshipJoinClause.firstAttribute.$refText && !relationshipJoinClause.firstAttribute.ref) {
            accept('error', `Attribute ${relationshipJoinClause.firstAttribute.$refText} does not exists`, { node: relationshipJoinClause, property: 'firstAttribute' });
        }

        if (relationshipJoinClause.secondAttribute.$refText && !relationshipJoinClause.secondAttribute.ref) {
            accept('error', `Attribute ${relationshipJoinClause.secondAttribute.$refText} does not exists`, { node: relationshipJoinClause, property: 'secondAttribute' });
        }

        if (relationshipJoinClause.firstAttribute.ref && relationshipJoinClause.secondAttribute.ref) {
            if (relationshipJoinClause.firstAttribute.ref.datatype?.type !== relationshipJoinClause.secondAttribute.ref.datatype?.type) {
                accept('warning', `Datatype of attributes ${relationshipJoinClause.firstAttribute.$refText} and ${relationshipJoinClause.firstAttribute.$refText} incompatible`, { node: relationshipJoinClause, property: 'firstAttribute' });
                accept('warning', `Datatype of attributes ${relationshipJoinClause.firstAttribute.$refText} and ${relationshipJoinClause.firstAttribute.$refText} incompatible`, { node: relationshipJoinClause, property: 'secondAttribute' });
            }
        }
    }
}
