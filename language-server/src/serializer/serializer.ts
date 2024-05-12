import { URI, expandToString } from "langium";
import { ER2CDSDiagramServer } from "../er2cds-diagram-server.js";
import { ER2CDSServices } from "../er2cds-module.js";
import { Attribute, ER2CDS, Entity, Relationship, RelationshipJoinClause } from "../generated/ast.js";
import { Range, Position } from 'vscode-languageserver-types';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';

export function synchronizeModelToText(model: ER2CDS, sourceUri: URI, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
    const source = serialize(model);

    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
    if (!document)
        return Promise.resolve();

    const workspaceEdit = {
        changes: {
            [sourceUri.toString()]:
                [
                    {
                        range: Range.create(Position.create(0, 0), Position.create(document.textDocument.lineCount + 1, 0)),
                        newText: source
                    }
                ]
        }
    }

    const workspaceEditAction: WorkspaceEditAction = {
        kind: WorkspaceEditAction.KIND,
        workspaceEdit: workspaceEdit
    }

    server.dispatch(workspaceEditAction);

    return Promise.resolve();
}

export function serialize(model: ER2CDS): string {
    return expandToString`
        er2cds ${model.name}

        ${serializeEntities(model.entities)}

        ${serializeRelationships(model.relationships)}
        `
}

export function serializeEntities(entities: Entity[]): string {
    return entities.map(e => serializeEntity(e)).join('\n\n');
}

export function serializeEntity(entity: Entity): string {
    return expandToString`
    entity ${entity.name} {
        ${entity.attributes.length > 0 ? entity.attributes.map(a => serializeAttribute(a)).join('\n') : undefined}
    }
    `;
}

export function serializeAttribute(attribute: Attribute): string {
    return expandToString`
    ${attribute.name} : ${attribute.datatype?.type} ${attribute.type ? `key` : undefined}
    `;
}

export function serializeRelationships(relationships: Relationship[]): string {
    return relationships.map(r => serializeRelationship(r)).join('\n\n');
}

export function serializeRelationship(relationship: Relationship): string {
    return expandToString`
    relationship ${relationship.name} {
        ${relationship.source?.target || relationship.target?.target.$refText ? `${relationship.source?.target.ref?.name} -> ${relationship.target?.target.ref?.name}` : undefined}
        ${relationship.joinOrder ? `join order ${relationship.joinOrder}` : undefined}
        ${relationship.joinClauses.length > 0 ? relationship.joinClauses.map(jc => serializeRelationshipJoinClause(jc)).join('\n') : undefined}
    }
    `;
}

export function serializeRelationshipJoinClause(relationshipJoinClause: RelationshipJoinClause): string {
    return expandToString`
        ${relationshipJoinClause.firstAttribute.$refText} = ${relationshipJoinClause.secondAttribute.$refText}
        `;
}