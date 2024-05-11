import { SModelIndex } from 'sprotty-protocol';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { UpdateElementPropertyAction } from '../actions.js';
import { CompositeCstNode, CompositeCstNodeImpl, URI, expandToString } from 'langium';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { ER2CDS, } from '../generated/ast.js';
import { Range, Position } from 'vscode-languageserver-types';
import fetch from 'node-fetch';
import { Agent } from 'https';
import { SapAttribute } from '../model-external.js';

export class UpdateElementPropertyHandler {
    private workspaceEdit: WorkspaceEdit | undefined;

    public async handle(action: UpdateElementPropertyAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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
                await this.handleEntityNameEdit(action, model, sourceUri, services);
                break;

            case 'relationship-name':
                await this.handleRelationshipNameEdit(action, model, sourceUri, services);
                break;

            case 'attribute-name':
                await this.handleAttributeNameEdit(action, model, sourceUri, services);
                break;

            case 'attribute-datatype':
                await this.handleAttributeDatatypeEdit(action, model, sourceUri);
                break;

            case 'attribute-type':
                await this.handleAttributeTypeEdit(action, model, sourceUri);
                break;

            case 'source-join-table':
                await this.handleSourceJoinTableEdit(action, model, sourceUri);
                break;

            case 'target-join-table':
                await this.handleTargetJoinTableEdit(action, model, sourceUri);
                break;

            case 'first-join-clause-attribute-name':
                await this.handleFirstJoinClauseAttributeEdit(action, model, sourceUri);
                break;

            case 'second-join-clause-attribute-name':
                await this.handleSecondJoinClauseAttributeEdit(action, model, sourceUri);
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

    protected async handleEntityNameEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI, services: ER2CDSServices): Promise<void> {
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

    protected async handleRelationshipNameEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI, services: ER2CDSServices): Promise<void> {
        model.relationships.forEach((r) => {
            if (r.name === action.elementId && ((r.$cstNode) as CompositeCstNodeImpl).content[1].range)
                this.createWorkspaceEditAction(sourceUri, ((r.$cstNode) as CompositeCstNodeImpl).content[1].range, action.value);
        });
    }

    protected async handleAttributeNameEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI, services: ER2CDSServices): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        const agent = new Agent({ rejectUnauthorized: false });
        const url = action.sapUrl + "sap/opu/odata/sap/ZER2CDS/Attributes(Entity='" + entityId + "',Attribute='" + action.value + "')?$format=json&sap-client=" + action.sapClient;

        return fetch(
            url,
            {
                agent: agent,
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(action.sapUsername + ':' + action.sapPassword)
                }
            }
        ).then(
            (response: any) => response.json()
        ).then(
            (response: any) => {
                const attribute: SapAttribute = response.d;
                const attributeText = expandToString`${attribute.Attribute} : ${attribute.Datatype}`;

                model.entities.filter(e => e.name === entityId).forEach(e => e.attributes.forEach((a) => {
                    if (a.name === attributeId) {
                        if ((a.$cstNode as CompositeCstNodeImpl).content.length < 4 && a.$cstNode?.range) {
                            this.createWorkspaceEditAction(sourceUri, a.$cstNode?.range, attributeText);
                        } else if ((a.$cstNode as CompositeCstNodeImpl).content[0].range && (a.$cstNode as CompositeCstNodeImpl).content[3].range) {
                            const range = Range.create((a.$cstNode as CompositeCstNodeImpl).content[0].range.start, (a.$cstNode as CompositeCstNodeImpl).content[3].range.end);
                            this.createWorkspaceEditAction(sourceUri, range, attributeText);
                        }

                        const references = services.references.References.findReferences(a, {});
                        references.forEach(r => {
                            this.createWorkspaceEditAction(sourceUri, r.segment.range, attribute.Attribute);
                        });
                    }
                }));
            }
        );
    }

    protected async handleAttributeDatatypeEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI): Promise<void> {
        const split = action.elementId.split('.');
        const entityId = split[0];
        const attributeId = split[1];

        model.entities.filter(e => e.name === entityId).forEach(e => e.attributes.forEach((a) => {
            if (a.name === attributeId && a.datatype?.$cstNode?.range)
                this.createWorkspaceEditAction(sourceUri, a.datatype?.$cstNode?.range, action.value);
        }));
    }

    protected async handleAttributeTypeEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI): Promise<void> {
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

    protected async handleSourceJoinTableEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI): Promise<void> {
        model.relationships.forEach(r => {
            if (r.first?.target.$refText === action.elementId && r.first?.target.$refNode?.range) {
                this.createWorkspaceEditAction(sourceUri, r.first?.target.$refNode?.range, action.value);
            }
        });
    }

    protected async handleTargetJoinTableEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI): Promise<void> {
        model.relationships.forEach(r => {
            if (r.second?.target.$refText === action.elementId && r.second?.target.$refNode?.range) {
                this.createWorkspaceEditAction(sourceUri, r.second?.target.$refNode?.range, action.value);
            }
        });
    }

    protected async handleFirstJoinClauseAttributeEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI): Promise<void> {
        const split = action.elementId.split('.');
        const relationshipId = split[0];
        const firstJoinClauseAttributeId = split[1];

        model.relationships.filter(r => r.name === relationshipId).map(e => e.attributes.forEach(a => {
            if (a.firstAttribute.$refText === firstJoinClauseAttributeId && a.firstAttribute.$refNode?.range) {
                this.createWorkspaceEditAction(sourceUri, a.firstAttribute.$refNode?.range, action.value);
            }
        }));
    }

    protected async handleSecondJoinClauseAttributeEdit(action: UpdateElementPropertyAction, model: ER2CDS, sourceUri: URI): Promise<void> {
        const split = action.elementId.split('.');
        const relationshipId = split[0];
        const secondJoinClauseAttributeId = split[2];

        model.relationships.filter(r => r.name === relationshipId).map(e => e.attributes.forEach(a => {
            if (a.secondAttribute.$refText === secondJoinClauseAttributeId && a.secondAttribute.$refNode?.range) {
                this.createWorkspaceEditAction(sourceUri, a.secondAttribute.$refNode?.range, action.value);
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