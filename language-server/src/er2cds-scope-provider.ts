import type { AstNodeDescription, LangiumServices, ReferenceInfo, Scope, Stream } from 'langium';
import { DefaultScopeProvider, stream } from 'langium';
import { ER2CDS, Relationship } from './generated/ast.js';


export class ER2CDSScopeProvider extends DefaultScopeProvider {
    constructor(protected services: LangiumServices) {
        super(services);
    }

    public override getScope(context: ReferenceInfo): Scope {
        if (context.property === 'target' && context.container.$type === 'RelationshipEntity') {
            const model = context.container.$container?.$container as ER2CDS;

            if (model) {
                const names = model.entities.map(e => this.services.workspace.AstNodeDescriptionProvider.createDescription(e, e.name));
                const alias = model.entities.map(e => this.services.workspace.AstNodeDescriptionProvider.createDescription(e, e.alias));

                return this.createScope(stream(names.concat(alias)));
            }
        }

        if (context.property === 'firstAttribute' && context.container.$type === 'RelationshipJoinClause') {
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
                const entity = relationship.source?.target.ref;
                if (entity)
                    scope = this.createScope(stream(entity.attributes.map(attr => this.services.workspace.AstNodeDescriptionProvider.createDescription(attr, attr.name))));
            }

            return scope;
        }

        if (context.property === 'secondAttribute' && context.container.$type === 'RelationshipJoinClause') {
            const entity = (context.container.$container as Relationship).target?.target.ref;

            if (entity)
                return this.createScope(stream(entity.attributes.map(attr => this.services.workspace.AstNodeDescriptionProvider.createDescription(attr, attr.name))));
        }

        return super.getScope(context);
    }
} 