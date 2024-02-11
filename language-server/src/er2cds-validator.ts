import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { ER2CDSAstType, State } from './generated/ast.js';
import type { ER2CDSServices } from './er2cds-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ER2CDSServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ER2CDSValidator;
    const checks: ValidationChecks<ER2CDSAstType> = {
        State: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ER2CDSValidator {

    checkPersonStartsWithCapital(person: State, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
