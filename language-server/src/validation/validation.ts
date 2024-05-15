import { DocumentState, LangiumDocument, type ValidationAcceptor, type ValidationChecks } from 'langium';
import type { ER2CDS, ER2CDSAstType, Entity } from '../generated/ast.js';
import { ER2CDSGlobal, type ER2CDSServices } from '../er2cds-module.js';
import { DiagramActionNotification } from 'langium-sprotty';
import { Marker, MarkerKind, SetMarkersAction } from '../actions.js';
import { Range } from 'vscode-languageserver-types';

export function registerValidationChecks(services: ER2CDSServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ER2CDSValidator;

    const checks: ValidationChecks<ER2CDSAstType> = {
        Entity: validator.checkEntityStartsWithCapital
    };

    registry.register(checks, validator);
}

export function registerValidationMarkers(services: ER2CDSServices) {
    services.shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, async (documents, cancelToken) => {
        for (const document of documents) {
            const markers = createMarkersForDocument(document);

            if (markers) {
                const setMarker = SetMarkersAction.create(markers);
                services.shared.lsp.Connection?.sendNotification(DiagramActionNotification.type, { clientId: ER2CDSGlobal.clientId, action: setMarker });
            }
        }
    });
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
    constructor(protected services: ER2CDSServices) {
    }

    checkEntityStartsWithCapital(entity: Entity, accept: ValidationAcceptor): void {
        if (entity.name) {
            const firstChar = entity.name.substring(0, 1);

            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: entity, property: 'name' });
            }
        }
    }
}
