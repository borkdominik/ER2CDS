import type { AstNodeDescription, LangiumServices, ReferenceInfo, Scope, Stream } from 'langium';
import { DefaultScopeProvider, stream } from 'langium';
import { Relationship } from './generated/ast.js';


export class ER2CDSScopeProvider extends DefaultScopeProvider {
    constructor(protected services: LangiumServices) {
        super(services);
    }

    public override getScope(context: ReferenceInfo): Scope {
        if (context.property === 'firstAttribute') {
            const relationship = context.container.$container as Relationship;
            let scope: Scope = null!;

            if (relationship.type === 'association' || relationship.type === 'association-to-parent') {
                let attributeStreams: Stream<AstNodeDescription> | undefined;

                relationship.$container.entities.forEach(e => {
                    const attributeStream = stream(e.attributes.map(attr => this.services.workspace.AstNodeDescriptionProvider.createDescription(attr, attr.name)));

                    if (!attributeStreams) {
                        attributeStreams = attributeStream;
                    } else {
                        attributeStreams = attributeStreams.concat(attributeStream);
                    }
                })

                if (attributeStreams) {
                    scope = this.createScope(attributeStreams);
                }
            } else {
                const entity = relationship.source?.target.ref!;
                scope = this.createScope(stream(entity.attributes.map(attr => this.services.workspace.AstNodeDescriptionProvider.createDescription(attr, attr.name))));
            }

            return scope;
        }

        if (context.property === 'secondAttribute') {
            const entity = (context.container.$container as Relationship).target?.target.ref!;
            return this.createScope(stream(entity.attributes.map(attr => this.services.workspace.AstNodeDescriptionProvider.createDescription(attr, attr.name))));
        }

        return super.getScope(context);
    }
} 