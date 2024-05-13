import { DocumentState, type ValidationAcceptor, type ValidationChecks } from 'langium';
import type { ER2CDSAstType, Entity } from '../generated/ast.js';
import { ER2CDS, type ER2CDSServices } from '../er2cds-module.js';
import { DiagramActionNotification, LangiumSprottySharedServices } from 'langium-sprotty';
import { Marker, MarkerKind, SetMarkersAction } from '../actions.js';

export function registerValidationChecks(services: ER2CDSServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ER2CDSValidator;

    const checks: ValidationChecks<ER2CDSAstType> = {
        Entity: validator.checkEntityStartsWithCapital
    };

    registry.register(checks, validator);
}

export function registerValidationMarkers(shared: LangiumSprottySharedServices) {
    shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Validated, async (documents, cancelToken) => {
        for (const document of documents) {
            if (document.diagnostics) {
                const markers: Marker[] = document.diagnostics.map(diagnostic => {
                    // TODO find elementId
                    // const elementId = (document.parseResult.value as any)['entities'].find((e: any) => e.name === 'vBAP');

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
                        // elementId: elementId,
                        description: diagnostic.message,
                    }
                });

                const setMarker = SetMarkersAction.create(markers);
                shared.lsp.Connection?.sendNotification(DiagramActionNotification.type, { clientId: ER2CDS.clientId, action: setMarker });
            }
        }
    });
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
