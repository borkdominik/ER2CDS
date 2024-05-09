import { SModelIndex } from 'sprotty-protocol';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { UpdateElementPropertyAction } from '../actions.js';
import { CompositeCstNode, CompositeCstNodeImpl, URI } from 'langium';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { ER2CDS, } from '../generated/ast.js';
import { Range, Position } from 'vscode-languageserver-types';

export class UpdateElementPropertyHandler {
    private workspaceEdit: WorkspaceEdit | undefined;

    public handle(action: UpdateElementPropertyAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
        if (!document)
            return Promise.resolve();

        const model = document.parseResult.value as ER2CDS;

        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        switch (action.propertyId) {
            case 'entity-name':
                this.handleEntityNameEdit(action, model, sourceUri, services);
                break;

            case 'relationship-name':
                this.handleRelationshipNameEdit(action, model, sourceUri, services);
                break;

            case 'attribute-name':
                this.handleAttributeNameEdit(action, model, sourceUri, services);
                break;

            case 'attribute-datatype':
                this.handleAttributeDatatypeEdit(action, model, sourceUri);
                break;

            case 'attribute-type':
                this.handleAttributeTypeEdit(action, model, sourceUri);
                break;
        }

        if (this.workspaceEdit) {
            const workspaceEditAction: WorkspaceEditAction = {
                kind: WorkspaceEditAction.KIND,
                workspaceEdit: this.workspaceEdit
            }

            server.dispatch(workspaceEditAction);
        }

        return Promise.resolve();
    }

    protected handleEntityNameEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI, services: ER2CDSServices) {
        model.entities.forEach((e) => {
            if (e.name === action.elementId && ((e.$cstNode) as CompositeCstNodeImpl).content[1].range) {
                this.createWorkspaceEditAction(sourceUri, ((e.$cstNode) as CompositeCstNodeImpl).content[1].range, action.value);

                const references = services.references.References.findReferences(e, {});
                references.forEach(r => {
                    this.createWorkspaceEditAction(sourceUri, r.segment.range, action.value);
                });
            }
        });
    }

    protected handleRelationshipNameEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI, services: ER2CDSServices) {
        model.relationships.forEach((r) => {
            if (r.name === action.elementId && ((r.$cstNode) as CompositeCstNodeImpl).content[1].range)
                this.createWorkspaceEditAction(sourceUri, ((r.$cstNode) as CompositeCstNodeImpl).content[1].range, action.value);
        });
    }

    protected handleAttributeNameEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI, services: ER2CDSServices) {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        model.entities.filter(e => e.name === entityId).forEach(e => e.attributes.forEach((a) => {
            if (a.name === attributeId && ((a.$cstNode) as CompositeCstNodeImpl).content[0].range) {
                this.createWorkspaceEditAction(sourceUri, ((a.$cstNode) as CompositeCstNodeImpl).content[0].range, action.value);

                const references = services.references.References.findReferences(a, {});
                references.forEach(r => {
                    this.createWorkspaceEditAction(sourceUri, r.segment.range, action.value);
                });
            }
        }));
    }

    protected handleAttributeDatatypeEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI) {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        model.entities.filter(e => e.name === entityId).forEach(e => e.attributes.forEach((a) => {
            if (a.name === attributeId && a.datatype?.$cstNode?.range)
                this.createWorkspaceEditAction(sourceUri, a.datatype?.$cstNode?.range, action.value);
        }));
    }

    protected handleAttributeTypeEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI) {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        model.entities.filter(e => e.name === entityId).map(e => e.attributes.forEach(a => {
            if (a.name === attributeId) {
                if ((a.$cstNode as CompositeCstNode).content.length > 3) {
                    const range = (a.$cstNode as CompositeCstNode).content[3].range;
                    this.createWorkspaceEditAction(sourceUri, range, '');
                } else {
                    const range = (a.$cstNode as CompositeCstNode).content[2].range;
                    this.createWorkspaceEditAction(sourceUri, Range.create(Position.create(range.end.line, range.end.character), Position.create(range.end.line, range.end.character + 4)), ' key ');
                }
            }
        }));
    }

    protected createWorkspaceEditAction(sourceUri: URI, range: Range, text: string) {
        if (!this.workspaceEdit) {
            this.workspaceEdit = {
                changes: {
                    [sourceUri.toString()]: []
                }
            }
        }

        const textEdit = {
            range: range,
            newText: text
        };

        if (this.workspaceEdit.changes)
            this.workspaceEdit.changes[sourceUri.toString()].push(textEdit);
    }
}