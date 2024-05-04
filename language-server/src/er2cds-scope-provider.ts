import type { LangiumServices, ReferenceInfo, Scope } from 'langium';
import { DefaultScopeProvider, stream } from 'langium';
import { Relationship } from './generated/ast.js';


export class ER2CDSScopeProvider extends DefaultScopeProvider {
    constructor(protected services: LangiumServices) {
        super(services);
    }

    public override getScope(context: ReferenceInfo): Scope {
        if (context.property === 'firstAttribute') {
            const entity = (context.container.$container as Relationship).first?.target.ref!;
            return this.createScope(stream(entity.attributes.map(attr => this.services.workspace.AstNodeDescriptionProvider.createDescription(attr, attr.name))));
        }

        if (context.property === 'secondAttribute') {
            const entity = (context.container.$container as Relationship).second?.target.ref!;
            return this.createScope(stream(entity.attributes.map(attr => this.services.workspace.AstNodeDescriptionProvider.createDescription(attr, attr.name))));
        }

        return super.getScope(context);
    }
} 