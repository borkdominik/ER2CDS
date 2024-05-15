import { LangiumDocument, type ValidationAcceptor, type ValidationChecks } from 'langium';
import { Attribute, DataType, ER2CDS, ER2CDSAstType, Entity, Relationship, RelationshipEntity, RelationshipJoinClause } from '../generated/ast.js';
import { type ER2CDSServices } from '../er2cds-module.js';
import { Marker, MarkerKind } from '../actions.js';
import { Range } from 'vscode-languageserver-types';

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

    checkER2CDS(er2cds: ER2CDS, accept: ValidationAcceptor): void {
        if (!er2cds.name) {
            accept('error', 'Name for ER2CDS mandatory.', { node: er2cds, property: 'name' });
        }
    }

    checkEntity(entity: Entity, accept: ValidationAcceptor): void {
        // TODO check if tabel exits in SAP
        // TODO check if attributes exist
    }

    checkAttribute(attribute: Attribute, accept: ValidationAcceptor): void {
        // TODO check if attribute exits on SAP table
    }

    checkDataType(datatype: DataType, accept: ValidationAcceptor): void {
        // TODO check if datatype is correct
    }

    checkRelationship(relationship: Relationship, accept: ValidationAcceptor): void {
        // TODO check if source is given
        // TODO check if target is given
        // TODO check if at least one join clause is given
    }

    checkRelationshipEntity(relationshipEntity: RelationshipEntity, accept: ValidationAcceptor): void {
        // TODO check if target exits
    }

    checkRelationshipJoinClause(relationshipJoinClause: RelationshipJoinClause, accept: ValidationAcceptor): void {
        // check if datatypes are compatibel
    }
}
