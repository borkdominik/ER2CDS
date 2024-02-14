import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { ER2CDSAstType, Entity } from './generated/ast.js';
import type { ER2CDSServices } from './er2cds-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ER2CDSServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ER2CDSValidator;
    const checks: ValidationChecks<ER2CDSAstType> = {
        Entity: validator.checkEntityStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ER2CDSValidator {
    checkEntityStartsWithCapital(entity: Entity, accept: ValidationAcceptor): void {
        if (entity.name) {
            const firstChar = entity.name.substring(0, 1);

            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: entity, property: 'name' });
            }
        }
    }
}
